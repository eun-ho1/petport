type DbVaccination = {
  id: string
  name: string
  administered_on: string
  next_due_on: string | null
  hospital_name: string | null
  notes: string | null
}

type DbDog = {
  id: string
  shelter_id: string
  name: string
  gender: "male" | "female" | "unknown"
  estimated_age_text: string | null
  birth_date: string | null
  weight_kg: number | null
  breed: string | null
  rescue_date: string | null
  rescue_location: string | null
  is_neutered: boolean
  status: "protected" | "treatment" | "temporary" | "adopted"
  vaccination_status: "complete" | "in_progress" | "not_started"
  adoption_readiness: "ready" | "missing_info" | "not_ready"
  readiness_score: number
  personality: string | null
  rescue_story: string | null
  medical_notes: string | null
  primary_photo_url: string | null
  photo_urls: string[]
  missing_info: string[]
  created_at: string
  updated_at: string
  vaccinations?: DbVaccination[]
}

type DbDailyCareRecord = {
  id: string
  dog_id: string
  care_date: string
  feeding_amount_grams: number | null
  feeding_completion: string
  water_intake: string
  medication_given: boolean
  medication_notes: string | null
  stool_condition: string
  vomiting: boolean
  vomiting_notes: string | null
  energy_level: string
  aggression: boolean
  anxiety: boolean
  behavior_notes: string | null
  health_notes: string | null
  special_observations: string | null
  weight_kg: number | null
  temperature_c: number | null
  image_urls: string[]
  is_draft: boolean
  recorded_by: string | null
  created_at: string
  updated_at: string
}

type DbHealthAlert = {
  id: string
  dog_id: string
  alert_type: string
  priority: string
  title: string
  description: string | null
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
  dogs?: {
    name: string
    primary_photo_url: string | null
  } | null
}

type DbDocument = {
  id: string
  dog_id: string
  shelter_id: string
  document_type: string
  language_code: string
  title: string
  status: string
  content_markdown: string | null
  file_url: string | null
  generated_by: string | null
  generated_at: string
  created_at: string
  updated_at: string
}

export function mapVaccination(record: DbVaccination) {
  return {
    id: record.id,
    name: record.name,
    date: record.administered_on,
    nextDue: record.next_due_on ?? undefined,
    hospital: record.hospital_name ?? undefined,
    notes: record.notes ?? undefined,
  }
}

export function mapDog(record: DbDog) {
  return {
    id: record.id,
    shelterId: record.shelter_id,
    name: record.name,
    gender: record.gender,
    estimatedAge: record.estimated_age_text ?? "",
    birthDate: record.birth_date ?? undefined,
    weight: record.weight_kg ?? 0,
    breed: record.breed ?? "",
    rescueDate: record.rescue_date ?? undefined,
    rescueLocation: record.rescue_location ?? "",
    isNeutered: record.is_neutered,
    status: record.status,
    vaccinationStatus: record.vaccination_status,
    adoptionReadiness: record.adoption_readiness,
    readinessScore: record.readiness_score,
    personality: record.personality ?? "",
    rescueStory: record.rescue_story ?? "",
    medicalNotes: record.medical_notes ?? "",
    primaryPhotoUrl: record.primary_photo_url ?? undefined,
    photos: record.photo_urls ?? [],
    missingInfo: record.missing_info ?? [],
    vaccinations: (record.vaccinations ?? []).map(mapVaccination),
    medicalRecords: [],
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

export function mapDailyCareRecord(record: DbDailyCareRecord) {
  return {
    id: record.id,
    dogId: record.dog_id,
    date: record.care_date,
    feedingAmount: record.feeding_amount_grams ?? 0,
    feedingCompletion: record.feeding_completion,
    waterIntake: record.water_intake,
    medicationGiven: record.medication_given,
    medicationNotes: record.medication_notes ?? undefined,
    stoolCondition: record.stool_condition,
    vomiting: record.vomiting,
    vomitingNotes: record.vomiting_notes ?? undefined,
    energyLevel: record.energy_level,
    aggression: record.aggression,
    anxiety: record.anxiety,
    behaviorNotes: record.behavior_notes ?? undefined,
    healthNotes: record.health_notes ?? undefined,
    specialObservations: record.special_observations ?? undefined,
    weight: record.weight_kg ?? undefined,
    temperature: record.temperature_c ?? undefined,
    imageUrls: record.image_urls ?? [],
    recordedBy: record.recorded_by ?? undefined,
    recordedAt: record.created_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    isDraft: record.is_draft,
  }
}

export function mapHealthAlert(record: DbHealthAlert) {
  return {
    id: record.id,
    dogId: record.dog_id,
    dogName: record.dogs?.name ?? "",
    dogPhoto: record.dogs?.primary_photo_url ?? "",
    alertType: record.alert_type,
    priority: record.priority,
    title: record.title,
    description: record.description ?? "",
    isResolved: record.is_resolved,
    resolvedAt: record.resolved_at ?? undefined,
    resolvedBy: record.resolved_by ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

export function mapDocument(record: DbDocument) {
  return {
    id: record.id,
    dogId: record.dog_id,
    shelterId: record.shelter_id,
    documentType: record.document_type,
    languageCode: record.language_code,
    title: record.title,
    status: record.status,
    contentMarkdown: record.content_markdown ?? "",
    fileUrl: record.file_url ?? undefined,
    generatedBy: record.generated_by ?? undefined,
    generatedAt: record.generated_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}
