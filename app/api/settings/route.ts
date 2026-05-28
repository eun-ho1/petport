import { ApiError } from "@/lib/server/api-errors"
import { apiSuccess, assertNonEmptyPatch, withRouteHandler } from "@/lib/server/api-response"
import { getRequestContext } from "@/lib/server/request-context"
import { settingsUpdateSchema } from "@/lib/server/api-schemas"
import { supabaseRequest } from "@/lib/server/supabase-rest"

const shelterSettingsSelect = [
  "shelter_id",
  "document_default_language",
  "document_include_shelter_info",
  "document_include_contact_info",
  "document_include_timestamp",
  "document_custom_footer",
  "appetite_alert_on_half_feeding",
  "appetite_alert_on_no_feeding",
  "low_water_alert_enabled",
  "low_energy_alert_enabled",
  "behavior_alert_enabled",
  "vomiting_alert_priority",
  "general_health_alert_priority",
  "created_at",
  "updated_at",
].join(",")

const profileSettingsSelect = [
  "profile_id",
  "shelter_id",
  "auto_translate",
  "include_emoji",
  "formal_tone",
  "include_disclaimer",
  "created_at",
  "updated_at",
].join(",")

const shelterSelect = [
  "id",
  "name",
  "description",
  "address",
  "phone",
  "email",
  "country_code",
  "is_active",
  "created_at",
  "updated_at",
].join(",")

function getDefaultTemplateSettings() {
  return {
    defaultLanguage: "en" as const,
    includeShelterInfo: true,
    includeContactInfo: true,
    includeTimestamp: true,
    customFooter: "",
  }
}

function getDefaultAlertSettings() {
  return {
    appetiteAlertOnHalfFeeding: true,
    appetiteAlertOnNoFeeding: true,
    lowWaterAlertEnabled: true,
    lowEnergyAlertEnabled: true,
    behaviorAlertEnabled: true,
    vomitingAlertPriority: "critical" as const,
    generalHealthAlertPriority: "medium" as const,
  }
}

function getDefaultAiSettings() {
  return {
    autoTranslate: true,
    includeEmoji: false,
    formalTone: true,
    includeDisclaimer: true,
  }
}

function mapShelterProfile(record: any) {
  return {
    id: record.id,
    name: record.name ?? "",
    description: record.description ?? "",
    address: record.address ?? "",
    phone: record.phone ?? "",
    email: record.email ?? "",
    countryCode: record.country_code ?? "KR",
    isActive: record.is_active ?? true,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

function mapShelterSettings(record?: any) {
  const defaults = getDefaultTemplateSettings()
  const alertDefaults = getDefaultAlertSettings()

  return {
    templateSettings: {
      defaultLanguage: record?.document_default_language === "ko" ? "ko" : defaults.defaultLanguage,
      includeShelterInfo: record?.document_include_shelter_info ?? defaults.includeShelterInfo,
      includeContactInfo: record?.document_include_contact_info ?? defaults.includeContactInfo,
      includeTimestamp: record?.document_include_timestamp ?? defaults.includeTimestamp,
      customFooter: record?.document_custom_footer ?? defaults.customFooter,
    },
    alertSettings: {
      appetiteAlertOnHalfFeeding:
        record?.appetite_alert_on_half_feeding ?? alertDefaults.appetiteAlertOnHalfFeeding,
      appetiteAlertOnNoFeeding:
        record?.appetite_alert_on_no_feeding ?? alertDefaults.appetiteAlertOnNoFeeding,
      lowWaterAlertEnabled: record?.low_water_alert_enabled ?? alertDefaults.lowWaterAlertEnabled,
      lowEnergyAlertEnabled: record?.low_energy_alert_enabled ?? alertDefaults.lowEnergyAlertEnabled,
      behaviorAlertEnabled: record?.behavior_alert_enabled ?? alertDefaults.behaviorAlertEnabled,
      vomitingAlertPriority: record?.vomiting_alert_priority ?? alertDefaults.vomitingAlertPriority,
      generalHealthAlertPriority:
        record?.general_health_alert_priority ?? alertDefaults.generalHealthAlertPriority,
    },
  }
}

function mapProfileSettings(record?: any) {
  const defaults = getDefaultAiSettings()

  return {
    autoTranslate: record?.auto_translate ?? defaults.autoTranslate,
    includeEmoji: record?.include_emoji ?? defaults.includeEmoji,
    formalTone: record?.formal_tone ?? defaults.formalTone,
    includeDisclaimer: record?.include_disclaimer ?? defaults.includeDisclaimer,
  }
}

async function resolveProfileId(shelterId: string, profileId: string) {
  const existing = await supabaseRequest<any[]>("profiles", {
    query: {
      select: "id,shelter_id,is_active",
      id: `eq.${profileId}`,
      shelter_id: `eq.${shelterId}`,
      is_active: "eq.true",
      limit: 1,
    },
  })

  return existing[0]?.id as string | undefined
}

async function getSettingsPayload(shelterId: string, profileId: string) {
  const [shelterRecords, shelterSettingsRecords, resolvedProfileId] = await Promise.all([
    supabaseRequest<any[]>("shelters", {
      query: {
        select: shelterSelect,
        id: `eq.${shelterId}`,
        limit: 1,
      },
    }),
    supabaseRequest<any[]>("shelter_settings", {
      query: {
        select: shelterSettingsSelect,
        shelter_id: `eq.${shelterId}`,
        limit: 1,
      },
    }),
    resolveProfileId(shelterId, profileId),
  ])

  const shelter = shelterRecords[0]
  if (!shelter) {
    throw new ApiError(404, "SHELTER_NOT_FOUND", "Shelter not found.")
  }

  const profileSettingsRecords =
    resolvedProfileId === undefined
      ? []
      : await supabaseRequest<any[]>("profile_settings", {
          query: {
            select: profileSettingsSelect,
            profile_id: `eq.${resolvedProfileId}`,
            limit: 1,
          },
        })

  const mappedShelterSettings = mapShelterSettings(shelterSettingsRecords[0])

  return {
    shelterProfile: mapShelterProfile(shelter),
    templateSettings: mappedShelterSettings.templateSettings,
    alertSettings: mappedShelterSettings.alertSettings,
    aiSettings: mapProfileSettings(profileSettingsRecords[0]),
    scope: {
      shelterId,
      profileId: resolvedProfileId,
    },
  }
}

export const GET = withRouteHandler(async (request: Request) => {
  const { shelterId, profileId } = await getRequestContext(request)
  return apiSuccess(await getSettingsPayload(shelterId, profileId))
})

export const PATCH = withRouteHandler(async (request: Request) => {
  const { shelterId, profileId } = await getRequestContext(request)
  const payload = settingsUpdateSchema.parse(await request.json())
  assertNonEmptyPatch(payload)

  if (payload.shelterProfile) {
    await supabaseRequest("shelters", {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal",
      },
      body: {
        ...(payload.shelterProfile.name !== undefined ? { name: payload.shelterProfile.name } : {}),
        ...(payload.shelterProfile.description !== undefined
          ? { description: payload.shelterProfile.description }
          : {}),
        ...(payload.shelterProfile.address !== undefined ? { address: payload.shelterProfile.address } : {}),
        ...(payload.shelterProfile.phone !== undefined ? { phone: payload.shelterProfile.phone } : {}),
        ...(payload.shelterProfile.email !== undefined ? { email: payload.shelterProfile.email } : {}),
        ...(payload.shelterProfile.countryCode !== undefined
          ? { country_code: payload.shelterProfile.countryCode }
          : {}),
        ...(payload.shelterProfile.isActive !== undefined ? { is_active: payload.shelterProfile.isActive } : {}),
      },
      query: {
        id: `eq.${shelterId}`,
      },
    })
  }

  if (payload.templateSettings || payload.alertSettings) {
    await supabaseRequest("shelter_settings", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: {
        shelter_id: shelterId,
        ...(payload.templateSettings?.defaultLanguage !== undefined
          ? { document_default_language: payload.templateSettings.defaultLanguage }
          : {}),
        ...(payload.templateSettings?.includeShelterInfo !== undefined
          ? { document_include_shelter_info: payload.templateSettings.includeShelterInfo }
          : {}),
        ...(payload.templateSettings?.includeContactInfo !== undefined
          ? { document_include_contact_info: payload.templateSettings.includeContactInfo }
          : {}),
        ...(payload.templateSettings?.includeTimestamp !== undefined
          ? { document_include_timestamp: payload.templateSettings.includeTimestamp }
          : {}),
        ...(payload.templateSettings?.customFooter !== undefined
          ? { document_custom_footer: payload.templateSettings.customFooter }
          : {}),
        ...(payload.alertSettings?.appetiteAlertOnHalfFeeding !== undefined
          ? { appetite_alert_on_half_feeding: payload.alertSettings.appetiteAlertOnHalfFeeding }
          : {}),
        ...(payload.alertSettings?.appetiteAlertOnNoFeeding !== undefined
          ? { appetite_alert_on_no_feeding: payload.alertSettings.appetiteAlertOnNoFeeding }
          : {}),
        ...(payload.alertSettings?.lowWaterAlertEnabled !== undefined
          ? { low_water_alert_enabled: payload.alertSettings.lowWaterAlertEnabled }
          : {}),
        ...(payload.alertSettings?.lowEnergyAlertEnabled !== undefined
          ? { low_energy_alert_enabled: payload.alertSettings.lowEnergyAlertEnabled }
          : {}),
        ...(payload.alertSettings?.behaviorAlertEnabled !== undefined
          ? { behavior_alert_enabled: payload.alertSettings.behaviorAlertEnabled }
          : {}),
        ...(payload.alertSettings?.vomitingAlertPriority !== undefined
          ? { vomiting_alert_priority: payload.alertSettings.vomitingAlertPriority }
          : {}),
        ...(payload.alertSettings?.generalHealthAlertPriority !== undefined
          ? { general_health_alert_priority: payload.alertSettings.generalHealthAlertPriority }
          : {}),
      },
      query: {
        on_conflict: "shelter_id",
      },
    })
  }

  if (payload.aiSettings) {
    const resolvedProfileId = await resolveProfileId(shelterId, profileId)
    if (!resolvedProfileId) {
      throw new ApiError(
        400,
        "PROFILE_CONTEXT_MISSING",
        "A profile is required to save user-level AI settings."
      )
    }

    await supabaseRequest("profile_settings", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: {
        profile_id: resolvedProfileId,
        shelter_id: shelterId,
        ...(payload.aiSettings.autoTranslate !== undefined
          ? { auto_translate: payload.aiSettings.autoTranslate }
          : {}),
        ...(payload.aiSettings.includeEmoji !== undefined
          ? { include_emoji: payload.aiSettings.includeEmoji }
          : {}),
        ...(payload.aiSettings.formalTone !== undefined
          ? { formal_tone: payload.aiSettings.formalTone }
          : {}),
        ...(payload.aiSettings.includeDisclaimer !== undefined
          ? { include_disclaimer: payload.aiSettings.includeDisclaimer }
          : {}),
      },
      query: {
        on_conflict: "profile_id",
      },
    })
  }

  return apiSuccess(await getSettingsPayload(shelterId, profileId))
})
