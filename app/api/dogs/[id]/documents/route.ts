import { ApiError } from "@/lib/server/api-errors"
import { apiSuccess, withRouteHandler } from "@/lib/server/api-response"
import { documentCreateSchema } from "@/lib/server/api-schemas"
import { getRequestContext } from "@/lib/server/request-context"
import { generateDocumentContent, buildDocumentTitle } from "@/lib/server/document-generator"
import { mapDailyCareRecord, mapDocument, mapDog, mapHealthAlert } from "@/lib/server/api-mappers"
import { supabaseRequest } from "@/lib/server/supabase-rest"

async function getDogForDocument(id: string, shelterId: string) {
  const [records, dailyCareRecords, healthAlerts, shelterRecords, shelterSettingRecords] = await Promise.all([
    supabaseRequest<any[]>("dogs", {
      query: {
        select:
          "id,shelter_id,name,gender,estimated_age_text,birth_date,weight_kg,breed,rescue_date,rescue_location,is_neutered,status,vaccination_status,adoption_readiness,readiness_score,personality,rescue_story,medical_notes,primary_photo_url,photo_urls,missing_info,created_at,updated_at,vaccinations(id,name,administered_on,next_due_on,hospital_name,notes)",
        id: `eq.${id}`,
        shelter_id: `eq.${shelterId}`,
        limit: 1,
      },
    }),
    supabaseRequest<any[]>("daily_care_records", {
      query: {
        select:
          "id,dog_id,care_date,feeding_amount_grams,feeding_completion,water_intake,medication_given,medication_notes,stool_condition,vomiting,vomiting_notes,energy_level,aggression,anxiety,behavior_notes,health_notes,special_observations,weight_kg,temperature_c,image_urls,is_draft,recorded_by,created_at,updated_at",
        dog_id: `eq.${id}`,
        shelter_id: `eq.${shelterId}`,
        order: "care_date.desc",
        limit: 10,
      },
    }),
    supabaseRequest<any[]>("health_alerts", {
      query: {
        select:
          "id,dog_id,alert_type,priority,title,description,is_resolved,resolved_at,resolved_by,created_at,updated_at,dogs(name,primary_photo_url)",
        dog_id: `eq.${id}`,
        shelter_id: `eq.${shelterId}`,
        order: "created_at.desc",
        limit: 10,
      },
    }),
    supabaseRequest<any[]>("shelters", {
      query: {
        select: "id,name,description,address,phone,email,country_code",
        id: `eq.${shelterId}`,
        limit: 1,
      },
    }),
    supabaseRequest<any[]>("shelter_settings", {
      query: {
        select:
          "document_default_language,document_include_shelter_info,document_include_contact_info,document_include_timestamp,document_custom_footer",
        shelter_id: `eq.${shelterId}`,
        limit: 1,
      },
    }),
  ])

  const dog = records[0]
  if (!dog) {
    throw new ApiError(404, "DOG_NOT_FOUND", "Dog not found.")
  }

  return {
    dog,
    dailyCareRecords: dailyCareRecords.map(mapDailyCareRecord),
    healthAlerts: healthAlerts.map(mapHealthAlert),
    shelter: shelterRecords[0] ?? null,
    shelterSettings: shelterSettingRecords[0] ?? null,
  }
}

function applyDocumentPreferences(
  markdown: string,
  options: {
    title: string
    generatedAt: string
    languageCode: string
    shelter?: {
      name?: string | null
      description?: string | null
      address?: string | null
      phone?: string | null
      email?: string | null
    } | null
    shelterSettings?: {
      document_include_shelter_info?: boolean
      document_include_contact_info?: boolean
      document_include_timestamp?: boolean
      document_custom_footer?: string | null
    } | null
  }
) {
  const language = options.languageCode.startsWith("ko") ? "ko" : "en"
  const sections: string[] = [markdown.trim()]

  if (options.shelterSettings?.document_include_shelter_info !== false && options.shelter?.name) {
    const shelterLines = [
      language === "ko" ? `보호소: ${options.shelter.name}` : `Shelter: ${options.shelter.name}`,
      options.shelter.description,
      options.shelter.address
        ? language === "ko"
          ? `주소: ${options.shelter.address}`
          : `Address: ${options.shelter.address}`
        : null,
    ].filter(Boolean)

    sections.push(
      `## ${language === "ko" ? "보호소 정보" : "Shelter Information"}\n${shelterLines
        .map((line) => `- ${line}`)
        .join("\n")}`
    )
  }

  if (options.shelterSettings?.document_include_contact_info !== false) {
    const contactLines = [
      options.shelter?.phone
        ? language === "ko"
          ? `연락처: ${options.shelter.phone}`
          : `Phone: ${options.shelter.phone}`
        : null,
      options.shelter?.email
        ? language === "ko"
          ? `이메일: ${options.shelter.email}`
          : `Email: ${options.shelter.email}`
        : null,
    ].filter(Boolean)

    if (contactLines.length > 0) {
      sections.push(
        `## ${language === "ko" ? "연락처" : "Contact"}\n${contactLines
          .map((line) => `- ${line}`)
          .join("\n")}`
      )
    }
  }

  if (options.shelterSettings?.document_include_timestamp !== false) {
    sections.push(
      `## ${language === "ko" ? "생성 정보" : "Generation Info"}\n- ${
        language === "ko" ? "생성 시각" : "Generated at"
      }: ${new Date(options.generatedAt).toLocaleString(language === "ko" ? "ko-KR" : "en-US")}`
    )
  }

  if (options.shelterSettings?.document_custom_footer?.trim()) {
    sections.push(
      `## ${language === "ko" ? "추가 메모" : "Additional Note"}\n${options.shelterSettings.document_custom_footer.trim()}`
    )
  }

  return sections.join("\n\n")
}

export const POST = withRouteHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { shelterId, profileId } = await getRequestContext(request)
  const { id } = await params
  const payload = documentCreateSchema.parse(await request.json())
  const { dog, dailyCareRecords, healthAlerts, shelter, shelterSettings } = await getDogForDocument(id, shelterId)
  const mappedDog = mapDog(dog)
  const languageCode =
    payload.languageCode || shelterSettings?.document_default_language || "en"
  const title = payload.title ?? buildDocumentTitle(payload.documentType, mappedDog.name, languageCode)

  try {
    const rawMarkdown = generateDocumentContent(payload.documentType, languageCode, {
      name: mappedDog.name,
      gender: mappedDog.gender,
      estimatedAge: mappedDog.estimatedAge,
      weight: mappedDog.weight,
      breed: mappedDog.breed,
      isNeutered: mappedDog.isNeutered,
      rescueDate: mappedDog.rescueDate,
      rescueLocation: mappedDog.rescueLocation,
      personality: mappedDog.personality,
      rescueStory: mappedDog.rescueStory,
      medicalNotes: mappedDog.medicalNotes,
      vaccinationStatus: mappedDog.vaccinationStatus,
      adoptionReadiness: mappedDog.adoptionReadiness,
      vaccinations: mappedDog.vaccinations,
      dailyCareRecords,
      healthAlerts,
    })
    const generatedAt = new Date().toISOString()
    const contentMarkdown = applyDocumentPreferences(rawMarkdown, {
      title,
      generatedAt,
      languageCode,
      shelter,
      shelterSettings,
    })

    const inserted = await supabaseRequest<any[]>("adoption_documents", {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: {
        shelter_id: shelterId,
        dog_id: id,
        document_type: payload.documentType,
        language_code: languageCode,
        title,
        status: "generated",
        content_markdown: contentMarkdown,
        generated_by: profileId ?? null,
        generated_at: generatedAt,
      },
      query: {
        select:
          "id,dog_id,shelter_id,document_type,language_code,title,status,content_markdown,file_url,generated_by,generated_at,created_at,updated_at",
      },
    })

    return apiSuccess(
      {
        item: mapDocument(inserted[0]),
      },
      { status: 201 }
    )
  } catch (error) {
    await supabaseRequest("adoption_documents", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: {
        shelter_id: shelterId,
        dog_id: id,
        document_type: payload.documentType,
        language_code: languageCode,
        title,
        status: "failed",
        content_markdown: null,
        generated_by: profileId ?? null,
      },
    }).catch(() => undefined)

    throw error
  }
})
