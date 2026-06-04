'use client'

import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

function formatNumber(n: number): string {
  if (n >= 1000) {
    const rounded = Math.floor(n / 100) * 100
    return rounded.toLocaleString('id-ID') + '+'
  }
  if (n >= 100) {
    return Math.floor(n / 10) * 10 + '+'
  }
  return String(n)
}

export default function PublicStats() {
  const [stats, setStats] = useState<{ total_invoices: number; total_users: number } | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/stats/public`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
  }, [])

  const items = [
    {
      label: 'Invoice Terbuat',
      value: stats ? formatNumber(stats.total_invoices) : '—',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      label: 'Pengguna Aktif',
      value: stats ? formatNumber(stats.total_users) : '—',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: 'Waktu Pembuatan',
      value: '< 2 min',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.label} className="text-center px-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-3">
            {item.icon}
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-indigo-600">{item.value}</p>
          <p className="mt-1 text-sm text-slate-600">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
