"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { validateStoredSession } from "@/lib/auth/session"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<"loading" | "ready">("loading")

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const session = await validateStoredSession()

      if (cancelled) return

      if (!session) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`)
        return
      }

      setStatus("ready")
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [pathname, router])

  if (status !== "ready") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">로그인 상태를 확인하는 중입니다...</div>
      </div>
    )
  }

  return <>{children}</>
}
