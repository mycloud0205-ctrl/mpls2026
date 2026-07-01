import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Calendar, Award, Database, LogOut, 
  Menu, X, KeyRound, User as UserIcon, Shield 
} from 'lucide-react';

import { User, ParticipantRanked } from './types';
import Login from './components/Login';
import DashboardView from './components/DashboardView';
import PesertaManager from './components/PesertaManager';
import KegiatanManager from './components/KegiatanManager';
import PointInput from './components/PointInput';
import RekapNilai from './components/RekapNilai';
import SertifikatView from './components/SertifikatView';
import AppsScriptCode from './components/AppsScriptCode';
import SiswaDashboard from './components/SiswaDashboard';
import UserManager from './components/UserManager';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCertPeserta, setSelectedCertPeserta] = useState<ParticipantRanked | null>(null);

  // Initialize session from localStorage if present
  useEffect(() => {
    const savedUser = localStorage.getItem('mpls_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        if (u.role === 'Siswa') {
          setActiveTab('profile-siswa');
        } else {
          setActiveTab('dashboard');
        }
      } catch (e) {
        localStorage.removeItem('mpls_user');
      }
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('mpls_user', JSON.stringify(user));
    if (user.role === 'Siswa') {
      setActiveTab('profile-siswa');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mpls_user');
    setSelectedCertPeserta(null);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Sidebar navigation options
  const navItems = currentUser.role === 'Siswa'
    ? [
        { id: 'profile-siswa', label: 'Profil & Nilai Saya', icon: Award },
        { id: 'kegiatan-siswa', label: 'Agenda Kegiatan', icon: Calendar }
      ]
    : currentUser.role === 'Admin'
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'peserta', label: 'Data Peserta', icon: Users },
        { id: 'kegiatan', label: 'Agenda Kegiatan', icon: Calendar },
        { id: 'point', label: 'Input Poin', icon: Award },
        { id: 'rekap', label: 'Rekap & Sertifikat', icon: Award },
        { id: 'users', label: 'Pengaturan User', icon: Shield },
        { id: 'sheets', label: 'Spreadsheet Sync', icon: Database }
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'peserta', label: 'Data Peserta', icon: Users },
        { id: 'kegiatan', label: 'Agenda Kegiatan', icon: Calendar },
        { id: 'point', label: 'Input Poin', icon: Award },
        { id: 'rekap', label: 'Rekap & Sertifikat', icon: Award }
      ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans text-neutral-800">
      {/* Top Navbar */}
      <header className="bg-indigo-950 text-white shadow-md px-6 py-4 flex justify-between items-center z-20 shrink-0 no-print">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-indigo-900 rounded-lg transition-colors focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-extrabold text-lg tracking-tight">
              MPLS SMKN 2 Baleendah
            </h1>
            <p className="text-[10px] text-indigo-300 font-mono tracking-wider uppercase">
              Sistem Penilaian &amp; Sertifikasi &bull; Panel {currentUser.role}
            </p>
          </div>
        </div>

        {/* User Session Profile Header */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold block">{currentUser.username}</span>
            <span className="text-[10px] text-indigo-300 font-mono">{currentUser.role}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-800 flex items-center justify-center border border-indigo-700">
            <UserIcon className="w-4 h-4 text-indigo-200" />
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar Drawer */}
        <aside className={`bg-white border-r border-neutral-200 z-10 transition-all duration-300 flex flex-col justify-between shrink-0 no-print ${
          isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-none'
        }`}>
          {/* Menu Items */}
          <nav className="p-4 space-y-1.5">
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 mb-2">
              Menu Utama
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-150'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === item.id ? 'text-indigo-600' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Logged-in Profile */}
          <div className="p-4 border-t border-neutral-100 bg-neutral-50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.username[0].toUpperCase()}
                </div>
                <div className="max-w-[120px]">
                  <span className="text-xs font-bold text-neutral-800 block truncate">{currentUser.username}</span>
                  <span className="text-[10px] text-neutral-400 block font-mono">{currentUser.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-all"
                title="Keluar Aplikasi"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Dynamic Main Page Content View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-neutral-50 z-0">
          <div className="max-w-6xl mx-auto">
             {activeTab === 'profile-siswa' && currentUser.role === 'Siswa' && (
               <SiswaDashboard 
                 currentUser={currentUser} 
                 onOpenSertifikat={(p) => setSelectedCertPeserta(p)} 
               />
             )}
             {activeTab === 'kegiatan-siswa' && currentUser.role === 'Siswa' && (
               <KegiatanManager userRole={currentUser.role} />
             )}
             {activeTab === 'dashboard' && (
               <DashboardView onNavigate={(tab) => setActiveTab(tab)} userRole={currentUser.role} />
             )}
             {activeTab === 'peserta' && (
               <PesertaManager userRole={currentUser.role} />
             )}
             {activeTab === 'kegiatan' && (
               <KegiatanManager userRole={currentUser.role} />
             )}
             {activeTab === 'point' && (
               <PointInput currentUser={currentUser} />
             )}
             {activeTab === 'rekap' && (
               <RekapNilai onViewSertifikat={(p) => setSelectedCertPeserta(p)} />
             )}
             {activeTab === 'users' && currentUser.role === 'Admin' && (
               <UserManager />
             )}
             {activeTab === 'sheets' && (
               <AppsScriptCode />
             )}
          </div>
        </main>
      </div>

      {/* Floating Certificate Modal Overlay */}
      {selectedCertPeserta && (
        <SertifikatView 
          peserta={selectedCertPeserta} 
          onClose={() => setSelectedCertPeserta(null)} 
        />
      )}
    </div>
  );
}
