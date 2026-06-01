'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { invoicesApi, ApiErrorClass } from '@/lib/api'
import type { Invoice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

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
  const [error, setError] = useState<string | null>(null)

  const id = Number(params.id)

  useEffect(() => {
    invoicesApi.get(id)
      .then((data) => {
        setInvoice(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err instanceof ApiErrorClass) {
          setError(err.message)
        }
        setLoading(false)
      })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    try {
      await invoicesApi.delete(id)
      router.push('/dashboard/invoices')
      router.refresh()
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        alert(err.message)
      }
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await invoicesApi.update(id, { status: newStatus })
      setInvoice(updated)
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        alert(err.message)
      }
    }
  }

  const handleDownloadPDF = () => {
    window.open(invoicesApi.downloadPdf(id), '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-slate-400">Loading...</div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Invoice not found'}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{invoice.invoice_number}</h1>
          <p className="text-slate-500 mt-1">Invoice details</p>
        </div>
        <Link
          href="/dashboard/invoices"
          className="text-slate-600 hover:text-slate-800 text-sm font-medium"
        >
          &larr; Back to invoices
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status] ?? 'bg-slate-100 text-slate-700'}`}
              >
                {invoice.status}
              </span>
              <select
                value={invoice.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500">Issue Date</p>
            <p className="text-sm font-medium text-slate-800 mt-1">{formatDate(invoice.issue_date)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Due Date</p>
            <p className="text-sm font-medium text-slate-800 mt-1">{formatDate(invoice.due_date)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Client</p>
            <p className="text-sm font-medium text-slate-800 mt-1">{invoice.client?.name ?? '—'}</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-base font-medium text-slate-800 mb-4">Items</h2>
          {invoice.items.length === 0 ? (
            <p className="text-sm text-slate-400">No items found</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-2 font-medium text-slate-600">Description</th>
                  <th className="text-right py-2 font-medium text-slate-600">Qty</th>
                  <th className="text-right py-2 font-medium text-slate-600">Price</th>
                  <th className="text-right py-2 font-medium text-slate-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{item.description}</td>
                    <td className="py-2 text-right text-slate-500">{item.quantity}</td>
                    <td className="py-2 text-right text-slate-500">{formatCurrency(item.unit_price)}</td>
                    <td className="py-2 text-right font-medium text-slate-800">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-slate-200 pt-6 mt-6 flex justify-end">
          <div className="text-right space-y-1">
            <p className="text-sm text-slate-500">Subtotal: {formatCurrency(invoice.subtotal)}</p>
            {invoice.tax_percent > 0 && (
              <p className="text-sm text-slate-500">Tax ({invoice.tax_percent}%): {formatCurrency(invoice.tax_amount)}</p>
            )}
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(invoice.total)}</p>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t border-slate-200 pt-6 mt-6">
            <h2 className="text-base font-medium text-slate-800 mb-2">Notes</h2>
            <p className="text-sm text-slate-600">{invoice.notes}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/dashboard/invoices/${id}/preview`}
          className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Preview
        </Link>
        <button
          onClick={handleDownloadPDF}
          className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Download PDF
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
