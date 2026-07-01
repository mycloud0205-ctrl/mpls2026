import React, { useState, useEffect } from 'react';
import { 
  Award, Search, ChevronRight, CheckCircle2, History, Trash2, 
  RefreshCw, ToggleLeft, ToggleRight, FileText, User, Calendar 
} from 'lucide-react';
import { Peserta, Kegiatan, PointEntry } from '../types';

interface PointInputProps {
  currentUser: { username: string; role: string };
}

export default function PointInput({ currentUser }: PointInputProps) {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector search terms
  const [pesertaSearch, setPesertaSearch] = useState('');
  const [kegiatanSearch, setKegiatanSearch] = useState('');

  // Selections
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [overridePoin, setOverridePoin] = useState<number>(0);
  const [catatan, setCatatan] = useState('');
  const [preventDuplicate, setPreventDuplicate] = useState(true);

  // States
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);

  const showToast = (text: string, isError: boolean = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resP, resK, resH] = await Promise.all([
        fetch('/api/peserta'),
        fetch('/api/kegiatan'),
        fetch('/api/points')
      ]);

      if (resP.ok && resK.ok && resH.ok) {
        const listP = await resP.json();
        const listK = await resK.json();
        const listH = await resH.json();

        setPesertaList(listP.filter((p: any) => p.status === 'Aktif'));
        setKegiatanList(listK.filter((k: any) => k.status === 'Aktif'));
        
        // Resolve names for history log list
        const resolvedHistory = listH.map((h: any) => {
          const matchingPeserta = listP.find((p: any) => p.id === h.id_peserta);
          const matchingKegiatan = listK.find((k: any) => k.id === h.id_kegiatan);
          return {
            ...h,
            nama_peserta: matchingPeserta ? matchingPeserta.nama : 'Siswa Tidak Diketahui',
            kelas_peserta: matchingPeserta ? matchingPeserta.kelas : '-',
            nama_kegiatan: matchingKegiatan ? matchingKegiatan.nama_kegiatan : 'Kegiatan Tidak Diketahui'
          };
        });
        
        // Sort history: newest first
        resolvedHistory.sort((a: any, b: any) => new Date(b.tanggal_input).getTime() - new Date(a.tanggal_input).getTime());
        setPointHistory(resolvedHistory);
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat database terpadu', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When selectedKegiatan changes, auto populate standard points weight
  useEffect(() => {
    if (selectedKegiatan) {
      setOverridePoin(selectedKegiatan.poin);
    }
  }, [selectedKegiatan]);

  const handleInputPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeserta || !selectedKegiatan) {
      showToast('Mohon pilih peserta dan agenda kegiatan terlebih dahulu!', true);
      return;
    }

    setSaving(true);
    const body = {
      id_peserta: selectedPeserta.id,
      id_kegiatan: selectedKegiatan.id,
      poin: overridePoin,
      catatan,
      input_by: currentUser.username,
      preventDuplicate
    };

    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Berhasil memberikan +${overridePoin} poin kepada ${selectedPeserta.nama}!`);
        // Reset inputs
        setSelectedPeserta(null);
        setSelectedKegiatan(null);
        setCatatan('');
        setPesertaSearch('');
        setKegiatanSearch('');
        fetchData(); // Refresh history
      } else {
        showToast(data.message || 'Gagal menyimpan input poin', true);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pemberian poin ini?')) return;
    try {
      const res = await fetch(`/api/points/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Pemberian poin berhasil dibatalkan');
        fetchData();
      } else {
        showToast(data.message || 'Gagal menghapus riwayat', true);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server', true);
    }
  };

  // Filter lists based on quick search
  const filteredPeserta = pesertaList.filter(p => 
    p.nama.toLowerCase().includes(pesertaSearch.toLowerCase()) || 
    p.no_peserta.toLowerCase().includes(pesertaSearch.toLowerCase()) ||
    p.nisn.includes(pesertaSearch)
  ).slice(0, 5); // Limit suggestions to 5 items for clean layout

  const filteredKegiatan = kegiatanList.filter(k => 
    k.nama_kegiatan.toLowerCase().includes(kegiatanSearch.toLowerCase()) ||
    k.jenis.toLowerCase().includes(kegiatanSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-sm max-w-sm flex items-center space-x-2 transition-all duration-300 transform translate-y-0 ${
          toast.isError 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Main Input Form Panel */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="bg-indigo-900 text-white px-5 py-4">
          <h3 className="font-display font-semibold text-sm flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-200" />
            <span>Form Input Perolehan Poin MPLS</span>
          </h3>
          <p className="text-xs text-indigo-200 mt-0.5">
            Berikan akumulasi nilai kegiatan siswa secara real-time.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs text-neutral-400 font-mono">Menyelaraskan data penilai...</span>
          </div>
        ) : (
          <form onSubmit={handleInputPoint} className="p-6 space-y-6 flex-1">
            
            {/* Row 1: Select Participant with Quick Search Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Peserta Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  1. Pilih Peserta MPLS (Aktif)
                </label>
                
                {selectedPeserta ? (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-900 block">{selectedPeserta.nama}</span>
                      <span className="text-[10px] font-mono text-indigo-400">
                        {selectedPeserta.no_peserta} &bull; {selectedPeserta.kelas} ({selectedPeserta.jurusan})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPeserta(null)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Cari nama, NISN, atau no peserta..."
                        value={pesertaSearch}
                        onChange={(e) => setPesertaSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                    
                    {/* Suggestions list */}
                    {pesertaSearch && filteredPeserta.length > 0 && (
                      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm divide-y divide-neutral-100 overflow-hidden">
                        {filteredPeserta.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPeserta(p)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-50 flex justify-between items-center transition-colors"
                          >
                            <div>
                              <span className="font-semibold text-neutral-800 block">{p.nama}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">{p.no_peserta} &bull; {p.kelas}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Kegiatan Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  2. Pilih Agenda Kegiatan
                </label>

                {selectedKegiatan ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">{selectedKegiatan.nama_kegiatan}</span>
                      <span className="text-[10px] font-mono text-amber-600">
                        Bobot Default: +{selectedKegiatan.poin} Poin ({selectedKegiatan.jenis})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedKegiatan(null)}
                      className="text-xs text-amber-700 hover:text-amber-900 font-semibold underline"
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Cari agenda kegiatan aktif..."
                        value={kegiatanSearch}
                        onChange={(e) => setKegiatanSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Suggestions list */}
                    {kegiatanSearch && filteredKegiatan.length > 0 && (
                      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm divide-y divide-neutral-100 overflow-hidden">
                        {filteredKegiatan.map(k => (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => setSelectedKegiatan(k)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-50 flex justify-between items-center transition-colors"
                          >
                            <div>
                              <span className="font-semibold text-neutral-800 block">{k.nama_kegiatan}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">+{k.poin} Poin &bull; {k.jenis}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Custom Poin Override & Catatan */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-2">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Nilai Poin
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={overridePoin}
                  onChange={(e) => setOverridePoin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-700 font-mono text-center"
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Catatan Panitia / Penilai (Opsional)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: Sangat disiplin, berpakaian rapi, aktif bertanya..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Security Duplication Prevent Toggle */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-neutral-700">Cegah Input Ganda Kegiatan</span>
                <span className="text-[10px] text-neutral-400 max-w-sm">
                  Mencegah pengisian poin lebih dari satu kali untuk siswa dan materi kegiatan yang sama demi validitas nilai.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreventDuplicate(!preventDuplicate)}
                className="text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none"
              >
                {preventDuplicate ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-neutral-300" />
                )}
              </button>
            </div>

            {/* Form Footer Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving || !selectedPeserta || !selectedKegiatan}
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-xs font-semibold shadow disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit &amp; Simpan Poin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Side Panel: Recent Logs / History */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-200 flex items-center space-x-2 shrink-0">
          <History className="w-5 h-5 text-neutral-500" />
          <div>
            <h3 className="font-display font-semibold text-neutral-800 text-xs uppercase tracking-wider">Riwayat Input Poin</h3>
            <p className="text-[10px] text-neutral-400">Pemberian poin terbaru oleh panitia.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[350px] divide-y divide-neutral-100 p-3 space-y-2">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-xs text-neutral-400 font-mono">
              Memuat riwayat...
            </div>
          ) : pointHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 font-mono">
              Belum ada riwayat input.
            </div>
          ) : (
            pointHistory.map((pt) => (
              <div key={pt.id} className="p-2.5 bg-neutral-50 border border-neutral-150 rounded-xl flex justify-between items-start hover:border-neutral-200 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-800">{pt.nama_peserta}</span>
                    <span className="text-[9px] text-neutral-400 font-mono">({pt.kelas_peserta})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    <span className="text-[10px] text-neutral-600 font-medium truncate max-w-[120px]">{pt.nama_kegiatan}</span>
                  </div>
                  {pt.catatan && (
                    <p className="text-[10px] text-neutral-400 italic">"{pt.catatan}"</p>
                  )}
                  <div className="text-[9px] text-neutral-400 font-mono">
                    Oleh: {pt.input_by} &bull; {new Date(pt.tanggal_input).toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-lg font-mono">
                    +{pt.poin}
                  </span>
                  <button
                    onClick={() => handleDeleteHistory(pt.id)}
                    className="p-1 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded transition-colors"
                    title="Batalkan Input"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
