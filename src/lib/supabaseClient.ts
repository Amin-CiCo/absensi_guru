import { createClient } from '@supabase/supabase-js';
import { Pegawai, AbsensiRecord, DayOfWeek } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = 
  supabaseUrl !== '' && 
  supabaseAnonKey !== '' && 
  isValidUrl(supabaseUrl) &&
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// FALLBACK LOCAL STORAGE DATABASE SYSTEM
// ==========================================

const LOCAL_STORAGE_PEGAWAI_KEY = 'absensi_guru_pegawai';
const LOCAL_STORAGE_ABSENSI_KEY = 'absensi_guru_absensi';

const getInitialPegawai = (): Pegawai[] => {
  return [
    {
      id: 'mock-1',
      nama: 'Drs. Ahmad Subarjo, M.Pd.',
      keterangan: 'Kepala Sekolah & Guru PKn (Senin, Rabu)',
      jadwal: ['Senin', 'Rabu'],
      is_active: true,
    },
    {
      id: 'mock-2',
      nama: 'Siti Aminah, S.Pd.',
      keterangan: 'Guru Bahasa Indonesia (Senin, Selasa, Kamis)',
      jadwal: ['Senin', 'Selasa', 'Kamis'],
      is_active: true,
    },
    {
      id: 'mock-3',
      nama: 'Budi Utomo, M.Si.',
      keterangan: 'Guru Matematika & Fisika (Selasa, Rabu, Jumat)',
      jadwal: ['Selasa', 'Rabu', 'Jumat'],
      is_active: true,
    },
    {
      id: 'mock-4',
      nama: 'Rini Handayani, S.Kom.',
      keterangan: 'Guru Informatika & Operator (Senin, Selasa, Rabu, Kamis, Jumat)',
      jadwal: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
      is_active: true,
    },
    {
      id: 'mock-5',
      nama: 'Dewi Lestari, S.Pd.',
      keterangan: 'Guru Bahasa Inggris (Kamis, Jumat, Sabtu)',
      jadwal: ['Kamis', 'Jumat', 'Sabtu'],
      is_active: true,
    },
    {
      id: 'mock-6',
      nama: 'Hendra Wijaya, S.Pd.',
      keterangan: 'Guru PJOK / Penjaskes (Senin, Jumat, Sabtu)',
      jadwal: ['Senin', 'Jumat', 'Sabtu'],
      is_active: true,
    },
    {
      id: 'mock-7',
      nama: 'Lani Marlina, S.Ag.',
      keterangan: 'Guru Agama Islam (Selasa, Kamis, Sabtu)',
      jadwal: ['Selasa', 'Kamis', 'Sabtu'],
      is_active: true,
    },
    {
      id: 'mock-8',
      nama: 'Joko Susilo',
      keterangan: 'Staff Tata Usaha (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu)',
      jadwal: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      is_active: true,
    },
  ];
};

const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage key:', key, error);
    return defaultValue;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing localStorage key:', key, error);
  }
};

// ==========================================
// UNIFIED DATABASE API (SUPABASE / FALLBACK)
// ==========================================

export const db = {
  pegawai: {
    list: async (): Promise<Pegawai[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('pegawai')
          .select('*')
          .order('nama', { ascending: true });
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        return data as Pegawai[];
      } else {
        const list = getLocalStorage<Pegawai[]>(LOCAL_STORAGE_PEGAWAI_KEY, []);
        if (list.length === 0) {
          const initial = getInitialPegawai();
          setLocalStorage(LOCAL_STORAGE_PEGAWAI_KEY, initial);
          return initial;
        }
        return list.sort((a, b) => a.nama.localeCompare(b.nama));
      }
    },

    create: async (nama: string, keterangan: string, jadwal: DayOfWeek[]): Promise<Pegawai> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('pegawai')
          .insert([{ nama, keterangan, jadwal, is_active: true }])
          .select()
          .single();
        
        if (error) throw error;
        return data as Pegawai;
      } else {
        const list = getLocalStorage<Pegawai[]>(LOCAL_STORAGE_PEGAWAI_KEY, []);
        if (list.length === 0) list.push(...getInitialPegawai());
        
        const newPegawai: Pegawai = {
          id: 'mock-' + Date.now().toString(),
          nama,
          keterangan,
          jadwal,
          is_active: true,
          created_at: new Date().toISOString()
        };
        list.push(newPegawai);
        setLocalStorage(LOCAL_STORAGE_PEGAWAI_KEY, list);
        return newPegawai;
      }
    },

    update: async (id: string, updates: Partial<Pegawai>): Promise<Pegawai> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('pegawai')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data as Pegawai;
      } else {
        const list = getLocalStorage<Pegawai[]>(LOCAL_STORAGE_PEGAWAI_KEY, []);
        const idx = list.findIndex(p => p.id === id);
        if (idx === -1) throw new Error('Pegawai tidak ditemukan');
        
        list[idx] = { ...list[idx], ...updates };
        setLocalStorage(LOCAL_STORAGE_PEGAWAI_KEY, list);
        return list[idx];
      }
    },

    delete: async (id: string): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('pegawai')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return true;
      } else {
        const list = getLocalStorage<Pegawai[]>(LOCAL_STORAGE_PEGAWAI_KEY, []);
        const filtered = list.filter(p => p.id !== id);
        setLocalStorage(LOCAL_STORAGE_PEGAWAI_KEY, filtered);
        
        // Also clear their attendance records from fallback
        const absensiList = getLocalStorage<AbsensiRecord[]>(LOCAL_STORAGE_ABSENSI_KEY, []);
        const filteredAbsensi = absensiList.filter(a => a.pegawai_id !== id);
        setLocalStorage(LOCAL_STORAGE_ABSENSI_KEY, filteredAbsensi);
        
        return true;
      }
    },

    resetToDefault: async (): Promise<Pegawai[]> => {
      if (isSupabaseConfigured && supabase) {
        // We do not drop tables, but delete all and insert defaults if safe
        const { error: delErr } = await supabase.from('pegawai').delete().neq('nama', '');
        if (delErr) throw delErr;
        
        const initial = getInitialPegawai().map(({ id, ...p }) => p); // let database generate UUIDs
        const { data, error: insErr } = await supabase.from('pegawai').insert(initial).select();
        if (insErr) throw insErr;
        return data as Pegawai[];
      } else {
        const initial = getInitialPegawai();
        setLocalStorage(LOCAL_STORAGE_PEGAWAI_KEY, initial);
        setLocalStorage(LOCAL_STORAGE_ABSENSI_KEY, []);
        return initial;
      }
    }
  },

  absensi: {
    listForDate: async (tanggal: string): Promise<AbsensiRecord[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('absensi')
          .select('*')
          .eq('tanggal', tanggal);
        
        if (error) throw error;
        return data as AbsensiRecord[];
      } else {
        const list = getLocalStorage<AbsensiRecord[]>(LOCAL_STORAGE_ABSENSI_KEY, []);
        return list.filter(a => a.tanggal === tanggal);
      }
    },

    save: async (pegawai_id: string, tanggal: string, status: AbsensiRecord['status'], keterangan?: string): Promise<AbsensiRecord> => {
      if (isSupabaseConfigured && supabase) {
        // Upsert logic in Supabase using ON CONFLICT (pegawai_id, tanggal)
        const { data, error } = await supabase
          .from('absensi')
          .upsert(
            { pegawai_id, tanggal, status, keterangan: keterangan || '' },
            { onConflict: 'pegawai_id,tanggal' }
          )
          .select()
          .single();
        
        if (error) throw error;
        return data as AbsensiRecord;
      } else {
        const list = getLocalStorage<AbsensiRecord[]>(LOCAL_STORAGE_ABSENSI_KEY, []);
        const idx = list.findIndex(a => a.pegawai_id === pegawai_id && a.tanggal === tanggal);
        
        const record: AbsensiRecord = {
          pegawai_id,
          tanggal,
          status,
          keterangan: keterangan || '',
          updated_at: new Date().toISOString()
        };
        
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...record };
          record.id = list[idx].id;
        } else {
          record.id = 'abs-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4);
          record.created_at = new Date().toISOString();
          list.push(record);
        }
        
        setLocalStorage(LOCAL_STORAGE_ABSENSI_KEY, list);
        return record;
      }
    },

    saveMany: async (records: Omit<AbsensiRecord, 'id'>[]): Promise<boolean> => {
      if (records.length === 0) return true;
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('absensi')
          .upsert(
            records.map(r => ({
              pegawai_id: r.pegawai_id,
              tanggal: r.tanggal,
              status: r.status,
              keterangan: r.keterangan || ''
            })),
            { onConflict: 'pegawai_id,tanggal' }
          );
        
        if (error) throw error;
        return true;
      } else {
        const list = getLocalStorage<AbsensiRecord[]>(LOCAL_STORAGE_ABSENSI_KEY, []);
        
        records.forEach(r => {
          const idx = list.findIndex(a => a.pegawai_id === r.pegawai_id && a.tanggal === r.tanggal);
          const record: AbsensiRecord = {
            ...r,
            keterangan: r.keterangan || '',
            updated_at: new Date().toISOString()
          };
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...record };
          } else {
            record.id = 'abs-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4);
            record.created_at = new Date().toISOString();
            list.push(record);
          }
        });
        
        setLocalStorage(LOCAL_STORAGE_ABSENSI_KEY, list);
        return true;
      }
    },

    listForMonth: async (tahun: number, bulan: number): Promise<AbsensiRecord[]> => {
      // bulan: 1-12
      const pad = (num: number) => num.toString().padStart(2, '0');
      const startDate = `${tahun}-${pad(bulan)}-01`;
      
      // Calculate end date of month
      const lastDay = new Date(tahun, bulan, 0).getDate();
      const endDate = `${tahun}-${pad(bulan)}-${pad(lastDay)}`;
      
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('absensi')
          .select('*')
          .gte('tanggal', startDate)
          .lte('tanggal', endDate);
        
        if (error) throw error;
        return data as AbsensiRecord[];
      } else {
        const list = getLocalStorage<AbsensiRecord[]>(LOCAL_STORAGE_ABSENSI_KEY, []);
        return list.filter(a => {
          const [recYear, recMonthStr] = a.tanggal.split('-');
          const recMonth = parseInt(recMonthStr, 10);
          return parseInt(recYear, 10) === tahun && recMonth === bulan;
        });
      }
    }
  }
};
