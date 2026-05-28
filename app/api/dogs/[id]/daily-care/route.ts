import { ApiError } from "@/lib/server/api-errors"
import { apiSuccess, withRouteHandler } from "@/lib/server/api-response"
import { dailyCareCreateSchema } from "@/lib/server/api-schemas"
import { getRequestContext } from "@/lib/server/request-context"
import { mapDailyCareRecord } from "@/lib/server/api-mappers"
import { supabaseRequest } from "@/lib/server/supabase-rest"

type ShelterAlertSettings = {
  appetite_alert_on_half_feeding?: boolean
  appetite_alert_on_no_feeding?: boolean
  low_water_alert_enabled?: boolean
  low_energy_alert_enabled?: boolean
  behavior_alert_enabled?: boolean
  vomiting_alert_priority?: string
  general_health_alert_priority?: string
}

async function getDog(id: string, shelterId: string) {
  const dogs = await supabaseRequest<any[]>("dogs", {
    query: {
      select: "id,name,primary_photo_url,shelter_id",
      id: `eq.${id}`,
      shelter_id: `eq.${shelterId}`,
      limit: 1,
    },
  })

  const dog = dogs[0]
  if (!dog) {
    throw new ApiError(404, "DOG_NOT_FOUND", "Dog not found.")
  }

  return dog
}

async function getShelterAlertSettings(shelterId: string) {
  const records = await supabaseRequest<ShelterAlertSettings[]>("shelter_settings", {
    query: {
      select:
        "appetite_alert_on_half_feeding,appetite_alert_on_no_feeding,low_water_alert_enabled,low_energy_alert_enabled,behavior_alert_enabled,vomiting_alert_priority,general_health_alert_priority",
      shelter_id: `eq.${shelterId}`,
      limit: 1,
    },
  })

  return records[0] ?? {}
}

function buildDailyCareAlerts(
  record: ReturnType<typeof dailyCareCreateSchema.parse>,
  dog: { id: string; name: string },
  settings: ShelterAlertSettings
) {
  const alerts: Array<{
    alert_type: string
    priority: string
    title: string
    description: string
  }> = []

  if (record.vomiting) {
    alerts.push({
      alert_type: "vomiting",
      priority: settings.vomiting_alert_priority ?? "critical",
      title: "Vomiting observed",
      description: `${dog.name} vomited during daily care.`,
    })
  }

  const shouldAlertOnNoFeeding = settings.appetite_alert_on_no_feeding ?? true
  const shouldAlertOnHalfFeeding = settings.appetite_alert_on_half_feeding ?? true

  if (
    (record.feedingCompletion === "none" && shouldAlertOnNoFeeding) ||
    (record.feedingCompletion === "half" && shouldAlertOnHalfFeeding)
  ) {
    alerts.push({
      alert_type: "appetite_issue",
      priority: record.feedingCompletion === "none" ? "high" : "medium",
      title: "Appetite issue detected",
      description: `${dog.name} showed reduced feeding completion.`,
    })
  }

  const shouldAlertOnBehavior = settings.behavior_alert_enabled ?? true
  const shouldAlertOnLowEnergy = settings.low_energy_alert_enabled ?? true
  const shouldAlertOnLowWater = settings.low_water_alert_enabled ?? true

  if (
    (shouldAlertOnBehavior && (record.aggression || record.anxiety)) ||
    (shouldAlertOnLowEnergy &&
      (record.energyLevel === "low" || record.energyLevel === "lethargic")) ||
    (shouldAlertOnLowWater && (record.waterIntake === "low" || record.waterIntake === "none"))
  ) {
    alerts.push({
      alert_type: "general_health",
      priority: settings.general_health_alert_priority ?? "medium",
      title: "Behavior or energy needs attention",
      description: `${dog.name} showed abnormal behavior, hydration, or low energy during care.`,
    })
  }

  return alerts
}

export const GET = withRouteHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { shelterId } = await getRequestContext(request)
  const { id } = await params
  await getDog(id, shelterId)

  const records = await supabaseRequest<any[]>("daily_care_records", {
    query: {
      select:
        "id,dog_id,care_date,feeding_amount_grams,feeding_completion,water_intake,medication_given,medication_notes,stool_condition,vomiting,vomiting_notes,energy_level,aggression,anxiety,behavior_notes,health_notes,special_observations,weight_kg,temperature_c,image_urls,is_draft,recorded_by,created_at,updated_at",
      dog_id: `eq.${id}`,
      shelter_id: `eq.${shelterId}`,
      order: "care_date.desc",
    },
  })

  return apiSuccess({
    items: records.map(mapDailyCareRecord),
  })
})

export const POST = withRouteHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { shelterId, profileId } = await getRequestContext(request)
  const { id } = await params
  const dog = await getDog(id, shelterId)
  const payload = dailyCareCreateSchema.parse(await request.json())
  const shelterAlertSettings = await getShelterAlertSettings(shelterId)

  const inserted = await supabaseRequest<any[]>("daily_care_records", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: {
      shelter_id: shelterId,
      dog_id: id,
      care_date: payload.date,
      feeding_amount_grams: payload.feedingAmount ?? null,
      feeding_completion: payload.feedingCompletion,
      water_intake: payload.waterIntake,
      medication_given: payload.medicationGiven,
      medication_notes: payload.medicationNotes ?? null,
      stool_condition: payload.stoolCondition,
      vomiting: payload.vomiting,
      vomiting_notes: payload.vomitingNotes ?? null,
      energy_level: payload.energyLevel,
      aggression: payload.aggression,
      anxiety: payload.anxiety,
      behavior_notes: payload.behaviorNotes ?? null,
      health_notes: payload.healthNotes ?? null,
      special_observations: payload.specialObservations ?? null,
      weight_kg: payload.weight ?? null,
      temperature_c: payload.temperature ?? null,
      image_urls: payload.imageUrls,
      is_draft: payload.isDraft,
      recorded_by: profileId ?? null,
    },
    query: {
      on_conflict: "dog_id,care_date",
      select:
        "id,dog_id,care_date,feeding_amount_grams,feeding_completion,water_intake,medication_given,medication_notes,stool_condition,vomiting,vomiting_notes,energy_level,aggression,anxiety,behavior_notes,health_notes,special_observations,weight_kg,temperature_c,image_urls,is_draft,recorded_by,created_at,updated_at",
    },
  })

  const createdRecord = inserted[0]

  if (!payload.isDraft) {
    await supabaseRequest("health_alerts", {
      method: "DELETE",
      headers: {
        Prefer: "return=minimal",
      },
      query: {
        source_record_id: `eq.${createdRecord.id}`,
        shelter_id: `eq.${shelterId}`,
        is_resolved: "eq.false",
      },
    })

    const alerts = buildDailyCareAlerts(payload, dog, shelterAlertSettings)

    if (alerts.length > 0) {
      await supabaseRequest("health_alerts", {
        method: "POST",
        headers: {
          Prefer: "return=minimal",
        },
        body: alerts.map((alert) => ({
          shelter_id: shelterId,
          dog_id: id,
          alert_type: alert.alert_type,
          priority: alert.priority,
          title: alert.title,
          description: alert.description,
          source_record_id: createdRecord.id,
        })),
      })
    }
  }

  return apiSuccess(
    {
      item: mapDailyCareRecord(createdRecord),
    },
    { status: 201 }
  )
})
