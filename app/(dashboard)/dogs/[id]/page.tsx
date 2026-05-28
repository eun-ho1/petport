"use client"

import type { ElementType } from "react"
import { use, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Edit,
  FileText,
  Heart,
  MapPin,
  Stethoscope,
  Syringe,
  Weight,
  XCircle,
} from "lucide-react"
import { MissingInfoBox } from "@/components/missing-info-box"
import { ReadinessBadge, ScoreBadge, StatusBadge, VaccinationBadge } from "@/components/badges"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api/client"
import {
  adoptionReadinessLabels,
  dogStatusLabels,
  genderLabels,
} from "@/lib/labels"
import type { Dog } from "@/lib/types"

export default function DogProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [dog, setDog] = useState<Dog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDog = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.getDog(id)
        setDog(response.item)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "강아지 정보를 불러오지 못했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDog()
  }, [id])

  const readinessChecklist = useMemo(() => {
    if (!dog) return []

    return [
      { label: "기본 정보 입력", done: Boolean(dog.name && dog.breed) },
      { label: "사진 2장 이상", done: dog.photos.length >= 2 },
      { label: "성격 설명 작성", done: dog.personality.length >= 20 },
      { label: "구조 스토리 작성", done: dog.rescueStory.length >= 20 },
      { label: "예방접종 완료", done: dog.vaccinationStatus === "complete" },
      { label: "중성화 완료", done: dog.isNeutered },
    ]
  }, [dog])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">강아지 정보를 불러오는 중입니다...</CardContent>
      </Card>
    )
  }

  if (error || !dog) {
    return (
      <Card>
        <CardContent className="space-y-4 py-12 text-center">
          <p className="text-destructive">{error ?? "강아지 정보를 찾을 수 없습니다."}</p>
          <Button asChild>
            <Link href="/dogs">목록으로 돌아가기</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const imageUrls = dog.photos.length > 0 ? dog.photos : [dog.primaryPhotoUrl ?? "/placeholder.jpg"]
  const completedItems = readinessChecklist.filter((item) => item.done).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dogs">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{dog.name}</h1>
              <StatusBadge status={dog.status} />
            </div>
            <p className="text-muted-foreground">
              {dog.breed || "품종 미상"} · {dog.estimatedAge || "나이 미상"} · {genderLabels[dog.gender]}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dogs/${dog.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/documents?dog=${dog.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              문서 생성
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>사진</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imageUrls.map((photo, index) => (
                  <div key={photo + index} className="relative aspect-square overflow-hidden rounded-xl">
                    <Image src={photo} alt={`${dog.name} 사진 ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="info">기본 정보</TabsTrigger>
              <TabsTrigger value="personality">성격</TabsTrigger>
              <TabsTrigger value="health">건강 기록</TabsTrigger>
              <TabsTrigger value="vaccination">예방접종</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <Card>
                <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <InfoRow icon={Calendar} label="구조일" value={dog.rescueDate ?? "미입력"} />
                    <InfoRow icon={MapPin} label="구조 장소" value={dog.rescueLocation || "미입력"} />
                    <InfoRow icon={Weight} label="체중" value={`${dog.weight}kg`} />
                  </div>
                  <div className="space-y-4">
                    <InfoRow icon={Heart} label="중성화" value={dog.isNeutered ? "완료" : "미완료"} />
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-secondary p-2">
                        <Syringe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">예방접종</p>
                        <VaccinationBadge status={dog.vaccinationStatus} />
                      </div>
                    </div>
                    <InfoRow icon={Calendar} label="보호 상태" value={dogStatusLabels[dog.status]} />
                  </div>

                  <div className="sm:col-span-2 border-t pt-6">
                    <h4 className="mb-2 font-medium">구조 스토리</h4>
                    <p className="text-muted-foreground">
                      {dog.rescueStory || "등록된 구조 스토리가 없습니다."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personality" className="mt-4">
              <Card>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <h4 className="mb-3 font-medium">성격 및 특징</h4>
                    <p className="text-muted-foreground">
                      {dog.personality || "등록된 성격 정보가 없습니다."}
                    </p>
                  </div>
                  <div className="border-t pt-6">
                    <h4 className="mb-2 font-medium">의료 메모</h4>
                    <p className="text-muted-foreground">
                      {dog.medicalNotes || "등록된 의료 메모가 없습니다."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {dog.medicalRecords.length > 0 ? (
                    <div className="space-y-4">
                      {dog.medicalRecords.map((record) => (
                        <div key={record.id} className="flex items-start gap-4 rounded-lg bg-secondary/50 p-4">
                          <div className="rounded-lg bg-card p-2">
                            <Stethoscope className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="font-medium">{record.type}</span>
                              <span className="text-xs text-muted-foreground">{record.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{record.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">등록된 건강 기록이 없습니다.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vaccination" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {dog.vaccinations.length > 0 ? (
                    <div className="space-y-4">
                      {dog.vaccinations.map((vaccination) => (
                        <div key={vaccination.id} className="flex items-start gap-4 rounded-lg bg-secondary/50 p-4">
                          <div className="rounded-lg bg-green-100 p-2">
                            <Syringe className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="font-medium">{vaccination.name}</span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <p className="text-sm text-muted-foreground">접종일: {vaccination.date}</p>
                            {vaccination.nextDue && (
                              <p className="text-xs text-muted-foreground">다음 접종: {vaccination.nextDue}</p>
                            )}
                            {vaccination.hospital && (
                              <p className="text-xs text-muted-foreground">{vaccination.hospital}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">등록된 예방접종 기록이 없습니다.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                해외입양 준비도
                <ScoreBadge score={dog.readinessScore} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">진행률</span>
                  <span className="font-medium">{dog.readinessScore}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${dog.readinessScore}%` }} />
                </div>
              </div>
              <ReadinessBadge status={dog.adoptionReadiness} />
              <p className="text-sm text-muted-foreground">
                {adoptionReadinessLabels[dog.adoptionReadiness]}
              </p>
            </CardContent>
          </Card>

          <MissingInfoBox items={dog.missingInfo} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                준비 체크리스트 ({completedItems}/{readinessChecklist.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {readinessChecklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">빠른 작업</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/daily-care/input/${dog.id}`}>
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  일일 케어 입력
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/dogs/${dog.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  정보 수정
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href={`/documents?dog=${dog.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  문서 생성
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-secondary p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
