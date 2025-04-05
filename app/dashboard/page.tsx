import { AuthCheck } from "@/components/auth-check"
import { DashboardContent } from "@/components/dashboard-content"

export default function Dashboard() {
  return (
    <AuthCheck>
      <DashboardContent />
    </AuthCheck>
  )
}

