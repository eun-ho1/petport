export type DogStatus = "protected" | "treatment" | "temporary" | "adopted"
export type Gender = "male" | "female" | "unknown"
export type VaccinationStatus = "complete" | "in_progress" | "not_started"
export type AdoptionReadiness = "ready" | "missing_info" | "not_ready"

export interface VaccinationRecord {
  id: string
  name: string
  date: string
  nextDue?: string
  hospital?: string
  notes?: string
}

export interface MedicalRecord {
  id: string
  date: string
  type: string
  description: string
  hospital?: string
  notes?: string
}

export interface Dog {
  id: string
  shelterId?: string
  name: string
  gender: Gender
  estimatedAge: string
  birthDate?: string
  weight: number
  breed: string
  rescueDate?: string
  rescueLocation: string
  isNeutered: boolean
  status: DogStatus
  vaccinationStatus: VaccinationStatus
  adoptionReadiness: AdoptionReadiness
  readinessScore: number
  primaryPhotoUrl?: string
  photos: string[]
  personality: string
  rescueStory: string
  medicalNotes: string
  vaccinations: VaccinationRecord[]
  medicalRecords: MedicalRecord[]
  missingInfo: string[]
  createdAt: string
  updatedAt: string
}

export type FeedingCompletion = "complete" | "most" | "half" | "none" | "not_fed"
export type WaterIntake = "enough" | "normal" | "low" | "none"
export type StoolCondition = "normal" | "soft" | "diarrhea" | "constipation" | "blood" | "unknown"
export type EnergyLevel = "very_active" | "active" | "normal" | "low" | "lethargic"

export interface DailyCareRecord {
  id: string
  dogId: string
  date: string
  feedingAmount: number
  feedingCompletion: FeedingCompletion
  waterIntake: WaterIntake
  medicationGiven: boolean
  medicationNotes?: string
  stoolCondition: StoolCondition
  vomiting: boolean
  vomitingNotes?: string
  energyLevel: EnergyLevel
  aggression: boolean
  anxiety: boolean
  behaviorNotes?: string
  healthNotes?: string
  specialObservations?: string
  weight?: number
  temperature?: number
  imageUrls?: string[]
  recordedBy?: string
  recordedAt: string
  createdAt?: string
  updatedAt?: string
  isDraft: boolean
}

export type AlertPriority = "critical" | "high" | "medium" | "low"
export type AlertType =
  | "appetite_issue"
  | "vomiting"
  | "behavior_issue"
  | "medication_missed"
  | "weight_loss"
  | "general_health"

export interface HealthAlert {
  id: string
  dogId: string
  dogName: string
  dogPhoto: string
  alertType: AlertType
  priority: AlertPriority
  title: string
  description: string
  createdAt: string
  updatedAt?: string
  isResolved: boolean
  resolvedAt?: string
  resolvedBy?: string
}

export type DocumentTypeId = "profile" | "vaccination" | "adoption" | "transport"

export interface DocumentType {
  id: DocumentTypeId
  name: string
  nameEn: string
  description: string
  requiredFields: string[]
}

export interface GeneratedDocument {
  id: string
  dogId: string
  shelterId?: string
  documentType: DocumentTypeId
  languageCode: string
  title: string
  status: "generated" | "draft" | "failed"
  contentMarkdown: string
  fileUrl?: string
  generatedBy?: string
  generatedAt: string
  createdAt: string
  updatedAt: string
}

export interface ShelterProfile {
  id?: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  countryCode: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TemplateSettings {
  defaultLanguage: "en" | "ko"
  includeShelterInfo: boolean
  includeContactInfo: boolean
  includeTimestamp: boolean
  customFooter: string
}

export interface AlertSettings {
  appetiteAlertOnHalfFeeding: boolean
  appetiteAlertOnNoFeeding: boolean
  lowWaterAlertEnabled: boolean
  lowEnergyAlertEnabled: boolean
  behaviorAlertEnabled: boolean
  vomitingAlertPriority: AlertPriority
  generalHealthAlertPriority: AlertPriority
}

export interface AiSettings {
  autoTranslate: boolean
  includeEmoji: boolean
  formalTone: boolean
  includeDisclaimer: boolean
}

export interface AppSettings {
  shelterProfile: ShelterProfile
  templateSettings: TemplateSettings
  alertSettings: AlertSettings
  aiSettings: AiSettings
  scope: {
    shelterId: string
    profileId?: string
  }
}
