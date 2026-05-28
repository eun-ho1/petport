"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardCheck,
  AlertCircle,
  Utensils,
  Heart,
  Brain,
  FileText,
  Search,
  ChevronRight,
  Droplets,
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { sampleDogs, getDailyCareStats, getTodayRecordForDog } from "@/lib/data"
import { cn } from "@/lib/utils"
import type { DailyCareRecord } from "@/lib/types"

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: "primary" | "accent" | "destructive" | "warning"
  href?: string
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-[oklch(0.75_0.15_80/0.15)] text-[oklch(0.55_0.15_80)]",
  }

  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

function QuickActionButton({
  icon: Icon,
  label,
  href,
  variant = "outline",
}: {
  icon: React.ElementType
  label: string
  href: string
  variant?: "default" | "outline"
}) {
  return (
    <Link href={href}>
      <Button
        variant={variant}
        className="w-full h-auto py-4 flex flex-col gap-2"
      >
        <Icon className="h-6 w-6" />
        <span className="text-sm font-medium">{label}</span>
      </Button>
    </Link>
  )
}

function DogRecordStatusBadge({ record }: { record?: DailyCareRecord }) {
  if (!record) {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        미등록
      </Badge>
    )
  }

  if (record.isDraft) {
    return (
      <Badge variant="outline" className="bg-[oklch(0.75_0.15_80/0.15)] text-[oklch(0.55_0.15_80)] border-[oklch(0.75_0.15_80)]">
        <Clock className="h-3 w-3 mr-1" />
        임시저장
      </Badge>
    )
  }

  const hasIssue =
    record.vomiting ||
    record.feedingCompletion === "거부" ||
    record.feedingCompletion === "반이하" ||
    record.waterIntake === "거부" ||
    record.energyLevel === "무기력" ||
    record.aggression ||
    record.anxiety

  if (hasIssue) {
    return (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
        <AlertCircle className="h-3 w-3 mr-1" />
        주의필요
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-[oklch(0.65_0.15_145/0.15)] text-[oklch(0.45_0.15_145)] border-[oklch(0.65_0.15_145)]">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      완료
    </Badge>
  )
}

function FeedingStatusIcon({ record }: { record?: DailyCareRecord }) {
  if (!record) return <XCircle className="h-4 w-4 text-muted-foreground" />

  const statusColors: Record<string, string> = {
    완식: "text-[oklch(0.45_0.15_145)]",
    반이상: "text-[oklch(0.55_0.15_80)]",
    반이하: "text-destructive",
    거부: "text-destructive",
    미급여: "text-muted-foreground",
  }

  return (
    <div className="flex items-center gap-1">
      <Utensils className={cn("h-4 w-4", statusColors[record.feedingCompletion])} />
      <span className={cn("text-xs", statusColors[record.feedingCompletion])}>
        {record.feedingCompletion}
      </span>
    </div>
  )
}

function WaterStatusIcon({ record }: { record?: DailyCareRecord }) {
  if (!record) return <XCircle className="h-4 w-4 text-muted-foreground" />

  const statusColors: Record<string, string> = {
    충분: "text-[oklch(0.45_0.15_145)]",
    보통: "text-[oklch(0.55_0.15_80)]",
    부족: "text-destructive",
    거부: "text-destructive",
  }

  return (
    <div className="flex items-center gap-1">
      <Droplets className={cn("h-4 w-4", statusColors[record.waterIntake])} />
      <span className={cn("text-xs", statusColors[record.waterIntake])}>
        {record.waterIntake}
      </span>
    </div>
  )
}

function MedicationStatusIcon({ record }: { record?: DailyCareRecord }) {
  if (!record) return <XCircle className="h-4 w-4 text-muted-foreground" />

  return (
    <div className="flex items-center gap-1">
      <Pill className={cn("h-4 w-4", record.medicationGiven ? "text-[oklch(0.45_0.15_145)]" : "text-muted-foreground")} />
      <span className={cn("text-xs", record.medicationGiven ? "text-[oklch(0.45_0.15_145)]" : "text-muted-foreground")}>
        {record.medicationGiven ? "투여" : "-"}
      </span>
    </div>
  )
}

export default function DailyCareDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const stats = getDailyCareStats()
  const activeDogs = sampleDogs.filter((d) => d.status !== "입양완료")

  const filteredDogs = activeDogs.filter(
    (dog) =>
      dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dog.breed.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">일일 관리</h1>
        <p className="text-muted-foreground">
          오늘의 강아지 건강 및 관리 현황
        </p>
      </div>

      {/* Stats Grid - Mobile optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={ClipboardCheck}
          label="오늘 체크 완료"
          value={stats.checkedToday}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="미등록"
          value={stats.missingRecords}
          color="warning"
        />
        <StatCard
          icon={AlertCircle}
          label="건강 이상"
          value={stats.abnormalHealth}
          color="destructive"
          href="/daily-care/alerts"
        />
        <StatCard
          icon={Utensils}
          label="식욕 문제"
          value={stats.appetiteIssues}
          color="warning"
        />
        <StatCard
          icon={Brain}
          label="행동 주의"
          value={stats.behaviorWarnings}
          color="accent"
        />
        <StatCard
          icon={Heart}
          label="전체 보호중"
          value={stats.totalDogs}
          color="primary"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">빠른 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickActionButton
              icon={Utensils}
              label="급여 기록"
              href="/daily-care/records"
              variant="default"
            />
            <QuickActionButton
              icon={Heart}
              label="건강 기록"
              href="/daily-care/records"
            />
            <QuickActionButton
              icon={Brain}
              label="행동 기록"
              href="/daily-care/records"
            />
            <QuickActionButton
              icon={FileText}
              label="일일 리포트"
              href="/daily-care/records"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dog List with Today's Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">강아지별 오늘의 기록</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 품종 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredDogs.map((dog) => {
              const todayRecord = getTodayRecordForDog(dog.id)
              return (
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
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {todayRecord && !todayRecord.isDraft && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[oklch(0.65_0.15_145)] rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Dog Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dog.name}</span>
                      <DogRecordStatusBadge record={todayRecord} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {dog.breed} / {dog.estimatedAge}
                    </p>
                  </div>

                  {/* Status Icons */}
                  <div className="hidden sm:flex items-center gap-4">
                    <FeedingStatusIcon record={todayRecord} />
                    <WaterStatusIcon record={todayRecord} />
                    <MedicationStatusIcon record={todayRecord} />
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
