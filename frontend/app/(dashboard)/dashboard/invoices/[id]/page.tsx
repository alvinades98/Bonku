'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { invoicesApi, ApiErrorClass } from '@/lib/api'
import type { Invoice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { showSuccess, showError, showConfirm } from '@/lib/toast'

const statusColors: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  const id = Number(params.id)

  useEffect(() => {
    invoicesApi.get(id)
      .then((data) => {
        setInvoice(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err instanceof ApiErrorClass) {
          showError(err.message, err.errors)
        }
        setLoading(false)
      })
  }, [id])

  const handleDelete = async () => {
    const confirmed = await showConfirm('Are you sure you want to delete this invoice?')
    if (!confirmed) return
    try {
      await invoicesApi.delete(id)
      showSuccess('Invoice deleted successfully')
      router.push('/dashboard/invoices')
      router.refresh()
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        showError(err.message, err.errors)
      }
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await invoicesApi.update(id, { status: newStatus })
      setInvoice(updated)
      showSuccess(`Status updated to ${newStatus}`)
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        showError(err.message, err.errors)
      }
    }
  }

  const handleDownloadPDF = () => {
    window.open(invoicesApi.downloadPdf(id), '_blank')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mt-3" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse" />
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
            href="/dashboard/invoices"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to invoices
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{invoice.invoice_number}</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[invoice.status] ?? 'bg-slate-100 text-slate-700'}`}
          >
            {invoice.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Client</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{invoice.client?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Issue Date</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{formatDate(invoice.issue_date)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Due Date</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{formatDate(invoice.due_date)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{formatCurrency(invoice.total)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Items</h2>
          {invoice.items.length === 0 ? (
            <p className="text-sm text-slate-400">No items found</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Description</th>
                      <th className="text-right py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Qty</th>
                      <th className="text-right py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Price</th>
                      <th className="text-right py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 text-slate-700">{item.description}</td>
                        <td className="py-3 text-right text-slate-500">{item.quantity}</td>
                        <td className="py-3 text-right text-slate-500">{formatCurrency(item.unit_price)}</td>
                        <td className="py-3 text-right font-semibold text-slate-800">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile items */}
              <div className="sm:hidden space-y-3">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.quantity} x {formatCurrency(item.unit_price)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 p-6 flex justify-end">
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_percent > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax ({invoice.tax_percent}%)</span>
                <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-slate-200">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-base font-bold text-slate-900">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t border-slate-100 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-2">Notes</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{invoice.notes}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/dashboard/invoices/${id}/preview`}
          className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Preview
        </Link>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  )
}
