"use client"

import { useState, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Utensils,
  Droplets,
  Pill,
  Scale,
  Activity,
  AlertTriangle,
  ChevronRight,
} from "lucide-react"
import { sampleDogs, getDogCareHistory } from "@/lib/data"
import { cn } from "@/lib/utils"
import type { DailyCareRecord } from "@/lib/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  })
}

function FeedingTrend({ records }: { records: DailyCareRecord[] }) {
  const data = records
    .slice(0, 7)
    .reverse()
    .map((r) => ({
      date: formatDate(r.date),
      amount: r.feedingAmount,
      completion:
        r.feedingCompletion === "완식"
          ? 100
          : r.feedingCompletion === "반이상"
          ? 75
          : r.feedingCompletion === "반이하"
          ? 25
          : 0,
    }))

  if (data.length < 2) {
    return (
      <div className="text-center text-muted-foreground py-8">
        트렌드를 표시하려면 2일 이상의 기록이 필요합니다
      </div>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="oklch(0.55 0.15 45)"
            strokeWidth={2}
            dot={{ fill: "oklch(0.55 0.15 45)" }}
            name="급여량 (g)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function WeightTrend({ records }: { records: DailyCareRecord[] }) {
  const recordsWithWeight = records.filter((r) => r.weight)
  const data = recordsWithWeight
    .slice(0, 14)
    .reverse()
    .map((r) => ({
      date: formatDate(r.date),
      weight: r.weight,
    }))

  if (data.length < 2) {
    return (
      <div className="text-center text-muted-foreground py-8">
        체중 기록이 부족합니다
      </div>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            domain={["dataMin - 0.5", "dataMax + 0.5"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="oklch(0.65 0.12 160)"
            strokeWidth={2}
            dot={{ fill: "oklch(0.65 0.12 160)" }}
            name="체중 (kg)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function TimelineItem({ record }: { record: DailyCareRecord }) {
  const hasIssue =
    record.vomiting ||
    record.feedingCompletion === "거부" ||
    record.feedingCompletion === "반이하" ||
    record.waterIntake === "거부" ||
    record.energyLevel === "무기력" ||
    record.aggression ||
    record.anxiety

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

  const energyColors: Record<string, string> = {
    매우활발: "text-[oklch(0.45_0.15_145)]",
    활발: "text-[oklch(0.45_0.15_145)]",
    보통: "text-muted-foreground",
    저조: "text-[oklch(0.55_0.15_80)]",
    무기력: "text-destructive",
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-3 h-3 rounded-full",
            hasIssue ? "bg-destructive" : "bg-[oklch(0.65_0.15_145)]"
          )}
        />
        <div className="w-0.5 flex-1 bg-border" />
      </div>
      <Card className={cn("flex-1 mb-4", hasIssue && "border-destructive/30")}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">{formatFullDate(record.date)}</span>
            {hasIssue && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                주의
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Utensils className={cn("h-4 w-4", feedingColors[record.feedingCompletion])} />
              <span className={feedingColors[record.feedingCompletion]}>
                {record.feedingCompletion}
              </span>
              {record.feedingAmount > 0 && (
                <span className="text-muted-foreground text-xs">
                  ({record.feedingAmount}g)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className={cn("h-4 w-4", waterColors[record.waterIntake])} />
              <span className={waterColors[record.waterIntake]}>
                {record.waterIntake}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Pill
                className={cn(
                  "h-4 w-4",
                  record.medicationGiven
                    ? "text-[oklch(0.45_0.15_145)]"
                    : "text-muted-foreground"
                )}
              />
              <span
                className={
                  record.medicationGiven
                    ? "text-[oklch(0.45_0.15_145)]"
                    : "text-muted-foreground"
                }
              >
                {record.medicationGiven ? "투약" : "-"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className={cn("h-4 w-4", energyColors[record.energyLevel])} />
              <span className={energyColors[record.energyLevel]}>
                {record.energyLevel}
              </span>
            </div>
          </div>

          {record.vomiting && (
            <div className="mt-2 text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              구토 기록됨 {record.vomitingNotes && `- ${record.vomitingNotes}`}
            </div>
          )}

          {(record.behaviorNotes || record.healthNotes || record.specialObservations) && (
            <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm text-muted-foreground">
              {record.behaviorNotes && <p>행동: {record.behaviorNotes}</p>}
              {record.healthNotes && <p>건강: {record.healthNotes}</p>}
              {record.specialObservations && <p>관찰: {record.specialObservations}</p>}
            </div>
          )}

          {record.weight && (
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Scale className="h-3.5 w-3.5" />
              체중: {record.weight}kg
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DogDailyHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState<"timeline" | "feeding" | "weight">("timeline")
  const dog = sampleDogs.find((d) => d.id === resolvedParams.id)
  const history = getDogCareHistory(resolvedParams.id)

  if (!dog) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">강아지를 찾을 수 없습니다</p>
      </div>
    )
  }

  // Calculate trends
  const recentRecords = history.slice(0, 7)
  const olderRecords = history.slice(7, 14)

  const avgRecentFeeding =
    recentRecords.length > 0
      ? recentRecords.reduce((sum, r) => sum + r.feedingAmount, 0) / recentRecords.length
      : 0
  const avgOlderFeeding =
    olderRecords.length > 0
      ? olderRecords.reduce((sum, r) => sum + r.feedingAmount, 0) / olderRecords.length
      : avgRecentFeeding

  const feedingTrend =
    avgRecentFeeding > avgOlderFeeding * 1.1
      ? "up"
      : avgRecentFeeding < avgOlderFeeding * 0.9
      ? "down"
      : "stable"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/daily-care/input/${dog.id}`}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <img
            src={dog.photos[0]}
            alt={dog.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h1 className="text-xl font-bold">{dog.name} 일일 기록</h1>
            <p className="text-sm text-muted-foreground">
              총 {history.length}개의 기록
            </p>
          </div>
        </div>
        <Link href={`/daily-care/input/${dog.id}`}>
          <Button>오늘 기록</Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold">
              {feedingTrend === "up" && (
                <TrendingUp className="h-4 w-4 text-[oklch(0.45_0.15_145)]" />
              )}
              {feedingTrend === "down" && (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              {feedingTrend === "stable" && (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{Math.round(avgRecentFeeding)}g</span>
            </div>
            <p className="text-xs text-muted-foreground">평균 급여량</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold">
              {recentRecords.filter((r) => r.medicationGiven).length}/
              {recentRecords.length}
            </div>
            <p className="text-xs text-muted-foreground">최근 투약</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-destructive">
              {recentRecords.filter((r) => r.vomiting).length}
            </div>
            <p className="text-xs text-muted-foreground">최근 구토</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("timeline")}
          className={cn(
            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "timeline"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          )}
        >
          <Calendar className="h-4 w-4 inline mr-1" />
          타임라인
        </button>
        <button
          onClick={() => setActiveTab("feeding")}
          className={cn(
            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "feeding"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          )}
        >
          <Utensils className="h-4 w-4 inline mr-1" />
          급여 트렌드
        </button>
        <button
          onClick={() => setActiveTab("weight")}
          className={cn(
            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "weight"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          )}
        >
          <Scale className="h-4 w-4 inline mr-1" />
          체중 트렌드
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "timeline" && (
        <div className="space-y-0">
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                기록이 없습니다
              </CardContent>
            </Card>
          ) : (
            history.map((record) => (
              <TimelineItem key={record.id} record={record} />
            ))
          )}
        </div>
      )}

      {activeTab === "feeding" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">급여량 변화</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedingTrend records={history} />
          </CardContent>
        </Card>
      )}

      {activeTab === "weight" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">체중 변화</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightTrend records={history} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
