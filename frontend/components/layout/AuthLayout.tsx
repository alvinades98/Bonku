import { PropsWithChildren } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl text-white font-bold text-lg mb-3">
          IG
        </div>
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
