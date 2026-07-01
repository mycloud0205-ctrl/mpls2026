export interface User {
  id: string;
  username: string;
  role: 'Admin' | 'Panitia' | 'Siswa';
  pesertaId?: string;
}

export interface Peserta {
  id: string;
  no_peserta: string;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  jk: 'L' | 'P';
  status: 'Aktif' | 'Tidak Aktif';
}

export interface Kegiatan {
  id: string;
  nama_kegiatan: string;
  deskripsi: string;
  tanggal: string;
  poin: number;
  jenis: string;
  status: 'Aktif' | 'Tidak Aktif';
}

export interface PointEntry {
  id: string;
  id_peserta: string;
  id_kegiatan: string;
  poin: number;
  catatan: string;
  tanggal_input: string;
  input_by: string;
  nama_kegiatan?: string; // resolved in backend for easy consumption
}

export interface ParticipantRanked extends Peserta {
  totalPoints: number;
  statusLulus: 'Lulus' | 'Tidak Lulus';
  rank: number;
  history: PointEntry[];
}

export interface ChartData {
  name: string;
  'Rata-rata Poin': number;
  'Total Poin': number;
  'Jumlah Peserta': number;
}

export interface TopPeserta {
  nama: string;
  kelas: string;
  poin: number;
}

export interface DashboardAnalytics {
  totalPeserta: number;
  totalKegiatan: number;
  totalPoinGiven: number;
  chartJurusan: ChartData[];
  topPeserta: TopPeserta[];
}
