"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle,
  Download,
  Eye,
  FileText,
  FileType,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { MissingInfoBox } from "@/components/missing-info-box"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api/client"
import { documentTypes, vaccinationStatusLabels } from "@/lib/labels"
import type { DocumentTypeId, Dog, GeneratedDocument } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

type LanguageCode = "en" | "ko"

function DocumentsPageContent() {
  const searchParams = useSearchParams()
  const preselectedDogId = searchParams.get("dog") ?? ""
  const { toast } = useToast()

  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState(preselectedDogId)
  const [selectedDocType, setSelectedDocType] = useState<DocumentTypeId | "">("")
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en")
  const [createdDocument, setCreatedDocument] = useState<GeneratedDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const fetchDogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [dogsResponse, settingsResponse] = await Promise.all([
        apiClient.getDogs(),
        apiClient.getSettings(),
      ])
      setDogs(dogsResponse.items)
      setSelectedLanguage(settingsResponse.templateSettings.defaultLanguage)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "강아지 목록을 불러오지 못했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchDogs()
  }, [])

  const selectedDog = dogs.find((dog) => dog.id === selectedDogId)
  const selectedDocumentType = documentTypes.find((document) => document.id === selectedDocType)

  const missingInfo = useMemo(() => {
    if (!selectedDog || !selectedDocumentType) return []

    const missing: string[] = []

    for (const field of selectedDocumentType.requiredFields) {
      if (field === "photos" && selectedDog.photos.length < 2) {
        missing.push("사진 2장 이상이 필요합니다.")
      }
      if (field === "vaccinations" && selectedDog.vaccinationStatus !== "complete") {
        missing.push(`예방접종 상태 확인이 필요합니다. 현재 상태: ${vaccinationStatusLabels[selectedDog.vaccinationStatus]}`)
      }
      if (field === "personality" && selectedDog.personality.trim().length < 20) {
        missing.push("성격 설명을 조금 더 보강하면 문서 품질이 좋아집니다.")
      }
      if (field === "rescueStory" && selectedDog.rescueStory.trim().length < 20) {
        missing.push("구조 스토리를 조금 더 보강하면 문서 초안이 풍부해집니다.")
      }
      if (field === "isNeutered" && !selectedDog.isNeutered) {
        missing.push("중성화 여부를 다시 확인해 주세요.")
      }
      if (field === "weight" && !selectedDog.weight) {
        missing.push("체중 정보가 필요합니다.")
      }
    }

    return missing
  }, [selectedDog, selectedDocumentType])

  const canGenerate = Boolean(selectedDog && selectedDocType && !isGenerating && !isLoading)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">해외입양 문서 생성</h1>
          <p className="text-muted-foreground">
            강아지 기본 정보, 접종 기록, 건강 메모, 최근 일일 케어 기록을 조합해 실제 전달 가능한 초안을 생성합니다.
          </p>
        </div>
        <Button variant="outline" onClick={() => void fetchDogs()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. 강아지 선택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedDogId}
                onValueChange={(value) => {
                  setSelectedDogId(value)
                  setCreatedDocument(null)
                  setGenerateError(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="문서를 만들 강아지를 선택해 주세요." />
                </SelectTrigger>
                <SelectContent>
                  {dogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name} ({dog.breed || "품종 미상"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedDog && (
                <div className="rounded-lg bg-secondary/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                      <Image
                        src={selectedDog.photos[0] ?? selectedDog.primaryPhotoUrl ?? "/placeholder.jpg"}
                        alt={selectedDog.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{selectedDog.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDog.breed || "품종 미상"} · {selectedDog.estimatedAge || "나이 미상"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        접종 상태: {vaccinationStatusLabels[selectedDog.vaccinationStatus]}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && !error && dogs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  등록된 강아지가 없습니다. 먼저 강아지를 등록해 주세요.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. 문서 유형과 언어</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={selectedLanguage === "en" ? "default" : "outline"}
                  onClick={() => {
                    setSelectedLanguage("en")
                    setCreatedDocument(null)
                  }}
                >
                  English
                </Button>
                <Button
                  type="button"
                  variant={selectedLanguage === "ko" ? "default" : "outline"}
                  onClick={() => {
                    setSelectedLanguage("ko")
                    setCreatedDocument(null)
                  }}
                >
                  한국어
                </Button>
              </div>

              <div className="space-y-3">
                {documentTypes.map((documentType) => (
                  <button
                    key={documentType.id}
                    type="button"
                    onClick={() => {
                      setSelectedDocType(documentType.id)
                      setCreatedDocument(null)
                      setGenerateError(null)
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedDocType === documentType.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText
                        className={`mt-0.5 h-5 w-5 ${
                          selectedDocType === documentType.id ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{documentType.name}</p>
                        <p className="text-xs text-muted-foreground">{documentType.nameEn}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{documentType.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedDog && selectedDocType && missingInfo.length > 0 && <MissingInfoBox items={missingInfo} />}

          <Card>
            <CardHeader>
              <CardTitle>3. 자동 반영 항목</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>강아지 기본 정보와 구조 배경</p>
              <p>예방접종 이력과 접종 상태</p>
              <p>건강 메모와 최근 건강 알림 요약</p>
              <p>최근 일일 케어 기록 기반 특이사항 요약</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full"
                size="lg"
                disabled={!canGenerate}
                onClick={async () => {
                  if (!selectedDog || !selectedDocType) return

                  try {
                    setIsGenerating(true)
                    setGenerateError(null)
                    const response = await apiClient.createDocument(selectedDog.id, {
                      documentType: selectedDocType,
                      languageCode: selectedLanguage,
                    })
                    setCreatedDocument(response.item)
                    toast({
                      title: "문서 생성 완료",
                      description: `${selectedDog.name} 문서 초안이 생성되고 이력이 저장되었습니다.`,
                    })
                  } catch (generateFailure) {
                    const message =
                      generateFailure instanceof Error
                        ? generateFailure.message
                        : "문서를 생성하지 못했습니다."
                    setGenerateError(message)
                    toast({
                      title: "문서 생성 실패",
                      description: message,
                      variant: "destructive",
                    })
                  } finally {
                    setIsGenerating(false)
                  }
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    문서 생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    문서 초안 생성
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                생성 결과 미리보기
              </CardTitle>
              {createdDocument && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    생성 이력 저장 완료
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void apiClient.downloadDocument(createdDocument.id, "md")}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Markdown 다운로드
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void apiClient.downloadDocument(createdDocument.id, "docx")}
                  >
                    <FileType className="mr-1 h-4 w-4" />
                    DOCX 다운로드
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-96 items-center justify-center text-muted-foreground">
                  강아지 목록을 불러오는 중입니다...
                </div>
              ) : error ? (
                <div className="flex h-96 items-center justify-center text-center text-destructive">{error}</div>
              ) : !selectedDog || !selectedDocType ? (
                <div className="flex h-96 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="mx-auto mb-3 h-12 w-12 opacity-50" />
                    <p>강아지와 문서 유형을 선택해 주세요.</p>
                  </div>
                </div>
              ) : !createdDocument ? (
                <div className="flex h-96 items-center justify-center text-muted-foreground">
                  <div className="space-y-3 text-center">
                    <Sparkles className="mx-auto h-12 w-12 opacity-50" />
                    <p>{isGenerating ? "문서를 생성하고 있습니다..." : "생성 버튼을 눌러 문서 초안을 만드세요."}</p>
                    {generateError && <p className="text-sm text-destructive">{generateError}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{createdDocument.title}</p>
                    <p className="mt-1">
                      문서 유형: {selectedDocumentType?.name} · 언어: {createdDocument.languageCode.toUpperCase()} · 생성 시각:{" "}
                      {new Date(createdDocument.generatedAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <div className="h-[32rem] overflow-auto rounded-lg bg-secondary/30 p-4">
                    <pre className="whitespace-pre-wrap text-sm leading-6">{createdDocument.contentMarkdown}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-6">불러오는 중...</div>}>
      <DocumentsPageContent />
    </Suspense>
  )
}
