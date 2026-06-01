import Link from 'next/link'

export default function InvoicePreviewPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Preview Invoice {params.id}</h1>
          <p className="text-slate-500 mt-1">Review before sending or downloading</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/invoices/${params.id}`}
            className="text-slate-600 hover:text-slate-800 text-sm font-medium"
          >
            &larr; Back
          </Link>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mb-3">
              IG
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Your Business Name</h2>
            <p className="text-sm text-slate-500 mt-1">Business address line 1</p>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-slate-800">INVOICE</h3>
            <p className="text-sm text-slate-500 mt-1">{params.id}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-1">Bill To:</p>
          <p className="font-medium text-slate-800">Client Name</p>
          <p className="text-sm text-slate-500">Client address</p>
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
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-400">
                No items
              </td>
            </tr>
          </tbody>
        </table>

        {/* Total */}
        <div className="border-t border-slate-200 pt-4 flex justify-end">
          <div className="w-48">
            <div className="flex justify-between py-1 text-sm text-slate-600">
              <span>Subtotal</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between py-1 text-sm text-slate-600">
              <span>Tax (11%)</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between py-2 border-t border-slate-200 mt-2 font-semibold text-slate-800">
              <span>Total</span>
              <span>Rp 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
