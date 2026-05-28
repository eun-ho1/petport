"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  ChevronRight,
  Filter,
  Utensils,
  Droplets,
  Pill,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from "lucide-react"
import { sampleDogs, getTodayRecordForDog } from "@/lib/data"
import { cn } from "@/lib/utils"
import type { DailyCareRecord } from "@/lib/types"

type FilterStatus = "all" | "completed" | "missing" | "attention"

function getRecordStatus(record?: DailyCareRecord): FilterStatus {
  if (!record) return "missing"
  if (record.isDraft) return "missing"

  const hasIssue =
    record.vomiting ||
    record.feedingCompletion === "거부" ||
    record.feedingCompletion === "반이하" ||
    record.waterIntake === "거부" ||
    record.energyLevel === "무기력" ||
    record.aggression ||
    record.anxiety

  return hasIssue ? "attention" : "completed"
}

function StatusBadge({ status }: { status: FilterStatus }) {
  const badges = {
    completed: (
      <Badge variant="outline" className="bg-[oklch(0.65_0.15_145/0.15)] text-[oklch(0.45_0.15_145)] border-[oklch(0.65_0.15_145)]">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        완료
      </Badge>
    ),
    missing: (
      <Badge variant="outline" className="bg-muted text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        미등록
      </Badge>
    ),
    attention: (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
        <AlertCircle className="h-3 w-3 mr-1" />
        주의필요
      </Badge>
    ),
    all: null,
  }
  return badges[status]
}

function RecordDetailCard({ record }: { record?: DailyCareRecord }) {
  if (!record) {
    return (
      <div className="text-xs text-muted-foreground">
        오늘 기록 없음
      </div>
    )
  }

  const feedingColors: Record<string, string> = {
    완식: "text-[oklch(0.45_0.15_145)]",
    반이상: "text-[oklch(0.55_0.15_80)]",
    반이하: "text-destructive",
    거부: "text-destructive",
    미급여: "text-muted-foreground",
  }

  const waterColors: Record<string, string> = {
    충분: "text-[oklch(0.45_0.15_145)]",
    보통: "text-[oklch(0.55_0.15_80)]",
    부족: "text-destructive",
    거부: "text-destructive",
  }

  return (
    <div className="flex flex-wrap gap-3 text-xs">
      <div className="flex items-center gap-1">
        <Utensils className={cn("h-3.5 w-3.5", feedingColors[record.feedingCompletion])} />
        <span className={feedingColors[record.feedingCompletion]}>{record.feedingCompletion}</span>
      </div>
      <div className="flex items-center gap-1">
        <Droplets className={cn("h-3.5 w-3.5", waterColors[record.waterIntake])} />
        <span className={waterColors[record.waterIntake]}>{record.waterIntake}</span>
      </div>
      {record.medicationGiven && (
        <div className="flex items-center gap-1">
          <Pill className="h-3.5 w-3.5 text-[oklch(0.45_0.15_145)]" />
          <span className="text-[oklch(0.45_0.15_145)]">투약완료</span>
        </div>
      )}
      {record.vomiting && (
        <div className="flex items-center gap-1 text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>구토</span>
        </div>
      )}
    </div>
  )
}

export default function DailyRecordsListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const activeDogs = sampleDogs.filter((d) => d.status !== "입양완료")

  const dogsWithRecords = activeDogs.map((dog) => ({
    dog,
    record: getTodayRecordForDog(dog.id),
    status: getRecordStatus(getTodayRecordForDog(dog.id)),
  }))

  const filteredDogs = dogsWithRecords.filter((item) => {
    const matchesSearch =
      item.dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dog.breed.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterStatus === "all" || item.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const counts = {
    all: dogsWithRecords.length,
    completed: dogsWithRecords.filter((d) => d.status === "completed").length,
    missing: dogsWithRecords.filter((d) => d.status === "missing").length,
    attention: dogsWithRecords.filter((d) => d.status === "attention").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/daily-care">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">일일 기록 목록</h1>
          <p className="text-muted-foreground">
            모든 강아지의 오늘 관리 현황
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 품종 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as FilterStatus)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 ({counts.all})</SelectItem>
                <SelectItem value="completed">완료 ({counts.completed})</SelectItem>
                <SelectItem value="missing">미등록 ({counts.missing})</SelectItem>
                <SelectItem value="attention">주의필요 ({counts.attention})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setFilterStatus("completed")}
          className={cn(
            "p-3 rounded-xl border text-center transition-colors",
            filterStatus === "completed"
              ? "border-[oklch(0.65_0.15_145)] bg-[oklch(0.65_0.15_145/0.1)]"
              : "border-border bg-card hover:bg-muted/50"
          )}
        >
          <div className="text-2xl font-bold text-[oklch(0.45_0.15_145)]">
            {counts.completed}
          </div>
          <div className="text-xs text-muted-foreground">완료</div>
        </button>
        <button
          onClick={() => setFilterStatus("missing")}
          className={cn(
            "p-3 rounded-xl border text-center transition-colors",
            filterStatus === "missing"
              ? "border-[oklch(0.75_0.15_80)] bg-[oklch(0.75_0.15_80/0.1)]"
              : "border-border bg-card hover:bg-muted/50"
          )}
        >
          <div className="text-2xl font-bold text-[oklch(0.55_0.15_80)]">
            {counts.missing}
          </div>
          <div className="text-xs text-muted-foreground">미등록</div>
        </button>
        <button
          onClick={() => setFilterStatus("attention")}
          className={cn(
            "p-3 rounded-xl border text-center transition-colors",
            filterStatus === "attention"
              ? "border-destructive bg-destructive/10"
              : "border-border bg-card hover:bg-muted/50"
          )}
        >
          <div className="text-2xl font-bold text-destructive">
            {counts.attention}
          </div>
          <div className="text-xs text-muted-foreground">주의필요</div>
        </button>
      </div>

      {/* Dog List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {filterStatus === "all"
              ? "전체 강아지"
              : filterStatus === "completed"
              ? "기록 완료"
              : filterStatus === "missing"
              ? "기록 미등록"
              : "주의 필요"}{" "}
            ({filteredDogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredDogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                해당하는 강아지가 없습니다
              </div>
            ) : (
              filteredDogs.map(({ dog, record, status }) => (
                <Link
                  key={dog.id}
                  href={`/daily-care/input/${dog.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  {/* Dog Photo */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={dog.photos[0]}
                      alt={dog.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  </div>

                  {/* Dog Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{dog.name}</span>
                      <StatusBadge status={status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dog.breed} / {dog.estimatedAge} / {dog.weight}kg
                    </p>
                    <RecordDetailCard record={record} />
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col items-end gap-1">
                    <Button size="sm" variant={status === "missing" ? "default" : "outline"}>
                      {status === "missing" ? "기록하기" : "수정"}
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
