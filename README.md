# Aplikasi Absensi Guru & Staf Sekolah Berbasis Jadwal Hari

Aplikasi Web Absensi Guru modern yang dibangun dengan **Next.js (React)**, **Supabase (PostgreSQL Database)**, dan **Tailwind CSS**, serta siap didaftarkan secara gratis di **Netlify**. Aplikasi ini mengacu penuh pada panduan alur kerja `absensi_guru.csv`.

---

## 🌟 Fitur Utama (Sesuai Panduan `absensi_guru.csv`)

1. **Master Data Guru & Jadwal Hari Mengajar**:
   - Menimpan data nama guru, gelar, dan tugas/mata pelajaran.
   - Mengatur hari kerja (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu) dengan sistem centang flexibel (guru bisa mengajar di lebih dari 1 hari).

2. **Lembar Absensi Harian Otomatis Berbasis Jadwal**:
   - Memilih tanggal absensi akan **secara otomatis menyaring dan hanya menampilkan guru yang dijadwalkan hadir/mengajar pada hari tersebut**.
   - Input status kehadiran cepat:
     - **H** = Hadir (Hijau)
     - **S** = Sakit (Kuning/Oranye)
     - **I** = Izin (Biru)
     - **A** = Alfa / Tanpa Keterangan (Merah)
   - Fitur tombol **"Tandai Semua Hadir"** untuk mempercepat pengisian admin.
   - Kolom catatan / keterangan opsional untuk setiap guru.

3. **Ganti Bulan Tanpa Re-struktur (Sistem Filter Aktif)**:
   - Cukup pilih Bulan dan Tahun (misal: Oktober 2026), seluruh tanggal, data absensi historis, dan rekapitulasi akan otomatis tersinkronisasi langsung dari database.

4. **Rekapitulasi Bulanan Otomatis & Adil**:
   - Menghitung total Hadir, Sakit, Izin, dan Alfa per guru.
   - **% Kehadiran Adil**: Dihitung dari `Hadir / Hari Terisi` (sesuai jumlah hari kerja milik guru tersebut), bukan dari total hari kalender biasa.
   - **Status Kinerja Otomatis**:
     - 🟢 **Sangat Baik**: &ge; 90%
     - 🔵 **Baik**: 75% - 89%
     - 🟡 **Perlu Perhatian**: &lt; 75%
   - Ringkasan statistik kehadiran sekolah secara menyeluruh.

5. **Cetak & Ekspor Laporan Resmi**:
   - Tombol **Cetak / Ekspor PDF** dengan format laporan sekolah formal (Kop Laporan, Tabel Rekapitulasi, dan Kolom Tanda Tangan Kepala Sekolah & Operator).

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🗄️ Cara Menghubungkan Database Supabase (PostgreSQL)

Secara bawaan, aplikasi ini dilengkapi **Mode Fallback Offline (LocalStorage)** sehingga bisa langsung dicoba di browser tanpa setup database.

Untuk menghubungkan ke Supabase secara live:

1. Buat akun & proyek gratis di [Supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** di Supabase Dashboard.
3. Buka file `supabase/schema.sql` pada proyek ini, lalu **Copy & Paste** seluruh executescript ke SQL Editor Supabase, kemudian tekan tombol **Run**.
4. Buka menu **Project Settings > API** di Supabase.
5. Buat file `.env.local` di folder utama proyek dengan isi:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

---

## 🌐 Cara Deploy ke Netlify (Gratis)

1. Upload/Push repository ini ke GitHub / GitLab.
2. Login ke [Netlify.com](https://netlify.com) dan klik **"Add new site" > "Import an existing project"**.
3. Pilih repository GitHub Anda.
4. Pada bagian **Environment Variables** di Netlify, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Klik **Deploy Site**. Netlify akan membaca file `netlify.toml` secara otomatis dan mempublikasikan web Anda dalam beberapa menit!
