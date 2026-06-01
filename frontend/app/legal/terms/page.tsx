import Link from 'next/link'

export const metadata = {
  title: 'Terms and Conditions — Invoice Generator',
  description: 'Syarat dan Ketentuan penggunaan Invoice Generator',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                IG
              </div>
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
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Terms and Conditions</h1>
        <p className="text-slate-500">Terakhir diperbarui: 1 Juni 2024</p>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Catatan:</strong> Ini adalah template Terms and Conditions. Konsultasikan dengan ahli hukum untuk memastikan kepatuhan terhadap hukum yang berlaku.
          </p>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Pendahuluan</h2>
          <p className="text-slate-600 leading-relaxed">
            Selamat datang di Invoice Generator (&quot;Layanan&quot;). Dengan mengakses atau menggunakan Layanan kami, 
            Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju, harap jangan menggunakan Layanan kami.
          </p>
          <p className="text-slate-600 leading-relaxed mt-2">
            Layanan ini dioperasikan oleh Invoice Generator (&quot;kami&quot;, &quot;kita&quot;, atau &quot;Layanan&quot;). 
            Layanan ini ditujukan untuk freelancer dan UMKM di Indonesia untuk membuat dan mengelola invoice secara digital.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Definisi</h2>
          <ul className="space-y-2 text-slate-600">
            <li><strong>&quot;Akun&quot;</strong> berarti akun yang Anda buat untuk mengakses Layanan.</li>
            <li><strong>&quot;Invoice&quot;</strong> berarti dokumen tagihan yang Anda buat melalui Layanan.</li>
            <li><strong>&quot;Klien&quot;</strong> berarti pihak ketiga yang Anda tuju dalam invoice.</li>
            <li><strong>&quot;Data Pengguna&quot;</strong> berarti informasi yang Anda berikan saat mendaftar dan menggunakan Layanan.</li>
            <li><strong>&quot;Konten&quot;</strong> berarti data, teks, gambar, logo, dan materi lain yang Anda unggah atau buat melalui Layanan.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Pendaftaran Akun</h2>
          <p className="text-slate-600 leading-relaxed">
            Untuk menggunakan fitur lengkap Layanan, Anda harus membuat akun. Anda setuju untuk:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li>Memberikan informasi yang akurat, lengkap, dan terkini saat pendaftaran.</li>
            <li>Menjaga kerahasiaan password dan akun Anda.</li>
            <li>Bertanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.</li>
            <li>Segera memberitahu kami jika Anda mencurigai adanya penggunaan yang tidak sah.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-2">
            Anda harus berusia minimal 18 tahun atau memiliki izin dari orang tua/wali untuk menggunakan Layanan ini.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Penggunaan Layanan</h2>
          <p className="text-slate-600 leading-relaxed">Anda setuju untuk tidak menggunakan Layanan untuk:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li>Membuat invoice palsu atau menyesatkan.</li>
            <li>Kegiatan yang melanggar hukum atau peraturan yang berlaku.</li>
            <li>Mengirimkan konten yang menipu, menyesatkan, atau merugikan pihak lain.</li>
            <li>Mengganggu atau merusak integritas atau kinerja Layanan.</li>
            <li>Mencoba mengakses akun atau data pengguna lain tanpa izin.</li>
            <li>Menyebarluaskan malware, virus, atau kode berbahaya lainnya.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. Kepemilikan dan Lisensi</h2>
          <p className="text-slate-600 leading-relaxed">
            <strong>Konten Anda:</strong> Anda tetap memegang hak atas Konten yang Anda buat atau unggah melalui Layanan. 
            Dengan menggunakan Layanan, Anda memberikan kami lisensi non-eksklusif untuk menyimpan, memproses, dan menampilkan 
            Konten tersebut semata-mata untuk tujuan menyediakan Layanan kepada Anda.
          </p>
          <p className="text-slate-600 leading-relaxed mt-2">
            <strong>Layanan:</strong> Layanan, termasuk semua hak kekayaan intelektual di dalamnya, adalah milik kami atau 
            pemberi lisensi kami. Anda tidak memperoleh hak kepemilikan apa pun atas Layanan.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">6. Pembayaran dan Berlangganan</h2>
          <p className="text-slate-600 leading-relaxed">
            Layanan ini saat ini tersedia secara gratis. Di masa depan, kami dapat menawarkan fitur berbayar atau berlangganan. 
            Jika Anda memilih untuk menggunakan fitur berbayar:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li>Biaya akan ditampilkan secara transparan sebelum Anda melakukan pembayaran.</li>
            <li>Pembayaran diproses melalui pihak ketiga (payment gateway).</li>
            <li>Tidak ada pengembalian dana untuk pembayaran yang telah dilakukan, kecuali ditentukan lain.</li>
            <li>Kami berhak mengubah harga dengan pemberitahuan sebelumnya.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">7. Batasan Tanggung Jawab</h2>
          <p className="text-slate-600 leading-relaxed">
            Layanan disediakan &quot;sebagaimana adanya&quot; dan &quot;sebagaimana tersedia&quot;. Kami tidak memberikan jaminan 
            bahwa Layanan akan:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
            <li>Berfungsi tanpa gangguan atau error.</li>
            <li>Aman dari serangan siber atau kerugian data.</li>
            <li>Memenuhi harapan atau kebutuhan spesifik Anda.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-2">
            Dalam batas yang diizinkan oleh hukum, kami tidak bertanggung jawab atas kerugian tidak langsung, insidental, 
            khusus, atau konsekuensial yang timbul dari penggunaan Layanan.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">8. Privasi</h2>
          <p className="text-slate-600 leading-relaxed">
            Privasi Anda penting bagi kami. Silakan baca{' '}
            <Link href="/legal/privacy" className="text-indigo-600 hover:underline">
              Kebijakan Privasi
            </Link>{' '}
            kami untuk memahami bagaimana kami mengumpulkan, menggunakan, dan melindungi Data Pengguna Anda.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">9. Pengakhiran</h2>
          <p className="text-slate-600 leading-relaxed">
            Kami berhak menangguhkan atau mengakhiri akses Anda ke Layanan kapan saja, dengan atau tanpa alasan, 
            dan dengan atau tanpa pemberitahuan, jika kami menentukan bahwa Anda telah melanggar Syarat dan Ketentuan ini.
          </p>
          <p className="text-slate-600 leading-relaxed mt-2">
            Setelah pengakhiran, hak Anda untuk menggunakan Layanan akan segera berakhir. Kami dapat menghapus Data Pengguna 
            dan Konten Anda sesuai dengan Kebijakan Privasi kami.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">10. Perubahan Syarat dan Ketentuan</h2>
          <p className="text-slate-600 leading-relaxed">
            Kami dapat mengubah Syarat dan Ketentuan ini dari waktu ke waktu. Kami akan memberitahu Anda tentang perubahan 
            material melalui email atau pemberitahuan di Layanan. Penggunaan Layanan Anda setelah perubahan berlaku 
            merupakan persetujuan Anda terhadap Syarat dan Ketentuan yang diubah.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">11. Hukum yang Berlaku</h2>
          <p className="text-slate-600 leading-relaxed">
            Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. 
            Setiap sengketa yang timbul dari atau sehubungan dengan Syarat dan Ketentuan ini akan diselesaikan 
            melalui pengadilan yang berwenang di Indonesia.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">12. Kontak</h2>
          <p className="text-slate-600 leading-relaxed">
            Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di:
          </p>
          <div className="mt-2 p-4 bg-slate-50 rounded-lg">
            <p className="text-slate-600">
              <strong>Email:</strong> support@invoicegenerator.id<br />
              <strong>Alamat:</strong> Jakarta, Indonesia
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                IG
              </div>
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
