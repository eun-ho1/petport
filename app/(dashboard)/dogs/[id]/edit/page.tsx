"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DogForm } from "@/components/dogs/dog-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiClient } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import type { Dog } from "@/lib/types"

export default function EditDogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [dog, setDog] = useState<Dog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDog = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.getDog(id)
        setDog(response.item)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "강아지 정보를 불러오지 못했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDog()
  }, [id])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">강아지 정보를 불러오는 중입니다...</CardContent>
      </Card>
    )
  }

  if (error || !dog) {
    return (
      <Card>
        <CardContent className="space-y-4 py-12 text-center">
          <p className="text-destructive">{error ?? "강아지 정보를 찾을 수 없습니다."}</p>
          <Button onClick={() => router.push("/dogs")}>목록으로 돌아가기</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <DogForm
      title={`${dog.name} 정보 수정`}
      description="강아지 정보를 최신 상태로 유지해 주세요."
      submitLabel="변경사항 저장"
      backHref={`/dogs/${id}`}
      initialDog={dog}
      isSubmitting={isSubmitting}
      onSubmit={async (payload) => {
        try {
          setIsSubmitting(true)
          const response = await apiClient.updateDog(id, payload)
          toast({
            title: "수정 완료",
            description: `${response.item.name} 정보가 업데이트되었습니다.`,
          })
          router.push(`/dogs/${id}`)
        } catch (submitError) {
          toast({
            title: "수정 실패",
            description:
              submitError instanceof Error ? submitError.message : "강아지 정보를 저장하지 못했습니다.",
            variant: "destructive",
          })
        } finally {
          setIsSubmitting(false)
        }
      }}
    />
  )
}
