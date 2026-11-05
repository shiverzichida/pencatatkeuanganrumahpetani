# Aplikasi Catatan Pengeluaran Bangun Rumah - Nahel Al Fath Ichida
Proyek: Pembangunan Rumah Tinggal 2 Lantai  
Lokasi: Jalan Petani Gang Ibrahim, Kota Pontianak

Aplikasi web modern berbasis **Next.js (App Router) + Tailwind CSS + Lucide Icons**, dirancang khusus untuk memantau pengeluaran riil pembangunan rumah Anda terhadap target Rencana Anggaran Biaya (RAB: Standar Rp 357 Juta / Pesimis Rp 381,6 Juta) dan terhubung **2 arah secara otomatis ke Google Spreadsheet**.

---

## 🚀 Fitur Utama

1. **Dashboard Budget vs Realisasi Real-Time**
   - Menampilkan total dana terpakai, sisa budget, dan batas pagu aman (pesimis +10%).
   - Progress bar interaktif per kategori (Struktur, Tukang, Dinding, Atap, Finishing, dll).
2. **Form Input Cepat & Responsif**
   - Input tanggal, kategori pos biaya, nama barang/uraian, jumlah (qty), satuan, harga satuan, nama toko/penerima, dan catatan.
   - Hitung total harga otomatis.
3. **Upload / Foto Nota & Kwitansi**
   - Mendukung jepret foto langsung dari kamera HP atau upload nota/struk belanja dari galeri.
   - Tampilan pop-up preview nota untuk pemeriksaan sewaktu-waktu.
4. **Sinkronisasi 2 Arah ke Google Spreadsheet**
   - Menggunakan Google Apps Script Web App (Gratis, tanpa batasan kuota rumit, data tersimpan rapi di Google Drive Anda).
   - Tetap berfungsi secara offline/lokal jika internet terputus (LocalStorage backup).
5. **Pencarian & Filter Cepat**
   - Filter pengeluaran berdasarkan kategori pekerjaan atau cari nama toko/barang seketika.

---

## 📋 Langkah 1: Hubungkan ke Google Spreadsheet (2 Menit)

1. Buka [Google Spreadsheet](https://sheets.new) di browser Anda, beri nama (misal: `Catatan Pengeluaran Rumah - Nahel`).
2. Klik menu **Ekstensi (Extensions) > Apps Script**.
3. Hapus semua tulisan di Apps Script, lalu buka file `google-apps-script.js` yang ada di folder proyek ini, **Copy** seluruh kodenya dan **Paste** ke Apps Script.
4. Klik icon **Save (Simpan)**.
5. Klik tombol biru di kanan atas: **Terapkan (Deploy) > Penerapan baru (New deployment)**.
6. Klik ikon gerigi (Select type) > pilih **Aplikasi Web (Web App)**.
7. Konfigurasi:
   - **Description**: `Web App Pengeluaran Rumah`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone (Siapa saja)`  <-- *Penting agar aplikasi web bisa mengirim data!*
8. Klik **Deploy** > Klik **Beri akses (Authorize Access)** > Pilih akun Google Anda > Klik **Advanced** > Klik **Go to (unsafe)** > **Allow**.
9. Salin (Copy) **URL Aplikasi Web** yang berakhiran `/exec`.
10. Buka aplikasi web Anda, klik tombol **Google Sheets** di kanan atas, lalu tempelkan URL tersebut dan klik **Simpan URL**!

---

## 🌐 Langkah 2: Deploy ke Vercel (Gratis & Cepat)

### Cara A: Melalui GitHub & Vercel Dashboard (Paling Mudah)
1. Buat repository baru di [GitHub](https://github.com/new) (misal: `catatan-bangun-rumah`).
2. Di terminal folder `app-catatan-bangun`, jalankan:
   ```bash
   git add .
   git commit -m "feat: initial commit catatan bangun rumah"
   git branch -M main
   git remote add origin https://github.com/USERNAME/catatan-bangun-rumah.git
   git push -u origin main
   ```
3. Buka [Vercel](https://vercel.com), login dengan akun GitHub Anda.
4. Klik **Add New... > Project**, lalu pilih repository `catatan-bangun-rumah`.
5. Klik **Deploy**. Dalam 1 menit aplikasi Anda sudah aktif dengan domain gratis `https://catatan-bangun-rumah.vercel.app` yang bisa dibuka langsung dari HP atau laptop kapan saja!

### Cara B: Menggunakan Vercel CLI Langsung dari Komputer
1. Buka PowerShell/Terminal di dalam folder `app-catatan-bangun`:
   ```bash
   npx vercel
   ```
2. Ikuti panduan login di layar, pilih default `Yes` untuk semua pertanyaan, dan proyek langsung ter-deploy ke Vercel!

---

## 💻 Menjalankan di Komputer Lokal (Development)

```bash
cd "c:\Users\shive\Documents\work\rumah petani saya\app-catatan-bangun"
npm run dev
```
Buka browser di `http://localhost:3000`.
