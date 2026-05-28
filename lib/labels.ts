import type {
  AdoptionReadiness,
  AlertPriority,
  AlertType,
  DogStatus,
  DocumentType,
  EnergyLevel,
  FeedingCompletion,
  Gender,
  StoolCondition,
  VaccinationStatus,
  WaterIntake,
} from "@/lib/types"

export const dogStatusLabels: Record<DogStatus, string> = {
  protected: "보호 중",
  treatment: "치료 중",
  temporary: "임시 보호",
  adopted: "입양 완료",
}

export const genderLabels: Record<Gender, string> = {
  male: "수컷",
  female: "암컷",
  unknown: "미상",
}

export const vaccinationStatusLabels: Record<VaccinationStatus, string> = {
  complete: "완료",
  in_progress: "진행 중",
  not_started: "미접종",
}

export const adoptionReadinessLabels: Record<AdoptionReadiness, string> = {
  ready: "준비 완료",
  missing_info: "정보 부족",
  not_ready: "검토 필요",
}

export const feedingCompletionLabels: Record<FeedingCompletion, string> = {
  complete: "완식",
  most: "대부분 섭취",
  half: "절반 섭취",
  none: "거의 먹지 않음",
  not_fed: "급여 전",
}

export const waterIntakeLabels: Record<WaterIntake, string> = {
  enough: "충분",
  normal: "보통",
  low: "부족",
  none: "거의 없음",
}

export const stoolConditionLabels: Record<StoolCondition, string> = {
  normal: "정상",
  soft: "묽음",
  diarrhea: "설사",
  constipation: "변비",
  blood: "혈변",
  unknown: "확인 전",
}

export const energyLevelLabels: Record<EnergyLevel, string> = {
  very_active: "매우 활발",
  active: "활발",
  normal: "보통",
  low: "기운 없음",
  lethargic: "무기력",
}

export const alertPriorityLabels: Record<AlertPriority, string> = {
  critical: "긴급",
  high: "높음",
  medium: "보통",
  low: "낮음",
}

export const alertTypeLabels: Record<AlertType, string> = {
  appetite_issue: "식욕 저하",
  vomiting: "구토",
  behavior_issue: "행동 이상",
  medication_missed: "투약 누락",
  weight_loss: "체중 감소",
  general_health: "건강 이상",
}

export const documentTypes: DocumentType[] = [
  {
    id: "profile",
    name: "영문 프로필",
    nameEn: "English Profile",
    description: "해외 입양 전달용 기본 영문 프로필",
    requiredFields: ["name", "gender", "estimatedAge", "breed", "personality", "photos"],
  },
  {
    id: "vaccination",
    name: "접종 요약",
    nameEn: "Vaccination Summary",
    description: "예방접종 이력을 정리한 문서",
    requiredFields: ["vaccinations"],
  },
  {
    id: "adoption",
    name: "입양 정보 시트",
    nameEn: "Adoption Information Sheet",
    description: "해외 입양처 공유용 소개 문서",
    requiredFields: ["personality", "rescueStory", "medicalNotes"],
  },
  {
    id: "transport",
    name: "이동 정보 문서",
    nameEn: "Transport Information",
    description: "이동 및 운송 준비용 문서",
    requiredFields: ["weight", "vaccinations", "isNeutered"],
  },
]
