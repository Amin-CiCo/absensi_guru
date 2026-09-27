'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Printer, 
  Search, 
  Calendar
} from 'lucide-react';
import { Pegawai, AbsensiRecord, RekapPegawai } from '../types';
import { MONTH_NAMES, getScheduledDatesInMonth, formatIndonesianMonthYear } from '../lib/dateUtils';
import { db } from '../lib/supabaseClient';

interface RekapBulananViewProps {
  pegawaiList: Pegawai[];
}

export const RekapBulananView: React.FC<RekapBulananViewProps> = ({ pegawaiList }) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [absensiMonthList, setAbsensiMonthList] = useState<AbsensiRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchMonthData = async () => {
      setLoading(true);
      try {
        const records = await db.absensi.listForMonth(selectedYear, selectedMonth);
        if (isMounted) {
          setAbsensiMonthList(records);
        }
      } catch (err) {
        console.error('Error fetching monthly records:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMonthData();
    return () => {
      isMounted = false;
    };
  }, [selectedYear, selectedMonth]);

  const rekapData: RekapPegawai[] = useMemo(() => {
    return pegawaiList
      .filter(p => p.is_active)
      .map(pegawai => {
        const scheduledDates = getScheduledDatesInMonth(selectedYear, selectedMonth, pegawai.jadwal || []);
        const totalJadwalBulanIni = scheduledDates.length;

        const pRecords = absensiMonthList.filter(a => a.pegawai_id === pegawai.id);

        let hadir = 0;
        let sakit = 0;
        let izin = 0;
        let alfa = 0;

        pRecords.forEach(rec => {
          if (rec.status === 'H') hadir++;
          else if (rec.status === 'S') sakit++;
          else if (rec.status === 'I') izin++;
          else if (rec.status === 'A') alfa++;
        });

        const totalTerisi = hadir + sakit + izin + alfa;
        const denominator = totalTerisi > 0 ? totalTerisi : (totalJadwalBulanIni > 0 ? totalJadwalBulanIni : 1);
        const persentase = totalTerisi > 0 ? Math.round((hadir / denominator) * 100) : 0;

        let statusKinerja: 'Sangat Baik' | 'Baik' | 'Perlu Perhatian' = 'Baik';
        if (persentase >= 90) statusKinerja = 'Sangat Baik';
        else if (persentase >= 75) statusKinerja = 'Baik';
        else statusKinerja = 'Perlu Perhatian';

        return {
          pegawai,
          totalJadwalBulanIni,
          totalTerisi,
          hadir,
          sakit,
          izin,
          alfa,
          persentaseKehadiran: persentase,
          statusKinerja
        };
      });
  }, [pegawaiList, absensiMonthList, selectedYear, selectedMonth]);

  const filteredRekap = useMemo(() => {
    return rekapData.filter(item => 
      item.pegawai.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pegawai.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rekapData, searchTerm]);

  const overallStats = useMemo(() => {
    let sumHadir = 0, sumSakit = 0, sumIzin = 0, sumAlfa = 0, sumPersentase = 0;
    rekapData.forEach(r => {
      sumHadir += r.hadir;
      sumSakit += r.sakit;
      sumIzin += r.izin;
      sumAlfa += r.alfa;
      sumPersentase += r.persentaseKehadiran;
    });
    const avgPersentase = rekapData.length > 0 ? Math.round(sumPersentase / rekapData.length) : 0;
    return { sumHadir, sumSakit, sumIzin, sumAlfa, avgPersentase };
  }, [rekapData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:outline-none"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:outline-none"
          >
            {[2024, 2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatIndonesianMonthYear(selectedMonth, selectedYear)}
          </span>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Grid Ringkasan */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 no-print">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Rata-rata</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{overallStats.avgPersentase}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Total Hadir</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{overallStats.sumHadir}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Total Sakit</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{overallStats.sumSakit}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Total Izin</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{overallStats.sumIzin}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">Total Alfa</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{overallStats.sumAlfa}</p>
        </div>
      </div>

      {/* Kop Laporan Cetak */}
      <div className="print-only mb-6 text-center border-b border-slate-300 pb-4">
        <h2 className="text-base font-bold uppercase">REKAPITULASI KEHADIRAN GURU</h2>
        <p className="text-xs text-slate-600">Periode: {formatIndonesianMonthYear(selectedMonth, selectedYear).toUpperCase()}</p>
      </div>

      {/* Tabel Rekap */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between no-print">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Rekap Bulanan
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
          <div className="p-8 text-center text-slate-400 text-xs">Memuat rekap...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 font-medium border-b border-slate-100">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-4">Nama Lengkap</th>
                  <th className="py-2.5 px-4">Tugas</th>
                  <th className="py-2.5 px-3 text-center">Jadwal</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700">H</th>
                  <th className="py-2.5 px-3 text-center text-amber-700">S</th>
                  <th className="py-2.5 px-3 text-center text-blue-700">I</th>
                  <th className="py-2.5 px-3 text-center text-rose-700">A</th>
                  <th className="py-2.5 px-3 text-center font-bold">Kehadiran</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredRekap.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">Tidak ada data.</td>
                  </tr>
                ) : (
                  filteredRekap.map((item, idx) => (
                    <tr key={item.pegawai.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{item.pegawai.nama}</td>
                      <td className="py-2.5 px-4 text-slate-500">{item.pegawai.keterangan || '-'}</td>
                      <td className="py-2.5 px-3 text-center">{item.totalJadwalBulanIni}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-emerald-700">{item.hadir}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-amber-700">{item.sakit}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-blue-700">{item.izin}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-rose-700">{item.alfa}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.persentaseKehadiran}%</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          item.statusKinerja === 'Sangat Baik' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : item.statusKinerja === 'Baik' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.statusKinerja}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tanda Tangan Cetak */}
      <div className="print-only mt-12 grid grid-cols-2 text-center text-xs">
        <div>
          <p>Mengetahui,</p>
          <p className="font-semibold mt-1">Kepala Sekolah</p>
          <div className="h-16"></div>
          <p className="font-semibold underline">Drs. Ahmad Subarjo, M.Pd.</p>
        </div>
        <div>
          <p>Petugas Absensi</p>
          <div className="h-20"></div>
          <p className="font-semibold underline">Rini Handayani, S.Kom.</p>
        </div>
      </div>
    </div>
  );
};
