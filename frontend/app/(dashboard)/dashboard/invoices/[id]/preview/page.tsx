'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { invoicesApi, ApiErrorClass } from '@/lib/api'
import type { Invoice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { showError } from '@/lib/toast'

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function InvoicePreviewPage() {
  const params = useParams()
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
          showError(err.message)
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Preview Invoice</h1>
          <p className="text-slate-500 mt-1">Review before sending or downloading</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/invoices/${params.id}`}
            className="text-slate-600 hover:text-slate-800 text-sm font-medium"
          >
            &larr; Back
          </Link>
          <button
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mb-3">
              {(invoice.client?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-semibold text-slate-800">{invoice.client?.name ?? '—'}</h2>
            {invoice.client?.email && <p className="text-sm text-slate-500 mt-1">{invoice.client.email}</p>}
            {invoice.client?.phone && <p className="text-sm text-slate-500">{invoice.client.phone}</p>}
            {invoice.client?.address && <p className="text-sm text-slate-500">{invoice.client.address}</p>}
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-slate-800">INVOICE</h3>
            <p className="text-sm text-slate-500 mt-1">{invoice.invoice_number}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${statusColors[invoice.status] ?? 'bg-slate-100 text-slate-700'}`}>
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Issue Date</p>
            <p className="text-sm font-medium text-slate-800">{formatDate(invoice.issue_date)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Due Date</p>
            <p className="text-sm font-medium text-slate-800">{formatDate(invoice.due_date)}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-8">
          <thead className="border-b border-slate-200">
            <tr>
              <th className="text-left py-2 font-medium text-slate-600">Description</th>
              <th className="text-right py-2 font-medium text-slate-600">Qty</th>
              <th className="text-right py-2 font-medium text-slate-600">Price</th>
              <th className="text-right py-2 font-medium text-slate-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No items
                </td>
              </tr>
            ) : (
              invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">{item.description}</td>
                  <td className="py-2 text-right text-slate-500">{item.quantity}</td>
                  <td className="py-2 text-right text-slate-500">{formatCurrency(item.unit_price)}</td>
                  <td className="py-2 text-right font-medium text-slate-800">{formatCurrency(item.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Total */}
        <div className="border-t border-slate-200 pt-4 flex justify-end">
          <div className="w-48">
            <div className="flex justify-between py-1 text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_percent > 0 && (
              <div className="flex justify-between py-1 text-sm text-slate-600">
                <span>Tax ({invoice.tax_percent}%)</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-t border-slate-200 mt-2 font-semibold text-slate-800">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t border-slate-200 mt-6 pt-4">
            <p className="text-sm text-slate-500 mb-1">Notes</p>
            <p className="text-sm text-slate-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
