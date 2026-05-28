import { adoptionReadinessLabels, dogStatusLabels, vaccinationStatusLabels } from "@/lib/labels"
import type { AdoptionReadiness, DogStatus, VaccinationStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: DogStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<DogStatus, string> = {
    protected: "bg-blue-100 text-blue-700",
    adopted: "bg-green-100 text-green-700",
    temporary: "bg-amber-100 text-amber-700",
    treatment: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className
      )}
    >
      {dogStatusLabels[status]}
    </span>
  )
}

interface VaccinationBadgeProps {
  status: VaccinationStatus
  className?: string
}

export function VaccinationBadge({ status, className }: VaccinationBadgeProps) {
  const styles: Record<VaccinationStatus, string> = {
    complete: "bg-green-100 text-green-700",
    in_progress: "bg-amber-100 text-amber-700",
    not_started: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className
      )}
    >
      {vaccinationStatusLabels[status]}
    </span>
  )
}

interface ReadinessBadgeProps {
  status: AdoptionReadiness
  className?: string
}

export function ReadinessBadge({ status, className }: ReadinessBadgeProps) {
  const styles: Record<AdoptionReadiness, string> = {
    ready: "bg-green-100 text-green-700",
    missing_info: "bg-amber-100 text-amber-700",
    not_ready: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className
      )}
    >
      {adoptionReadinessLabels[status]}
    </span>
  )
}

interface ScoreBadgeProps {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const color =
    score >= 80
      ? "bg-green-100 text-green-700"
      : score >= 50
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        color,
        className
      )}
    >
      {score}%
    </span>
  )
}
