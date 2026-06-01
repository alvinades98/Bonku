'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { dashboardApi, invoicesApi, ApiErrorClass } from '@/lib/api'
import type { DashboardStats, Invoice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      invoicesApi.list({ limit: 5 }),
    ])
      .then(([s, inv]) => {
        setStats(s)
        setInvoices(inv)
        setLoading(false)
      })
      .catch((err) => {
        if (err instanceof ApiErrorClass) {
          setError(err.message)
        }
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-slate-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
      <p className="text-slate-500 mt-1">Overview of your invoices and payments</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Invoices</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{stats?.total_invoices ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-amber-600">Outstanding</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{stats?.outstanding ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-emerald-600">Paid</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{stats?.paid ?? 0}</p>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-800">Recent Invoices</h2>
          <Link href="/dashboard/invoices" className="text-sm text-indigo-600 hover:underline">
            View all &rarr;
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="mt-3 bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-400">
            No invoices yet.{' '}
            <Link href="/dashboard/invoices/new" className="text-indigo-600 hover:underline">
              Create your first invoice
            </Link>{' '}
            to get started.
          </div>
        ) : (
          <div className="mt-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Invoice #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{inv.client?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(inv.issue_date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status] ?? 'bg-slate-100 text-slate-700'}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
