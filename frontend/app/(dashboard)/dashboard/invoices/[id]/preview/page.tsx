'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { invoicesApi, authApi, ApiErrorClass, getUploadUrl } from '@/lib/api'
import type { Invoice, User } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { showError } from '@/lib/toast'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function InvoicePreviewPage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const id = Number(params.id)

  useEffect(() => {
    Promise.all([
      invoicesApi.get(id),
      authApi.me(),
    ])
      .then(([inv, u]) => {
        setInvoice(inv)
        setUser(u)
        setLoading(false)
      })
      .catch((err) => {
        if (err instanceof ApiErrorClass) {
          showError(err.message, err.errors)
        }
        setLoading(false)
      })
  }, [id])

  const handleDownloadPDF = () => {
    window.open(invoicesApi.downloadPdf(id), '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <Link
            href={`/dashboard/invoices/${params.id}`}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to detail
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Preview Invoice</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Review before sending or downloading</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-indigo-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-10 max-w-3xl mx-auto">
        {/* Header: Company info (left) + INVOICE title (right) */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 pb-6 border-b-2 border-gray-200">
          <div>
            {user?.company_logo_path && (
              <img
                src={getUploadUrl(user.company_logo_path)}
                alt="Company logo"
                className="h-16 object-contain mb-3"
              />
            )}
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {user?.company_name || user?.name || '—'}
            </h2>
            {user?.company_address && (
              <p className="text-sm text-gray-500">{user.company_address}</p>
            )}
            {user?.company_phone && (
              <p className="text-sm text-gray-500">Telp: {user.company_phone}</p>
            )}
            {user?.npwp && (
              <p className="text-sm text-gray-500">NPWP: {user.npwp}</p>
            )}
          </div>
          <div className="text-left sm:text-right">
            <h3 className="text-3xl font-bold text-blue-600 tracking-tight">INVOICE</h3>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold text-gray-900">{invoice.invoice_number}</span>
            </p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase mt-2 ${statusColors[invoice.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Bill To (left) + Details (right) */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
          <div className="flex-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Bill To</h4>
            <p className="text-sm font-semibold text-gray-900">{invoice.client?.name ?? '—'}</p>
            {invoice.client?.email && (
              <p className="text-sm text-gray-600">{invoice.client.email}</p>
            )}
            {invoice.client?.phone && (
              <p className="text-sm text-gray-600">{invoice.client.phone}</p>
            )}
            {invoice.client?.address && (
              <p className="text-sm text-gray-600">{invoice.client.address}</p>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Details</h4>
            <p className="text-sm text-gray-600 mb-1">
              <span className="inline-block w-24 text-gray-500">Issue Date:</span> {formatDate(invoice.issue_date)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="inline-block w-24 text-gray-500">Due Date:</span> {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>

        {/* Items table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700" style={{ width: '40%' }}>Description</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Qty</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Unit Price</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 border-b border-gray-200">
                    No items
                  </td>
                </tr>
              ) : (
                invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-4 px-4 text-gray-700">{item.description}</td>
                    <td className="py-4 px-4 text-gray-700">{item.quantity}</td>
                    <td className="py-4 px-4 text-gray-700">{formatCurrency(item.unit_price)}</td>
                    <td className="py-4 px-4 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-[300px]">
            <div className="flex justify-between py-2 text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_percent > 0 && (
              <div className="flex justify-between py-2 text-sm text-gray-600">
                <span>Tax ({invoice.tax_percent}%)</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2 text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t border-gray-200 pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Notes</h4>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
