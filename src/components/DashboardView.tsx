'use client';

import React from 'react';
import { 
  Users, 
  Calendar, 
  Check, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Pegawai, AbsensiRecord } from '../types';
import { getDayNameFromDate, formatIndonesianDate } from '../lib/dateUtils';

interface DashboardViewProps {
  pegawaiList: Pegawai[];
  todayAbsensi: AbsensiRecord[];
  todayDateStr: string;
  onNavigate: (tab: string) => void;
  monthStats: {
    totalHadir: number;
    totalSakit: number;
    totalIzin: number;
    totalAlfa: number;
    persentaseAvg: number;
  };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pegawaiList,
  todayAbsensi,
  todayDateStr,
  onNavigate,
  monthStats
}) => {
  const todayDayName = getDayNameFromDate(todayDateStr);

  const scheduledToday = pegawaiList.filter(p => p.is_active && p.jadwal.includes(todayDayName));

  const todayAbsensiMap = new Map<string, AbsensiRecord>();
  todayAbsensi.forEach(a => todayAbsensiMap.set(a.pegawai_id, a));

  let hadirCount = 0;
  scheduledToday.forEach(p => {
    const rec = todayAbsensiMap.get(p.id);
    if (rec?.status === 'H') hadirCount++;
  });

  const percentToday = scheduledToday.length > 0 
    ? Math.round((hadirCount / scheduledToday.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Bar: Tanggal & Aksi Cepat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Ringkasan Kehadiran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatIndonesianDate(todayDateStr)} • Jadwal hari <span className="font-medium text-slate-800">{todayDayName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('absensi')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition inline-flex items-center gap-1.5"
          >
            <span>Isi Absensi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Statistik Minimalis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Guru Bertugas</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{scheduledToday.length}</span>
            <span className="text-xs text-slate-400">orang ({todayDayName})</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Hadir Hari Ini</span>
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{hadirCount}</span>
            <span className="text-xs text-slate-400">/ {scheduledToday.length} ({percentToday}%)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Guru</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{pegawaiList.filter(p => p.is_active).length}</span>
            <span className="text-xs text-slate-400">terdaftar</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Rata-rata Bulan Ini</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{monthStats.persentaseAvg}%</span>
            <span className="text-xs text-emerald-600 font-medium">kehadiran</span>
          </div>
        </div>
      </div>

      {/* Tabel Minimalis Jadwal Hari Ini */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Guru Bertugas Hari Ini ({todayDayName})
          </h3>
          <button
            onClick={() => onNavigate('absensi')}
            className="text-xs text-slate-500 hover:text-slate-900 font-medium transition"
          >
            Kelola &rarr;
          </button>
        </div>

        {scheduledToday.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Tidak ada guru yang dijadwalkan mengajar pada hari {todayDayName}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 font-medium border-b border-slate-100">
                  <th className="py-2.5 px-4 w-10 text-center">No</th>
                  <th className="py-2.5 px-4">Nama Guru</th>
                  <th className="py-2.5 px-4">Tugas / Mata Pelajaran</th>
                  <th className="py-2.5 px-4">Hari Kerja</th>
                  <th className="py-2.5 px-4 text-right">Status Hari Ini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {scheduledToday.map((pegawai, idx) => {
                  const rec = todayAbsensiMap.get(pegawai.id);
                  let statusText = 'Belum Diisi';
                  let statusStyle = 'text-slate-400 bg-slate-50 border-slate-200';

                  if (rec?.status === 'H') {
                    statusText = 'Hadir';
                    statusStyle = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                  } else if (rec?.status === 'S') {
                    statusText = 'Sakit';
                    statusStyle = 'text-amber-700 bg-amber-50 border-amber-200';
                  } else if (rec?.status === 'I') {
                    statusText = 'Izin';
                    statusStyle = 'text-blue-700 bg-blue-50 border-blue-200';
                  } else if (rec?.status === 'A') {
                    statusText = 'Alfa';
                    statusStyle = 'text-rose-700 bg-rose-50 border-rose-200';
                  }

                  return (
                    <tr key={pegawai.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5 px-4 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{pegawai.nama}</td>
                      <td className="py-2.5 px-4 text-slate-500">{pegawai.keterangan || '-'}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {pegawai.jadwal.map(day => (
                            <span 
                              key={day} 
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                day === todayDayName
                                  ? 'bg-slate-900 text-white'
                                  : 'text-slate-400'
                              }`}
                            >
                              {day.substring(0, 3)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${statusStyle}`}>
                          {statusText}
                        </span>
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
