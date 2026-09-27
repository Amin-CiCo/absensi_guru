'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { SupabaseModal } from '../components/SupabaseModal';
import { DashboardView } from '../components/DashboardView';
import { AbsensiHarianView } from '../components/AbsensiHarianView';
import { DataPegawaiView } from '../components/DataPegawaiView';
import { RekapBulananView } from '../components/RekapBulananView';
import { Pegawai, AbsensiRecord } from '../types';
import { db } from '../lib/supabaseClient';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [todayAbsensi, setTodayAbsensi] = useState<AbsensiRecord[]>([]);
  
  const getTodayString = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  const [monthStats, setMonthStats] = useState({
    totalHadir: 0,
    totalSakit: 0,
    totalIzin: 0,
    totalAlfa: 0,
    persentaseAvg: 0
  });

  const fetchPegawai = useCallback(async () => {
    try {
      const data = await db.pegawai.list();
      setPegawaiList(data);
    } catch (err) {
      console.error('Error fetching pegawai:', err);
    }
  }, []);

  const fetchTodayAbsensi = useCallback(async () => {
    try {
      const todayStr = getTodayString();
      const records = await db.absensi.listForDate(todayStr);
      setTodayAbsensi(records);
    } catch (err) {
      console.error('Error fetching today absensi:', err);
    }
  }, []);

  const fetchMonthStats = useCallback(async () => {
    try {
      const now = new Date();
      const monthRecords = await db.absensi.listForMonth(now.getFullYear(), now.getMonth() + 1);
      
      let hadir = 0, sakit = 0, izin = 0, alfa = 0;
      monthRecords.forEach(r => {
        if (r.status === 'H') hadir++;
        else if (r.status === 'S') sakit++;
        else if (r.status === 'I') izin++;
        else if (r.status === 'A') alfa++;
      });

      const total = hadir + sakit + izin + alfa;
      const persentaseAvg = total > 0 ? Math.round((hadir / total) * 100) : 0;

      setMonthStats({
        totalHadir: hadir,
        totalSakit: sakit,
        totalIzin: izin,
        totalAlfa: alfa,
        persentaseAvg
      });
    } catch (err) {
      console.error('Error fetching month stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchPegawai();
    fetchTodayAbsensi();
    fetchMonthStats();
  }, [fetchPegawai, fetchTodayAbsensi, fetchMonthStats]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            pegawaiList={pegawaiList}
            todayAbsensi={todayAbsensi}
            todayDateStr={getTodayString()}
            onNavigate={(tab) => setActiveTab(tab)}
            monthStats={monthStats}
          />
        )}

        {activeTab === 'absensi' && (
          <AbsensiHarianView
            pegawaiList={pegawaiList}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onAbsensiSaved={() => {
              fetchTodayAbsensi();
              fetchMonthStats();
            }}
          />
        )}

        {activeTab === 'pegawai' && (
          <DataPegawaiView
            pegawaiList={pegawaiList}
            onPegawaiUpdated={() => {
              fetchPegawai();
              fetchTodayAbsensi();
            }}
          />
        )}

        {activeTab === 'rekap' && (
          <RekapBulananView
            pegawaiList={pegawaiList}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sistem Absensi Guru & Staf</span>
          <span>Next.js • Supabase • Netlify</span>
        </div>
      </footer>

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
