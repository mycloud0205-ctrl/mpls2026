import React, { useState, useEffect } from 'react';
import { 
  Award, Search, Filter, Award as Medal, History, FileBadge2, 
  RefreshCw, Check, X, ShieldAlert, BadgeCheck 
} from 'lucide-react';
import { ParticipantRanked, PointEntry } from '../types';

interface RekapNilaiProps {
  onViewSertifikat: (peserta: ParticipantRanked) => void;
}

export default function RekapNilai({ onViewSertifikat }: RekapNilaiProps) {
  const [rankingList, setRankingList] = useState<ParticipantRanked[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');

  // Selected participant for history details modal
  const [selectedForHistory, setSelectedForHistory] = useState<ParticipantRanked | null>(null);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ranking');
      if (res.ok) {
        const data = await res.json();
        setRankingList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  // Filter rankings list
  const filteredRankings = rankingList.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.no_peserta.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.nisn.includes(searchQuery);
    const matchKelas = filterKelas ? item.kelas === filterKelas : true;
    const matchJurusan = filterJurusan ? item.jurusan === filterJurusan : true;

    return matchSearch && matchKelas && matchJurusan;
  });

  // Unique filters lists
  const uniqueClasses = Array.from(new Set(rankingList.map(r => r.kelas))).sort();
  const uniqueJurusans = Array.from(new Set(rankingList.map(r => r.jurusan))).sort();

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h2 className="text-xl font-display font-bold text-neutral-800 flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <span>Rekapitulasi Nilai &amp; Kelulusan Sertifikat</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Peringkat akumulatif perolehan poin dan status kelulusan peserta MPLS SMK Negeri 2 Baleendah. Standar kelulusan: <strong>&ge; 100 Poin</strong>.
        </p>
      </div>

      {/* Filters Board */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NISN, atau nomor peserta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filter Kelas */}
        <div>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer appearance-none"
          >
            <option value="">-- Semua Kelas --</option>
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* Filter Jurusan */}
        <div>
          <select
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer appearance-none"
          >
            <option value="">-- Semua Jurusan --</option>
            {uniqueJurusans.map(jur => (
              <option key={jur} value={jur}>{jur}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs text-neutral-400 font-mono">Menyusun peringkat peserta...</span>
          </div>
        ) : filteredRankings.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400 font-mono">
            Tidak ada data rekapitulasi ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Rank</th>
                  <th className="px-5 py-3.5">No Peserta</th>
                  <th className="px-5 py-3.5">Nama Lengkap</th>
                  <th className="px-5 py-3.5">Kelas</th>
                  <th className="px-5 py-3.5">Jurusan</th>
                  <th className="px-5 py-3.5 text-center">Total Poin</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Sertifikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredRankings.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center ${
                        item.rank === 1 ? 'bg-amber-100 text-amber-700 font-bold' :
                        item.rank === 2 ? 'bg-neutral-200 text-neutral-700' :
                        item.rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-neutral-100 text-neutral-500'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-neutral-900">{item.no_peserta}</td>
                    <td className="px-5 py-3 font-semibold text-neutral-800">
                      <div className="flex items-center space-x-1.5">
                        <span>{item.nama}</span>
                        {item.rank <= 3 && <Medal className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-700">{item.kelas}</td>
                    <td className="px-5 py-3 font-semibold text-indigo-900">{item.jurusan}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="font-bold text-neutral-900 font-mono text-sm bg-neutral-50 px-2 py-0.5 rounded border border-neutral-150">
                        {item.totalPoints}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold inline-flex items-center space-x-1 ${
                        item.statusLulus === 'Lulus' 
                          ? 'bg-green-50 text-green-700 border border-green-150' 
                          : 'bg-red-50 text-red-700 border border-red-150'
                      }`}>
                        {item.statusLulus === 'Lulus' ? (
                          <>
                            <BadgeCheck className="w-3 h-3 text-green-600" />
                            <span>Lulus</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                            <span>Tidak Lulus</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedForHistory(item)}
                          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-indigo-600 transition-colors"
                          title="Lihat Riwayat Poin"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => onViewSertifikat(item)}
                          disabled={item.statusLulus !== 'Lulus'}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm ${
                            item.statusLulus === 'Lulus'
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow'
                              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none'
                          }`}
                          title={item.statusLulus === 'Lulus' ? 'Buka Sertifikat' : 'Poin belum mencukupi'}
                        >
                          <FileBadge2 className="w-3.5 h-3.5" />
                          <span>Cetak</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Details Modal */}
      {selectedForHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-100 max-w-md w-full overflow-hidden">
            <div className="bg-indigo-900 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-display font-semibold text-sm">Riwayat Poin Peserta</h3>
                <p className="text-[10px] text-indigo-200 font-mono mt-0.5">{selectedForHistory.nama} ({selectedForHistory.no_peserta})</p>
              </div>
              <button onClick={() => setSelectedForHistory(null)} className="hover:text-neutral-300 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-150 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-neutral-400 uppercase tracking-widest block text-[9px] font-bold">Total Terkumpul:</span>
                  <span className="font-display font-extrabold text-lg text-indigo-700">{selectedForHistory.totalPoints} Poin</span>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase tracking-widest block text-[9px] font-bold">Kualifikasi:</span>
                  <span className={`font-bold uppercase tracking-wider ${
                    selectedForHistory.statusLulus === 'Lulus' ? 'text-green-600' : 'text-red-500'
                  }`}>{selectedForHistory.statusLulus}</span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[250px] overflow-y-auto divide-y divide-neutral-100 pr-1">
                {selectedForHistory.history.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-8 font-mono">Siswa belum memiliki riwayat penilaian.</p>
                ) : (
                  selectedForHistory.history.map((pt) => (
                    <div key={pt.id} className="pt-2 flex justify-between items-start text-xs">
                      <div>
                        <span className="font-semibold text-neutral-800 block leading-tight">{pt.nama_kegiatan}</span>
                        {pt.catatan && (
                          <span className="text-[10px] text-neutral-400 italic block mt-0.5">"{pt.catatan}"</span>
                        )}
                        <span className="text-[9px] text-neutral-400 font-mono block mt-0.5">
                          {new Date(pt.tanggal_input).toLocaleDateString()} &bull; Oleh {pt.input_by}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 font-bold font-mono text-[10px] rounded">
                        +{pt.poin}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-neutral-150 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedForHistory(null)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Tutup Dialog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
