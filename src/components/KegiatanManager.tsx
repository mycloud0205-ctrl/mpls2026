import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Search, Edit2, Trash2, X, Save, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { Kegiatan } from '../types';

interface KegiatanManagerProps {
  userRole: 'Admin' | 'Panitia' | 'Siswa';
}

export default function KegiatanManager({ userRole }: KegiatanManagerProps) {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);

  // Form fields
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [poin, setPoin] = useState(10);
  const [jenis, setJenis] = useState('Wajib');
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');

  // Notification states
  const [toastMessage, setToastMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (text: string, isError: boolean = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchKegiatan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kegiatan');
      if (res.ok) {
        const data = await res.json();
        setKegiatanList(data);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat agenda kegiatan', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedKegiatan(null);
    setNamaKegiatan('');
    setDeskripsi('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setPoin(20);
    setJenis('Wajib');
    setStatus('Aktif');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (kegiatan: Kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setNamaKegiatan(kegiatan.nama_kegiatan);
    setDeskripsi(kegiatan.deskripsi);
    setTanggal(kegiatan.tanggal);
    setPoin(kegiatan.poin);
    setJenis(kegiatan.jenis);
    setStatus(kegiatan.status);
    setIsFormModalOpen(true);
  };

  const handleSaveKegiatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKegiatan || !tanggal || poin === undefined || !jenis) {
      showToast('Mohon lengkapi semua field wajib!', true);
      return;
    }

    setSaving(true);
    const body = { nama_kegiatan: namaKegiatan, deskripsi, tanggal, poin, jenis, status };

    try {
      const url = selectedKegiatan ? `/api/kegiatan/${selectedKegiatan.id}` : '/api/kegiatan';
      const method = selectedKegiatan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(selectedKegiatan ? 'Kegiatan berhasil diperbarui' : 'Kegiatan baru berhasil terdaftar');
        setIsFormModalOpen(false);
        fetchKegiatan();
      } else {
        showToast(data.message || 'Terjadi kesalahan sistem', true);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server', true);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = (kegiatan: Kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteKegiatan = async () => {
    if (!selectedKegiatan) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/kegiatan/${selectedKegiatan.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Agenda kegiatan berhasil dihapus');
        setIsDeleteConfirmOpen(false);
        fetchKegiatan();
      } else {
        showToast(data.message || 'Gagal menghapus kegiatan', true);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server', true);
    } finally {
      setSaving(false);
    }
  };

  // Filter & Search Logic
  const filteredList = kegiatanList.filter(k => 
    k.nama_kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) || 
    k.jenis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-sm max-w-sm flex items-center space-x-2 transition-all duration-300 transform translate-y-0 ${
          toastMessage.isError 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-800 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>{userRole === 'Siswa' ? 'Agenda & Kegiatan MPLS' : 'Manajemen Agenda & Kegiatan MPLS'}</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {userRole === 'Siswa' 
              ? 'Daftar seluruh agenda kegiatan, materi wawasan, pembinaan karakter, beserta bobot poin penilaian.' 
              : 'Daftar kegiatan, bobot poin, materi wawasan, dan yel-yel yurisdiksi panitia pelaksana.'}
          </p>
        </div>

        {userRole === 'Admin' && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan</span>
          </button>
        )}
      </div>

      {/* Search Filter bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama kegiatan atau kategori jenis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* Main Table Grid */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs text-neutral-400 font-mono">Memuat agenda kegiatan...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400 font-mono">
            Tidak ada agenda kegiatan terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Nama Kegiatan</th>
                  <th className="px-5 py-3.5">Deskripsi</th>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5">Bobot Poin</th>
                  <th className="px-5 py-3.5">Jenis Kategori</th>
                  <th className="px-5 py-3.5">Status</th>
                  {userRole === 'Admin' && <th className="px-5 py-3.5 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredList.map((k) => (
                  <tr key={k.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-neutral-800">{k.nama_kegiatan}</div>
                      <span className="text-[9px] font-mono text-neutral-400">ID: {k.id}</span>
                    </td>
                    <td className="px-5 py-3 text-neutral-500 max-w-xs truncate" title={k.deskripsi}>
                      {k.deskripsi || '-'}
                    </td>
                    <td className="px-5 py-3 font-mono text-neutral-700">{k.tanggal}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 font-bold font-mono rounded-lg">
                        +{k.poin} Poin
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        k.jenis === 'Wajib' 
                          ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' 
                          : k.jenis === 'Pilihan'
                          ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                          : 'bg-orange-50 border border-orange-100 text-orange-700'
                      }`}>
                        {k.jenis}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        k.status === 'Aktif' 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                      }`}>
                        {k.status}
                      </span>
                    </td>
                    {userRole === 'Admin' && (
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(k)}
                            className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(k)}
                            className="p-1.5 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-100 max-w-md w-full overflow-hidden">
            <div className="bg-indigo-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-display font-semibold text-sm">
                {selectedKegiatan ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Kegiatan Baru'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="hover:text-neutral-300 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveKegiatan} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Nama Kegiatan (Wajib)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembekalan Wawasan Wiyata Mandala"
                  value={namaKegiatan}
                  onChange={(e) => setNamaKegiatan(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi pokok bahasan atau panduan kedisiplinan..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Bobot Nilai Poin</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={poin}
                    onChange={(e) => setPoin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Jenis Kategori</label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  >
                    <option value="Wajib">Wajib (Mandatory)</option>
                    <option value="Pilihan">Pilihan (Optional)</option>
                    <option value="Kedisiplinan">Kedisiplinan (Behavioral)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Status Keaktifan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-600 text-xs font-semibold hover:bg-neutral-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Kegiatan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedKegiatan && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-neutral-100 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 ring-8 ring-red-50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="font-display font-extrabold text-neutral-900 text-lg">Apakah Anda Yakin?</h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Anda akan menghapus kegiatan <strong className="text-neutral-800">{selectedKegiatan.nama_kegiatan}</strong>. Semua riwayat pemberian poin kepada peserta untuk kegiatan ini juga akan dihapus permanen!
            </p>

            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleDeleteKegiatan}
                disabled={saving}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-red-100 hover:shadow-red-200 disabled:opacity-50"
              >
                {saving ? 'Menghapus...' : 'Ya, Hapus Kegiatan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
