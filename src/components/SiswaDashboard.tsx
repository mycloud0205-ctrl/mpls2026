import React, { useState, useEffect } from 'react';
import { 
  Award, Calendar, FileBadge2, History, RefreshCw, User as UserIcon, 
  MapPin, BookOpen, GraduationCap, ArrowRight, ShieldCheck, AlertTriangle, 
  Smile, Trophy, BadgeCheck, CheckCircle2, ChevronRight, ClipboardList
} from 'lucide-react';
import { User, ParticipantRanked } from '../types';

interface SiswaDashboardProps {
  currentUser: User;
  onOpenSertifikat: (peserta: ParticipantRanked) => void;
}

export default function SiswaDashboard({ currentUser, onOpenSertifikat }: SiswaDashboardProps) {
  const [profile, setProfile] = useState<ParticipantRanked | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!currentUser.pesertaId) {
      setError('Data peserta ID tidak terasosiasi dengan user Anda!');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/siswa/profile/${currentUser.pesertaId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Gagal memuat data profil.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser.pesertaId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs text-neutral-400 font-mono">Memuat profil dan riwayat poin...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3 max-w-md mx-auto my-12">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-sm font-bold text-red-800">Gagal Memuat Profil</h3>
        <p className="text-xs text-red-600 leading-relaxed">{error || 'Data profil tidak ditemukan.'}</p>
        <button 
          onClick={fetchProfile}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const pointProgress = Math.min(Math.round((profile.totalPoints / 100) * 100), 100);
  const isLulus = profile.totalPoints >= 100;
  const pointsNeeded = Math.max(100 - profile.totalPoints, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Grid */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-neutral-900 rounded-2xl p-6 md:p-8 text-white shadow-lg border border-indigo-950">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-12 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
              <Smile className="w-3.5 h-3.5" />
              <span>Siswa Peserta MPLS</span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-extrabold tracking-tight">
              Selamat Datang, {profile.nama}!
            </h2>
            <p className="text-xs text-indigo-200 leading-relaxed max-w-xl">
              Halaman ini adalah portal pribadi Anda untuk memantau kehadiran, perolehan poin aktivitas, kedisiplinan, dan mencetak Sertifikat Kelulusan MPLS secara mandiri.
            </p>
          </div>

          <div className="shrink-0 flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-indigo-100" />
            </div>
            <div className="text-left font-mono">
              <span className="text-[10px] text-indigo-300 block">NOMOR PESERTA</span>
              <span className="text-xs font-bold text-white block">{profile.no_peserta}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Status & Quick Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Certificate Eligibility & Progress Card */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between space-y-5 md:col-span-2">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 flex items-center space-x-2">
              <Trophy className="w-4.5 h-4.5 text-indigo-600" />
              <span>Kelayakan Sertifikasi MPLS</span>
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">
              Setiap peserta wajib mengumpulkan minimal <strong>100 Poin</strong> melalui kehadiran dan keaktifan kegiatan selama MPLS berlangsung.
            </p>
          </div>

          {/* Progress Bar Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-neutral-500">Kemajuan Poin: {profile.totalPoints} / 100 Poin</span>
              <span className="font-bold text-indigo-700">{pointProgress}%</span>
            </div>
            <div className="w-full bg-neutral-100 h-3.5 rounded-full overflow-hidden border border-neutral-150">
              <div 
                style={{ width: `${pointProgress}%` }}
                className={`h-full transition-all duration-500 rounded-full ${
                  isLulus ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                }`}
              ></div>
            </div>
          </div>

          {/* Alert Callout for Status */}
          {isLulus ? (
            <div className="p-4 bg-green-50 border border-green-150 rounded-xl flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div>
                  <span className="text-xs font-bold text-green-800 block">Selamat! Anda Dinyatakan LULUS</span>
                  <p className="text-[11px] text-green-700 leading-relaxed mt-0.5">
                    Akumulasi poin Anda telah mencapai batas kelulusan sertifikasi. Anda sekarang dapat mencetak sertifikat digital Anda secara mandiri di bawah ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenSertifikat(profile)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow"
                >
                  <FileBadge2 className="w-3.5 h-3.5" />
                  <span>Cetak Sertifikat Kelulusan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-150 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-bold text-amber-800 block">Sertifikat Belum Tersedia</span>
                <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                  Anda memerlukan <strong>{pointsNeeded} Poin</strong> tambahan untuk mendapatkan Sertifikat Kelulusan. Silakan ikuti kegiatan wajib/pilihan yang diselenggarakan oleh panitia untuk menambah poin Anda.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Profile Summary Card */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 flex items-center space-x-2">
              <GraduationCap className="w-4.5 h-4.5 text-indigo-600" />
              <span>Informasi Akademik</span>
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">Identitas resmi Anda yang terdaftar pada sistem database MPLS.</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-neutral-100">
              <span className="text-neutral-400">NISN</span>
              <span className="font-mono font-bold text-neutral-800">{profile.nisn}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-100">
              <span className="text-neutral-400">Kelas</span>
              <span className="font-semibold text-neutral-800">{profile.kelas}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-100">
              <span className="text-neutral-400">Kompetensi Keahlian</span>
              <span className="font-semibold text-indigo-800">{profile.jurusan}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-100">
              <span className="text-neutral-400">Peringkat Sementara</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Peringkat {profile.rank}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-neutral-400 text-center italic bg-neutral-50 py-1.5 rounded border border-neutral-150">
            Sistem Penilaian MPLS SMKN 2 Baleendah
          </div>
        </div>
      </div>

      {/* Points History Timeline Log */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-4.5 h-4.5 text-indigo-600" />
            <h3 className="text-sm font-semibold text-neutral-800">Riwayat Penilaian &amp; Aktivitas</h3>
          </div>
          <span className="px-2 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-full font-mono">
            {profile.history.length} Catatan
          </span>
        </div>

        {profile.history.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <History className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs text-neutral-400 font-mono">Belum ada riwayat perolehan poin yang tercatat.</p>
            <p className="text-[11px] text-neutral-400">Poin Anda akan muncul setelah panitia menginput kehadiran atau keaktifan agenda kegiatan.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {profile.history.map((pt, idx) => (
              <div key={pt.id} className="p-5 hover:bg-neutral-50/40 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center font-bold font-mono text-[10px]">
                      {profile.history.length - idx}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-800">{pt.nama_kegiatan}</h4>
                  </div>
                  
                  {pt.catatan && (
                    <p className="text-xs text-neutral-600 italic bg-neutral-50 border border-neutral-150 p-2.5 rounded-lg leading-relaxed">
                      "{pt.catatan}"
                    </p>
                  )}

                  <div className="text-[10px] text-neutral-400 font-mono flex flex-wrap gap-x-3 gap-y-1">
                    <span>Tanggal Input: {new Date(pt.tanggal_input).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>&bull;</span>
                    <span>Oleh: {pt.input_by}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 font-bold font-mono text-sm rounded-lg shadow-sm">
                    +{pt.poin} Poin
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
