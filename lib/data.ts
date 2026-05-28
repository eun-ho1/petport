import type { Dog, DocumentType, GeneratedDocument, ShelterProfile, StaffAccount, DailyCareRecord, HealthAlert } from "./types"

export const sampleDogs: Dog[] = [
  {
    id: "1",
    name: "초코",
    gender: "수컷",
    estimatedAge: "2살",
    weight: 8.5,
    breed: "믹스견",
    rescueDate: "2024-01-15",
    rescueLocation: "서울시 강남구",
    isNeutered: true,
    status: "보호중",
    vaccinationStatus: "완료",
    adoptionReadiness: "준비완료",
    readinessScore: 95,
    photos: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop",
    ],
    personality: "활발하고 사람을 좋아해요. 산책을 매우 좋아하며 다른 강아지들과도 잘 어울립니다.",
    rescueStory: "강남구 골목에서 배회하던 중 구조되었습니다. 처음에는 경계심이 있었지만 지금은 사람을 매우 좋아합니다.",
    medicalNotes: "전반적으로 건강 상태 양호. 정기 검진 필요.",
    vaccinations: [
      { id: "v1", name: "종합백신 (DHPPL)", date: "2024-01-20", nextDue: "2025-01-20", hospital: "행복동물병원" },
      { id: "v2", name: "광견병", date: "2024-01-20", nextDue: "2025-01-20", hospital: "행복동물병원" },
      { id: "v3", name: "켄넬코프", date: "2024-02-01", hospital: "행복동물병원" },
    ],
    medicalRecords: [
      { id: "m1", date: "2024-01-15", type: "건강검진", description: "구조 후 첫 건강검진", hospital: "행복동물병원" },
      { id: "m2", date: "2024-01-25", type: "중성화수술", description: "수술 완료, 회복 양호", hospital: "행복동물병원" },
    ],
    missingInfo: [],
    createdAt: "2024-01-15",
    updatedAt: "2024-03-01",
  },
  {
    id: "2",
    name: "뽀삐",
    gender: "암컷",
    estimatedAge: "3살",
    weight: 5.2,
    breed: "말티즈",
    rescueDate: "2024-02-10",
    rescueLocation: "경기도 수원시",
    isNeutered: true,
    status: "보호중",
    vaccinationStatus: "진행중",
    adoptionReadiness: "정보부족",
    readinessScore: 65,
    photos: [
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop",
    ],
    personality: "조용하고 온순해요. 무릎에 앉는 것을 좋아합니다.",
    rescueStory: "주인이 이사하면서 버려졌습니다. 발견 당시 영양실조 상태였으나 현재는 회복 완료.",
    medicalNotes: "피부 알러지 있음. 특수 사료 필요.",
    vaccinations: [
      { id: "v1", name: "종합백신 (DHPPL)", date: "2024-02-15", nextDue: "2025-02-15", hospital: "사랑동물병원" },
    ],
    medicalRecords: [
      { id: "m1", date: "2024-02-10", type: "건강검진", description: "영양실조 진단, 치료 시작", hospital: "사랑동물병원" },
      { id: "m2", date: "2024-03-01", type: "피부검사", description: "알러지 진단", hospital: "사랑동물병원" },
    ],
    missingInfo: ["광견병 접종", "켄넬코프 접종", "추가 사진"],
    createdAt: "2024-02-10",
    updatedAt: "2024-03-15",
  },
  {
    id: "3",
    name: "막동이",
    gender: "수컷",
    estimatedAge: "1살",
    weight: 12.3,
    breed: "진돗개 믹스",
    rescueDate: "2024-03-01",
    rescueLocation: "충남 천안시",
    isNeutered: false,
    status: "치료중",
    vaccinationStatus: "미접종",
    adoptionReadiness: "검토필요",
    readinessScore: 30,
    photos: [
      "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&h=400&fit=crop",
    ],
    personality: "활발하지만 아직 훈련이 필요해요.",
    rescueStory: "도로변에서 다친 채 발견되었습니다. 현재 다리 치료 중.",
    medicalNotes: "왼쪽 앞다리 골절 치료 중. 수술 후 재활 필요.",
    vaccinations: [],
    medicalRecords: [
      { id: "m1", date: "2024-03-01", type: "응급치료", description: "골절 수술", hospital: "24시동물병원" },
      { id: "m2", date: "2024-03-10", type: "재활치료", description: "물리치료 시작", hospital: "24시동물병원" },
    ],
    missingInfo: ["모든 예방접종", "중성화 수술", "성격 테스트", "추가 사진"],
    createdAt: "2024-03-01",
    updatedAt: "2024-03-20",
  },
  {
    id: "4",
    name: "하루",
    gender: "암컷",
    estimatedAge: "4살",
    weight: 6.8,
    breed: "포메라니안",
    rescueDate: "2023-11-20",
    rescueLocation: "서울시 마포구",
    isNeutered: true,
    status: "보호중",
    vaccinationStatus: "완료",
    adoptionReadiness: "준비완료",
    readinessScore: 100,
    photos: [
      "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1587559070757-f72a388edbba?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=400&h=400&fit=crop",
    ],
    personality: "사교적이고 영리해요. 간단한 명령어를 잘 따릅니다.",
    rescueStory: "노견 방치 신고로 구조되었습니다. 처음 보호소에 왔을 때 털 상태가 매우 안 좋았으나 지금은 완전히 회복했습니다.",
    medicalNotes: "치석 제거 완료. 전반적으로 매우 건강함.",
    vaccinations: [
      { id: "v1", name: "종합백신 (DHPPL)", date: "2023-12-01", nextDue: "2024-12-01", hospital: "행복동물병원" },
      { id: "v2", name: "광견병", date: "2023-12-01", nextDue: "2024-12-01", hospital: "행복동물병원" },
      { id: "v3", name: "켄넬코프", date: "2023-12-10", hospital: "행복동물병원" },
      { id: "v4", name: "심장사상충 예방", date: "2024-03-01", nextDue: "2024-04-01", hospital: "행복동물병원" },
    ],
    medicalRecords: [
      { id: "m1", date: "2023-11-20", type: "건강검진", description: "전체 건강검진", hospital: "행복동물병원" },
      { id: "m2", date: "2023-12-15", type: "스케일링", description: "치석 제거", hospital: "행복동물병원" },
    ],
    missingInfo: [],
    createdAt: "2023-11-20",
    updatedAt: "2024-03-01",
  },
  {
    id: "5",
    name: "콩이",
    gender: "수컷",
    estimatedAge: "6개월",
    weight: 3.2,
    breed: "비숑프리제",
    rescueDate: "2024-03-10",
    rescueLocation: "인천시 남동구",
    isNeutered: false,
    status: "임시보호",
    vaccinationStatus: "진행중",
    adoptionReadiness: "정보부족",
    readinessScore: 55,
    photos: [
      "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=400&fit=crop",
    ],
    personality: "호기심이 많고 장난기가 많아요.",
    rescueStory: "펫샵 폐업으로 인해 보호소로 이송되었습니다.",
    medicalNotes: "어린 나이로 건강 상태 양호. 성장 관찰 필요.",
    vaccinations: [
      { id: "v1", name: "종합백신 1차", date: "2024-03-15", hospital: "사랑동물병원" },
      { id: "v2", name: "종합백신 2차", date: "2024-04-01", hospital: "사랑동물병원" },
    ],
    medicalRecords: [
      { id: "m1", date: "2024-03-10", type: "건강검진", description: "기본 건강검진", hospital: "사랑동물병원" },
    ],
    missingInfo: ["종합백신 추가 접종", "광견병 접종", "중성화 수술 예정"],
    createdAt: "2024-03-10",
    updatedAt: "2024-04-05",
  },
]

export const documentTypes: DocumentType[] = [
  {
    id: "profile",
    name: "영문 프로필",
    nameEn: "English Dog Profile",
    description: "해외 입양을 위한 영문 강아지 프로필",
    requiredFields: ["name", "gender", "age", "breed", "personality", "photos"],
  },
  {
    id: "vaccination",
    name: "예방접종 요약서",
    nameEn: "Vaccination Summary",
    description: "예방접종 기록 영문 요약",
    requiredFields: ["vaccinations"],
  },
  {
    id: "adoption",
    name: "입양 정보 시트",
    nameEn: "Adoption Information Sheet",
    description: "입양자를 위한 상세 정보",
    requiredFields: ["name", "personality", "medicalNotes", "rescueStory"],
  },
  {
    id: "transport",
    name: "운송/비행 정보",
    nameEn: "Flight / Transport Info",
    description: "해외 운송을 위한 서류",
    requiredFields: ["name", "weight", "vaccinations", "isNeutered"],
  },
]

export const recentDocuments: GeneratedDocument[] = [
  {
    id: "d1",
    dogId: "1",
    dogName: "초코",
    documentType: "영문 프로필",
    generatedAt: "2024-04-01 14:30",
    status: "생성완료",
  },
  {
    id: "d2",
    dogId: "4",
    dogName: "하루",
    documentType: "예방접종 요약서",
    generatedAt: "2024-04-01 10:15",
    status: "생성완료",
  },
  {
    id: "d3",
    dogId: "4",
    dogName: "하루",
    documentType: "입양 정보 시트",
    generatedAt: "2024-03-28 09:00",
    status: "생성완료",
  },
]

export const shelterProfile: ShelterProfile = {
  name: "사랑의발자국 유기동물보호소",
  address: "서울시 강서구 화곡동 123-45",
  phone: "02-1234-5678",
  email: "contact@lovepaws.kr",
  description: "2015년부터 유기동물 구조 및 입양 활동을 하고 있습니다. 해외 입양 전문.",
}

export const staffAccounts: StaffAccount[] = [
  { id: "s1", name: "김민수", email: "minsu@lovepaws.kr", role: "관리자", createdAt: "2023-01-01" },
  { id: "s2", name: "이지현", email: "jihyun@lovepaws.kr", role: "직원", createdAt: "2023-06-15" },
  { id: "s3", name: "박준영", email: "junyoung@lovepaws.kr", role: "봉사자", createdAt: "2024-01-10" },
]

// Daily Care Sample Data
const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0]

export const dailyCareRecords: DailyCareRecord[] = [
  {
    id: "dc1",
    dogId: "1",
    date: today,
    feedingAmount: 200,
    feedingCompletion: "완식",
    waterIntake: "충분",
    medicationGiven: false,
    stoolCondition: "정상",
    vomiting: false,
    energyLevel: "활발",
    aggression: false,
    anxiety: false,
    behaviorNotes: "오늘 산책 시 다른 강아지와 잘 어울림",
    recordedAt: `${today}T09:30:00`,
    recordedBy: "이지현",
    isDraft: false,
  },
  {
    id: "dc2",
    dogId: "2",
    date: today,
    feedingAmount: 150,
    feedingCompletion: "반이상",
    waterIntake: "보통",
    medicationGiven: true,
    medicationNotes: "알러지약 투여",
    stoolCondition: "정상",
    vomiting: false,
    energyLevel: "보통",
    aggression: false,
    anxiety: true,
    behaviorNotes: "낯선 방문자에게 약간의 불안 증세",
    healthNotes: "피부 상태 개선 중",
    recordedAt: `${today}T10:15:00`,
    recordedBy: "김민수",
    isDraft: false,
  },
  {
    id: "dc3",
    dogId: "4",
    date: today,
    feedingAmount: 180,
    feedingCompletion: "완식",
    waterIntake: "충분",
    medicationGiven: false,
    stoolCondition: "정상",
    vomiting: false,
    energyLevel: "매우활발",
    aggression: false,
    anxiety: false,
    specialObservations: "입양 상담 예정 - 좋은 컨디션 유지",
    recordedAt: `${today}T08:45:00`,
    recordedBy: "박준영",
    isDraft: false,
  },
  {
    id: "dc4",
    dogId: "3",
    date: yesterday,
    feedingAmount: 100,
    feedingCompletion: "반이하",
    waterIntake: "부족",
    medicationGiven: true,
    medicationNotes: "진통제 투여",
    stoolCondition: "묽음",
    vomiting: true,
    vomitingNotes: "아침 식사 후 1회 구토",
    energyLevel: "저조",
    aggression: false,
    anxiety: true,
    healthNotes: "다리 수술 후 회복 중 - 컨디션 저조",
    recordedAt: `${yesterday}T11:00:00`,
    recordedBy: "이지현",
    isDraft: false,
  },
  {
    id: "dc5",
    dogId: "1",
    date: yesterday,
    feedingAmount: 200,
    feedingCompletion: "완식",
    waterIntake: "충분",
    medicationGiven: false,
    stoolCondition: "정상",
    vomiting: false,
    energyLevel: "활발",
    aggression: false,
    anxiety: false,
    recordedAt: `${yesterday}T09:00:00`,
    recordedBy: "김민수",
    isDraft: false,
  },
  {
    id: "dc6",
    dogId: "2",
    date: yesterday,
    feedingAmount: 120,
    feedingCompletion: "반이상",
    waterIntake: "보통",
    medicationGiven: true,
    stoolCondition: "정상",
    vomiting: false,
    energyLevel: "보통",
    aggression: false,
    anxiety: false,
    recordedAt: `${yesterday}T10:30:00`,
    recordedBy: "이지현",
    isDraft: false,
  },
  {
    id: "dc7",
    dogId: "4",
    date: yesterday,
    feedingAmount: 180,
    feedingCompletion: "완식",
    waterIntake: "충분",
    medicationGiven: false,
    stoolCondition: "정상",
    vomiting: false,
    energyLevel: "활발",
    aggression: false,
    anxiety: false,
    recordedAt: `${yesterday}T09:15:00`,
    recordedBy: "박준영",
    isDraft: false,
  },
  {
    id: "dc8",
    dogId: "5",
    date: yesterday,
    feedingAmount: 100,
    feedingCompletion: "완식",
    waterIntake: "충분",
    medicationGiven: false,
    stoolCondition: "정상",
    vomiting: false,
    energyLevel: "매우활발",
    aggression: false,
    anxiety: false,
    weight: 3.3,
    recordedAt: `${yesterday}T10:00:00`,
    recordedBy: "김민수",
    isDraft: false,
  },
]

export const healthAlerts: HealthAlert[] = [
  {
    id: "ha1",
    dogId: "3",
    dogName: "막동이",
    dogPhoto: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&h=400&fit=crop",
    alertType: "식욕부진",
    priority: "높음",
    description: "2일 연속 사료 섭취량 50% 미만",
    createdAt: `${today}T08:00:00`,
    isResolved: false,
  },
  {
    id: "ha2",
    dogId: "3",
    dogName: "막동이",
    dogPhoto: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&h=400&fit=crop",
    alertType: "구토",
    priority: "긴급",
    description: "어제 구토 증상 기록됨 - 수의사 확인 필요",
    createdAt: `${today}T08:00:00`,
    isResolved: false,
  },
  {
    id: "ha3",
    dogId: "5",
    dogName: "콩이",
    dogPhoto: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=400&fit=crop",
    alertType: "건강이상",
    priority: "보통",
    description: "오늘 일일 관리 기록 미등록",
    createdAt: `${today}T12:00:00`,
    isResolved: false,
  },
  {
    id: "ha4",
    dogId: "2",
    dogName: "뽀삐",
    dogPhoto: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop",
    alertType: "행동이상",
    priority: "낮음",
    description: "불안 증세 관찰됨 - 지속 모니터링 필요",
    createdAt: `${yesterday}T15:00:00`,
    isResolved: false,
  },
]

export function getDailyCareStats(): { totalDogs: number; checkedToday: number; missingRecords: number; abnormalHealth: number; appetiteIssues: number; behaviorWarnings: number } {
  const today = new Date().toISOString().split('T')[0]
  const activeDogs = sampleDogs.filter(d => d.status !== "입양완료")
  const todayRecords = dailyCareRecords.filter(r => r.date === today && !r.isDraft)
  
  const checkedDogIds = new Set(todayRecords.map(r => r.dogId))
  const missingRecords = activeDogs.filter(d => !checkedDogIds.has(d.id)).length
  
  const abnormalHealth = todayRecords.filter(r => 
    r.vomiting || r.stoolCondition === "설사" || r.stoolCondition === "혈변" || r.energyLevel === "무기력"
  ).length
  
  const appetiteIssues = todayRecords.filter(r => 
    r.feedingCompletion === "반이하" || r.feedingCompletion === "거부" || r.waterIntake === "부족" || r.waterIntake === "거부"
  ).length
  
  const behaviorWarnings = todayRecords.filter(r => r.aggression || r.anxiety).length
  
  return {
    totalDogs: activeDogs.length,
    checkedToday: todayRecords.length,
    missingRecords,
    abnormalHealth,
    appetiteIssues,
    behaviorWarnings,
  }
}

export function getTodayRecordForDog(dogId: string): DailyCareRecord | undefined {
  const today = new Date().toISOString().split('T')[0]
  return dailyCareRecords.find(r => r.dogId === dogId && r.date === today)
}

export function getDogCareHistory(dogId: string): DailyCareRecord[] {
  return dailyCareRecords
    .filter(r => r.dogId === dogId && !r.isDraft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
