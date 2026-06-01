'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { authApi, ApiErrorClass } from '@/lib/api'
import { useStore } from '@/lib/store'
import type { User } from '@/lib/types'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/invoices', label: 'Invoices' },
  { href: '/dashboard/clients', label: 'Clients' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useStore((s) => s.user)
  const setUser = useStore((s) => s.setUser)
  const clear = useStore((s) => s.clear)
  const [loading, setLoading] = useState(!user)

  useEffect(() => {
    if (!user) {
      authApi.me()
        .then((u) => {
          setUser(u)
          setLoading(false)
        })
        .catch((err) => {
          if (err instanceof ApiErrorClass && err.status === 401) {
            router.push('/login')
          }
          setLoading(false)
        })
    }
  }, [user, setUser, router])

  const handleSignOut = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore errors on logout
    }
    clear()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40">
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-slate-400">Loading...</div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
          IG
        </div>
        <span className="font-semibold text-slate-800">Invoice Generator</span>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
        {user && (
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-slate-700 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
