"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, FileText, Filter, LayoutGrid, List, Search, RefreshCw } from "lucide-react"
import { ReadinessBadge, ScoreBadge, StatusBadge, VaccinationBadge } from "@/components/badges"
import { DogCard } from "@/components/dog-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiClient } from "@/lib/api/client"
import { adoptionReadinessLabels, dogStatusLabels, genderLabels, vaccinationStatusLabels } from "@/lib/labels"
import type { AdoptionReadiness, Dog, DogStatus, Gender, VaccinationStatus } from "@/lib/types"

export default function DogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [vaccinationFilter, setVaccinationFilter] = useState<string>("all")
  const [readinessFilter, setReadinessFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const fetchDogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getDogs()
      setDogs(response.items)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "강아지 목록을 불러오지 못했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchDogs()
  }, [])

  const filteredDogs = useMemo(() => {
    return dogs.filter((dog) => {
      const matchesSearch =
        dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dog.breed.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || dog.status === statusFilter
      const matchesGender = genderFilter === "all" || dog.gender === genderFilter
      const matchesVaccination = vaccinationFilter === "all" || dog.vaccinationStatus === vaccinationFilter
      const matchesReadiness = readinessFilter === "all" || dog.adoptionReadiness === readinessFilter
      return matchesSearch && matchesStatus && matchesGender && matchesVaccination && matchesReadiness
    })
  }, [dogs, genderFilter, readinessFilter, searchQuery, statusFilter, vaccinationFilter])

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setGenderFilter("all")
    setVaccinationFilter("all")
    setReadinessFilter("all")
  }

  const hasActiveFilters =
    Boolean(searchQuery) ||
    statusFilter !== "all" ||
    genderFilter !== "all" ||
    vaccinationFilter !== "all" ||
    readinessFilter !== "all"

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">강아지 목록</h1>
          <p className="text-muted-foreground">
            전체 {dogs.length}마리 중 {filteredDogs.length}마리 표시
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchDogs()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
          <Button asChild>
            <Link href="/dogs/new">강아지 등록</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="이름 또는 품종으로 검색"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">필터:</span>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="보호 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  {(["protected", "temporary", "treatment", "adopted"] as DogStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {dogStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="성별" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 성별</SelectItem>
                  {(["male", "female", "unknown"] as Gender[]).map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {genderLabels[gender]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={vaccinationFilter} onValueChange={setVaccinationFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="예방접종" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 접종 상태</SelectItem>
                  {(["complete", "in_progress", "not_started"] as VaccinationStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {vaccinationStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={readinessFilter} onValueChange={setReadinessFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="입양 준비도" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 준비도</SelectItem>
                  {(["ready", "missing_info", "not_ready"] as AdoptionReadiness[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {adoptionReadinessLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  필터 초기화
                </Button>
              )}

              <div className="ml-auto flex items-center gap-1 rounded-lg border p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">강아지 목록을 불러오는 중입니다...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => void fetchDogs()}>다시 시도</Button>
          </CardContent>
        </Card>
      ) : filteredDogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            검색 조건에 맞는 강아지가 없습니다.
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>강아지</TableHead>
                <TableHead>품종</TableHead>
                <TableHead>보호 상태</TableHead>
                <TableHead>예방접종</TableHead>
                <TableHead>입양 준비도</TableHead>
                <TableHead>점수</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDogs.map((dog) => {
                const imageUrl = dog.photos[0] ?? dog.primaryPhotoUrl ?? "/placeholder.jpg"

                return (
                  <TableRow key={dog.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                          <Image src={imageUrl} alt={dog.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">{dog.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {genderLabels[dog.gender]} · {dog.estimatedAge || "나이 미상"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{dog.breed || "품종 미상"}</TableCell>
                    <TableCell>
                      <StatusBadge status={dog.status} />
                    </TableCell>
                    <TableCell>
                      <VaccinationBadge status={dog.vaccinationStatus} />
                    </TableCell>
                    <TableCell>
                      <ReadinessBadge status={dog.adoptionReadiness} />
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={dog.readinessScore} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dogs/${dog.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/documents?dog=${dog.id}`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
