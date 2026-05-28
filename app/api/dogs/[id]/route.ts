import { ApiError } from "@/lib/server/api-errors"
import { apiSuccess, assertNonEmptyPatch, withRouteHandler } from "@/lib/server/api-response"
import { dogUpdateSchema } from "@/lib/server/api-schemas"
import { getRequestContext } from "@/lib/server/request-context"
import { mapDog } from "@/lib/server/api-mappers"
import { supabaseRequest } from "@/lib/server/supabase-rest"

const dogSelect =
  "id,shelter_id,name,gender,estimated_age_text,birth_date,weight_kg,breed,rescue_date,rescue_location,is_neutered,status,vaccination_status,adoption_readiness,readiness_score,personality,rescue_story,medical_notes,primary_photo_url,photo_urls,missing_info,created_at,updated_at,vaccinations(id,name,administered_on,next_due_on,hospital_name,notes)"

async function getDogOrThrow(id: string, shelterId: string) {
  const records = await supabaseRequest<any[]>("dogs", {
    query: {
      select: dogSelect,
      id: `eq.${id}`,
      shelter_id: `eq.${shelterId}`,
      limit: 1,
    },
  })

  const dog = records[0]

  if (!dog) {
    throw new ApiError(404, "DOG_NOT_FOUND", "Dog not found.")
  }

  return dog
}

export const GET = withRouteHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { shelterId } = await getRequestContext(request)
  const { id } = await params
  const dog = await getDogOrThrow(id, shelterId)

  return apiSuccess({
    item: mapDog(dog),
  })
})

export const PATCH = withRouteHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { shelterId } = await getRequestContext(request)
  const { id } = await params
  const payload = dogUpdateSchema.parse(await request.json())
  assertNonEmptyPatch(payload)

  await getDogOrThrow(id, shelterId)

  const updatePayload: Record<string, unknown> = {}

  if (payload.name !== undefined) updatePayload.name = payload.name
  if (payload.gender !== undefined) updatePayload.gender = payload.gender
  if (payload.estimatedAge !== undefined) updatePayload.estimated_age_text = payload.estimatedAge
  if (payload.birthDate !== undefined) updatePayload.birth_date = payload.birthDate
  if (payload.weight !== undefined) updatePayload.weight_kg = payload.weight
  if (payload.breed !== undefined) updatePayload.breed = payload.breed
  if (payload.rescueDate !== undefined) updatePayload.rescue_date = payload.rescueDate
  if (payload.rescueLocation !== undefined) updatePayload.rescue_location = payload.rescueLocation
  if (payload.isNeutered !== undefined) updatePayload.is_neutered = payload.isNeutered
  if (payload.status !== undefined) updatePayload.status = payload.status
  if (payload.vaccinationStatus !== undefined) updatePayload.vaccination_status = payload.vaccinationStatus
  if (payload.adoptionReadiness !== undefined) updatePayload.adoption_readiness = payload.adoptionReadiness
  if (payload.readinessScore !== undefined) updatePayload.readiness_score = payload.readinessScore
  if (payload.personality !== undefined) updatePayload.personality = payload.personality
  if (payload.rescueStory !== undefined) updatePayload.rescue_story = payload.rescueStory
  if (payload.medicalNotes !== undefined) updatePayload.medical_notes = payload.medicalNotes
  if (payload.primaryPhotoUrl !== undefined) {
    updatePayload.primary_photo_url = payload.primaryPhotoUrl
  }
  if (payload.photos !== undefined) {
    updatePayload.photo_urls = payload.photos
    if (payload.primaryPhotoUrl === undefined) {
      updatePayload.primary_photo_url = payload.photos[0] ?? null
    }
  }
  if (payload.missingInfo !== undefined) updatePayload.missing_info = payload.missingInfo

  await supabaseRequest("dogs", {
    method: "PATCH",
    headers: {
      Prefer: "return=minimal",
    },
    query: {
      id: `eq.${id}`,
      shelter_id: `eq.${shelterId}`,
    },
    body: updatePayload,
  })

  if (payload.vaccinations !== undefined) {
    await supabaseRequest("vaccinations", {
      method: "DELETE",
      headers: {
        Prefer: "return=minimal",
      },
      query: {
        dog_id: `eq.${id}`,
        shelter_id: `eq.${shelterId}`,
      },
    })

    if (payload.vaccinations.length > 0) {
      await supabaseRequest("vaccinations", {
        method: "POST",
        headers: {
          Prefer: "return=minimal",
        },
        body: payload.vaccinations.map((vaccination) => ({
          shelter_id: shelterId,
          dog_id: id,
          name: vaccination.name,
          administered_on: vaccination.date,
          next_due_on: vaccination.nextDue ?? null,
          hospital_name: vaccination.hospital ?? null,
          notes: vaccination.notes ?? null,
        })),
      })
    }
  }

  const updated = await getDogOrThrow(id, shelterId)

  return apiSuccess({
    item: mapDog(updated),
  })
})

export const DELETE = withRouteHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { shelterId } = await getRequestContext(request)
  const { id } = await params

  await getDogOrThrow(id, shelterId)

  await supabaseRequest("dogs", {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
    query: {
      id: `eq.${id}`,
      shelter_id: `eq.${shelterId}`,
    },
  })

  return apiSuccess({
    deleted: true,
    id,
  })
})
