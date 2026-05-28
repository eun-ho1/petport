"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle,
  Droplets,
  Heart,
  Pill,
  Save,
  Scale,
  Thermometer,
  Utensils,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api/client"
import {
  energyLevelLabels,
  feedingCompletionLabels,
  stoolConditionLabels,
  waterIntakeLabels,
} from "@/lib/labels"
import type { DailyCareRecord, Dog, EnergyLevel, FeedingCompletion, StoolCondition, WaterIntake } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface SelectChipProps<T extends string> {
  options: Array<{ value: T; label: string; color?: string }>
  value: T
  onChange: (value: T) => void
}

function SelectChip<T extends string>({ options, value, onChange }: SelectChipProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-xl px-3 py-2 text-sm font-medium transition-all active:scale-95",
            value === option.value
              ? option.color || "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function ToggleButton({
  label,
  value,
  onChange,
  variant = "default",
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
  variant?: "default" | "warning"
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex min-w-[120px] flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all active:scale-95",
        value
          ? variant === "warning"
            ? "border-destructive bg-destructive/10 text-destructive"
            : "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground"
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <div
        className={cn(
          "relative h-6 w-10 rounded-full transition-colors",
          value
            ? variant === "warning"
              ? "bg-destructive"
              : "bg-primary"
            : "bg-muted"
        )}
      >
        <div
          className={cn(
            "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
            value ? "translate-x-5" : "translate-x-1"
          )}
        />
      </div>
    </button>
  )
}

export default function DailyCareInputPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [dog, setDog] = useState<Dog | null>(null)
  const [existingRecord, setExistingRecord] = useState<DailyCareRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [feedingAmount, setFeedingAmount] = useState("")
  const [feedingCompletion, setFeedingCompletion] = useState<FeedingCompletion>("not_fed")
  const [waterIntake, setWaterIntake] = useState<WaterIntake>("normal")
  const [medicationGiven, setMedicationGiven] = useState(false)
  const [medicationNotes, setMedicationNotes] = useState("")
  const [stoolCondition, setStoolCondition] = useState<StoolCondition>("unknown")
  const [vomiting, setVomiting] = useState(false)
  const [vomitingNotes, setVomitingNotes] = useState("")
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("normal")
  const [aggression, setAggression] = useState(false)
  const [anxiety, setAnxiety] = useState(false)
  const [behaviorNotes, setBehaviorNotes] = useState("")
  const [healthNotes, setHealthNotes] = useState("")
  const [specialObservations, setSpecialObservations] = useState("")
  const [weight, setWeight] = useState("")
  const [temperature, setTemperature] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [dogResponse, careResponse] = await Promise.all([
          apiClient.getDog(id),
          apiClient.getDailyCareRecords(id),
        ])

        const todayRecord = careResponse.items.find((item) => item.date === today) ?? null

        setDog(dogResponse.item)
        setExistingRecord(todayRecord)

        if (todayRecord) {
          setFeedingAmount(todayRecord.feedingAmount ? String(todayRecord.feedingAmount) : "")
          setFeedingCompletion(todayRecord.feedingCompletion)
          setWaterIntake(todayRecord.waterIntake)
          setMedicationGiven(todayRecord.medicationGiven)
          setMedicationNotes(todayRecord.medicationNotes ?? "")
          setStoolCondition(todayRecord.stoolCondition)
          setVomiting(todayRecord.vomiting)
          setVomitingNotes(todayRecord.vomitingNotes ?? "")
          setEnergyLevel(todayRecord.energyLevel)
          setAggression(todayRecord.aggression)
          setAnxiety(todayRecord.anxiety)
          setBehaviorNotes(todayRecord.behaviorNotes ?? "")
          setHealthNotes(todayRecord.healthNotes ?? "")
          setSpecialObservations(todayRecord.specialObservations ?? "")
          setWeight(todayRecord.weight ? String(todayRecord.weight) : "")
          setTemperature(todayRecord.temperature ? String(todayRecord.temperature) : "")
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "일일 케어 정보를 불러오지 못했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [id, today])

  const persistRecord = async (isDraft: boolean) => {
    if (!dog) return

    const response = await apiClient.createDailyCareRecord(id, {
      date: today,
      feedingAmount: feedingAmount ? Number(feedingAmount) : null,
      feedingCompletion,
      waterIntake,
      medicationGiven,
      medicationNotes: medicationNotes || null,
      stoolCondition,
      vomiting,
      vomitingNotes: vomitingNotes || null,
      energyLevel,
      aggression,
      anxiety,
      behaviorNotes: behaviorNotes || null,
      healthNotes: healthNotes || null,
      specialObservations: specialObservations || null,
      weight: weight ? Number(weight) : null,
      temperature: temperature ? Number(temperature) : null,
      imageUrls: [],
      isDraft,
    })

    setExistingRecord(response.item)
    return response.item
  }

  const feedingOptions = (Object.keys(feedingCompletionLabels) as FeedingCompletion[]).map((value) => ({
    value,
    label: feedingCompletionLabels[value],
    color:
      value === "complete"
        ? "bg-[oklch(0.65_0.15_145)] text-white"
        : value === "most"
          ? "bg-[oklch(0.75_0.15_80)] text-[oklch(0.3_0.05_80)]"
          : value === "half" || value === "none"
            ? "bg-destructive/80 text-white"
            : "bg-muted text-muted-foreground",
  }))

  const waterOptions = (Object.keys(waterIntakeLabels) as WaterIntake[]).map((value) => ({
    value,
    label: waterIntakeLabels[value],
    color:
      value === "enough"
        ? "bg-[oklch(0.65_0.15_145)] text-white"
        : value === "normal"
          ? "bg-[oklch(0.75_0.15_80)] text-[oklch(0.3_0.05_80)]"
          : "bg-destructive/80 text-white",
  }))

  const stoolOptions = (Object.keys(stoolConditionLabels) as StoolCondition[]).map((value) => ({
    value,
    label: stoolConditionLabels[value],
    color:
      value === "normal"
        ? "bg-[oklch(0.65_0.15_145)] text-white"
        : value === "soft"
          ? "bg-[oklch(0.75_0.15_80)] text-[oklch(0.3_0.05_80)]"
          : value === "unknown"
            ? "bg-muted text-muted-foreground"
            : "bg-destructive/80 text-white",
  }))

  const energyOptions = (Object.keys(energyLevelLabels) as EnergyLevel[]).map((value) => ({
    value,
    label: energyLevelLabels[value],
    color:
      value === "very_active" || value === "active"
        ? "bg-[oklch(0.65_0.15_145)] text-white"
        : value === "normal"
          ? "bg-[oklch(0.75_0.15_80)] text-[oklch(0.3_0.05_80)]"
          : "bg-destructive/80 text-white",
  }))

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">일일 케어 정보를 불러오는 중입니다...</CardContent>
      </Card>
    )
  }

  if (error || !dog) {
    return (
      <Card>
        <CardContent className="space-y-4 py-12 text-center">
          <p className="text-destructive">{error ?? "강아지 정보를 찾을 수 없습니다."}</p>
          <Button asChild>
            <Link href="/dogs">강아지 목록으로 돌아가기</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const imageUrl = dog.photos[0] ?? dog.primaryPhotoUrl ?? "/placeholder.jpg"

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-center gap-3">
        <Link href={`/dogs/${dog.id}`}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex flex-1 items-center gap-3">
          <img src={imageUrl} alt={dog.name} className="h-12 w-12 rounded-full object-cover" />
          <div>
            <h1 className="text-xl font-bold">{dog.name} 일일 케어</h1>
            <p className="text-sm text-muted-foreground">
              {dog.breed || "품종 미상"} / {dog.estimatedAge || "나이 미상"}
            </p>
          </div>
        </div>
        {existingRecord && (
          <Badge variant="outline" className="bg-[oklch(0.65_0.15_145/0.15)] text-[oklch(0.45_0.15_145)]">
            오늘 기록 있음
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Utensils className="h-5 w-5 text-primary" />
            급여
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm text-muted-foreground">급여량 (g)</Label>
            <Input type="number" value={feedingAmount} onChange={(e) => setFeedingAmount(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block text-sm text-muted-foreground">섭취 상태</Label>
            <SelectChip options={feedingOptions} value={feedingCompletion} onChange={setFeedingCompletion} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Droplets className="h-5 w-5 text-accent" />
            수분
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SelectChip options={waterOptions} value={waterIntake} onChange={setWaterIntake} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="h-5 w-5 text-primary" />
            투약
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">약 복용 여부</Label>
            <Button variant={medicationGiven ? "default" : "outline"} onClick={() => setMedicationGiven((prev) => !prev)}>
              {medicationGiven ? "복용함" : "복용 안 함"}
            </Button>
          </div>
          {medicationGiven && (
            <Input
              placeholder="투약 내용"
              value={medicationNotes}
              onChange={(e) => setMedicationNotes(e.target.value)}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-5 w-5 text-destructive" />
            건강 상태
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm text-muted-foreground">배변 상태</Label>
            <SelectChip options={stoolOptions} value={stoolCondition} onChange={setStoolCondition} />
          </div>
          <ToggleButton label="구토 여부" value={vomiting} onChange={setVomiting} variant="warning" />
          {vomiting && (
            <Input
              placeholder="구토 상세 메모"
              value={vomitingNotes}
              onChange={(e) => setVomitingNotes(e.target.value)}
            />
          )}
          <div>
            <Label className="mb-2 block text-sm text-muted-foreground">활력 상태</Label>
            <SelectChip options={energyOptions} value={energyLevel} onChange={setEnergyLevel} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-accent" />
            행동 관찰
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <ToggleButton label="공격성" value={aggression} onChange={setAggression} variant="warning" />
            <ToggleButton label="불안/스트레스" value={anxiety} onChange={setAnxiety} variant="warning" />
          </div>
          <Textarea
            rows={3}
            placeholder="행동 메모"
            value={behaviorNotes}
            onChange={(e) => setBehaviorNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            추가 메모
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={3}
            placeholder="건강 메모"
            value={healthNotes}
            onChange={(e) => setHealthNotes(e.target.value)}
          />
          <Textarea
            rows={3}
            placeholder="특이사항"
            value={specialObservations}
            onChange={(e) => setSpecialObservations(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground">선택 입력</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Scale className="h-4 w-4" />
              체중 (kg)
            </Label>
            <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Thermometer className="h-4 w-4" />
              체온 (°C)
            </Label>
            <Input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 p-4 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-3xl gap-3">
          <Button
            variant="outline"
            className="h-12 flex-1"
            disabled={isSavingDraft || isCompleting}
            onClick={async () => {
              try {
                setIsSavingDraft(true)
                await persistRecord(true)
                toast({
                  title: "임시 저장 완료",
                  description: "일일 케어 기록이 임시 저장되었습니다.",
                })
              } catch (saveError) {
                toast({
                  title: "임시 저장 실패",
                  description:
                    saveError instanceof Error ? saveError.message : "임시 저장 중 문제가 발생했습니다.",
                  variant: "destructive",
                })
              } finally {
                setIsSavingDraft(false)
              }
            }}
          >
            <Save className="mr-2 h-5 w-5" />
            {isSavingDraft ? "저장 중..." : "임시 저장"}
          </Button>
          <Button
            className="h-12 flex-1"
            disabled={isSavingDraft || isCompleting}
            onClick={async () => {
              try {
                setIsCompleting(true)
                await persistRecord(false)
                toast({
                  title: "저장 완료",
                  description: "일일 케어 기록이 저장되었습니다.",
                })
                router.push(`/dogs/${dog.id}`)
              } catch (saveError) {
                toast({
                  title: "저장 실패",
                  description:
                    saveError instanceof Error ? saveError.message : "일일 케어 기록을 저장하지 못했습니다.",
                  variant: "destructive",
                })
              } finally {
                setIsCompleting(false)
              }
            }}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            {isCompleting ? "저장 중..." : "체크 완료"}
          </Button>
        </div>
      </div>
    </div>
  )
}
