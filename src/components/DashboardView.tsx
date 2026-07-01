import React, { useState, useEffect } from 'react';
import { Users, Award, Calendar, ChevronRight, RefreshCw, Trophy } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { DashboardAnalytics } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  userRole: 'Admin' | 'Panitia';
}

export default function DashboardView({ onNavigate, userRole }: DashboardViewProps) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-sm text-neutral-500 font-mono">Memuat analisa data...</span>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight">
            Selamat Datang di Portal MPLS
          </h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-xl">
            Aplikasi pengelolaan dan penilaian poin peserta Masa Pengenalan Lingkungan Sekolah SMK Negeri 2 Baleendah.
          </p>
        </div>
        <button
          onClick={() => onNavigate('point')}
          className="mt-4 md:mt-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all text-sm font-medium shadow"
        >
          Input Perolehan Poin &rarr;
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 block font-mono uppercase tracking-wider">Total Peserta MPLS</span>
            <span className="font-display font-extrabold text-2xl text-neutral-800">{analytics.totalPeserta}</span>
            <span className="text-[11px] text-neutral-400 block">Siswa terdaftar aktif</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 block font-mono uppercase tracking-wider">Total Agenda Kegiatan</span>
            <span className="font-display font-extrabold text-2xl text-neutral-800">{analytics.totalKegiatan}</span>
            <span className="text-[11px] text-neutral-400 block">Materi, Kedisiplinan &amp; Ekskul</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 block font-mono uppercase tracking-wider">Akumulasi Poin Diberikan</span>
            <span className="font-display font-extrabold text-2xl text-neutral-800">{analytics.totalPoinGiven}</span>
            <span className="text-[11px] text-neutral-400 block">Total poin riwayat terinput</span>
          </div>
        </div>
      </div>

      {/* Charts & Leaderboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Point Distribution Chart */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-neutral-800 text-base">Rata-rata Poin Per Kompetensi Keahlian</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Distribusi perolehan poin rata-rata peserta berdasarkan jurusan masing-masing.
            </p>
          </div>
          
          <div className="h-80 w-full mt-4">
            {analytics.chartJurusan.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-mono">
                Belum ada data poin untuk ditampilkan
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.chartJurusan}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                    labelStyle={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Rata-rata Poin" radius={[6, 6, 0, 0]}>
                    {analytics.chartJurusan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top 5 Leaderboard */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-bold text-neutral-800 text-base">Peserta Teraktif (Top 5)</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Peserta dengan perolehan poin tertinggi saat ini.
            </p>
          </div>

          <div className="mt-4 flex-1 space-y-3.5">
            {analytics.topPeserta.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-mono py-12">
                Belum ada perolehan poin.
              </div>
            ) : (
              analytics.topPeserta.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-neutral-50 rounded-xl transition-all">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-neutral-200 text-neutral-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-neutral-100 text-neutral-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-neutral-800 block truncate max-w-[150px]">
                        {p.nama}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {p.kelas}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 font-mono font-bold text-xs rounded-lg shadow-sm">
                    {p.poin} Pts
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigate('rekap')}
            className="w-full mt-4 flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50 rounded-lg transition-all"
          >
            <span>Lihat Semua Peringkat</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
