import React, { useState } from 'react';
import { KeyRound, User as UserIcon, LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username dan Password wajib diisi!');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Username atau Password salah!');
      }
    } catch (err) {
      setError('Koneksi ke server gagal. Pastikan backend aktif.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 inset-x-0 h-2 bg-indigo-600"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Logo Icon Replacement */}
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-600 text-white shadow-md mb-4 ring-4 ring-indigo-50">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-neutral-900 tracking-tight">
            Aplikasi MPLS SMKN 2 Baleendah
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500 max-w-xs mx-auto">
            Sistem Penghitungan Poin Kegiatan &amp; Penilaian Sertifikat MPLS
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-sm border border-neutral-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="block w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-semibold shadow-md shadow-indigo-100 hover:shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk Aplikasi</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Login Helper Panel */}
          <div className="mt-6 pt-5 border-t border-neutral-100">
            <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Bantuan Login Cepat (Pilih untuk Mengisi):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                }}
                className="p-2 border border-neutral-200 rounded-lg text-left hover:bg-neutral-50 hover:border-indigo-300 transition-all text-xs"
              >
                <span className="font-semibold text-neutral-800 block">Role Admin</span>
                <span className="text-neutral-400 text-[10px] font-mono">admin / admin123</span>
              </button>
              <button
                onClick={() => {
                  setUsername('panitia');
                  setPassword('panitia123');
                }}
                className="p-2 border border-neutral-200 rounded-lg text-left hover:bg-neutral-50 hover:border-indigo-300 transition-all text-xs"
              >
                <span className="font-semibold text-neutral-800 block">Role Panitia</span>
                <span className="text-neutral-400 text-[10px] font-mono">panitia / panitia123</span>
              </button>
              <button
                onClick={() => {
                  setUsername('MPLS-001');
                  setPassword('0081234567');
                }}
                className="p-2 border border-neutral-200 rounded-lg text-left hover:bg-neutral-50 hover:border-indigo-300 transition-all text-xs"
              >
                <span className="font-semibold text-neutral-800 block">Role Siswa (Ahmad)</span>
                <span className="text-neutral-400 text-[10px] font-mono">MPLS-001 / 0081234567</span>
              </button>
            </div>
            <p className="mt-3 text-[10px] text-neutral-400 text-center leading-relaxed">
              *Siswa dapat masuk menggunakan <strong>Nomor Peserta</strong> sebagai Username dan <strong>NISN</strong> sebagai Password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
