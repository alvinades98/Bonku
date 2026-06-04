import { PropsWithChildren } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="InvoiceGen" className="w-14 h-14 rounded-xl object-contain mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-slate-800">Invoice Generator</h1>
        <p className="text-slate-500 text-sm mt-1">Create professional invoices in minutes</p>
      </div>
      {children}
      <p className="mt-6 text-xs text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-600 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  )
}
