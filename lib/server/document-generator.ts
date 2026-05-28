import { renderDocumentTemplate, type SupportedDocumentLanguage, type SupportedDocumentType } from "@/lib/server/document-templates"

type VaccinationForDocument = {
  name: string
  date: string
  nextDue?: string
}

type DailyCareForDocument = {
  date: string
  feedingCompletion: string
  waterIntake: string
  medicationGiven: boolean
  medicationNotes?: string
  vomiting: boolean
  vomitingNotes?: string
  energyLevel: string
  aggression: boolean
  anxiety: boolean
  behaviorNotes?: string
  healthNotes?: string
  specialObservations?: string
  weight?: number
  temperature?: number
  isDraft: boolean
}

type HealthAlertForDocument = {
  title: string
  description: string
  priority: string
  isResolved: boolean
  createdAt: string
}

export type DogForDocument = {
  name: string
  gender: string
  estimatedAge: string
  weight: number
  breed: string
  isNeutered: boolean
  rescueDate?: string
  rescueLocation: string
  personality: string
  rescueStory: string
  medicalNotes: string
  vaccinationStatus: string
  adoptionReadiness: string
  vaccinations: VaccinationForDocument[]
  dailyCareRecords: DailyCareForDocument[]
  healthAlerts: HealthAlertForDocument[]
}

function getLanguage(languageCode: string): SupportedDocumentLanguage {
  return languageCode.toLowerCase().startsWith("ko") ? "ko" : "en"
}

function yesNo(value: boolean, language: SupportedDocumentLanguage) {
  return value ? (language === "ko" ? "예" : "Yes") : language === "ko" ? "아니오" : "No"
}

function genderLabel(value: string, language: SupportedDocumentLanguage) {
  if (value === "male") return language === "ko" ? "수컷" : "Male"
  if (value === "female") return language === "ko" ? "암컷" : "Female"
  return language === "ko" ? "미상" : "Unknown"
}

function vaccinationStatusLabel(value: string, language: SupportedDocumentLanguage) {
  const map =
    language === "ko"
      ? {
          complete: "완료",
          in_progress: "진행 중",
          not_started: "미접종",
        }
      : {
          complete: "Complete",
          in_progress: "In progress",
          not_started: "Not started",
        }

  return map[value as keyof typeof map] ?? value
}

function adoptionReadinessLabel(value: string, language: SupportedDocumentLanguage) {
  const map =
    language === "ko"
      ? {
          ready: "준비 완료",
          missing_info: "정보 부족",
          not_ready: "검토 필요",
        }
      : {
          ready: "Ready",
          missing_info: "Missing information",
          not_ready: "Needs review",
        }

  return map[value as keyof typeof map] ?? value
}

function feedingCompletionLabel(value: string, language: SupportedDocumentLanguage) {
  const map =
    language === "ko"
      ? {
          complete: "완식",
          most: "대부분 섭취",
          half: "절반 섭취",
          none: "거의 먹지 않음",
          not_fed: "급여 전",
        }
      : {
          complete: "Finished meal",
          most: "Ate most",
          half: "Ate about half",
          none: "Ate little or none",
          not_fed: "Not fed yet",
        }

  return map[value as keyof typeof map] ?? value
}

function waterIntakeLabel(value: string, language: SupportedDocumentLanguage) {
  const map =
    language === "ko"
      ? {
          enough: "충분",
          normal: "보통",
          low: "부족",
          none: "거의 없음",
        }
      : {
          enough: "Adequate",
          normal: "Normal",
          low: "Low",
          none: "Minimal",
        }

  return map[value as keyof typeof map] ?? value
}

function energyLevelLabel(value: string, language: SupportedDocumentLanguage) {
  const map =
    language === "ko"
      ? {
          very_active: "매우 활발",
          active: "활발",
          normal: "보통",
          low: "기운 없음",
          lethargic: "무기력",
        }
      : {
          very_active: "Very active",
          active: "Active",
          normal: "Normal",
          low: "Low energy",
          lethargic: "Lethargic",
        }

  return map[value as keyof typeof map] ?? value
}

function getDocumentName(documentType: SupportedDocumentType, language: SupportedDocumentLanguage) {
  const names =
    language === "ko"
      ? {
          profile: "해외입양 프로필",
          vaccination: "접종 요약서",
          adoption: "입양 정보 시트",
          transport: "이동 준비 문서",
        }
      : {
          profile: "Adoption Profile",
          vaccination: "Vaccination Summary",
          adoption: "Adoption Information Sheet",
          transport: "Transport Information",
        }

  return names[documentType]
}

export function buildDocumentTitle(
  documentType: SupportedDocumentType,
  dogName: string,
  languageCode = "en"
) {
  const language = getLanguage(languageCode)
  const suffix = getDocumentName(documentType, language)
  return language === "ko" ? `${dogName} ${suffix}` : `${dogName} ${suffix}`
}

function summarizeVaccinations(dog: DogForDocument, language: SupportedDocumentLanguage) {
  if (dog.vaccinations.length === 0) {
    return [
      language === "ko"
        ? "등록된 접종 기록이 아직 없습니다."
        : "No vaccination records have been registered yet.",
    ]
  }

  return dog.vaccinations.map((item) => {
    const nextDue = item.nextDue
      ? language === "ko"
        ? `, 다음 예정일 ${item.nextDue}`
        : `, next due ${item.nextDue}`
      : ""

    return language === "ko"
      ? `${item.name}: ${item.date}${nextDue}`
      : `${item.name}: ${item.date}${nextDue}`
  })
}

function summarizeHealth(dog: DogForDocument, language: SupportedDocumentLanguage) {
  const lines: string[] = []

  if (dog.medicalNotes.trim()) {
    lines.push(dog.medicalNotes.trim())
  }

  lines.push(
    language === "ko"
      ? `예방접종 상태: ${vaccinationStatusLabel(dog.vaccinationStatus, language)}`
      : `Vaccination status: ${vaccinationStatusLabel(dog.vaccinationStatus, language)}`
  )

  lines.push(
    language === "ko"
      ? `입양 준비도: ${adoptionReadinessLabel(dog.adoptionReadiness, language)}`
      : `Adoption readiness: ${adoptionReadinessLabel(dog.adoptionReadiness, language)}`
  )

  const unresolvedAlerts = dog.healthAlerts.filter((alert) => !alert.isResolved).slice(0, 3)
  if (unresolvedAlerts.length > 0) {
    unresolvedAlerts.forEach((alert) => {
      lines.push(
        language === "ko"
          ? `최근 알림: ${alert.title} - ${alert.description}`
          : `Recent alert: ${alert.title} - ${alert.description}`
      )
    })
  } else {
    lines.push(
      language === "ko"
        ? "최근 미해결 건강 알림은 없습니다."
        : "There are no recent unresolved health alerts."
    )
  }

  return lines
}

function summarizeCareHighlights(dog: DogForDocument, language: SupportedDocumentLanguage) {
  const records = dog.dailyCareRecords.filter((record) => !record.isDraft).slice(0, 7)
  const lines: string[] = []

  for (const record of records) {
    if (record.vomiting) {
      lines.push(
        language === "ko"
          ? `${record.date}: 구토 관찰${record.vomitingNotes ? ` - ${record.vomitingNotes}` : ""}`
          : `${record.date}: vomiting observed${record.vomitingNotes ? ` - ${record.vomitingNotes}` : ""}`
      )
    }

    if (record.energyLevel === "low" || record.energyLevel === "lethargic") {
      lines.push(
        language === "ko"
          ? `${record.date}: 활력 ${energyLevelLabel(record.energyLevel, language)}`
          : `${record.date}: energy level ${energyLevelLabel(record.energyLevel, language)}`
      )
    }

    if (record.aggression || record.anxiety) {
      lines.push(
        language === "ko"
          ? `${record.date}: 행동 특이사항${record.behaviorNotes ? ` - ${record.behaviorNotes}` : ""}`
          : `${record.date}: behavior concern${record.behaviorNotes ? ` - ${record.behaviorNotes}` : ""}`
      )
    }

    if (record.medicationGiven && record.medicationNotes?.trim()) {
      lines.push(
        language === "ko"
          ? `${record.date}: 투약 메모 - ${record.medicationNotes.trim()}`
          : `${record.date}: medication note - ${record.medicationNotes.trim()}`
      )
    }

    if (record.healthNotes?.trim()) {
      lines.push(
        language === "ko"
          ? `${record.date}: 건강 메모 - ${record.healthNotes.trim()}`
          : `${record.date}: health note - ${record.healthNotes.trim()}`
      )
    }

    if (record.specialObservations?.trim()) {
      lines.push(
        language === "ko"
          ? `${record.date}: 특이사항 - ${record.specialObservations.trim()}`
          : `${record.date}: special observation - ${record.specialObservations.trim()}`
      )
    }
  }

  if (lines.length === 0) {
    return [
      language === "ko"
        ? "최근 일일 케어 기록에서 특이사항이 발견되지 않았습니다."
        : "No notable concerns were found in recent daily care records.",
    ]
  }

  return Array.from(new Set(lines)).slice(0, 8)
}

function buildBasicInfo(dog: DogForDocument, language: SupportedDocumentLanguage) {
  const weightLine =
    dog.weight > 0
      ? language === "ko"
        ? `체중: ${dog.weight} kg`
        : `Weight: ${dog.weight} kg`
      : language === "ko"
        ? "체중: 미기록"
        : "Weight: not recorded"

  return [
    language === "ko" ? `이름: ${dog.name}` : `Name: ${dog.name}`,
    language === "ko"
      ? `성별: ${genderLabel(dog.gender, language)}`
      : `Gender: ${genderLabel(dog.gender, language)}`,
    language === "ko"
      ? `추정 나이: ${dog.estimatedAge || "미상"}`
      : `Estimated age: ${dog.estimatedAge || "Unknown"}`,
    language === "ko" ? `품종: ${dog.breed || "미상"}` : `Breed: ${dog.breed || "Unknown"}`,
    weightLine,
    language === "ko"
      ? `중성화 여부: ${yesNo(dog.isNeutered, language)}`
      : `Neutered/Spayed: ${yesNo(dog.isNeutered, language)}`,
  ]
}

function buildRescueSummary(dog: DogForDocument, language: SupportedDocumentLanguage) {
  const lines: string[] = []

  lines.push(
    language === "ko"
      ? `구조 날짜: ${dog.rescueDate ?? "미기록"}`
      : `Rescue date: ${dog.rescueDate ?? "Not recorded"}`
  )
  lines.push(
    language === "ko"
      ? `구조 장소: ${dog.rescueLocation || "미기록"}`
      : `Rescue location: ${dog.rescueLocation || "Not recorded"}`
  )

  if (dog.rescueStory.trim()) {
    lines.push(dog.rescueStory.trim())
  }

  return lines
}

function buildPersonalitySummary(dog: DogForDocument, language: SupportedDocumentLanguage) {
  const lines: string[] = []

  if (dog.personality.trim()) {
    lines.push(dog.personality.trim())
  } else {
    lines.push(
      language === "ko"
        ? "성격 메모가 아직 충분히 기록되지 않았습니다."
        : "Personality notes have not been fully recorded yet."
    )
  }

  const latestRecord = dog.dailyCareRecords.find((record) => !record.isDraft)
  if (latestRecord) {
    lines.push(
      language === "ko"
        ? `최근 급여 상태: ${feedingCompletionLabel(latestRecord.feedingCompletion, language)}, 음수 상태: ${waterIntakeLabel(latestRecord.waterIntake, language)}`
        : `Recent feeding: ${feedingCompletionLabel(latestRecord.feedingCompletion, language)}, water intake: ${waterIntakeLabel(latestRecord.waterIntake, language)}`
    )
  }

  return lines
}

function buildTransportNotes(dog: DogForDocument, language: SupportedDocumentLanguage) {
  const lines = summarizeCareHighlights(dog, language)
  const latestRecord = dog.dailyCareRecords.find((record) => !record.isDraft)

  if (latestRecord?.temperature) {
    lines.unshift(
      language === "ko"
        ? `최근 체온 기록: ${latestRecord.temperature}°C`
        : `Latest temperature record: ${latestRecord.temperature}°C`
    )
  }

  if (latestRecord?.weight) {
    lines.unshift(
      language === "ko"
        ? `최근 체중 기록: ${latestRecord.weight} kg`
        : `Latest weight record: ${latestRecord.weight} kg`
    )
  }

  return lines
}

export function generateDocumentContent(
  documentType: SupportedDocumentType,
  languageCode: string,
  dog: DogForDocument
) {
  const language = getLanguage(languageCode)
  const title = buildDocumentTitle(documentType, dog.name, language)
  const documentName = getDocumentName(documentType, language)

  return renderDocumentTemplate(documentType, language, {
    title,
    heroHeading:
      language === "ko"
        ? `${dog.name}의 ${documentName}`
        : `${documentName} for ${dog.name}`,
    heroBody:
      language === "ko"
        ? "보호소에 등록된 강아지 상세 정보, 접종 이력, 건강 메모, 최근 일일 케어 기록을 기반으로 자동 생성된 초안입니다."
        : "This draft was generated automatically from the dog's shelter profile, vaccination records, health notes, and recent daily care records.",
    basicInfo: buildBasicInfo(dog, language),
    vaccinationRecords: summarizeVaccinations(dog, language),
    healthSummary: summarizeHealth(dog, language),
    careHighlights: summarizeCareHighlights(dog, language),
    rescueSummary: buildRescueSummary(dog, language),
    personalitySummary: buildPersonalitySummary(dog, language),
    transportNotes: buildTransportNotes(dog, language),
  })
}
