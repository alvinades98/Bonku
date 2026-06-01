import { PropsWithChildren } from 'react'
import DashboardSidebar from './DashboardSidebar'

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="pl-64">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
