"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { adoptionReadinessLabels, dogStatusLabels, genderLabels, vaccinationStatusLabels } from "@/lib/labels"
import type {
  AdoptionReadiness,
  Dog,
  DogStatus,
  Gender,
  VaccinationRecord,
  VaccinationStatus,
} from "@/lib/types"

type DogFormValues = {
  name: string
  gender: Gender
  estimatedAge: string
  weight: string
  breed: string
  rescueDate: string
  rescueLocation: string
  isNeutered: boolean
  status: DogStatus
  vaccinationStatus: VaccinationStatus
  adoptionReadiness: AdoptionReadiness
  readinessScore: string
  personality: string
  rescueStory: string
  medicalNotes: string
}

interface DogFormProps {
  title: string
  description: string
  submitLabel: string
  backHref: string
  initialDog?: Dog
  isSubmitting?: boolean
  onSubmit: (payload: {
    name: string
    gender: Gender
    estimatedAge: string
    weight: number | null
    breed: string
    rescueDate: string | null
    rescueLocation: string
    isNeutered: boolean
    status: DogStatus
    vaccinationStatus: VaccinationStatus
    adoptionReadiness: AdoptionReadiness
    readinessScore: number
    personality: string
    rescueStory: string
    medicalNotes: string
    photos: string[]
    primaryPhotoUrl?: string
    missingInfo: string[]
    vaccinations: Array<Omit<VaccinationRecord, "id">>
  }) => Promise<void>
}

export function DogForm({
  title,
  description,
  submitLabel,
  backHref,
  initialDog,
  isSubmitting = false,
  onSubmit,
}: DogFormProps) {
  const [values, setValues] = useState<DogFormValues>({
    name: initialDog?.name ?? "",
    gender: initialDog?.gender ?? "unknown",
    estimatedAge: initialDog?.estimatedAge ?? "",
    weight: initialDog?.weight ? String(initialDog.weight) : "",
    breed: initialDog?.breed ?? "",
    rescueDate: initialDog?.rescueDate ?? "",
    rescueLocation: initialDog?.rescueLocation ?? "",
    isNeutered: initialDog?.isNeutered ?? false,
    status: initialDog?.status ?? "protected",
    vaccinationStatus: initialDog?.vaccinationStatus ?? "not_started",
    adoptionReadiness: initialDog?.adoptionReadiness ?? "missing_info",
    readinessScore: String(initialDog?.readinessScore ?? 0),
    personality: initialDog?.personality ?? "",
    rescueStory: initialDog?.rescueStory ?? "",
    medicalNotes: initialDog?.medicalNotes ?? "",
  })
  const [vaccinations, setVaccinations] = useState<Array<Omit<VaccinationRecord, "id">>>(
    initialDog?.vaccinations.map(({ id: _id, ...rest }) => rest) ?? []
  )
  const [photos, setPhotos] = useState<string[]>(initialDog?.photos ?? [])
  const [missingInfoText, setMissingInfoText] = useState((initialDog?.missingInfo ?? []).join(", "))
  const [photoInput, setPhotoInput] = useState("")

  const parsedMissingInfo = useMemo(
    () =>
      missingInfoText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [missingInfoText]
  )

  const updateValue = (field: keyof DogFormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value as never }))
  }

  const addVaccination = () => {
    setVaccinations((prev) => [...prev, { name: "", date: "", nextDue: "", hospital: "", notes: "" }])
  }

  const updateVaccination = (
    index: number,
    field: keyof Omit<VaccinationRecord, "id">,
    value: string
  ) => {
    setVaccinations((prev) =>
      prev.map((vaccination, currentIndex) =>
        currentIndex === index ? { ...vaccination, [field]: value } : vaccination
      )
    )
  }

  const removeVaccination = (index: number) => {
    setVaccinations((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
  }

  const addPhoto = () => {
    const trimmed = photoInput.trim()
    if (!trimmed) return
    setPhotos((prev) => [...prev, trimmed])
    setPhotoInput("")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    await onSubmit({
      name: values.name.trim(),
      gender: values.gender,
      estimatedAge: values.estimatedAge.trim(),
      weight: values.weight ? Number(values.weight) : null,
      breed: values.breed.trim(),
      rescueDate: values.rescueDate || null,
      rescueLocation: values.rescueLocation.trim(),
      isNeutered: values.isNeutered,
      status: values.status,
      vaccinationStatus: values.vaccinationStatus,
      adoptionReadiness: values.adoptionReadiness,
      readinessScore: Number(values.readinessScore || 0),
      personality: values.personality.trim(),
      rescueStory: values.rescueStory.trim(),
      medicalNotes: values.medicalNotes.trim(),
      photos,
      primaryPhotoUrl: photos[0],
      missingInfo: parsedMissingInfo,
      vaccinations: vaccinations.filter((item) => item.name.trim() && item.date.trim()),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={backHref}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input id="name" value={values.name} onChange={(e) => updateValue("name", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">성별</Label>
                    <Select value={values.gender} onValueChange={(value) => updateValue("gender", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["male", "female", "unknown"] as Gender[]).map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {genderLabels[gender]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedAge">추정 나이</Label>
                    <Input
                      id="estimatedAge"
                      value={values.estimatedAge}
                      onChange={(e) => updateValue("estimatedAge", e.target.value)}
                      placeholder="예: 2살"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">체중 (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={values.weight}
                      onChange={(e) => updateValue("weight", e.target.value)}
                      placeholder="예: 5.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="breed">품종</Label>
                    <Input id="breed" value={values.breed} onChange={(e) => updateValue("breed", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rescueDate">구조일</Label>
                    <Input
                      id="rescueDate"
                      type="date"
                      value={values.rescueDate}
                      onChange={(e) => updateValue("rescueDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rescueLocation">구조 장소</Label>
                    <Input
                      id="rescueLocation"
                      value={values.rescueLocation}
                      onChange={(e) => updateValue("rescueLocation", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label htmlFor="isNeutered" className="font-medium">
                      중성화 여부
                    </Label>
                    <p className="text-sm text-muted-foreground">중성화 수술 여부를 표시합니다.</p>
                  </div>
                  <Switch
                    id="isNeutered"
                    checked={values.isNeutered}
                    onCheckedChange={(checked) => updateValue("isNeutered", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>성격 및 구조 스토리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personality">성격 메모</Label>
                  <Textarea
                    id="personality"
                    rows={4}
                    value={values.personality}
                    onChange={(e) => updateValue("personality", e.target.value)}
                    placeholder="강아지의 성격, 대인 관계, 다른 동물과의 반응을 적어 주세요."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rescueStory">구조 스토리</Label>
                  <Textarea
                    id="rescueStory"
                    rows={4}
                    value={values.rescueStory}
                    onChange={(e) => updateValue("rescueStory", e.target.value)}
                    placeholder="어디서 어떤 상태로 구조되었는지 적어 주세요."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalNotes">의료 메모</Label>
                  <Textarea
                    id="medicalNotes"
                    rows={3}
                    value={values.medicalNotes}
                    onChange={(e) => updateValue("medicalNotes", e.target.value)}
                    placeholder="알레르기, 복용 중인 약, 주의사항 등을 적어 주세요."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>예방접종 기록</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addVaccination}>
                  <Plus className="mr-1 h-4 w-4" />
                  접종 추가
                </Button>
              </CardHeader>
              <CardContent>
                {vaccinations.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">등록된 예방접종 정보가 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {vaccinations.map((vaccination, index) => (
                      <div key={index} className="space-y-3 rounded-lg bg-secondary/50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">접종 {index + 1}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeVaccination(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Input
                            placeholder="백신명"
                            value={vaccination.name}
                            onChange={(e) => updateVaccination(index, "name", e.target.value)}
                          />
                          <Input
                            type="date"
                            value={vaccination.date}
                            onChange={(e) => updateVaccination(index, "date", e.target.value)}
                          />
                          <Input
                            type="date"
                            value={vaccination.nextDue ?? ""}
                            onChange={(e) => updateVaccination(index, "nextDue", e.target.value)}
                          />
                          <Input
                            placeholder="병원명"
                            value={vaccination.hospital ?? ""}
                            onChange={(e) => updateVaccination(index, "hospital", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>상태</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>보호 상태</Label>
                  <Select value={values.status} onValueChange={(value) => updateValue("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["protected", "temporary", "treatment", "adopted"] as DogStatus[]).map((status) => (
                        <SelectItem key={status} value={status}>
                          {dogStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>예방접종 상태</Label>
                  <Select
                    value={values.vaccinationStatus}
                    onValueChange={(value) => updateValue("vaccinationStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["complete", "in_progress", "not_started"] as VaccinationStatus[]).map((status) => (
                        <SelectItem key={status} value={status}>
                          {vaccinationStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>입양 준비도 상태</Label>
                  <Select
                    value={values.adoptionReadiness}
                    onValueChange={(value) => updateValue("adoptionReadiness", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["ready", "missing_info", "not_ready"] as AdoptionReadiness[]).map((status) => (
                        <SelectItem key={status} value={status}>
                          {adoptionReadinessLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readinessScore">준비 점수</Label>
                  <Input
                    id="readinessScore"
                    type="number"
                    min="0"
                    max="100"
                    value={values.readinessScore}
                    onChange={(e) => updateValue("readinessScore", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>사진</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {photos.length === 0 && (
                    <div className="col-span-2 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      등록된 사진이 없습니다.
                    </div>
                  )}
                  {photos.map((photo, index) => (
                    <div key={photo + index} className="space-y-2 rounded-lg border bg-secondary/30 p-2">
                      <div className="truncate text-xs text-muted-foreground">{photo}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setPhotos((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="사진 URL을 입력해 추가하세요"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addPhoto}>
                    추가
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>누락 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  value={missingInfoText}
                  onChange={(e) => setMissingInfoText(e.target.value)}
                  placeholder="쉼표(,)로 구분해 입력하세요. 예: 광견병 접종, 추가 사진"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 pt-6">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "저장 중..." : submitLabel}
                </Button>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link href={backHref}>취소</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
