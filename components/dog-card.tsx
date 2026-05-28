import Image from "next/image"
import Link from "next/link"
import { Eye, FileText } from "lucide-react"
import { ScoreBadge, StatusBadge, VaccinationBadge } from "@/components/badges"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { genderLabels } from "@/lib/labels"
import type { Dog } from "@/lib/types"

interface DogCardProps {
  dog: Dog
}

export function DogCard({ dog }: DogCardProps) {
  const imageUrl = dog.photos[0] ?? dog.primaryPhotoUrl ?? "/placeholder.jpg"

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-square">
        <Image src={imageUrl} alt={dog.name} fill className="object-cover" />
        <div className="absolute right-2 top-2">
          <StatusBadge status={dog.status} />
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{dog.name}</h3>
            <p className="text-sm text-muted-foreground">
              {dog.breed || "품종 미상"} · {dog.estimatedAge || "나이 미상"}
            </p>
          </div>
          <ScoreBadge score={dog.readinessScore} />
        </div>

        <div className="mb-3 flex items-center gap-2">
          <VaccinationBadge status={dog.vaccinationStatus} />
          <span className="text-xs text-muted-foreground">
            {genderLabels[dog.gender]} · {dog.weight}kg
          </span>
        </div>

        {dog.missingInfo.length > 0 && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2">
            <p className="text-xs font-medium text-amber-700">
              누락 정보 {dog.missingInfo.length}건
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/dogs/${dog.id}`}>
              <Eye className="mr-1 h-4 w-4" />
              상세
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link href={`/documents?dog=${dog.id}`}>
              <FileText className="mr-1 h-4 w-4" />
              문서
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
