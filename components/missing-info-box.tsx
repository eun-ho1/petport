import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MissingInfoBoxProps {
  items: string[]
  className?: string
}

export function MissingInfoBox({ items, className }: MissingInfoBoxProps) {
  if (items.length === 0) return null

  return (
    <div className={cn("rounded-xl border border-amber-200 bg-amber-50 p-4", className)}>
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-100 p-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="mb-2 font-medium text-amber-800">
            누락된 정보 ({items.length}건)
          </h4>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
