'use client';

import React from 'react';
import { Database, X, ExternalLink, CheckCircle, AlertTriangle, Code } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Pengaturan Database Supabase
              </h3>
              <p className="text-xs text-slate-500">
                Status Koneksi Database PostgreSQL Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-slate-600">
          <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
            isSupabaseConfigured 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            {isSupabaseConfigured ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold text-base mb-1">
                {isSupabaseConfigured 
                  ? 'Supabase Terhubung Lengkap!' 
                  : 'Mode Offline / Fallback LocalStorage Aktif'}
              </h4>
              <p className="text-xs leading-relaxed">
                {isSupabaseConfigured
                  ? 'Aplikasi terhubung secara live ke Supabase PostgreSQL. Semua perubahan data disimpan di cloud.'
                  : 'Sistem saat ini menyimpan data di penyimpanan lokal browser Anda. Anda tetap bisa mencoba seluruh fitur absensi dan rekapitulasi secara penuh tanpa hambatan.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <span>Langkah-langkah Hubungkan Supabase:</span>
            </h4>
            
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li>
                Buat proyek gratis di{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline font-medium inline-flex items-center gap-1"
                >
                  Supabase.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Buka menu <strong>SQL Editor</strong> di dashboard Supabase Anda.
              </li>
              <li>
                Buka file <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">supabase/schema.sql</code> yang ada di proyek ini, lalu salin dan jalankan (Run) di SQL Editor Supabase.
              </li>
              <li>
                Salin <strong>Project URL</strong> dan <strong>anon public API key</strong> dari menu <i>Project Settings &gt; API</i> di Supabase.
              </li>
              <li>
                Buat file <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">.env.local</code> di folder utama proyek (atau tambahkan Environment Variables di dashboard Netlify) dengan isi:
              </li>
            </ol>

            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-xs font-mono relative overflow-x-auto">
              <div className="flex items-center justify-between text-slate-400 mb-2 pb-1 border-b border-slate-800 text-[11px]">
                <span className="flex items-center gap-1">
                  <Code className="w-3.5 h-3.5" /> .env.local
                </span>
              </div>
              <pre className="text-emerald-400">NEXT_PUBLIC_SUPABASE_URL<span className="text-slate-400">=</span><span className="text-blue-300">https://xyzcompany.supabase.co</span></pre>
              <pre className="text-emerald-400">NEXT_PUBLIC_SUPABASE_ANON_KEY<span className="text-slate-400">=</span><span className="text-amber-300">eyJhbGciOiJIUzI1NiIsInR5c...</span></pre>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition text-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
