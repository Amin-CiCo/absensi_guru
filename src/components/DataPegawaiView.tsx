'use client';

import React, { useState } from 'react';
import { 
  UserPlus, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  X, 
  RotateCcw
} from 'lucide-react';
import { Pegawai, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { db } from '../lib/supabaseClient';

interface DataPegawaiViewProps {
  pegawaiList: Pegawai[];
  onPegawaiUpdated: () => void;
}

export const DataPegawaiView: React.FC<DataPegawaiViewProps> = ({
  pegawaiList,
  onPegawaiUpdated
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);

  const [nama, setNama] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [selectedJadwal, setSelectedJadwal] = useState<DayOfWeek[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
  const [saving, setSaving] = useState(false);

  const filteredList = pegawaiList.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (pegawai?: Pegawai) => {
    if (pegawai) {
      setEditingPegawai(pegawai);
      setNama(pegawai.nama);
      setKeterangan(pegawai.keterangan || '');
      setSelectedJadwal(pegawai.jadwal || []);
    } else {
      setEditingPegawai(null);
      setNama('');
      setKeterangan('');
      setSelectedJadwal(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPegawai(null);
  };

  const handleToggleDay = (day: DayOfWeek) => {
    if (selectedJadwal.includes(day)) {
      setSelectedJadwal(selectedJadwal.filter(d => d !== day));
    } else {
      setSelectedJadwal([...selectedJadwal, day]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    setSaving(true);
    try {
      if (editingPegawai) {
        await db.pegawai.update(editingPegawai.id, {
          nama: nama.trim(),
          keterangan: keterangan.trim(),
          jadwal: selectedJadwal
        });
      } else {
        await db.pegawai.create(nama.trim(), keterangan.trim(), selectedJadwal);
      }
      onPegawaiUpdated();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving pegawai:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus guru "${nama}"?`)) return;
    try {
      await db.pegawai.delete(id);
      onPegawaiUpdated();
    } catch (err) {
      console.error('Error deleting pegawai:', err);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset daftar guru ke template awal?')) {
      try {
        await db.pegawai.resetToDefault();
        onPegawaiUpdated();
      } catch (err) {
        console.error('Error resetting default:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Guru & Jadwal Mengajar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data guru dan hari kerja wajib
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium rounded-lg text-xs transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Template</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Tabel Pegawai */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
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
          <span className="text-xs text-slate-400">Total: {filteredList.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 font-medium border-b border-slate-100">
                <th className="py-2.5 px-4 w-10 text-center">No</th>
                <th className="py-2.5 px-4">Nama Lengkap</th>
                <th className="py-2.5 px-4">Tugas / Jabatan</th>
                <th className="py-2.5 px-4 text-center">Jadwal Hari Kerja</th>
                <th className="py-2.5 px-4 text-right w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Tidak ada data.</td>
                </tr>
              ) : (
                filteredList.map((pegawai, idx) => (
                  <tr key={pegawai.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{pegawai.nama}</td>
                    <td className="py-2.5 px-4 text-slate-500">{pegawai.keterangan || '-'}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex flex-wrap justify-center gap-1">
                        {DAYS_OF_WEEK.map(day => {
                          const isChecked = pegawai.jadwal?.includes(day);
                          return (
                            <span
                              key={day}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                isChecked
                                  ? 'bg-slate-900 text-white'
                                  : 'text-slate-300'
                              }`}
                            >
                              {day.substring(0, 3)}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(pegawai)}
                          className="p-1 text-slate-500 hover:text-slate-900 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pegawai.id, pegawai.nama)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                {editingPegawai ? 'Edit Guru' : 'Tambah Guru Baru'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Utomo, S.Pd."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tugas / Jabatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Guru Matematika"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Hari Kerja Wajib</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {DAYS_OF_WEEK.map(day => {
                    const isChecked = selectedJadwal.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`py-1.5 rounded text-center font-medium border transition ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
