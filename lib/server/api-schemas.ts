import { z } from "zod"

const uuidSchema = z.string().uuid()
const dateSchema = z.string().date()
const optionalDateSchema = dateSchema.optional().nullable()
const optionalTextSchema = z.string().trim().min(1).optional().nullable()

export const dogStatusSchema = z.enum(["protected", "treatment", "temporary", "adopted"])
export const genderSchema = z.enum(["male", "female", "unknown"])
export const vaccinationStatusSchema = z.enum(["complete", "in_progress", "not_started"])
export const adoptionReadinessSchema = z.enum(["ready", "missing_info", "not_ready"])
export const feedingCompletionSchema = z.enum(["complete", "most", "half", "none", "not_fed"])
export const waterIntakeSchema = z.enum(["enough", "normal", "low", "none"])
export const stoolConditionSchema = z.enum(["normal", "soft", "diarrhea", "constipation", "blood", "unknown"])
export const energyLevelSchema = z.enum(["very_active", "active", "normal", "low", "lethargic"])
export const alertPrioritySchema = z.enum(["critical", "high", "medium", "low"])
export const alertTypeSchema = z.enum([
  "appetite_issue",
  "vomiting",
  "behavior_issue",
  "medication_missed",
  "weight_loss",
  "general_health",
])
export const documentTypeSchema = z.enum(["profile", "vaccination", "adoption", "transport"])

export const vaccinationInputSchema = z.object({
  name: z.string().trim().min(1),
  date: dateSchema,
  nextDue: optionalDateSchema,
  hospital: optionalTextSchema,
  notes: optionalTextSchema,
})

export const dogCreateSchema = z.object({
  name: z.string().trim().min(1),
  gender: genderSchema.default("unknown"),
  estimatedAge: optionalTextSchema,
  birthDate: optionalDateSchema,
  weight: z.number().nonnegative().optional().nullable(),
  breed: optionalTextSchema,
  rescueDate: optionalDateSchema,
  rescueLocation: optionalTextSchema,
  isNeutered: z.boolean().default(false),
  status: dogStatusSchema.default("protected"),
  vaccinationStatus: vaccinationStatusSchema.default("not_started"),
  adoptionReadiness: adoptionReadinessSchema.default("missing_info"),
  readinessScore: z.number().int().min(0).max(100).default(0),
  personality: optionalTextSchema,
  rescueStory: optionalTextSchema,
  medicalNotes: optionalTextSchema,
  primaryPhotoUrl: optionalTextSchema,
  photos: z.array(z.string().url()).default([]),
  missingInfo: z.array(z.string().trim().min(1)).default([]),
  vaccinations: z.array(vaccinationInputSchema).default([]),
})

export const dogUpdateSchema = dogCreateSchema.partial()

export const dailyCareCreateSchema = z.object({
  date: dateSchema,
  feedingAmount: z.number().int().nonnegative().optional().nullable(),
  feedingCompletion: feedingCompletionSchema.default("not_fed"),
  waterIntake: waterIntakeSchema.default("normal"),
  medicationGiven: z.boolean().default(false),
  medicationNotes: optionalTextSchema,
  stoolCondition: stoolConditionSchema.default("unknown"),
  vomiting: z.boolean().default(false),
  vomitingNotes: optionalTextSchema,
  energyLevel: energyLevelSchema.default("normal"),
  aggression: z.boolean().default(false),
  anxiety: z.boolean().default(false),
  behaviorNotes: optionalTextSchema,
  healthNotes: optionalTextSchema,
  specialObservations: optionalTextSchema,
  weight: z.number().nonnegative().optional().nullable(),
  temperature: z.number().min(30).max(45).optional().nullable(),
  imageUrls: z.array(z.string().url()).default([]),
  isDraft: z.boolean().default(false),
})

export const resolveHealthAlertSchema = z.object({
  resolvedBy: uuidSchema.optional(),
})

export const documentCreateSchema = z.object({
  documentType: documentTypeSchema,
  languageCode: z.string().trim().min(2).default("en"),
  title: optionalTextSchema,
})

export const settingsScopeSchema = z.enum(["shelter", "user"]).default("shelter")

export const shelterProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    address: z.string().trim().max(500).optional(),
    phone: z.string().trim().max(50).optional(),
    email: z.string().trim().email().max(255).optional(),
    countryCode: z.string().trim().min(2).max(8).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

export const templateSettingsUpdateSchema = z
  .object({
    defaultLanguage: z.enum(["en", "ko"]).optional(),
    includeShelterInfo: z.boolean().optional(),
    includeContactInfo: z.boolean().optional(),
    includeTimestamp: z.boolean().optional(),
    customFooter: z.string().max(2000).optional(),
  })
  .strict()

export const alertSettingsUpdateSchema = z
  .object({
    appetiteAlertOnHalfFeeding: z.boolean().optional(),
    appetiteAlertOnNoFeeding: z.boolean().optional(),
    lowWaterAlertEnabled: z.boolean().optional(),
    lowEnergyAlertEnabled: z.boolean().optional(),
    behaviorAlertEnabled: z.boolean().optional(),
    vomitingAlertPriority: alertPrioritySchema.optional(),
    generalHealthAlertPriority: alertPrioritySchema.optional(),
  })
  .strict()

export const aiSettingsUpdateSchema = z
  .object({
    autoTranslate: z.boolean().optional(),
    includeEmoji: z.boolean().optional(),
    formalTone: z.boolean().optional(),
    includeDisclaimer: z.boolean().optional(),
  })
  .strict()

export const settingsUpdateSchema = z
  .object({
    shelterProfile: shelterProfileUpdateSchema.optional(),
    templateSettings: templateSettingsUpdateSchema.optional(),
    alertSettings: alertSettingsUpdateSchema.optional(),
    aiSettings: aiSettingsUpdateSchema.optional(),
  })
  .strict()
