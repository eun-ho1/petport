"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DogForm } from "@/components/dogs/dog-form"
import { apiClient } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function NewDogPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <DogForm
      title="새 강아지 등록"
      description="보호소에 새로 들어온 강아지 정보를 입력해 주세요."
      submitLabel="강아지 등록"
      backHref="/dogs"
      isSubmitting={isSubmitting}
      onSubmit={async (payload) => {
        try {
          setIsSubmitting(true)
          const response = await apiClient.createDog(payload)
          toast({
            title: "등록 완료",
            description: `${response.item.name} 정보가 저장되었습니다.`,
          })
          router.push(`/dogs/${response.item.id}`)
        } catch (error) {
          toast({
            title: "등록 실패",
            description:
              error instanceof Error ? error.message : "강아지 등록 중 문제가 발생했습니다.",
            variant: "destructive",
          })
        } finally {
          setIsSubmitting(false)
        }
      }}
    />
  )
}
