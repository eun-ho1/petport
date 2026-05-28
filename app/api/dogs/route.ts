import { apiSuccess, withRouteHandler } from "@/lib/server/api-response"
import { dogCreateSchema } from "@/lib/server/api-schemas"
import { getRequestContext } from "@/lib/server/request-context"
import { mapDog } from "@/lib/server/api-mappers"
import { supabaseRequest } from "@/lib/server/supabase-rest"

const dogSelect =
  "id,shelter_id,name,gender,estimated_age_text,birth_date,weight_kg,breed,rescue_date,rescue_location,is_neutered,status,vaccination_status,adoption_readiness,readiness_score,personality,rescue_story,medical_notes,primary_photo_url,photo_urls,missing_info,created_at,updated_at,vaccinations(id,name,administered_on,next_due_on,hospital_name,notes)"

export const GET = withRouteHandler(async (request: Request) => {
  const { shelterId } = await getRequestContext(request)

  const records = await supabaseRequest<any[]>("dogs", {
    query: {
      select: dogSelect,
      shelter_id: `eq.${shelterId}`,
      order: "created_at.desc",
    },
  })

  return apiSuccess({
    items: records.map(mapDog),
  })
})

export const POST = withRouteHandler(async (request: Request) => {
  const { shelterId, profileId } = await getRequestContext(request)
  const payload = dogCreateSchema.parse(await request.json())

  const insertedDogs = await supabaseRequest<any[]>("dogs", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: {
      shelter_id: shelterId,
      name: payload.name,
      gender: payload.gender,
      estimated_age_text: payload.estimatedAge ?? null,
      birth_date: payload.birthDate ?? null,
      weight_kg: payload.weight ?? null,
      breed: payload.breed ?? null,
      rescue_date: payload.rescueDate ?? null,
      rescue_location: payload.rescueLocation ?? null,
      is_neutered: payload.isNeutered,
      status: payload.status,
      vaccination_status: payload.vaccinationStatus,
      adoption_readiness: payload.adoptionReadiness,
      readiness_score: payload.readinessScore,
      personality: payload.personality ?? null,
      rescue_story: payload.rescueStory ?? null,
      medical_notes: payload.medicalNotes ?? null,
      primary_photo_url: payload.primaryPhotoUrl ?? payload.photos[0] ?? null,
      photo_urls: payload.photos,
      missing_info: payload.missingInfo,
      created_by: profileId ?? null,
    },
    query: {
      select: "id",
    },
  })

  const dogId = insertedDogs[0]?.id

  if (payload.vaccinations.length > 0 && dogId) {
    await supabaseRequest("vaccinations", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: payload.vaccinations.map((vaccination) => ({
        shelter_id: shelterId,
        dog_id: dogId,
        name: vaccination.name,
        administered_on: vaccination.date,
        next_due_on: vaccination.nextDue ?? null,
        hospital_name: vaccination.hospital ?? null,
        notes: vaccination.notes ?? null,
      })),
    })
  }

  const created = await supabaseRequest<any[]>("dogs", {
    query: {
      select: dogSelect,
      id: `eq.${dogId}`,
      limit: 1,
    },
  })

  return apiSuccess(
    {
      item: mapDog(created[0]),
    },
    { status: 201 }
  )
})
