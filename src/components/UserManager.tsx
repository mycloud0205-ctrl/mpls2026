import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Trash2, Shield, User as UserIcon, RefreshCw, AlertTriangle, CheckCircle2, Lock
} from 'lucide-react';
import { User } from '../types';

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'Panitia' | 'Admin'>('Panitia');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError('Gagal memuat daftar user.');
      }
    } catch (err) {
      console.error(err);
      setError('Koneksi sistem bermasalah.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Username dan Password tidak boleh kosong!');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          role: newRole
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`User baru "${newUsername}" dengan role ${newRole} berhasil ditambahkan!`);
        setNewUsername('');
        setNewPassword('');
        setNewRole('Panitia');
        fetchUsers();
      } else {
        setError(data.message || 'Gagal menambahkan user baru.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (username === 'admin') {
      alert('User admin bawaan sistem tidak boleh dihapus!');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus user "${username}"?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(`User "${username}" berhasil dihapus.`);
        fetchUsers();
      } else {
        setError(data.message || 'Gagal menghapus user.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi saat menghapus.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <h2 className="text-lg font-display font-bold text-neutral-800 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span>Pengaturan Akun &amp; Hak Akses</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
          Sebagai Administrator, Anda dapat menambahkan akun panitia pelaksana baru dan menghapus akun panitia yang sudah tidak aktif untuk menjaga keamanan sistem penilaian MPLS.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-150 rounded-lg flex items-center space-x-2 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-150 rounded-lg flex items-center space-x-2 text-xs text-green-700">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Add New User */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-neutral-800 flex items-center space-x-2 mb-4">
            <UserPlus className="w-4.5 h-4.5 text-indigo-600" />
            <span>Tambah Akun Baru</span>
          </h3>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Username Login
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="contoh: panitia_budi"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="masukkan password"
                  className="w-full px-3 py-2 pl-8 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
                  required
                />
                <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Role / Hak Akses
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'Panitia' | 'Admin')}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                <option value="Panitia">Panitia (Akses Terbatas)</option>
                <option value="Admin">Administrator (Akses Penuh)</option>
              </select>
              <p className="text-[10px] text-neutral-400 mt-1">
                *Role <strong>Panitia</strong> tidak memiliki akses untuk mensinkronisasi data ke Google Sheets.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>Daftarkan Akun</span>
            </button>
          </form>
        </div>

        {/* User Account List */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono">Daftar Pengguna Aktif ({users.length})</h3>
            <button
              onClick={fetchUsers}
              className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-neutral-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-[10px] text-neutral-400 font-mono">Memuat database akun...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 font-mono">
              Tidak ada data akun yang ditemukan.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                      u.role === 'Admin' 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    }`}>
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-neutral-800">{u.username}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase font-mono ${
                          u.role === 'Admin'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">
                        Password: <strong className="text-neutral-600 font-semibold">{u.password}</strong>
                      </span>
                    </div>
                  </div>

                  {u.username !== 'admin' ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Hapus Akun"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-neutral-300 font-mono italic px-2.5">Sistem</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
