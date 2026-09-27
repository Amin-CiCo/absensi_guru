'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Save, 
  Check, 
  Search
} from 'lucide-react';
import { Pegawai, AbsensiRecord, AttendanceStatus } from '../types';
import { getDayNameFromDate, formatIndonesianDate } from '../lib/dateUtils';
import { db } from '../lib/supabaseClient';

interface AbsensiHarianViewProps {
  pegawaiList: Pegawai[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onAbsensiSaved: () => void;
}

export const AbsensiHarianView: React.FC<AbsensiHarianViewProps> = ({
  pegawaiList,
  selectedDate,
  setSelectedDate,
  onAbsensiSaved
}) => {
  const [records, setRecords] = useState<Map<string, { status: AttendanceStatus; keterangan: string }>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const dayName = getDayNameFromDate(selectedDate);

  const scheduledPegawai = pegawaiList.filter(
    p => p.is_active && p.jadwal.includes(dayName)
  );

  const filteredPegawai = scheduledPegawai.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    let isMounted = true;
    const fetchAbsensiForDate = async () => {
      setLoading(true);
      try {
        const existingList = await db.absensi.listForDate(selectedDate);
        if (isMounted) {
          const map = new Map<string, { status: AttendanceStatus; keterangan: string }>();
          existingList.forEach(item => {
            map.set(item.pegawai_id, {
              status: item.status,
              keterangan: item.keterangan || ''
            });
          });
          setRecords(map);
        }
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAbsensiForDate();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const handleStatusChange = (pegawaiId: string, status: AttendanceStatus) => {
    const newMap = new Map(records);
    const existing = newMap.get(pegawaiId) || { status: 'H', keterangan: '' };
    newMap.set(pegawaiId, { ...existing, status });
    setRecords(newMap);
  };

  const handleKeteranganChange = (pegawaiId: string, keterangan: string) => {
    const newMap = new Map(records);
    const existing = newMap.get(pegawaiId) || { status: 'H', keterangan: '' };
    newMap.set(pegawaiId, { ...existing, keterangan });
    setRecords(newMap);
  };

  const handleMarkAllHadir = () => {
    const newMap = new Map(records);
    scheduledPegawai.forEach(p => {
      const existing = newMap.get(p.id);
      if (!existing) {
        newMap.set(p.id, { status: 'H', keterangan: '' });
      } else {
        newMap.set(p.id, { ...existing, status: 'H' });
      }
    });
    setRecords(newMap);
    showToast('Semua guru ditandai Hadir', 'success');
  };

  const handleSaveAll = async () => {
    if (scheduledPegawai.length === 0) return;
    setSaving(true);
    try {
      const recordsToSave = scheduledPegawai.map(p => {
        const item = records.get(p.id) || { status: 'H', keterangan: '' };
        return {
          pegawai_id: p.id,
          tanggal: selectedDate,
          status: item.status,
          keterangan: item.keterangan
        };
      });

      await db.absensi.saveMany(recordsToSave);
      showToast('Absensi berhasil disimpan', 'success');
      onAbsensiSaved();
    } catch (err) {
      console.error('Error saving attendance:', err);
      showToast('Gagal menyimpan absensi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-3.5 py-2 rounded-lg shadow-lg text-white text-xs font-medium flex items-center space-x-2 transition-all ${
          toast.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Bar: Tanggal & Aksi */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <span className="text-xs font-medium text-slate-500">
            Jadwal: <span className="text-slate-900 font-semibold">{dayName}</span> ({formatIndonesianDate(selectedDate)})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllHadir}
            disabled={scheduledPegawai.length === 0}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium rounded-lg text-xs transition disabled:opacity-50"
          >
            Semua Hadir
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || scheduledPegawai.length === 0}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </div>

      {/* Tabel Absensi Minimalis */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Daftar Guru Bertugas ({scheduledPegawai.length})
          </span>
          <div className="relative w-48 sm:w-60">
            <input
              type="text"
              placeholder="Cari guru..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Memuat data...</div>
        ) : scheduledPegawai.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Tidak ada guru yang dijadwalkan pada hari {dayName}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 font-medium border-b border-slate-100">
                  <th className="py-2.5 px-4 w-10 text-center">No</th>
                  <th className="py-2.5 px-4">Nama Guru</th>
                  <th className="py-2.5 px-4">Tugas</th>
                  <th className="py-2.5 px-4 text-center w-60">Status</th>
                  <th className="py-2.5 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredPegawai.map((pegawai, idx) => {
                  const currentRecord = records.get(pegawai.id) || { status: 'H', keterangan: '' };
                  const currentStatus = currentRecord.status;

                  return (
                    <tr key={pegawai.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5 px-4 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{pegawai.nama}</td>
                      <td className="py-2.5 px-4 text-slate-500">{pegawai.keterangan || '-'}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map((st) => {
                            const isSelected = currentStatus === st;
                            const labelMap = { H: 'Hadir', S: 'Sakit', I: 'Izin', A: 'Alfa' };
                            
                            let activeClass = '';
                            if (st === 'H' && isSelected) activeClass = 'bg-emerald-600 text-white border-emerald-600';
                            else if (st === 'S' && isSelected) activeClass = 'bg-amber-500 text-white border-amber-500';
                            else if (st === 'I' && isSelected) activeClass = 'bg-blue-600 text-white border-blue-600';
                            else if (st === 'A' && isSelected) activeClass = 'bg-rose-600 text-white border-rose-600';
                            else activeClass = 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50';

                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(pegawai.id, st)}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${activeClass}`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder="Catatan..."
                          value={currentRecord.keterangan}
                          onChange={(e) => handleKeteranganChange(pegawai.id, e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
