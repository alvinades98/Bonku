'use client'

import { PropsWithChildren, useState } from 'react'
import DashboardSidebar from './DashboardSidebar'

export default function DashboardLayout({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50/80">
      <DashboardSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="InvoiceGen" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-bold text-slate-800 tracking-tight">InvoiceGen</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8 xl:px-14">
          {children}
        </div>
      </main>
    </div>
  )
}
