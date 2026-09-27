-- SCHEMA UNTUK SISTEM ABSENSI GURU BERBASIS JADWAL HARI
-- Gunakan skrip ini langsung di SQL Editor Supabase Anda.

-- 1. Tabel Pegawai (Guru & Staff)
CREATE TABLE IF NOT EXISTS public.pegawai (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    keterangan VARCHAR(255),
    jadwal TEXT[] NOT NULL DEFAULT '{}', -- Array hari: ['Senin', 'Selasa', dst]
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Buat indeks untuk pencarian nama pegawai
CREATE INDEX IF NOT EXISTS idx_pegawai_nama ON public.pegawai(nama);

-- 2. Tabel Absensi Harian
CREATE TABLE IF NOT EXISTS public.absensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pegawai_id UUID NOT NULL REFERENCES public.pegawai(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    status VARCHAR(1) NOT NULL CHECK (status IN ('H', 'A', 'S', 'I')), -- H=Hadir, A=Alfa, S=Sakit, I=Izin
    keterangan VARCHAR(255), -- Catatan opsional tambahan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_pegawai_tanggal UNIQUE (pegawai_id, tanggal)
);

-- Buat indeks untuk performa query absensi harian dan bulanan
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON public.absensi(tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_pegawai_tanggal ON public.absensi(pegawai_id, tanggal);

-- Trigger untuk memperbarui kolom updated_at secara otomatis
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_absensi_modtime
    BEFORE UPDATE ON public.absensi
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 3. Kebijakan Row Level Security (RLS) Supabase
-- Secara default, kita mengizinkan akses penuh (Anonymous/Public) agar mudah digunakan,
-- namun Anda bisa membatasinya dengan Auth Supabase di masa depan.
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absensi ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk tabel Pegawai
CREATE POLICY "Izinkan semua akses publik untuk pegawai" 
ON public.pegawai FOR ALL USING (true) WITH CHECK (true);

-- Kebijakan untuk tabel Absensi
CREATE POLICY "Izinkan semua akses publik untuk absensi" 
ON public.absensi FOR ALL USING (true) WITH CHECK (true);

-- 4. Sampel Data Awal (Opsional untuk memulai uji coba)
INSERT INTO public.pegawai (nama, keterangan, jadwal) VALUES
('Drs. Ahmad Subarjo, M.Pd.', 'Kepala Sekolah & Guru PKn (Senin, Rabu)', ARRAY['Senin', 'Rabu']),
('Siti Aminah, S.Pd.', 'Guru Bahasa Indonesia (Senin, Selasa, Kamis)', ARRAY['Senin', 'Selasa', 'Kamis']),
('Budi Utomo, M.Si.', 'Guru Matematika & Fisika (Selasa, Rabu, Jumat)', ARRAY['Selasa', 'Rabu', 'Jumat']),
('Rini Handayani, S.Kom.', 'Guru Informatika & Operator (Senin, Selasa, Rabu, Kamis, Jumat)', ARRAY['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']),
('Dewi Lestari, S.Pd.', 'Guru Bahasa Inggris (Kamis, Jumat, Sabtu)', ARRAY['Kamis', 'Jumat', 'Sabtu']),
('Hendra Wijaya, S.Pd.', 'Guru PJOK / Penjaskes (Senin, Jumat, Sabtu)', ARRAY['Senin', 'Jumat', 'Sabtu']),
('Lani Marlina, S.Ag.', 'Guru Agama Islam (Selasa, Kamis, Sabtu)', ARRAY['Selasa', 'Kamis', 'Sabtu']),
('Joko Susilo', 'Staff Tata Usaha (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu)', ARRAY['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])
ON CONFLICT DO NOTHING;
