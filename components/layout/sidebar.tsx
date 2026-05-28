"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertTriangle,
  ClipboardCheck,
  Dog,
  FileText,
  LayoutDashboard,
  Menu,
  PlusCircle,
  Settings,
  X,
} from "lucide-react"
import { LogoutButton } from "@/components/auth/logout-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "대시보드", href: "/", icon: LayoutDashboard },
  { name: "일일 케어", href: "/daily-care", icon: ClipboardCheck },
  { name: "건강 알림", href: "/daily-care/alerts", icon: AlertTriangle },
  { name: "강아지 목록", href: "/dogs", icon: Dog },
  { name: "강아지 등록", href: "/dogs/new", icon: PlusCircle },
  { name: "문서 생성", href: "/documents", icon: FileText },
  { name: "설정", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="bg-card"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-border px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Dog className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">PawBridge</h1>
              <p className="text-xs text-muted-foreground">보호소 관리 시스템</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="space-y-3 border-t border-border px-6 py-4">
            <LogoutButton />
            <p className="text-xs text-muted-foreground">Signed in shelter workspace</p>
          </div>
        </div>
      </aside>
    </>
  )
}
