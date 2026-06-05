'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'

interface QuickItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
}

interface SenderInfo {
  name: string
  email: string
  phone: string
  address: string
}

interface ClientInfo {
  name: string
  email: string
  phone: string
  address: string
}

const today = new Date()
const due = new Date()
due.setDate(today.getDate() + 30)

const defaultItems: QuickItem[] = [
  { id: 1, description: '', quantity: 1, unitPrice: 0 },
]

const smallInputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white'

export default function QuickInvoiceGenerator() {
  const router = useRouter()
  const [sender, setSender] = useState<SenderInfo>({ name: '', email: '', phone: '', address: '' })
  const [client, setClient] = useState<ClientInfo>({ name: '', email: '', phone: '', address: '' })
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${String(Date.now()).slice(-6)}`)
  const [issueDate, setIssueDate] = useState(today.toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(due.toISOString().split('T')[0])
  const [items, setItems] = useState<QuickItem[]>(defaultItems)
  const [taxPercent, setTaxPercent] = useState(0)
  const [notes, setNotes] = useState('')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const previewRef = useRef<HTMLDivElement>(null)

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * (taxPercent / 100)
  const total = subtotal + taxAmount

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: number, field: keyof QuickItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handlePrintPDF = () => {
    const validItems = items.filter((i) => i.description.trim())
    const rows = validItems
      .map(
        (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;">${item.description}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${formatCurrency(item.quantity * item.unitPrice)}</td>
        </tr>`
      )
      .join('')

    const html = `<!DOCTYPE html><html><head><title>Invoice ${invoiceNumber}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1e293b; padding:40px; max-width:800px; margin:0 auto; }
  @media print { body { padding:20px; } }
</style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #e2e8f0;">
    <div>
      <h1 style="font-size:22px;font-weight:700;margin-bottom:4px;">${sender.name || 'Your Business Name'}</h1>
      ${sender.address ? `<p style="color:#64748b;font-size:13px;">${sender.address}</p>` : ''}
      ${sender.phone ? `<p style="color:#64748b;font-size:13px;">Phone: ${sender.phone}</p>` : ''}
      ${sender.email ? `<p style="color:#64748b;font-size:13px;">${sender.email}</p>` : ''}
    </div>
    <div style="text-align:right;">
      <h2 style="font-size:32px;font-weight:800;color:#4f46e5;letter-spacing:-1px;">INVOICE</h2>
      <p style="font-size:14px;font-weight:600;margin-top:4px;">${invoiceNumber}</p>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-bottom:32px;">
    <div>
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">Bill To</p>
      <p style="font-weight:600;">${client.name || '—'}</p>
      ${client.email ? `<p style="color:#64748b;font-size:13px;">${client.email}</p>` : ''}
      ${client.phone ? `<p style="color:#64748b;font-size:13px;">${client.phone}</p>` : ''}
      ${client.address ? `<p style="color:#64748b;font-size:13px;">${client.address}</p>` : ''}
    </div>
    <div>
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">Details</p>
      <p style="font-size:13px;color:#64748b;"><span style="color:#94a3b8;">Issued:</span> ${issueDate ? formatDate(issueDate) : '—'}</p>
      <p style="font-size:13px;color:#64748b;"><span style="color:#94a3b8;">Due:</span> ${dueDate ? formatDate(dueDate) : '—'}</p>
    </div>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
    <thead><tr style="background:#f1f5f9;">
      <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:600;text-transform:uppercase;color:#475569;width:40%;">Description</th>
      <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:600;text-transform:uppercase;color:#475569;">Qty</th>
      <th style="text-align:right;padding:10px 12px;font-size:11px;font-weight:600;text-transform:uppercase;color:#475569;">Rate</th>
      <th style="text-align:right;padding:10px 12px;font-size:11px;font-weight:600;text-transform:uppercase;color:#475569;">Amount</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="display:flex;justify-content:flex-end;margin-bottom:32px;">
    <div style="width:260px;">
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#64748b;"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
      ${taxPercent > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#64748b;"><span>Tax (${taxPercent}%)</span><span>${formatCurrency(taxAmount)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #1e293b;margin-top:8px;font-size:18px;font-weight:700;"><span>Total</span><span>${formatCurrency(total)}</span></div>
    </div>
  </div>
  ${notes ? `<div style="border-top:1px solid #e2e8f0;padding-top:20px;"><p style="font-size:11px;font-weight:600;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">Notes</p><p style="font-size:14px;color:#64748b;">${notes}</p></div>` : ''}
</body></html>`

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => printWindow.print(), 300)
    }
  }

  const handleShowDownloadOptions = () => {
    setShowDownloadModal(true)
  }

  useEffect(() => {
    if (showPreviewModal || showDownloadModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showPreviewModal])

  const InvoicePreview = ({ isModal = false }: { isModal?: boolean }) => (
    <div
      ref={isModal ? previewRef : undefined}
      className={`bg-white ${isModal ? 'p-6 sm:p-10' : 'p-5 sm:p-8'} ${!isModal ? 'rounded-2xl border border-slate-200 shadow-sm' : ''}`}
    >
      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start gap-4 ${isModal ? 'mb-8 pb-6' : 'mb-6 pb-5'} border-b-2 border-slate-200`}>
        <div>
          <h2 className={`${isModal ? 'text-xl' : 'text-lg'} font-bold text-slate-900 mb-1`}>
            {sender.name || 'Your Business Name'}
          </h2>
          {sender.address && <p className="text-sm text-slate-500">{sender.address}</p>}
          {sender.phone && <p className="text-sm text-slate-500">Phone: {sender.phone}</p>}
          {sender.email && <p className="text-sm text-slate-500">{sender.email}</p>}
        </div>
        <div className="text-left sm:text-right">
          <h3 className={`${isModal ? 'text-3xl' : 'text-2xl'} font-bold text-indigo-600 tracking-tight`}>INVOICE</h3>
          <p className="text-sm text-slate-600 mt-1 font-semibold">{invoiceNumber || 'INV-000'}</p>
        </div>
      </div>

      {/* Bill To + Details */}
      <div className={`flex flex-col sm:flex-row justify-between gap-6 ${isModal ? 'mb-8' : 'mb-6'}`}>
        <div className="flex-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Bill To</h4>
          <p className="text-sm font-semibold text-slate-900">{client.name || '—'}</p>
          {client.email && <p className="text-sm text-slate-600">{client.email}</p>}
          {client.phone && <p className="text-sm text-slate-600">{client.phone}</p>}
          {client.address && <p className="text-sm text-slate-600">{client.address}</p>}
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Details</h4>
          <p className="text-sm text-slate-600 mb-1">
            <span className="inline-block w-20 text-slate-400">Issued:</span>{' '}
            {issueDate ? formatDate(issueDate) : '—'}
          </p>
          <p className="text-sm text-slate-600">
            <span className="inline-block w-20 text-slate-400">Due:</span>{' '}
            {dueDate ? formatDate(dueDate) : '—'}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className={`${isModal ? 'mb-8' : 'mb-6'} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600" style={{ width: '40%' }}>
                Description
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Qty</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Rate</th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.filter((i) => i.description.trim()).length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400 border-b border-slate-200">
                  Add items to see preview
                </td>
              </tr>
            ) : (
              items
                .filter((i) => i.description.trim())
                .map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-3 px-3 text-slate-700">{item.description}</td>
                    <td className="py-3 px-3 text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-3 text-slate-700">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-900">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className={`w-full ${isModal ? 'sm:w-[300px]' : 'sm:w-64'}`}>
          <div className="flex justify-between py-1.5 text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {taxPercent > 0 && (
            <div className="flex justify-between py-1.5 text-sm text-slate-600">
              <span>Tax ({taxPercent}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-2 border-slate-900 mt-2 text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Notes</h4>
          <p className="text-sm text-slate-600">{notes}</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      <div>
        {/* Mobile Tab Toggle */}
        <div className="flex sm:hidden bg-slate-100 rounded-xl p-1 mb-4">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'edit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Edit Invoice
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className={`space-y-4 ${activeTab === 'preview' ? 'hidden sm:block' : ''}`}>
            {/* From */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">From</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your name / Business"
                  value={sender.name}
                  onChange={(e) => setSender({ ...sender, name: e.target.value })}
                  className={smallInputClass}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={sender.email}
                  onChange={(e) => setSender({ ...sender, email: e.target.value })}
                  className={smallInputClass}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={sender.phone}
                  onChange={(e) => setSender({ ...sender, phone: e.target.value })}
                  className={smallInputClass}
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={sender.address}
                  onChange={(e) => setSender({ ...sender, address: e.target.value })}
                  className={smallInputClass}
                />
              </div>
            </div>

            {/* Bill To */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Bill To</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Client name"
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  className={smallInputClass}
                />
                <input
                  type="email"
                  placeholder="Client email"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  className={smallInputClass}
                />
                <input
                  type="text"
                  placeholder="Client phone"
                  value={client.phone}
                  onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  className={smallInputClass}
                />
                <input
                  type="text"
                  placeholder="Client address"
                  value={client.address}
                  onChange={(e) => setClient({ ...client, address: e.target.value })}
                  className={smallInputClass}
                />
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Invoice Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Invoice #</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className={smallInputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className={smallInputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={smallInputClass}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2.5 bg-slate-50 rounded-xl"
                  >
                    <span className="text-xs font-medium text-slate-400 w-5 hidden sm:block">{index + 1}</span>
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '')
                          updateItem(item.id, 'quantity', digits ? parseInt(digits) : 0)
                        }}
                        className="w-full sm:w-16 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      />
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Rate"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d.]/g, '')
                          const num = Number(raw.replace(/^0+(?=\d)/, ''))
                          if (!isNaN(num)) updateItem(item.id, 'unitPrice', num)
                        }}
                        className="w-full sm:w-28 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                        disabled={items.length === 1}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tax (%)</label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    min={0}
                    max={100}
                    className="w-full sm:w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  />
                </div>
                <div className="w-full sm:w-56 space-y-1">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {taxPercent > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Tax ({taxPercent}%)</span>
                      <span className="font-medium">{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-1">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Notes</h3>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, bank details, etc."
                className={smallInputClass}
              />
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className={`${activeTab === 'edit' ? 'hidden sm:block' : ''}`}>
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Live Preview</h3>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                  Full Preview
                </button>
              </div>
              <InvoicePreview />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Preview
                </button>
                <button
                  onClick={handleShowDownloadOptions}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-indigo-200 inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto">
          <div className="relative w-full max-w-3xl mx-4 my-8">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm rounded-t-2xl px-5 py-3 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Invoice Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShowDownloadOptions}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Modal Body */}
            <div className="bg-slate-100 rounded-b-2xl p-4 sm:p-8">
              <InvoicePreview isModal />
            </div>
          </div>
        </div>
      )}

      {/* Download Options Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Download Invoice PDF</h3>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">Pilih cara download invoice kamu</p>
            </div>

            <div className="p-6">
              {/* Comparison Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Fitur</th>
                      <th className="text-center py-3 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wider w-24">Tanpa Login</th>
                      <th className="text-center py-3 px-3 font-semibold text-indigo-600 text-xs uppercase tracking-wider w-24 bg-indigo-50">Dengan Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-100">
                      <td className="py-2.5 px-4 text-slate-700">Download PDF</td>
                      <td className="py-2.5 px-3 text-center text-emerald-500">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-500 bg-indigo-50/50">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="py-2.5 px-4 text-slate-700">Simpan riwayat invoice</td>
                      <td className="py-2.5 px-3 text-center text-red-400">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-500 bg-indigo-50/50">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="py-2.5 px-4 text-slate-700">Manajemen klien</td>
                      <td className="py-2.5 px-3 text-center text-red-400">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-500 bg-indigo-50/50">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="py-2.5 px-4 text-slate-700">Dashboard & tracking status</td>
                      <td className="py-2.5 px-3 text-center text-red-400">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-500 bg-indigo-50/50">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="py-2.5 px-4 text-slate-700">Logo bisnis di invoice</td>
                      <td className="py-2.5 px-3 text-center text-red-400">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-500 bg-indigo-50/50">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="py-2.5 px-4 text-slate-700">Nomor invoice auto-generate</td>
                      <td className="py-2.5 px-3 text-center text-red-400">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-500 bg-indigo-50/50">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowDownloadModal(false)
                    handlePrintPDF()
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PDF (Gratis)
                </button>
                <button
                  onClick={() => {
                    setShowDownloadModal(false)
                    router.push('/register')
                  }}
                  className="w-full bg-white border border-slate-300 text-slate-700 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Daftar Gratis untuk Fitur Lengkap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
