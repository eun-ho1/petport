import '../models/app_models.dart';

class SampleRepository {
  static const dogs = <Dog>[
    Dog(
      id: '1',
      name: '초코',
      genderLabel: '수컷',
      ageLabel: '2살',
      weightKg: 8.5,
      breed: '믹스견',
      rescueDate: '2024-01-15',
      rescueLocation: '서울 강남구',
      isNeutered: true,
      status: DogStatus.protected,
      vaccinationStatus: VaccinationStatus.complete,
      readinessScore: 95,
      photoUrl:
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
      personality: '사람을 좋아하고 다른 강아지들과도 잘 어울립니다. 적응이 빠르고 산책을 좋아합니다.',
      rescueStory:
          '서울의 한 골목에서 구조되었고, 짧은 적응 기간을 거친 뒤 사람에 대한 신뢰를 회복했습니다.',
      medicalNotes: '전반적인 건강 상태는 안정적입니다. 정기 검진과 연간 예방접종이 필요합니다.',
      vaccinations: [
        VaccinationRecord(
          name: '종합백신(DHPPL)',
          date: '2024-01-20',
          nextDue: '2025-01-20',
        ),
        VaccinationRecord(
          name: '광견병',
          date: '2024-01-20',
          nextDue: '2025-01-20',
        ),
      ],
    ),
    Dog(
      id: '2',
      name: '몽이',
      genderLabel: '암컷',
      ageLabel: '3살',
      weightKg: 5.2,
      breed: '말티즈',
      rescueDate: '2024-02-10',
      rescueLocation: '경기 수원시',
      isNeutered: true,
      status: DogStatus.protected,
      vaccinationStatus: VaccinationStatus.inProgress,
      readinessScore: 68,
      photoUrl:
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
      personality: '처음에는 조용하지만 익숙해지면 애교가 많습니다. 차분한 환경과 1:1 관심을 좋아합니다.',
      rescueStory:
          '주인의 파양 이후 구조되었고, 처음에는 마른 상태였지만 현재는 회복이 잘 진행되고 있습니다.',
      medicalNotes:
          '피부가 다소 예민합니다. 투약 후 경과를 관찰하고 스트레스가 적은 환경이 필요합니다.',
      vaccinations: [
        VaccinationRecord(
          name: '종합백신(DHPPL)',
          date: '2024-02-15',
          nextDue: '2025-02-15',
        ),
      ],
    ),
    Dog(
      id: '3',
      name: '보리',
      genderLabel: '수컷',
      ageLabel: '1살',
      weightKg: 12.3,
      breed: '진도 믹스',
      rescueDate: '2024-03-01',
      rescueLocation: '충남 천안시',
      isNeutered: false,
      status: DogStatus.treatment,
      vaccinationStatus: VaccinationStatus.missing,
      readinessScore: 32,
      photoUrl:
          'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=600&q=80',
      personality: '온순하지만 아직 경계심이 남아 있습니다. 천천히 신뢰를 쌓아가는 돌봄이 필요합니다.',
      rescueStory:
          '도로변 인근에서 부상당한 채 발견되었고, 현재 체계적인 회복 프로그램을 진행 중입니다.',
      medicalNotes: '다리 수술 후 회복 중입니다. 식사량과 수분 섭취를 매일 세심하게 확인해야 합니다.',
      vaccinations: [],
    ),
    Dog(
      id: '4',
      name: '나리',
      genderLabel: '암컷',
      ageLabel: '4살',
      weightKg: 6.8,
      breed: '포메라니안',
      rescueDate: '2023-11-20',
      rescueLocation: '서울 마포구',
      isNeutered: true,
      status: DogStatus.protected,
      vaccinationStatus: VaccinationStatus.complete,
      readinessScore: 100,
      photoUrl:
          'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=600&q=80',
      personality:
          '자신감 있고 활발하며 입양 준비도가 높습니다. 사람과 잘 지내고 새로운 환경에도 잘 적응합니다.',
      rescueStory:
          '방치 사례에서 구조된 뒤 보호소 돌봄을 통해 현재는 안정적인 상태를 유지하고 있습니다.',
      medicalNotes: '현재 큰 건강 문제는 없습니다. 정기 검진과 이동 준비를 지속하면 됩니다.',
      vaccinations: [
        VaccinationRecord(
          name: '종합백신(DHPPL)',
          date: '2023-12-01',
          nextDue: '2024-12-01',
        ),
        VaccinationRecord(
          name: '광견병',
          date: '2023-12-01',
          nextDue: '2024-12-01',
        ),
      ],
    ),
    Dog(
      id: '5',
      name: '콩이',
      genderLabel: '수컷',
      ageLabel: '6개월',
      weightKg: 3.2,
      breed: '비숑 프리제',
      rescueDate: '2024-03-10',
      rescueLocation: '인천',
      isNeutered: false,
      status: DogStatus.temporary,
      vaccinationStatus: VaccinationStatus.inProgress,
      readinessScore: 55,
      photoUrl:
          'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=600&q=80',
      personality:
          '에너지가 넘치고 호기심이 많습니다. 아직 어린 강아지라 기본 훈련과 성장 관찰이 필요합니다.',
      rescueStory:
          '동네 구조 이후 임시 보호 형태로 돌봄을 시작했고, 새로운 환경에 빠르게 적응하고 있습니다.',
      medicalNotes:
          '전반적으로 건강하지만 아직 퍼피 예방접종 일정과 성장 모니터링이 진행 중입니다.',
      vaccinations: [
        VaccinationRecord(name: '종합백신 1차', date: '2024-03-15'),
        VaccinationRecord(name: '종합백신 2차', date: '2024-04-01'),
      ],
    ),
  ];

  static const alerts = <HealthAlert>[
    HealthAlert(
      dogId: '3',
      dogName: '보리',
      type: '식욕 저하',
      priority: '높음',
      description: '이틀 연속 식사량이 50% 이하로 떨어졌습니다.',
    ),
    HealthAlert(
      dogId: '3',
      dogName: '보리',
      type: '구토',
      priority: '긴급',
      description: '최근 일일 케어 기록에 구토가 등록되었습니다.',
    ),
    HealthAlert(
      dogId: '5',
      dogName: '콩이',
      type: '일일 기록 누락',
      priority: '보통',
      description: '오늘 건강 체크가 아직 완료되지 않았습니다.',
    ),
    HealthAlert(
      dogId: '2',
      dogName: '몽이',
      type: '불안 관찰',
      priority: '보통',
      description: '방문 일정 이후 스트레스 징후가 증가했습니다.',
    ),
  ];

  static const careRecords = <DailyCareRecord>[
    DailyCareRecord(
      dogId: '1',
      feedingStatus: FeedingStatus.complete,
      waterIntake: '충분',
      medicationGiven: false,
      energyLabel: '좋음',
      hasAlert: false,
      hasBehaviorIssue: false,
    ),
    DailyCareRecord(
      dogId: '2',
      feedingStatus: FeedingStatus.partial,
      waterIntake: '보통',
      medicationGiven: true,
      energyLabel: '안정적',
      hasAlert: false,
      hasBehaviorIssue: true,
    ),
    DailyCareRecord(
      dogId: '3',
      feedingStatus: FeedingStatus.poor,
      waterIntake: '부족',
      medicationGiven: true,
      energyLabel: '낮음',
      hasAlert: true,
      hasBehaviorIssue: true,
    ),
    DailyCareRecord(
      dogId: '4',
      feedingStatus: FeedingStatus.complete,
      waterIntake: '충분',
      medicationGiven: false,
      energyLabel: '좋음',
      hasAlert: false,
      hasBehaviorIssue: false,
    ),
  ];

  static const documentTemplates = <DocumentTemplate>[
    DocumentTemplate(
      id: 'profile',
      title: '영문 강아지 프로필',
      description: '해외 입양 파트너에게 전달하는 기본 프로필입니다.',
    ),
    DocumentTemplate(
      id: 'vaccination',
      title: '예방접종 요약서',
      description: '확인용 백신 체크리스트입니다.',
    ),
    DocumentTemplate(
      id: 'adoption',
      title: '입양 정보 시트',
      description: '입양자와 코디네이터를 위한 요약 문서입니다.',
    ),
    DocumentTemplate(
      id: 'transport',
      title: '이동 정보서',
      description: '항공 이동과 인계에 맞춘 문서입니다.',
    ),
  ];

  static const shelterProfile = ShelterProfile(
    name: '러브포우즈 보호소',
    address: '서울 강서구 구조로 123',
    phone: '02-1234-5678',
    email: 'contact@lovepaws.kr',
    description: '2015년부터 구조, 회복, 해외 입양 준비를 지원해 온 구조 중심 보호소입니다.',
  );

  static const staffAccounts = <StaffAccount>[
    StaffAccount(
      name: '김민수',
      email: 'minsu@lovepaws.kr',
      role: '관리자',
    ),
    StaffAccount(
      name: '이지현',
      email: 'jihyun@lovepaws.kr',
      role: '코디네이터',
    ),
    StaffAccount(
      name: '박준영',
      email: 'junyoung@lovepaws.kr',
      role: '봉사자',
    ),
  ];

  static const dashboardStats = DashboardStats(
    totalDogs: 5,
    readyForAdoption: 2,
    vaccinationPending: 3,
    medicalWatch: 1,
  );

  static const careStats = CareStats(
    checkedToday: 4,
    missingRecords: 1,
    abnormalHealth: 1,
    behaviorWarnings: 2,
  );

  static DailyCareRecord? todayRecordForDog(String dogId) {
    for (final record in careRecords) {
      if (record.dogId == dogId) return record;
    }
    return null;
  }
}
