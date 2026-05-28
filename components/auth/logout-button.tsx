"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { clearSession } from "@/lib/auth/session"

export function LogoutButton() {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => {
        clearSession()
        router.replace("/login")
      }}
    >
      <LogOut className="mr-2 h-4 w-4" />
      로그아웃
    </Button>
  )
}
