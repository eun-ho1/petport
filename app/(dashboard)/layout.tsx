import { AuthGuard } from "@/components/auth/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-64">
          <div className="p-4 pt-16 sm:p-6 lg:p-8 lg:pt-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
