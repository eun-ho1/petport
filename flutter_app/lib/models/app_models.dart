import 'package:flutter/material.dart';

import '../core/app_theme.dart';

enum DogStatus {
  protected('protected', '보호 중', AppTheme.primary),
  treatment('treatment', '치료 중', AppTheme.danger),
  temporary('temporary', '임시 보호', AppTheme.warning),
  adopted('adopted', '입양 완료', AppTheme.success);

  const DogStatus(this.apiValue, this.label, this.color);

  final String apiValue;
  final String label;
  final Color color;

  static DogStatus fromApi(String value) {
    return DogStatus.values.firstWhere(
      (status) => status.apiValue == value,
      orElse: () => DogStatus.protected,
    );
  }
}

enum VaccinationStatus {
  complete('complete', '완료', AppTheme.success),
  inProgress('in_progress', '진행 중', AppTheme.warning),
  missing('not_started', '미접종', AppTheme.danger);

  const VaccinationStatus(this.apiValue, this.label, this.color);

  final String apiValue;
  final String label;
  final Color color;

  static VaccinationStatus fromApi(String value) {
    return VaccinationStatus.values.firstWhere(
      (status) => status.apiValue == value,
      orElse: () => VaccinationStatus.missing,
    );
  }
}

enum FeedingStatus {
  complete('완식'),
  partial('부분 섭취'),
  poor('섭취 부족');

  const FeedingStatus(this.label);

  final String label;
}

class VaccinationRecord {
  const VaccinationRecord({
    required this.id,
    required this.name,
    required this.date,
    this.nextDue,
    this.hospital,
    this.notes,
  });

  final String id;
  final String name;
  final String date;
  final String? nextDue;
  final String? hospital;
  final String? notes;

  factory VaccinationRecord.fromJson(Map<String, dynamic> json) {
    return VaccinationRecord(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      date: json['date'] as String? ?? '',
      nextDue: json['nextDue'] as String?,
      hospital: json['hospital'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

class DailyCareRecord {
  const DailyCareRecord({
    required this.id,
    required this.dogId,
    required this.date,
    required this.feedingCompletionCode,
    required this.waterIntakeCode,
    required this.medicationGiven,
    required this.energyLevelCode,
    required this.aggression,
    required this.anxiety,
    required this.vomiting,
    this.feedingAmount,
    this.medicationNotes,
    this.stoolConditionCode,
    this.vomitingNotes,
    this.behaviorNotes,
    this.healthNotes,
    this.specialObservations,
    this.weight,
    this.temperature,
    this.imageUrls = const [],
    this.recordedBy,
    this.recordedAt,
    this.isDraft = false,
  });

  final String id;
  final String dogId;
  final String date;
  final int? feedingAmount;
  final String feedingCompletionCode;
  final String waterIntakeCode;
  final bool medicationGiven;
  final String? medicationNotes;
  final String? stoolConditionCode;
  final bool vomiting;
  final String? vomitingNotes;
  final String energyLevelCode;
  final bool aggression;
  final bool anxiety;
  final String? behaviorNotes;
  final String? healthNotes;
  final String? specialObservations;
  final double? weight;
  final double? temperature;
  final List<String> imageUrls;
  final String? recordedBy;
  final String? recordedAt;
  final bool isDraft;

  FeedingStatus get feedingStatus {
    switch (feedingCompletionCode) {
      case 'complete':
        return FeedingStatus.complete;
      case 'most':
        return FeedingStatus.partial;
      default:
        return FeedingStatus.poor;
    }
  }

  String get waterIntake {
    switch (waterIntakeCode) {
      case 'enough':
        return '충분';
      case 'normal':
        return '보통';
      case 'low':
        return '부족';
      case 'none':
        return '거의 없음';
      default:
        return waterIntakeCode;
    }
  }

  String get energyLabel {
    switch (energyLevelCode) {
      case 'very_active':
        return '매우 활발';
      case 'active':
        return '활발';
      case 'normal':
        return '보통';
      case 'low':
        return '기운 없음';
      case 'lethargic':
        return '무기력';
      default:
        return energyLevelCode;
    }
  }

  bool get hasAlert {
    return vomiting ||
        feedingCompletionCode == 'half' ||
        feedingCompletionCode == 'none' ||
        waterIntakeCode == 'low' ||
        waterIntakeCode == 'none' ||
        energyLevelCode == 'low' ||
        energyLevelCode == 'lethargic';
  }

  bool get hasBehaviorIssue => aggression || anxiety;

  String get summaryLabel {
    if (hasAlert) return '확인 필요';
    if (hasBehaviorIssue) return '행동 관찰';
    if (isDraft) return '임시 저장';
    return '기록 완료';
  }

  Color get summaryColor {
    if (hasAlert) return AppTheme.danger;
    if (hasBehaviorIssue) return AppTheme.accent;
    if (isDraft) return AppTheme.warning;
    return AppTheme.success;
  }

  factory DailyCareRecord.fromJson(Map<String, dynamic> json) {
    return DailyCareRecord(
      id: json['id'] as String? ?? '',
      dogId: json['dogId'] as String? ?? '',
      date: json['date'] as String? ?? '',
      feedingAmount: (json['feedingAmount'] as num?)?.toInt(),
      feedingCompletionCode: json['feedingCompletion'] as String? ?? 'not_fed',
      waterIntakeCode: json['waterIntake'] as String? ?? 'normal',
      medicationGiven: json['medicationGiven'] as bool? ?? false,
      medicationNotes: json['medicationNotes'] as String?,
      stoolConditionCode: json['stoolCondition'] as String?,
      vomiting: json['vomiting'] as bool? ?? false,
      vomitingNotes: json['vomitingNotes'] as String?,
      energyLevelCode: json['energyLevel'] as String? ?? 'normal',
      aggression: json['aggression'] as bool? ?? false,
      anxiety: json['anxiety'] as bool? ?? false,
      behaviorNotes: json['behaviorNotes'] as String?,
      healthNotes: json['healthNotes'] as String?,
      specialObservations: json['specialObservations'] as String?,
      weight: (json['weight'] as num?)?.toDouble(),
      temperature: (json['temperature'] as num?)?.toDouble(),
      imageUrls: (json['imageUrls'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      recordedBy: json['recordedBy'] as String?,
      recordedAt: json['recordedAt'] as String?,
      isDraft: json['isDraft'] as bool? ?? false,
    );
  }
}

class Dog {
  const Dog({
    required this.id,
    required this.name,
    required this.genderCode,
    required this.ageLabel,
    required this.weightKg,
    required this.breed,
    required this.rescueDate,
    required this.rescueLocation,
    required this.isNeutered,
    required this.status,
    required this.vaccinationStatus,
    required this.readinessScore,
    required this.photoUrl,
    required this.personality,
    required this.rescueStory,
    required this.medicalNotes,
    required this.vaccinations,
    required this.missingInfo,
    required this.adoptionReadinessCode,
    this.photos = const [],
  });

  final String id;
  final String name;
  final String genderCode;
  final String ageLabel;
  final double weightKg;
  final String breed;
  final String rescueDate;
  final String rescueLocation;
  final bool isNeutered;
  final DogStatus status;
  final VaccinationStatus vaccinationStatus;
  final int readinessScore;
  final String photoUrl;
  final String personality;
  final String rescueStory;
  final String medicalNotes;
  final List<VaccinationRecord> vaccinations;
  final List<String> missingInfo;
  final String adoptionReadinessCode;
  final List<String> photos;

  String get genderLabel {
    switch (genderCode) {
      case 'male':
        return '수컷';
      case 'female':
        return '암컷';
      default:
        return '미상';
    }
  }

  String get adoptionReadinessLabel {
    switch (adoptionReadinessCode) {
      case 'ready':
        return '준비 완료';
      case 'missing_info':
        return '정보 부족';
      case 'not_ready':
        return '검토 필요';
      default:
        return adoptionReadinessCode;
    }
  }

  factory Dog.fromJson(Map<String, dynamic> json) {
    final photos = (json['photos'] as List<dynamic>? ?? const [])
        .map((item) => item.toString())
        .toList();
    final primaryPhotoUrl = json['primaryPhotoUrl'] as String?;

    return Dog(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      genderCode: json['gender'] as String? ?? 'unknown',
      ageLabel: json['estimatedAge'] as String? ?? '',
      weightKg: (json['weight'] as num?)?.toDouble() ?? 0,
      breed: json['breed'] as String? ?? '',
      rescueDate: json['rescueDate'] as String? ?? '',
      rescueLocation: json['rescueLocation'] as String? ?? '',
      isNeutered: json['isNeutered'] as bool? ?? false,
      status: DogStatus.fromApi(json['status'] as String? ?? 'protected'),
      vaccinationStatus: VaccinationStatus.fromApi(
        json['vaccinationStatus'] as String? ?? 'not_started',
      ),
      readinessScore: (json['readinessScore'] as num?)?.toInt() ?? 0,
      photoUrl: photos.isNotEmpty
          ? photos.first
          : (primaryPhotoUrl ?? 'https://placehold.co/600x600/png'),
      personality: json['personality'] as String? ?? '',
      rescueStory: json['rescueStory'] as String? ?? '',
      medicalNotes: json['medicalNotes'] as String? ?? '',
      vaccinations: (json['vaccinations'] as List<dynamic>? ?? const [])
          .map((item) => VaccinationRecord.fromJson(
                Map<String, dynamic>.from(item as Map),
              ))
          .toList(),
      missingInfo: (json['missingInfo'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      adoptionReadinessCode:
          json['adoptionReadiness'] as String? ?? 'missing_info',
      photos: photos,
    );
  }
}

class HealthAlert {
  const HealthAlert({
    required this.id,
    required this.dogId,
    required this.dogName,
    required this.dogPhoto,
    required this.alertTypeCode,
    required this.priorityCode,
    required this.title,
    required this.description,
    required this.createdAt,
    required this.isResolved,
    this.resolvedAt,
    this.resolvedBy,
  });

  final String id;
  final String dogId;
  final String dogName;
  final String dogPhoto;
  final String alertTypeCode;
  final String priorityCode;
  final String title;
  final String description;
  final String createdAt;
  final bool isResolved;
  final String? resolvedAt;
  final String? resolvedBy;

  String get type {
    switch (alertTypeCode) {
      case 'appetite_issue':
        return '식욕 저하';
      case 'vomiting':
        return '구토';
      case 'behavior_issue':
        return '행동 이상';
      case 'medication_missed':
        return '투약 누락';
      case 'weight_loss':
        return '체중 감소';
      case 'general_health':
        return '건강 이상';
      default:
        return alertTypeCode;
    }
  }

  String get priority {
    switch (priorityCode) {
      case 'critical':
        return '긴급';
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return priorityCode;
    }
  }

  factory HealthAlert.fromJson(Map<String, dynamic> json) {
    return HealthAlert(
      id: json['id'] as String? ?? '',
      dogId: json['dogId'] as String? ?? '',
      dogName: json['dogName'] as String? ?? '',
      dogPhoto: json['dogPhoto'] as String? ?? '',
      alertTypeCode: json['alertType'] as String? ?? 'general_health',
      priorityCode: json['priority'] as String? ?? 'medium',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      createdAt: json['createdAt'] as String? ?? '',
      isResolved: json['isResolved'] as bool? ?? false,
      resolvedAt: json['resolvedAt'] as String?,
      resolvedBy: json['resolvedBy'] as String?,
    );
  }
}

class DashboardStats {
  const DashboardStats({
    required this.totalDogs,
    required this.readyForAdoption,
    required this.vaccinationPending,
    required this.medicalWatch,
  });

  final int totalDogs;
  final int readyForAdoption;
  final int vaccinationPending;
  final int medicalWatch;
}

class CareStats {
  const CareStats({
    required this.checkedToday,
    required this.missingRecords,
    required this.abnormalHealth,
    required this.behaviorWarnings,
  });

  final int checkedToday;
  final int missingRecords;
  final int abnormalHealth;
  final int behaviorWarnings;
}

class DocumentTemplate {
  const DocumentTemplate({
    required this.id,
    required this.title,
    required this.description,
  });

  final String id;
  final String title;
  final String description;
}

class ShelterProfile {
  const ShelterProfile({
    required this.name,
    required this.phone,
    required this.email,
    required this.address,
    required this.description,
  });

  final String name;
  final String phone;
  final String email;
  final String address;
  final String description;
}

class StaffAccount {
  const StaffAccount({
    required this.name,
    required this.email,
    required this.role,
  });

  final String name;
  final String email;
  final String role;
}

class DailyCareInput {
  const DailyCareInput({
    required this.date,
    required this.feedingCompletion,
    required this.waterIntake,
    required this.medicationGiven,
    required this.stoolCondition,
    required this.vomiting,
    required this.energyLevel,
    required this.aggression,
    required this.anxiety,
    required this.isDraft,
    this.feedingAmount,
    this.medicationNotes,
    this.vomitingNotes,
    this.behaviorNotes,
    this.healthNotes,
    this.specialObservations,
    this.weight,
    this.temperature,
    this.imageUrls = const [],
  });

  final String date;
  final int? feedingAmount;
  final String feedingCompletion;
  final String waterIntake;
  final bool medicationGiven;
  final String? medicationNotes;
  final String stoolCondition;
  final bool vomiting;
  final String? vomitingNotes;
  final String energyLevel;
  final bool aggression;
  final bool anxiety;
  final String? behaviorNotes;
  final String? healthNotes;
  final String? specialObservations;
  final double? weight;
  final double? temperature;
  final List<String> imageUrls;
  final bool isDraft;

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'feedingAmount': feedingAmount,
      'feedingCompletion': feedingCompletion,
      'waterIntake': waterIntake,
      'medicationGiven': medicationGiven,
      'medicationNotes': medicationNotes,
      'stoolCondition': stoolCondition,
      'vomiting': vomiting,
      'vomitingNotes': vomitingNotes,
      'energyLevel': energyLevel,
      'aggression': aggression,
      'anxiety': anxiety,
      'behaviorNotes': behaviorNotes,
      'healthNotes': healthNotes,
      'specialObservations': specialObservations,
      'weight': weight,
      'temperature': temperature,
      'imageUrls': imageUrls,
      'isDraft': isDraft,
    };
  }
}
