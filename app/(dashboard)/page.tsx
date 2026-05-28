import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { StatusBadge, ReadinessBadge } from "@/components/badges"
import {
  Dog,
  Plane,
  AlertTriangle,
  Stethoscope,
  PlusCircle,
  FileText,
  Search,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { sampleDogs, recentDocuments } from "@/lib/data"

export default function DashboardPage() {
  const totalDogs = sampleDogs.length
  const readyForAdoption = sampleDogs.filter(
    (d) => d.adoptionReadiness === "준비완료"
  ).length
  const missingVaccination = sampleDogs.filter(
    (d) => d.vaccinationStatus !== "완료"
  ).length
  const needsMedicalAttention = sampleDogs.filter(
    (d) => d.status === "치료중"
  ).length
  const recentDogs = sampleDogs.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
          <p className="text-muted-foreground">
            보호소 현황을 한눈에 확인하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dogs">
              <Search className="h-4 w-4 mr-2" />
              강아지 검색
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dogs/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              강아지 등록
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="전체 보호 중"
          value={totalDogs}
          description="현재 보호소에 있는 강아지"
          icon={Dog}
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="해외입양 준비완료"
          value={readyForAdoption}
          description="서류 생성 가능"
          icon={Plane}
          iconClassName="bg-green-100 text-green-600"
        />
        <StatCard
          title="예방접종 미완료"
          value={missingVaccination}
          description="접종 필요"
          icon={AlertTriangle}
          iconClassName="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="치료 필요"
          value={needsMedicalAttention}
          description="의료 관심 필요"
          icon={Stethoscope}
          iconClassName="bg-red-100 text-red-600"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">빠른 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link href="/dogs/new" className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium">강아지 등록</div>
                  <div className="text-xs text-muted-foreground">새로운 강아지 추가</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link href="/documents" className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <div className="font-medium">서류 생성</div>
                  <div className="text-xs text-muted-foreground">영문 서류 생성</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link
                href="/dogs?filter=missing"
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Search className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">누락 정보 확인</div>
                  <div className="text-xs text-muted-foreground">정보 부족 강아지</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Dogs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">최근 등록된 강아지</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dogs">
                전체 보기
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDogs.map((dog) => (
                <Link
                  key={dog.id}
                  href={`/dogs/${dog.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={dog.photos[0]}
                      alt={dog.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{dog.name}</h4>
                      <StatusBadge status={dog.status} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {dog.breed} · {dog.estimatedAge} · {dog.gender}
                    </p>
                  </div>
                  <ReadinessBadge status={dog.adoptionReadiness} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">최근 생성된 서류</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/documents">
                전체 보기
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="p-2 bg-card rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">
                        {doc.documentType}
                      </h4>
                      {doc.status === "생성완료" && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {doc.dogName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {doc.generatedAt}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adoption Flow Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">해외 입양 프로세스</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <div className="font-medium text-sm">강아지 등록</div>
                <div className="text-xs text-muted-foreground">기본 정보 입력</div>
              </div>
            </div>
            <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground mx-2" />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <div className="font-medium text-sm">건강 기록 완성</div>
                <div className="text-xs text-muted-foreground">예방접종 및 의료 기록</div>
              </div>
            </div>
            <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground mx-2" />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <div className="font-medium text-sm">서류 생성</div>
                <div className="text-xs text-muted-foreground">영문 서류 자동 생성</div>
              </div>
            </div>
            <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground mx-2" />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <div className="font-medium text-sm">PDF 다운로드</div>
                <div className="text-xs text-muted-foreground">입양 기관 전달</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
