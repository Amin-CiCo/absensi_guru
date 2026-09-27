export type DayOfWeek = 
  | 'Senin' 
  | 'Selasa' 
  | 'Rabu' 
  | 'Kamis' 
  | 'Jumat' 
  | 'Sabtu' 
  | 'Minggu';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

export type AttendanceStatus = 'H' | 'A' | 'S' | 'I';

export interface Pegawai {
  id: string;
  nama: string;
  keterangan: string;
  jadwal: DayOfWeek[];
  is_active: boolean;
  created_at?: string;
}

export interface AbsensiRecord {
  id?: string;
  pegawai_id: string;
  tanggal: string; // YYYY-MM-DD
  status: AttendanceStatus;
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RekapPegawai {
  pegawai: Pegawai;
  totalJadwalBulanIni: number;
  totalTerisi: number;
  hadir: number;
  sakit: number;
  izin: number;
  alfa: number;
  persentaseKehadiran: number;
  statusKinerja: 'Sangat Baik' | 'Baik' | 'Perlu Perhatian';
}
