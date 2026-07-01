import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Edit2, Trash2, Download, Upload, 
  X, Filter, Save, FileSpreadsheet, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { Peserta } from '../types';

interface PesertaManagerProps {
  userRole: 'Admin' | 'Panitia';
}

export default function PesertaManager({ userRole }: PesertaManagerProps) {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);
  
  // Form fields
  const [noPeserta, setNoPeserta] = useState('');
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [jk, setJk] = useState<'L' | 'P'>('L');
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');
  
  // Bulk import string field
  const [csvPasteData, setCsvPasteData] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Notification states
  const [toastMessage, setToastMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (text: string, isError: boolean = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchPeserta = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/peserta');
      if (res.ok) {
        const data = await res.json();
        setPesertaList(data);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data peserta', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeserta();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedPeserta(null);
    setNoPeserta('');
    setNisn('');
    setNama('');
    setKelas('');
    setJurusan('RPL');
    setJk('L');
    setStatus('Aktif');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (peserta: Peserta) => {
    setSelectedPeserta(peserta);
    setNoPeserta(peserta.no_peserta);
    setNisn(peserta.nisn);
    setNama(peserta.nama);
    setKelas(peserta.kelas);
    setJurusan(peserta.jurusan);
    setJk(peserta.jk);
    setStatus(peserta.status);
    setIsFormModalOpen(true);
  };

  const handleSavePeserta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noPeserta || !nisn || !nama || !kelas || !jurusan) {
      showToast('Mohon lengkapi semua field wajib!', true);
      return;
    }

    setSaving(true);
    const body = { no_peserta: noPeserta, nisn, nama, kelas, jurusan, jk, status };

    try {
      const url = selectedPeserta ? `/api/peserta/${selectedPeserta.id}` : '/api/peserta';
      const method = selectedPeserta ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(selectedPeserta ? 'Data peserta berhasil diperbarui' : 'Peserta baru berhasil ditambahkan');
        setIsFormModalOpen(false);
        fetchPeserta();
      } else {
        showToast(data.message || 'Terjadi kesalahan sistem', true);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke server', true);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = (peserta: Peserta) => {
    setSelectedPeserta(peserta);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeletePeserta = async () => {
    if (!selectedPeserta) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/peserta/${selectedPeserta.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Peserta dan riwayat poin berhasil dihapus');
        setIsDeleteConfirmOpen(false);
        fetchPeserta();
      } else {
        showToast(data.message || 'Gagal menghapus peserta', true);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data', true);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImport = async () => {
    if (!csvPasteData.trim()) {
      showToast('Mohon masukkan data CSV terlebih dahulu!', true);
      return;
    }

    setSaving(true);
    setImportStatus('Memproses impor data...');

    // Parsing CSV string
    const lines = csvPasteData.split('\n');
    const parsedList: any[] = [];

    // Header validation (no_peserta, nisn, nama, kelas, jurusan, jk, status)
    const headerLine = lines[0].toLowerCase().trim();
    const hasHeader = headerLine.includes('nisn') || headerLine.includes('no_peserta') || headerLine.includes('nama');
    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle comma-separated or tab-separated lines
      const cols = line.split(/[,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 5) continue;

      parsedList.push({
        no_peserta: cols[0],
        nisn: cols[1],
        nama: cols[2],
        kelas: cols[3],
        jurusan: cols[4],
        jk: cols[5] || 'L',
        status: cols[6] || 'Aktif'
      });
    }

    if (parsedList.length === 0) {
      showToast('Tidak ada baris data valid yang terbaca!', true);
      setSaving(false);
      setImportStatus(null);
      return;
    }

    try {
      const res = await fetch('/api/peserta/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataList: parsedList })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Impor Selesai! Berhasil: ${data.addedCount}, Dilewati: ${data.skippedCount}`);
        setIsImportModalOpen(false);
        setCsvPasteData('');
        fetchPeserta();
      } else {
        showToast(data.message || 'Gagal mengimpor data', true);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server', true);
    } finally {
      setSaving(false);
      setImportStatus(null);
    }
  };

  // Helper to trigger CSV file download
  const handleExportCSV = () => {
    if (pesertaList.length === 0) {
      showToast('Tidak ada data untuk diekspor', true);
      return;
    }

    const headers = ['Nomor Peserta', 'NISN', 'Nama Lengkap', 'Kelas', 'Jurusan', 'Jenis Kelamin', 'Status'];
    const rows = pesertaList.map(p => [
      p.no_peserta,
      p.nisn,
      p.nama,
      p.kelas,
      p.jurusan,
      p.jk === 'L' ? 'Laki-laki' : 'Perempuan',
      p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peserta_mpls_smkn2be_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ekspor CSV berhasil diunduh');
  };

  // Filtering & Sorting Logic
  const filteredList = pesertaList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.no_peserta.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.nisn.includes(searchQuery);
    const matchKelas = filterKelas ? p.kelas === filterKelas : true;
    const matchJurusan = filterJurusan ? p.jurusan === filterJurusan : true;

    return matchSearch && matchKelas && matchJurusan;
  });

  // Extract unique classes & jurusans for dropdown filters
  const uniqueClasses = Array.from(new Set(pesertaList.map(p => p.kelas))).sort();
  const uniqueJurusans = Array.from(new Set(pesertaList.map(p => p.jurusan))).sort();

  // Paginated chunk
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
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
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Manajemen Data Peserta MPLS</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Daftar siswa baru SMK Negeri 2 Baleendah yang mengikuti rangkaian kegiatan MPLS 2026.
          </p>
        </div>
        
        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 rounded-lg transition-all text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          
          {userRole === 'Admin' && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 rounded-lg transition-all text-xs font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Impor CSV</span>
              </button>
              
              <button
                onClick={handleOpenAddModal}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-xs font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Peserta</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NISN, atau no peserta..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filter Kelas */}
        <div className="relative">
          <select
            value={filterKelas}
            onChange={(e) => { setFilterKelas(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="">-- Semua Kelas --</option>
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* Filter Jurusan */}
        <div className="relative">
          <select
            value={filterJurusan}
            onChange={(e) => { setFilterJurusan(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="">-- Semua Jurusan --</option>
            {uniqueJurusans.map(jur => (
              <option key={jur} value={jur}>{jur}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs text-neutral-400 font-mono">Memuat database peserta...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400 font-mono">
            Tidak ditemukan data peserta yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">No Peserta</th>
                  <th className="px-5 py-3.5">NISN</th>
                  <th className="px-5 py-3.5">Nama Lengkap</th>
                  <th className="px-5 py-3.5">Kelas</th>
                  <th className="px-5 py-3.5">Jurusan</th>
                  <th className="px-5 py-3.5">JK</th>
                  <th className="px-5 py-3.5">Status</th>
                  {userRole === 'Admin' && <th className="px-5 py-3.5 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedList.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-neutral-900">{p.no_peserta}</td>
                    <td className="px-5 py-3 font-mono text-neutral-400">{p.nisn}</td>
                    <td className="px-5 py-3 font-semibold text-neutral-800">{p.nama}</td>
                    <td className="px-5 py-3 text-neutral-700">{p.kelas}</td>
                    <td className="px-5 py-3 font-semibold text-indigo-900">
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[10px]">
                        {p.jurusan}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold">{p.jk === 'L' ? 'L' : 'P'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'Aktif' 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    {userRole === 'Admin' && (
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(p)}
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

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400 font-mono">
              Menampilkan {paginatedList.length} dari {filteredList.length} peserta
            </span>
            <div className="inline-flex space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1 bg-white border border-neutral-300 rounded text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Kembali
              </button>
              <span className="px-3 py-1 text-[11px] font-bold text-neutral-700 font-mono">
                Halaman {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1 bg-white border border-neutral-300 rounded text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Add / Edit Participant Form (Simulation of modal-dialog bootstrap) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-100 max-w-lg w-full overflow-hidden">
            <div className="bg-indigo-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-display font-semibold text-sm">
                {selectedPeserta ? 'Edit Data Peserta' : 'Tambah Peserta MPLS Baru'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="hover:text-neutral-300 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSavePeserta} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Nomor Peserta (Wajib)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MPLS-008"
                    value={noPeserta}
                    onChange={(e) => setNoPeserta(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">NISN (Wajib)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0089876543"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Nama Lengkap (Wajib)</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap siswa baru"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Kelas (Wajib)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: X RPL 1"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Jurusan / Kompetensi Keahlian</label>
                  <select
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  >
                    <option value="RPL">RPL (Perangkat Lunak)</option>
                    <option value="TKJ">TKJ (Komputer Jaringan)</option>
                    <option value="DKV">DKV (Desain Komunikasi)</option>
                    <option value="TITL">TITL (Teknik Listrik)</option>
                    <option value="TPFL">TPFL (Teknik Las)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Jenis Kelamin</label>
                  <div className="flex space-x-3 mt-1">
                    <label className="inline-flex items-center text-xs text-neutral-600">
                      <input
                        type="radio"
                        name="jk"
                        checked={jk === 'L'}
                        onChange={() => setJk('L')}
                        className="mr-1.5 focus:ring-indigo-500 text-indigo-600"
                      />
                      Laki-laki
                    </label>
                    <label className="inline-flex items-center text-xs text-neutral-600">
                      <input
                        type="radio"
                        name="jk"
                        checked={jk === 'P'}
                        onChange={() => setJk('P')}
                        className="mr-1.5 focus:ring-indigo-500 text-indigo-600"
                      />
                      Perempuan
                    </label>
                  </div>
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
                      <RefreshCw className="w-3 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Data</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-100 max-w-xl w-full overflow-hidden">
            <div className="bg-indigo-900 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-200" />
                <h3 className="font-display font-semibold text-sm">Impor Peserta dari CSV / Excel</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="hover:text-neutral-300 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-neutral-50 p-3 rounded-lg text-xs border border-neutral-200 text-neutral-500 leading-relaxed">
                <span className="font-bold text-neutral-700 block mb-1">Format Baris Data:</span>
                Ketikkan atau tempel baris data yang dipisahkan koma atau tab. Setiap baris harus mengikuti struktur: <br />
                <code className="text-indigo-600 font-bold block font-mono mt-1 text-[11px]">
                  no_peserta, nisn, nama, kelas, jurusan, jk(L/P), status(Aktif/Tidak Aktif)
                </code>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Tempel Data CSV:</label>
                <textarea
                  rows={6}
                  value={csvPasteData}
                  onChange={(e) => setCsvPasteData(e.target.value)}
                  placeholder={`MPLS-010,0081122334,Andi Wijaya,X RPL 1,RPL,L,Aktif&#10;MPLS-011,0082233445,Siti Aminah,X TKJ 1,TKJ,P,Aktif`}
                  className="w-full p-3 font-mono text-xs bg-neutral-900 text-neutral-200 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-neutral-600"
                ></textarea>
              </div>

              {importStatus && (
                <div className="text-xs font-mono text-indigo-600 animate-pulse">
                  {importStatus}
                </div>
              )}

              <div className="pt-3 border-t border-neutral-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-600 text-xs font-semibold hover:bg-neutral-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleBulkImport}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Proses Impor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: SweetAlert-style Delete Confirmation */}
      {isDeleteConfirmOpen && selectedPeserta && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-neutral-100 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 ring-8 ring-red-50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="font-display font-extrabold text-neutral-900 text-lg">Apakah Anda Yakin?</h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Anda akan menghapus data <strong className="text-neutral-800">{selectedPeserta.nama}</strong> ({selectedPeserta.no_peserta}). Semua riwayat perolehan poin yang telah dimasukkan juga akan dihapus secara permanen!
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
                onClick={handleDeletePeserta}
                disabled={saving}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-red-100 hover:shadow-red-200 disabled:opacity-50"
              >
                {saving ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
