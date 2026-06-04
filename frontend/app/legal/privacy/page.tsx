import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Invoice Generator',
  description: 'Kebijakan Privasi Invoice Generator',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="InvoiceGen" className="w-9 h-9 rounded-xl object-contain" />
              <span className="font-semibold text-slate-800">Invoice Generator</span>
            </Link>
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-800">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500">Terakhir diperbarui: 1 Juni 2024</p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Pendahuluan</h2>
          <p className="text-slate-600 leading-relaxed">
            Invoice Generator (&quot;kami&quot;, &quot;kita&quot;, atau &quot;Layanan&quot;) berkomitmen untuk melindungi privasi Anda. 
            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda 
            saat Anda menggunakan layanan kami.
          </p>
          <p className="text-slate-600 leading-relaxed mt-2">
            Dengan menggunakan Layanan kami, Anda menyetujui pengumpulan dan penggunaan data sesuai dengan Kebijakan Privasi ini.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Data yang Kami Kumpulkan</h2>
          <p className="text-slate-600 leading-relaxed">Kami mengumpulkan beberapa jenis data untuk menyediakan dan meningkatkan Layanan:</p>

          <h3 className="text-lg font-medium text-slate-700 mt-6 mb-2">2.1 Data yang Anda Berikan</h3>
          <ul className="list-disc pl-6 space-y-1 text-slate-600">
            <li><strong>Data Akun:</strong> Nama lengkap, alamat email, dan password.</li>
            <li><strong>Data Bisnis:</strong> Nama bisnis, alamat bisnis, nomor telepon, NPWP.</li>
            <li><strong>Data Klien:</strong> Informasi klien yang Anda tambahkan (nama, email, telepon, alamat).</li>
            <li><strong>Logo:</strong> File logo bisnis yang Anda unggah.</li>
          </ul>

          <h3 className="text-lg font-medium text-slate-700 mt-6 mb-2">2.2 Data yang Dikumpulkan Otomatis</h3>
          <ul className="list-disc pl-6 space-y-1 text-slate-600">
            <li><strong>Data Log:</strong> Alamat IP, jenis browser, sistem operasi, waktu akses.</li>
            <li><strong>Cookie:</strong> Token autentikasi (httpOnly cookie), preferensi sesi.</li>
            <li><strong>Data Penggunaan:</strong> Halaman yang dikunjungi, fitur yang digunakan.</li>
          </ul>

          <h3 className="text-lg font-medium text-slate-700 mt-6 mb-2">2.3 Data Invoice</h3>
          <ul className="list-disc pl-6 space-y-1 text-slate-600">
            <li>Nomor invoice, tanggal, jumlah, item, catatan.</li>
            <li>Status invoice (draft, terkirim, lunas, dibatalkan).</li>
            <li>File PDF invoice yang di-generate.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Tujuan Penggunaan Data</h2>
          <p className="text-slate-600 leading-relaxed">Kami menggunakan data yang dikumpulkan untuk:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li>Menyediakan, mengoperasikan, dan memelihara Layanan.</li>
            <li>Membuat, mengelola, dan menyimpan invoice Anda.</li>
            <li>Menghasilkan file PDF invoice.</li>
            <li>Mengautentikasi identitas Anda dan mengamankan akun.</li>
            <li>Mengirimkan pemberitahuan terkait Layanan (misalnya, pemberitahuan keamanan).</li>
            <li>Meningkatkan dan mengoptimalkan Layanan.</li>
            <li>Mematuhi kewajiban hukum yang berlaku.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Dasar Hukum Pemrosesan</h2>
          <p className="text-slate-600 leading-relaxed">
            Sesuai dengan UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi, kami memproses data pribadi Anda berdasarkan:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li><strong>Persetujuan:</strong> Anda memberikan persetujuan saat mendaftar dan menggunakan Layanan.</li>
            <li><strong>Kontrak:</strong> Pemrosesan diperlukan untuk melaksanakan perjanjian layanan dengan Anda.</li>
            <li><strong>Kepentingan Sah:</strong> Pemrosesan diperlukan untuk kepentingan sah kami dalam menyediakan Layanan.</li>
            <li><strong>Kewajiban Hukum:</strong> Pemrosesan diperlukan untuk mematuhi kewajiban hukum.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. Penyimpanan dan Keamanan Data</h2>
          <h3 className="text-lg font-medium text-slate-700 mt-4 mb-2">5.1 Penyimpanan</h3>
          <ul className="list-disc pl-6 space-y-1 text-slate-600">
            <li>Data disimpan di server yang berlokasi di Indonesia.</li>
            <li>Password di-hash menggunakan algoritma bcrypt.</li>
            <li>Token autentikasi disimpan dalam httpOnly cookies untuk mencegah XSS.</li>
            <li>File logo disimpan dalam volume Docker yang terisolasi.</li>
          </ul>

          <h3 className="text-lg font-medium text-slate-700 mt-4 mb-2">5.2 Keamanan</h3>
          <p className="text-slate-600 leading-relaxed">
            Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi data Anda:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li>Enkripsi data saat transit (HTTPS/TLS).</li>
            <li>Hash password dengan bcrypt.</li>
            <li>httpOnly cookies untuk token JWT.</li>
            <li>Akses terbatas ke data pengguna (user-scoped).</li>
            <li>Monitoring dan logging untuk mendeteksi aktivitas mencurigakan.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">6. Berbagi Data</h2>
          <p className="text-slate-600 leading-relaxed">
            Kami <strong>tidak menjual</strong> data pribadi Anda kepada pihak ketiga. Kami hanya membagikan data dalam situasi berikut:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li><strong>Penyedia Layanan:</strong> Dengan pihak ketiga yang membantu mengoperasikan Layanan (misalnya, hosting, database), dengan perjanjian kerahasiaan.</li>
            <li><strong>Kewajiban Hukum:</strong> Jika diwajibkan oleh hukum, perintah pengadilan, atau proses hukum lainnya.</li>
            <li><strong>Perlindungan Hak:</strong> Untuk melindungi hak, properti, atau keselamatan kami, pengguna kami, atau publik.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">7. Hak Anda</h2>
          <p className="text-slate-600 leading-relaxed">
            Sesuai UU PDP, Anda memiliki hak berikut terkait data pribadi Anda:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li><strong>Hak Akses:</strong> Meminta salinan data pribadi yang kami simpan tentang Anda.</li>
            <li><strong>Hak Koreksi:</strong> Meminta perbaikan data yang tidak akurat atau tidak lengkap.</li>
            <li><strong>Hak Penghapusan:</strong> Meminta penghapusan data pribadi Anda.</li>
            <li><strong>Hak Pembatasan:</strong> Meminta pembatasan pemrosesan data pribadi Anda.</li>
            <li><strong>Hak Portabilitas:</strong> Menerima data Anda dalam format yang terstruktur dan umum digunakan.</li>
            <li><strong>Hak Keberatan:</strong> Menentang pemrosesan data pribadi Anda untuk tujuan tertentu.</li>
            <li><strong>Hak Penarikan Persetujuan:</strong> Menarik persetujuan kapan saja (tidak mempengaruhi keabsahan pemrosesan sebelumnya).</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-2">
            Untuk menggunakan hak-hak ini, silakan hubungi kami di <strong>support@invoicegenerator.id</strong>.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">8. Retensi Data</h2>
          <p className="text-slate-600 leading-relaxed">
            Kami menyimpan data pribadi Anda selama:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li>Akun Anda aktif dan menggunakan Layanan.</li>
            <li>Diperlukan untuk mematuhi kewajiban hukum (misalnya, kewajiban perpajakan).</li>
            <li>Diperlukan untuk menyelesaikan sengketa atau menegakkan perjanjian kami.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-2">
            Setelah periode retensi berakhir, data akan dihapus atau dianonimkan secara aman.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">9. Cookie</h2>
          <p className="text-slate-600 leading-relaxed">
            Kami menggunakan cookie untuk:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li><strong>Autentikasi:</strong> Token JWT disimpan dalam httpOnly cookie (tidak dapat diakses oleh JavaScript).</li>
            <li><strong>Sesi:</strong> Menjaga status login Anda selama menggunakan Layanan.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-2">
            Anda dapat mengatur browser untuk menolak cookie, tetapi ini dapat mempengaruhi fungsionalitas Layanan.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">10. Layanan Pihak Ketiga</h2>
          <p className="text-slate-600 leading-relaxed">
            Layanan kami dapat berisi tautan ke situs web pihak ketiga. Kebijakan Privasi ini tidak berlaku untuk situs web pihak ketiga. 
            Kami menyarankan Anda untuk membaca kebijakan privasi setiap situs web yang Anda kunjungi.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">11. Perubahan Kebijakan Privasi</h2>
          <p className="text-slate-600 leading-relaxed">
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberitahu Anda tentang perubahan material 
            melalui email atau pemberitahuan di Layanan. Tanggal &quot;Terakhir diperbarui&quot; di bagian atas menunjukkan kapan 
            kebijakan ini terakhir direvisi.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">12. Kontak</h2>
          <p className="text-slate-600 leading-relaxed">
            Jika Anda memiliki pertanyaan atau permintaan terkait Kebijakan Privasi ini atau data pribadi Anda, silakan hubungi:
          </p>
          <div className="mt-2 p-4 bg-slate-50 rounded-lg">
            <p className="text-slate-600">
              <strong>Email:</strong> support@invoicegenerator.id<br />
              <strong>Alamat:</strong> Jakarta, Indonesia<br />
              <strong>Subjek Email:</strong> Privacy Request
            </p>
          </div>
          <p className="text-slate-600 leading-relaxed mt-2">
            Kami akan merespons permintaan Anda dalam waktu 14 hari kerja.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="InvoiceGen" className="w-7 h-7 rounded-lg object-contain" />
              <span className="font-medium text-slate-700">Invoice Generator</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <Link href="/legal/terms" className="hover:text-slate-700">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-slate-700">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
