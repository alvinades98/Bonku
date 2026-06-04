import Link from 'next/link'
import PublicStats from '@/components/PublicStats'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Invoice Profesional',
    description: 'Buat invoice dengan desain bersih dan profesional dalam hitungan menit.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Manajemen Klien',
    description: 'Simpan dan kelola data klien untuk penggunaan invoice yang lebih cepat.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75c0 .621.504 1.125 1.125 1.125h.75m-6 5.25v.75c0 .621.504 1.125 1.125 1.125h.75m6.75-9v.75c0 .621.504 1.125 1.125 1.125h.75m-6 3v.75c0 .621.504 1.125 1.125 1.125h.75m6-3v.75c0 .621.504 1.125 1.125 1.125h.75m-6 3v.75c0 .621.504 1.125 1.125 1.125h.75m12-6v.75c0 .621.504 1.125 1.125 1.125h.75m-1.5-1.5h.75c.621 0 1.125.504 1.125 1.125v.75m-9 0h.75c.621 0 1.125.504 1.125 1.125v.75m6-6.75h.75c.621 0 1.125.504 1.125 1.125v.75m-9 0h.75c.621 0 1.125.504 1.125 1.125v.75" />
      </svg>
    ),
    title: 'Perhitungan Pajak',
    description: 'Hitung PPN dan PPh secara otomatis. Support persentase pajak kustom.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L5.67 18.1a1.125 1.125 0 01-.857 1.225l-.57.128a.375.375 0 01-.445-.277L2.625 13.5m4.095-5.325c.24-.03.48-.062.72-.096m-.72.096L4.5 12.75m10.56-4.575a42.415 42.415 0 0110.56 0m-10.56 0l1.155 4.621a1.125 1.125 0 00.857.856l.57.128a.375.375 0 00.445-.277l1.173-5.678m-4.095-5.325a42.415 42.415 0 00-10.56 0m10.56 0l1.155 4.621a1.125 1.125 0 01-.857.856l-.57.128a.375.375 0 01-.445-.277L12.625 8.1m-1.5-5.325a42.415 42.415 0 00-10.56 0m10.56 0l1.155 4.621a1.125 1.125 0 01-.857.856l-.57.128a.375.375 0 01-.445-.277L7.5 8.1m6.625 5.325a42.415 42.415 0 0110.56 0" />
      </svg>
    ),
    title: 'Download PDF',
    description: 'Generate dan download invoice dalam format PDF dengan satu klik.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Dashboard & Tracking',
    description: 'Pantau status invoice — draft, terkirim, lunas, atau dibatalkan.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Aman & Privat',
    description: 'Data kamu tersimpan aman. Autentikasi JWT dengan httpOnly cookies.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="InvoiceGen" className="w-9 h-9 rounded-xl object-contain" />
              <span className="font-semibold text-slate-800">Invoice Generator</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-800 px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-sm text-indigo-700 mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Gratis untuk Freelancer & UMKM
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
              Buat Invoice Profesional{' '}
              <span className="text-indigo-600">dalam 2 Menit</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Kelola invoice, pantau pembayaran, dan impress klien dengan invoice yang terlihat profesional. 
              Cocok untuk freelancer dan UMKM di Indonesia.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-colors shadow-lg shadow-indigo-200"
              >
                Mulai Gratis &rarr;
              </Link>
              <Link
                href="/login"
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-8 py-3.5 rounded-xl text-base font-semibold transition-colors"
              >
                Sudah Punya Akun
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <PublicStats />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Fitur lengkap untuk mengelola invoice dan pembayaran bisnis kamu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">{feature.title}</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Cara Kerja
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Tiga langkah mudah untuk membuat invoice profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Daftar Akun',
                description: 'Buat akun gratis dan isi profil bisnis kamu.',
              },
              {
                step: '2',
                title: 'Buat Invoice',
                description: 'Tambahkan klien, item, dan perhitungan pajak otomatis.',
              },
              {
                step: '3',
                title: 'Kirim & Pantau',
                description: 'Download PDF dan kirim ke klien. Pantau status pembayaran.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">{item.title}</h3>
                <p className="mt-2 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-indigo-600 rounded-3xl p-10 sm:p-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Siap Membuat Invoice Pertama Kamu?
            </h2>
            <p className="mt-4 text-indigo-100 text-lg max-w-xl mx-auto">
              Daftar sekarang dan mulai buat invoice profesional untuk bisnis kamu. Gratis!
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-block bg-white hover:bg-slate-50 text-indigo-600 px-8 py-3.5 rounded-xl text-base font-semibold transition-colors"
              >
                Daftar Gratis &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="InvoiceGen" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-semibold text-slate-800">Invoice Generator</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <Link href="/legal/terms" className="hover:text-slate-700">Terms</Link>
                <Link href="/legal/privacy" className="hover:text-slate-700">Privacy</Link>
              </div>
              <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Invoice Generator. Dibuat untuk freelancer & UMKM Indonesia.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
