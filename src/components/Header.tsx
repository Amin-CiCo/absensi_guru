'use client';

import React, { useState } from 'react';
import { 
  Users, 
  CalendarCheck2, 
  BarChart3, 
  LayoutDashboard, 
  Menu, 
  X,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSupabaseModal
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'absensi', label: 'Absensi Harian', icon: CalendarCheck2 },
    { id: 'pegawai', label: 'Guru & Jadwal', icon: Users },
    { id: 'rekap', label: 'Rekapitulasi Bulanan', icon: BarChart3 },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Hamburger & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                aria-label="Buka Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-900 rounded-lg">
                  <CalendarCheck2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  AbsensiGuru
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Supabase Status Button */}
            <button
              onClick={onOpenSupabaseModal}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-all ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isSupabaseConfigured ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span className="hidden xs:inline">
                {isSupabaseConfigured ? 'Cloud Connected' : 'Local Mode'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-over Drawer Menu from Left */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden no-print">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content sliding from left */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-900 rounded-lg">
                  <CalendarCheck2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900 text-sm">Navigasi Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 space-y-1 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSupabaseModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  Status Database
                </span>
                <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
