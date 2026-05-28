export type SupportedDocumentType = "profile" | "vaccination" | "adoption" | "transport"
export type SupportedDocumentLanguage = "en" | "ko"

export interface DocumentTemplatePayload {
  title: string
  heroHeading: string
  heroBody?: string
  basicInfo: string[]
  vaccinationRecords: string[]
  healthSummary: string[]
  careHighlights: string[]
  rescueSummary: string[]
  personalitySummary: string[]
  transportNotes: string[]
}

function renderSection(title: string, lines: string[]) {
  if (lines.length === 0) {
    return `## ${title}\n- N/A`
  }

  return `## ${title}\n${lines.map((line) => `- ${line}`).join("\n")}`
}

const templateRenderers: Record<
  SupportedDocumentLanguage,
  Record<SupportedDocumentType, (payload: DocumentTemplatePayload) => string>
> = {
  en: {
    profile: (payload) => `# ${payload.title}

${payload.heroHeading}
${payload.heroBody ?? ""}

${renderSection("Basic Information", payload.basicInfo)}

${renderSection("Personality", payload.personalitySummary)}

${renderSection("Rescue Background", payload.rescueSummary)}

${renderSection("Health Summary", payload.healthSummary)}

${renderSection("Recent Care Highlights", payload.careHighlights)}
`,
    vaccination: (payload) => `# ${payload.title}

${payload.heroHeading}
${payload.heroBody ?? ""}

${renderSection("Basic Information", payload.basicInfo)}

${renderSection("Vaccination Records", payload.vaccinationRecords)}

${renderSection("Health Summary", payload.healthSummary)}

${renderSection("Recent Care Highlights", payload.careHighlights)}
`,
    adoption: (payload) => `# ${payload.title}

${payload.heroHeading}
${payload.heroBody ?? ""}

${renderSection("Basic Information", payload.basicInfo)}

${renderSection("Personality and Home Fit", payload.personalitySummary)}

${renderSection("Rescue Background", payload.rescueSummary)}

${renderSection("Health and Daily Care Summary", payload.healthSummary)}

${renderSection("Special Care Notes", payload.careHighlights)}
`,
    transport: (payload) => `# ${payload.title}

${payload.heroHeading}
${payload.heroBody ?? ""}

${renderSection("Identity", payload.basicInfo)}

${renderSection("Vaccination Records", payload.vaccinationRecords)}

${renderSection("Medical Readiness", payload.healthSummary)}

${renderSection("Handling and Transport Notes", payload.transportNotes)}
`,
  },
  ko: {
    profile: (payload) => `# ${payload.title}

${payload.heroHeading}
${payload.heroBody ?? ""}

${renderSection("기본 정보", payload.basicInfo)}

${renderSection("성격 요약", payload.personalitySummary)}

${renderSection("구조 배경", payload.rescueSummary)}

${renderSection("건강 요약", payload.healthSummary)}

${renderSection("최근 케어 특이사항", payload.careHighlights)}
`,
    vaccination: (payload) => `# ${payload.title}

${payload.heroHeading}
${payload.heroBody ?? ""}

${renderSection("기본 정보", payload.basicInfo)}

${renderSection("접종 기록", payload.vaccinationRecords)}

${renderSection("건강 요약", payload.healthSummary)}

${renderSection("최근 케어 특이사항", payload.careHighlights)}
`,
    adoption: (payload) => `# ${payload.title}

${payload.heroHeading}
${payload.heroBody ?? ""}

${renderSection("기본 정보", payload.basicInfo)}

${renderSection("성격 및 가정 적합성", payload.personalitySummary)}

${renderSection("구조 배경", payload.rescueSummary)}

${renderSection("건강 및 일상 케어 요약", payload.healthSummary)}

${renderSection("특별 관리 메모", payload.careHighlights)}
`,
    transport: (payload) => `# ${payload.title}

${payload.heroHeading}
${payload.heroBody ?? ""}

${renderSection("개체 정보", payload.basicInfo)}

${renderSection("접종 기록", payload.vaccinationRecords)}

${renderSection("의료 준비 상태", payload.healthSummary)}

${renderSection("이동 및 취급 메모", payload.transportNotes)}
`,
  },
}

export function renderDocumentTemplate(
  documentType: SupportedDocumentType,
  language: SupportedDocumentLanguage,
  payload: DocumentTemplatePayload
) {
  return templateRenderers[language][documentType](payload).trim()
}
