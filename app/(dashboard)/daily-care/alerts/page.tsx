"use client"

import type { ElementType } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Pill,
  RefreshCw,
  TrendingDown,
  Utensils,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { alertPriorityLabels, alertTypeLabels } from "@/lib/labels"
import type { AlertPriority, AlertType, HealthAlert } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const priorityConfig: Record<
  AlertPriority,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  critical: {
    label: alertPriorityLabels.critical,
    color: "text-white",
    bgColor: "bg-destructive",
    borderColor: "border-destructive",
  },
  high: {
    label: alertPriorityLabels.high,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
  medium: {
    label: alertPriorityLabels.medium,
    color: "text-[oklch(0.55_0.15_80)]",
    bgColor: "bg-[oklch(0.75_0.15_80/0.15)]",
    borderColor: "border-[oklch(0.75_0.15_80)]",
  },
  low: {
    label: alertPriorityLabels.low,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-border",
  },
}

const alertTypeIcons: Record<AlertType, ElementType> = {
  appetite_issue: Utensils,
  vomiting: AlertTriangle,
  behavior_issue: Activity,
  medication_missed: Pill,
  weight_loss: TrendingDown,
  general_health: AlertTriangle,
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return "방금 전"
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  return date.toLocaleDateString("ko-KR")
}

type FilterPriority = "all" | AlertPriority

export default function HealthAlertsPage() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isResolvingId, setIsResolvingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all")
  const [showResolved, setShowResolved] = useState(false)

  const fetchAlerts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getHealthAlerts()
      setAlerts(response.items)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "건강 알림을 불러오지 못했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchAlerts()
  }, [])

  const activeAlerts = useMemo(() => alerts.filter((alert) => !alert.isResolved), [alerts])
  const resolvedAlerts = useMemo(() => alerts.filter((alert) => alert.isResolved), [alerts])
  const sourceAlerts = showResolved ? resolvedAlerts : activeAlerts
  const filteredAlerts = sourceAlerts.filter(
    (alert) => filterPriority === "all" || alert.priority === filterPriority
  )

  const alertCounts: Record<AlertPriority, number> = {
    critical: activeAlerts.filter((alert) => alert.priority === "critical").length,
    high: activeAlerts.filter((alert) => alert.priority === "high").length,
    medium: activeAlerts.filter((alert) => alert.priority === "medium").length,
    low: activeAlerts.filter((alert) => alert.priority === "low").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/daily-care">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">건강 알림</h1>
          <p className="text-muted-foreground">주의가 필요한 강아지 상태를 빠르게 확인하세요.</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "px-3 py-1 text-lg",
            activeAlerts.length > 0
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-[oklch(0.65_0.15_145)] bg-[oklch(0.65_0.15_145/0.15)] text-[oklch(0.45_0.15_145)]"
          )}
        >
          <Bell className="mr-1 h-4 w-4" />
          {activeAlerts.length}
        </Badge>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => void fetchAlerts()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(["critical", "high", "medium", "low"] as AlertPriority[]).map((priority) => {
          const config = priorityConfig[priority]
          const count = alertCounts[priority]
          const isActive = filterPriority === priority

          return (
            <button
              key={priority}
              onClick={() => setFilterPriority(isActive ? "all" : priority)}
              className={cn(
                "rounded-xl border-2 p-3 text-center transition-all active:scale-95",
                isActive ? config.borderColor : "border-border",
                isActive ? config.bgColor : "bg-card hover:bg-muted/50"
              )}
            >
              <div className={cn("text-xl font-bold", isActive ? config.color : count > 0 ? config.color : "text-muted-foreground")}>
                {count}
              </div>
              <div className="text-xs text-muted-foreground">{config.label}</div>
            </button>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant={!showResolved ? "default" : "outline"}
                size="sm"
                onClick={() => setShowResolved(false)}
                className="flex-1 sm:flex-none"
              >
                <Clock className="mr-1 h-4 w-4" />
                진행 중 ({activeAlerts.length})
              </Button>
              <Button
                variant={showResolved ? "default" : "outline"}
                size="sm"
                onClick={() => setShowResolved(true)}
                className="flex-1 sm:flex-none"
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                해결됨 ({resolvedAlerts.length})
              </Button>
            </div>
            <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as FilterPriority)}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="우선순위" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="critical">긴급</SelectItem>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">건강 알림을 불러오는 중입니다...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => void fetchAlerts()}>다시 시도</Button>
          </CardContent>
        </Card>
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-[oklch(0.65_0.15_145)]" />
            <p className="text-muted-foreground">
              {showResolved ? "해결된 알림이 없습니다." : "현재 진행 중인 알림이 없습니다."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const config = priorityConfig[alert.priority]
            const Icon = alertTypeIcons[alert.alertType]

            return (
              <Card
                key={alert.id}
                className={cn("overflow-hidden", !alert.isResolved && alert.priority === "critical" && "border-destructive")}
              >
                {!alert.isResolved && (
                  <div
                    className={cn(
                      "h-1",
                      alert.priority === "critical"
                        ? "bg-destructive"
                        : alert.priority === "high"
                          ? "bg-destructive/60"
                          : alert.priority === "medium"
                            ? "bg-[oklch(0.75_0.15_80)]"
                            : "bg-muted"
                    )}
                  />
                )}

                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Link href={`/daily-care/input/${alert.dogId}`} className="shrink-0">
                      <img
                        src={alert.dogPhoto || "/placeholder.jpg"}
                        alt={alert.dogName}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold">{alert.dogName || "이름 없음"}</span>
                        <Badge variant="outline" className={cn(config.bgColor, config.color, config.borderColor)}>
                          {config.label}
                        </Badge>
                      </div>

                      <div className="mb-2 flex items-center gap-2 text-sm">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{alertTypeLabels[alert.alertType]}</span>
                      </div>

                      <p className="mb-1 text-sm font-medium">{alert.title}</p>
                      <p className="mb-2 text-sm text-muted-foreground">{alert.description}</p>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(alert.createdAt)}</span>

                        {!alert.isResolved && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isResolvingId === alert.id}
                              onClick={async () => {
                                try {
                                  setIsResolvingId(alert.id)
                                  await apiClient.resolveHealthAlert(alert.id)
                                  setAlerts((current) =>
                                    current.map((item) =>
                                      item.id === alert.id
                                        ? { ...item, isResolved: true, resolvedAt: new Date().toISOString() }
                                        : item
                                    )
                                  )
                                  toast({
                                    title: "알림 해결 처리 완료",
                                    description: "건강 알림 상태가 업데이트되었습니다.",
                                  })
                                } catch (resolveError) {
                                  toast({
                                    title: "처리 실패",
                                    description:
                                      resolveError instanceof Error
                                        ? resolveError.message
                                        : "건강 알림을 해결 처리하지 못했습니다.",
                                    variant: "destructive",
                                  })
                                } finally {
                                  setIsResolvingId(null)
                                }
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              해결
                            </Button>
                            <Link href={`/daily-care/input/${alert.dogId}`}>
                              <Button size="sm">
                                기록하기
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
