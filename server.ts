import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Database file path in workspace root
const DB_FILE = path.join(process.cwd(), 'db.json');

// Interface Declarations
interface User {
  id: string;
  username: string;
  password?: string;
  role: 'Admin' | 'Panitia' | 'Siswa';
  pesertaId?: string;
}

interface Peserta {
  id: string;
  no_peserta: string;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  jk: 'L' | 'P';
  status: 'Aktif' | 'Tidak Aktif';
}

interface Kegiatan {
  id: string;
  nama_kegiatan: string;
  deskripsi: string;
  tanggal: string;
  poin: number;
  jenis: string; // e.g., Wajib, Pilihan, Kedisiplinan
  status: 'Aktif' | 'Tidak Aktif';
}

interface PointEntry {
  id: string;
  id_peserta: string;
  id_kegiatan: string;
  poin: number;
  catatan: string;
  tanggal_input: string;
  input_by: string;
}

interface Database {
  users: User[];
  peserta: Peserta[];
  kegiatan: Kegiatan[];
  points: PointEntry[];
  settings?: {
    googleSheetsUrl?: string;
  };
}

// Initial Database Seeding
function getInitialData(): Database {
  return {
    users: [
      { id: 'u1', username: 'admin', password: 'admin123', role: 'Admin' },
      { id: 'u2', username: 'panitia', password: 'panitia123', role: 'Panitia' }
    ],
    peserta: [
      { id: 'p1', no_peserta: 'MPLS-001', nisn: '0081234567', nama: 'Ahmad Fauzi', kelas: 'X RPL 1', jurusan: 'RPL', jk: 'L', status: 'Aktif' },
      { id: 'p2', no_peserta: 'MPLS-002', nisn: '0082345678', nama: 'Siti Rahmawati', kelas: 'X TKJ 2', jurusan: 'TKJ', jk: 'P', status: 'Aktif' },
      { id: 'p3', no_peserta: 'MPLS-003', nisn: '0083456789', nama: 'Budi Santoso', kelas: 'X DKV 1', jurusan: 'DKV', jk: 'L', status: 'Aktif' },
      { id: 'p4', no_peserta: 'MPLS-004', nisn: '0084567890', nama: 'Dewi Lestari', kelas: 'X TITL 1', jurusan: 'TITL', jk: 'P', status: 'Aktif' },
      { id: 'p5', no_peserta: 'MPLS-005', nisn: '0085678901', nama: 'Fajar Ramadhan', kelas: 'X TPFL 2', jurusan: 'TPFL', jk: 'L', status: 'Aktif' },
      { id: 'p6', no_peserta: 'MPLS-006', nisn: '0086789012', nama: 'Chandra Wijaya', kelas: 'X RPL 2', jurusan: 'RPL', jk: 'L', status: 'Aktif' },
      { id: 'p7', no_peserta: 'MPLS-007', nisn: '0087890123', nama: 'Anisa Fitriani', kelas: 'X TKJ 1', jurusan: 'TKJ', jk: 'P', status: 'Aktif' }
    ],
    kegiatan: [
      { id: 'k1', nama_kegiatan: 'Upacara Pembukaan & Apel Pagi', deskripsi: 'Mengikuti upacara pembukaan MPLS dengan khidmat dan disiplin.', tanggal: '2026-07-20', poin: 20, jenis: 'Wajib', status: 'Aktif' },
      { id: 'k2', nama_kegiatan: 'Materi Wawasan Wiyata Mandala', deskripsi: 'Pemaparan materi lingkungan sekolah, visi misi, dan budaya belajar.', tanggal: '2026-07-20', poin: 30, jenis: 'Wajib', status: 'Aktif' },
      { id: 'k3', nama_kegiatan: 'Pengenalan Ekstrakurikuler', deskripsi: 'Menghadiri demo dan presentasi ekstrakurikuler SMKN 2 Baleendah.', tanggal: '2026-07-21', poin: 25, jenis: 'Pilihan', status: 'Aktif' },
      { id: 'k4', nama_kegiatan: 'PBB & Pembinaan Karakter', deskripsi: 'Latihan baris-berbaris dan penegakan kedisiplinan bersama panitia.', tanggal: '2026-07-22', poin: 35, jenis: 'Wajib', status: 'Aktif' },
      { id: 'k5', nama_kegiatan: 'Kreativitas & Seni (Inaugurasi)', deskripsi: 'Menampilkan bakat atau yel-yel kelompok pada acara penutupan.', tanggal: '2026-07-22', poin: 20, jenis: 'Pilihan', status: 'Aktif' }
    ],
    points: [
      { id: 'po1', id_peserta: 'p1', id_kegiatan: 'k1', poin: 20, catatan: 'Hadir tepat waktu dan rapi', tanggal_input: '2026-07-20T08:00:00Z', input_by: 'panitia' },
      { id: 'po2', id_peserta: 'p1', id_kegiatan: 'k2', poin: 30, catatan: 'Sangat aktif bertanya saat sesi tanya jawab', tanggal_input: '2026-07-20T11:30:00Z', input_by: 'panitia' },
      { id: 'po3', id_peserta: 'p2', id_kegiatan: 'k1', poin: 20, catatan: 'Mengikuti dengan baik', tanggal_input: '2026-07-20T08:05:00Z', input_by: 'panitia' }
    ],
    settings: {
      googleSheetsUrl: ''
    }
  };
}

// Read database from file
function readDb(): Database {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading DB, returning initial data:', error);
    return getInitialData();
  }
}

// Custom fetch helper to handle Google Apps Script 302 redirects with POST body preservation
async function fetchWithRedirects(url: string, options: any = {}): Promise<Response> {
  const maxRedirects = 5;
  let currentUrl = url;
  let redirectCount = 0;

  while (redirectCount < maxRedirects) {
    const res = await fetch(currentUrl, {
      ...options,
      redirect: 'manual'
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        return res;
      }
      currentUrl = location;
      redirectCount++;
      continue;
    }

    return res;
  }
  throw new Error('Terlalu banyak pengalihan (Too many redirects)');
}

// Trigger real-time background synchronization to Google Sheets Web App
function triggerBackgroundSync(db: Database) {
  const url = db.settings?.googleSheetsUrl;
  if (!url) return;
  
  fetchWithRedirects(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'syncAll',
      data: {
        users: db.users,
        peserta: db.peserta,
        kegiatan: db.kegiatan,
        points: db.points
      }
    })
  }).then(res => {
    if (res.ok) {
      console.log('Real-time background sync with Google Sheets succeeded!');
    } else {
      console.error('Real-time background sync failed with status:', res.status);
    }
  }).catch(err => {
    console.error('Real-time background sync error:', err);
  });
}

// Write database to file
function writeDb(data: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    // Trigger real-time background sync to Google Sheets
    triggerBackgroundSync(data);
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  // 1. Authentication
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDb();
    
    // 1. Check standard admin / panitia users
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      return res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    }

    // 2. Check if it matches a Peserta (Siswa) using no_peserta and nisn
    const pes = db.peserta.find(p => p.no_peserta.toLowerCase() === username.trim().toLowerCase() && p.nisn.trim() === password.trim());
    if (pes) {
      return res.json({
        success: true,
        user: {
          id: pes.id,
          username: pes.nama, // Display student's name
          role: 'Siswa',
          pesertaId: pes.id
        }
      });
    }

    res.status(401).json({
      success: false,
      message: 'Username atau Password salah! (Siswa login dengan No. Peserta & Password NISN)'
    });
  });

  // 1.5. User Management CRUD (for Admin)
  app.get('/api/users', (req, res) => {
    const db = readDb();
    res.json(db.users);
  });

  app.post('/api/users', (req, res) => {
    const db = readDb();
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Username, password, dan role wajib diisi!' });
    }

    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ success: false, message: `Username "${username}" sudah digunakan!` });
    }

    const newUser = {
      id: 'u_' + Date.now(),
      username,
      password,
      role
    };

    db.users.push(newUser);
    writeDb(db);
    triggerBackgroundSync(db);
    res.json({ success: true, user: newUser });
  });

  app.delete('/api/users/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;

    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan!' });
    }

    const userToDelete = db.users[userIndex];
    if (userToDelete.username === 'admin') {
      return res.status(400).json({ success: false, message: 'User admin bawaan tidak dapat dihapus!' });
    }

    db.users.splice(userIndex, 1);
    writeDb(db);
    triggerBackgroundSync(db);
    res.json({ success: true, message: 'User berhasil dihapus' });
  });

  // 2. Peserta CRUD
  app.get('/api/peserta', (req, res) => {
    const db = readDb();
    res.json(db.peserta);
  });

  app.post('/api/peserta', (req, res) => {
    const db = readDb();
    const { no_peserta, nisn, nama, kelas, jurusan, jk, status } = req.body;

    if (!no_peserta || !nisn || !nama || !kelas || !jurusan || !jk) {
      return res.status(400).json({ success: false, message: 'Semua data wajib diisi!' });
    }

    // Check unique no_peserta & nisn
    if (db.peserta.some(p => p.no_peserta === no_peserta)) {
      return res.status(400).json({ success: false, message: `Nomor Peserta ${no_peserta} sudah terdaftar!` });
    }
    if (db.peserta.some(p => p.nisn === nisn)) {
      return res.status(400).json({ success: false, message: `NISN ${nisn} sudah terdaftar!` });
    }

    const newPeserta: Peserta = {
      id: 'p_' + Date.now(),
      no_peserta,
      nisn,
      nama,
      kelas,
      jurusan,
      jk,
      status: status || 'Aktif'
    };

    db.peserta.push(newPeserta);
    writeDb(db);
    res.json({ success: true, data: newPeserta });
  });

  app.put('/api/peserta/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const index = db.peserta.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Peserta tidak ditemukan!' });
    }

    const { no_peserta, nisn, nama, kelas, jurusan, jk, status } = req.body;

    // Check unique constraints for other entries
    if (db.peserta.some(p => p.id !== id && p.no_peserta === no_peserta)) {
      return res.status(400).json({ success: false, message: 'Nomor Peserta sudah digunakan!' });
    }
    if (db.peserta.some(p => p.id !== id && p.nisn === nisn)) {
      return res.status(400).json({ success: false, message: 'NISN sudah digunakan!' });
    }

    db.peserta[index] = {
      ...db.peserta[index],
      no_peserta: no_peserta || db.peserta[index].no_peserta,
      nisn: nisn || db.peserta[index].nisn,
      nama: nama || db.peserta[index].nama,
      kelas: kelas || db.peserta[index].kelas,
      jurusan: jurusan || db.peserta[index].jurusan,
      jk: jk || db.peserta[index].jk,
      status: status || db.peserta[index].status
    };

    writeDb(db);
    res.json({ success: true, data: db.peserta[index] });
  });

  app.delete('/api/peserta/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const index = db.peserta.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Peserta tidak ditemukan!' });
    }

    // Delete peserta
    db.peserta.splice(index, 1);
    // Cascade delete point entries
    db.points = db.points.filter(pt => pt.id_peserta !== id);

    writeDb(db);
    res.json({ success: true, message: 'Peserta dan riwayat poin berhasil dihapus!' });
  });

  // Bulk Import Peserta
  app.post('/api/peserta/import', (req, res) => {
    const db = readDb();
    const { dataList } = req.body; // Array of Peserta input

    if (!Array.isArray(dataList)) {
      return res.status(400).json({ success: false, message: 'Format data import salah!' });
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const item of dataList) {
      const { no_peserta, nisn, nama, kelas, jurusan, jk, status } = item;
      
      // Clean inputs
      if (!no_peserta || !nisn || !nama || !kelas || !jurusan || !jk) {
        skippedCount++;
        continue;
      }

      // Check duplicate in memory & file
      const isDupe = db.peserta.some(p => p.no_peserta === String(no_peserta).trim() || p.nisn === String(nisn).trim());
      if (isDupe) {
        skippedCount++;
        continue;
      }

      const newP: Peserta = {
        id: 'p_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
        no_peserta: String(no_peserta).trim(),
        nisn: String(nisn).trim(),
        nama: String(nama).trim(),
        kelas: String(kelas).trim(),
        jurusan: String(jurusan).trim().toUpperCase(),
        jk: (String(jk).trim().toUpperCase().startsWith('L') || String(jk).trim() === 'Laki-laki') ? 'L' : 'P',
        status: (String(status).trim() === 'Tidak Aktif') ? 'Tidak Aktif' : 'Aktif'
      };

      db.peserta.push(newP);
      addedCount++;
    }

    writeDb(db);
    res.json({ success: true, addedCount, skippedCount });
  });

  // 3. Kegiatan CRUD
  app.get('/api/kegiatan', (req, res) => {
    const db = readDb();
    res.json(db.kegiatan);
  });

  app.post('/api/kegiatan', (req, res) => {
    const db = readDb();
    const { nama_kegiatan, deskripsi, tanggal, poin, jenis, status } = req.body;

    if (!nama_kegiatan || !tanggal || poin === undefined || !jenis) {
      return res.status(400).json({ success: false, message: 'Semua data kegiatan wajib diisi!' });
    }

    const newKegiatan: Kegiatan = {
      id: 'k_' + Date.now(),
      nama_kegiatan,
      deskripsi: deskripsi || '',
      tanggal,
      poin: Number(poin),
      jenis,
      status: status || 'Aktif'
    };

    db.kegiatan.push(newKegiatan);
    writeDb(db);
    res.json({ success: true, data: newKegiatan });
  });

  app.put('/api/kegiatan/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const index = db.kegiatan.findIndex(k => k.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan!' });
    }

    const { nama_kegiatan, deskripsi, tanggal, poin, jenis, status } = req.body;

    db.kegiatan[index] = {
      ...db.kegiatan[index],
      nama_kegiatan: nama_kegiatan || db.kegiatan[index].nama_kegiatan,
      deskripsi: deskripsi !== undefined ? deskripsi : db.kegiatan[index].deskripsi,
      tanggal: tanggal || db.kegiatan[index].tanggal,
      poin: poin !== undefined ? Number(poin) : db.kegiatan[index].poin,
      jenis: jenis || db.kegiatan[index].jenis,
      status: status || db.kegiatan[index].status
    };

    writeDb(db);
    res.json({ success: true, data: db.kegiatan[index] });
  });

  app.delete('/api/kegiatan/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const index = db.kegiatan.findIndex(k => k.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan!' });
    }

    db.kegiatan.splice(index, 1);
    // Cascade delete points earned from this activity
    db.points = db.points.filter(pt => pt.id_kegiatan !== id);

    writeDb(db);
    res.json({ success: true, message: 'Kegiatan berhasil dihapus!' });
  });

  // 4. Points Input & History
  app.get('/api/points', (req, res) => {
    const db = readDb();
    res.json(db.points);
  });

  app.post('/api/points', (req, res) => {
    const db = readDb();
    const { id_peserta, id_kegiatan, poin, catatan, input_by, preventDuplicate } = req.body;

    if (!id_peserta || !id_kegiatan || poin === undefined) {
      return res.status(400).json({ success: false, message: 'Peserta, kegiatan, dan poin wajib diisi!' });
    }

    // Check duplicate if setting is enabled
    if (preventDuplicate) {
      const exists = db.points.some(p => p.id_peserta === id_peserta && p.id_kegiatan === id_kegiatan);
      if (exists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Poin untuk kegiatan ini sudah pernah diinput untuk peserta ini!' 
        });
      }
    }

    const newPoint: PointEntry = {
      id: 'pt_' + Date.now(),
      id_peserta,
      id_kegiatan,
      poin: Number(poin),
      catatan: catatan || '',
      tanggal_input: new Date().toISOString(),
      input_by: input_by || 'Panitia'
    };

    db.points.push(newPoint);
    writeDb(db);
    res.json({ success: true, data: newPoint });
  });

  app.delete('/api/points/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const index = db.points.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Riwayat poin tidak ditemukan!' });
    }

    db.points.splice(index, 1);
    writeDb(db);
    res.json({ success: true, message: 'Riwayat perolehan poin dibatalkan/dihapus!' });
  });

  // 5. Ranking and Certificate status computation
  app.get('/api/ranking', (req, res) => {
    const db = readDb();
    
    // Map peserta to compute their points
    const mapped = db.peserta.map(p => {
      // Find all points for this participant
      const pHistory = db.points.filter(pt => pt.id_peserta === p.id);
      const totalPoints = pHistory.reduce((acc, curr) => acc + curr.poin, 0);
      const statusLulus = totalPoints >= 100 ? 'Lulus' : 'Tidak Lulus';

      return {
        ...p,
        totalPoints,
        statusLulus,
        history: pHistory.map(pt => {
          const act = db.kegiatan.find(k => k.id === pt.id_kegiatan);
          return {
            ...pt,
            nama_kegiatan: act ? act.nama_kegiatan : 'Kegiatan Tidak Diketahui'
          };
        })
      };
    });

    // Sort by totalPoints descending
    mapped.sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign ranking (handles same points getting same rank)
    let currentRank = 0;
    let lastPoints = -1;
    const ranked = mapped.map((item, idx) => {
      if (item.totalPoints !== lastPoints) {
        currentRank = idx + 1;
        lastPoints = item.totalPoints;
      }
      return {
        ...item,
        rank: currentRank
      };
    });

    res.json(ranked);
  });

  // 5.1 Student self-profile endpoint
  app.get('/api/siswa/profile/:pesertaId', (req, res) => {
    const { pesertaId } = req.params;
    const db = readDb();
    
    // Find the participant
    const pes = db.peserta.find(p => p.id === pesertaId);
    if (!pes) {
      return res.status(404).json({ success: false, message: 'Data peserta tidak ditemukan!' });
    }

    // Map all peserta to compute rankings
    const mapped = db.peserta.map(p => {
      const pHistory = db.points.filter(pt => pt.id_peserta === p.id);
      const totalPoints = pHistory.reduce((acc, curr) => acc + curr.poin, 0);
      return {
        id: p.id,
        totalPoints
      };
    });

    // Sort by totalPoints descending
    mapped.sort((a, b) => b.totalPoints - a.totalPoints);

    // Find rank of the current student
    let rank = 1;
    let currentRank = 0;
    let lastPoints = -1;
    for (let i = 0; i < mapped.length; i++) {
      if (mapped[i].totalPoints !== lastPoints) {
        currentRank = i + 1;
        lastPoints = mapped[i].totalPoints;
      }
      if (mapped[i].id === pesertaId) {
        rank = currentRank;
        break;
      }
    }

    // Get current student's points and history
    const history = db.points
      .filter(pt => pt.id_peserta === pesertaId)
      .map(pt => {
        const act = db.kegiatan.find(k => k.id === pt.id_kegiatan);
        return {
          ...pt,
          nama_kegiatan: act ? act.nama_kegiatan : 'Kegiatan Tidak Diketahui'
        };
      });

    // Sort history by date descending
    history.sort((a, b) => new Date(b.tanggal_input).getTime() - new Date(a.tanggal_input).getTime());

    const totalPoints = history.reduce((acc, curr) => acc + curr.poin, 0);
    const statusLulus = totalPoints >= 100 ? 'Lulus' : 'Tidak Lulus';

    res.json({
      ...pes,
      totalPoints,
      statusLulus,
      rank,
      history
    });
  });

  // 6. Dashboard metrics
  app.get('/api/analytics', (req, res) => {
    const db = readDb();
    const totalPeserta = db.peserta.length;
    const totalKegiatan = db.kegiatan.length;
    const totalPoinGiven = db.points.reduce((acc, pt) => acc + pt.poin, 0);

    // Compute chart data: Average point per Jurusan
    const jurusanStats: Record<string, { totalPoints: number; count: number }> = {};
    db.peserta.forEach(p => {
      const jur = p.jurusan;
      const pts = db.points.filter(pt => pt.id_peserta === p.id).reduce((acc, curr) => acc + curr.poin, 0);
      if (!jurusanStats[jur]) {
        jurusanStats[jur] = { totalPoints: 0, count: 0 };
      }
      jurusanStats[jur].totalPoints += pts;
      jurusanStats[jur].count += 1;
    });

    const chartJurusan = Object.entries(jurusanStats).map(([name, stat]) => ({
      name,
      'Rata-rata Poin': stat.count > 0 ? parseFloat((stat.totalPoints / stat.count).toFixed(1)) : 0,
      'Total Poin': stat.totalPoints,
      'Jumlah Peserta': stat.count
    }));

    // Top 5 Peserta perolehan tertinggi
    const pesertaPoints = db.peserta.map(p => {
      const pts = db.points.filter(pt => pt.id_peserta === p.id).reduce((acc, curr) => acc + curr.poin, 0);
      return { nama: p.nama, kelas: p.kelas, poin: pts };
    });
    pesertaPoints.sort((a, b) => b.poin - a.poin);
    const topPeserta = pesertaPoints.slice(0, 5);

    res.json({
      totalPeserta,
      totalKegiatan,
      totalPoinGiven,
      chartJurusan,
      topPeserta
    });
  });

  // 7. Google Apps Script Code Provider (for user copy/paste)
  app.get('/api/sheets-code', (req, res) => {
    const codeGs = `/**
 * Google Apps Script Backend for MPLS SMKN 2 Baleendah
 * 
 * Instructions:
 * 1. Create a new Google Spreadsheet (you can leave it completely blank!).
 * 2. Open Extensions > Apps Script.
 * 3. Replace Code.gs with this code.
 * 4. Save and Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (Required so the web app can sync)
 * 5. Copy the Web App URL and paste it in the Web App Sync settings of this App!
 */

const SCHEMA = {
  "Users": ["id", "username", "password", "role"],
  "Peserta": ["id", "no_peserta", "nisn", "nama", "kelas", "jurusan", "jk", "status"],
  "Kegiatan": ["id", "nama_kegiatan", "deskripsi", "tanggal", "poin", "jenis", "status"],
  "Point": ["id", "id_peserta", "id_kegiatan", "poin", "catatan", "tanggal_input", "input_by"]
};

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  if (sheet.getLastColumn() === 0) {
    const headers = SCHEMA[sheetName];
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return sheet;
}

function doGet(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput("Koneksi API Google Sheets Aktif! Silakan hubungkan dari dashboard aplikasi web Anda.");
  }
  const action = e.parameter.action;
  
  try {
    if (action === "getPeserta") {
      return jsonResponse(readSheetData("Peserta"));
    } else if (action === "getKegiatan") {
      return jsonResponse(readSheetData("Kegiatan"));
    } else if (action === "getPoint") {
      return jsonResponse(readSheetData("Point"));
    } else if (action === "getRanking") {
      return jsonResponse(calculateRankings());
    } else {
      return jsonResponse({ success: false, message: "Action not found" });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, message: "Peringatan: Script harus dipanggil melalui API Web App (HTTP POST)." });
    }
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    
    if (action === "login") {
      return handleLogin(postData.username, postData.password);
    } else if (action === "tambahPeserta") {
      return addRecord("Peserta", postData.data);
    } else if (action === "editPeserta") {
      return editRecord("Peserta", postData.id, postData.data);
    } else if (action === "hapusPeserta") {
      return deleteRecord("Peserta", postData.id);
    } else if (action === "tambahKegiatan") {
      return addRecord("Kegiatan", postData.data);
    } else if (action === "editKegiatan") {
      return editRecord("Kegiatan", postData.id, postData.data);
    } else if (action === "hapusKegiatan") {
      return deleteRecord("Kegiatan", postData.id);
    } else if (action === "inputPoint") {
      return addRecord("Point", postData.data);
    } else if (action === "syncAll") {
      const data = postData.data;
      if (data.users) writeSheetData("Users", data.users);
      if (data.peserta) writeSheetData("Peserta", data.peserta);
      if (data.kegiatan) writeSheetData("Kegiatan", data.kegiatan);
      if (data.points) writeSheetData("Point", data.points);
      return jsonResponse({ success: true, message: "Seluruh data berhasil disinkronisasi ke Google Sheets!" });
    } else {
      return jsonResponse({ success: false, message: "Action not found" });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function readSheetData(sheetName) {
  const sheet = getOrCreateSheet(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  
  const rows = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = rows[0];
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    headers.forEach((h, idx) => {
      if (h) {
        obj[h] = row[idx];
      }
    });
    data.push(obj);
  }
  return data;
}

function writeSheetData(sheetName, dataList) {
  const sheet = getOrCreateSheet(sheetName);
  
  // Clear everything after header row
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  if (!dataList || dataList.length === 0) return;
  
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rows = dataList.map(item => {
    return headers.map(h => {
      if (h === "id" && !item[h]) return "rec_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
      return item[h] !== undefined ? item[h] : "";
    });
  });
  
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function addRecord(sheetName, data) {
  const sheet = getOrCreateSheet(sheetName);
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const newRow = headers.map(h => {
    if (h === "id") return "rec_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
    if (h === "tanggal_input" || h === "tanggal") return data[h] || new Date().toISOString();
    return data[h] !== undefined ? data[h] : "";
  });
  sheet.appendRow(newRow);
  return jsonResponse({ success: true, message: "Record added successfully" });
}

function editRecord(sheetName, id, data) {
  const sheet = getOrCreateSheet(sheetName);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idColIdx = headers.indexOf("id");
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idColIdx] == id) {
      const rowNum = i + 1;
      headers.forEach((h, colIdx) => {
        if (h !== "id" && data[h] !== undefined) {
          sheet.getRange(rowNum, colIdx + 1).setValue(data[h]);
        }
      });
      return jsonResponse({ success: true, message: "Record updated successfully" });
    }
  }
  return jsonResponse({ success: false, message: "Record not found" });
}

function deleteRecord(sheetName, id) {
  const sheet = getOrCreateSheet(sheetName);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idColIdx = headers.indexOf("id");
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idColIdx] == id) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true, message: "Record deleted" });
    }
  }
  return jsonResponse({ success: false, message: "Record not found" });
}

function handleLogin(username, password) {
  const users = readSheetData("Users");
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    return jsonResponse({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  }
  return jsonResponse({ success: false, message: "Username/Password invalid" });
}

function calculateRankings() {
  const peserta = readSheetData("Peserta");
  const points = readSheetData("Point");
  
  return peserta.map(p => {
    const pHistory = points.filter(pt => pt.id_peserta == p.id);
    const totalPoints = pHistory.reduce((sum, curr) => sum + Number(curr.poin || 0), 0);
    return {
      ...p,
      totalPoints: totalPoints,
      statusLulus: totalPoints >= 100 ? "Lulus" : "Tidak Lulus"
    };
  }).sort((a,b) => b.totalPoints - a.totalPoints);
}
`;

    res.json({
      codeGs,
      sheetsStructure: {
        Users: ['id', 'username', 'password', 'role'],
        Peserta: ['id', 'no_peserta', 'nisn', 'nama', 'kelas', 'jurusan', 'jk', 'status'],
        Kegiatan: ['id', 'nama_kegiatan', 'deskripsi', 'tanggal', 'poin', 'jenis', 'status'],
        Point: ['id', 'id_peserta', 'id_kegiatan', 'poin', 'catatan', 'tanggal_input', 'input_by']
      }
    });
  });

  // GET Google Sheets Settings Web App URL
  app.get('/api/settings/sheets-url', (req, res) => {
    const db = readDb();
    res.json({ url: db.settings?.googleSheetsUrl || '' });
  });

  // POST save Google Sheets Settings Web App URL
  app.post('/api/settings/sheets-url', (req, res) => {
    const { url } = req.body;
    const db = readDb();
    if (!db.settings) {
      db.settings = {};
    }
    db.settings.googleSheetsUrl = url || '';
    writeDb(db);
    res.json({ success: true, message: 'URL Google Sheets berhasil disimpan!' });
  });

  // POST test connection to Google Sheets Web App
  app.post('/api/sync/test', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL Web App tidak boleh kosong!' });
    }

    try {
      const response = await fetchWithRedirects(`${url}?action=getPeserta`);
      if (response.ok) {
        res.json({ success: true, message: 'Koneksi ke Google Sheets Web App berhasil!' });
      } else {
        res.status(400).json({ success: false, message: `Server mengembalikan status: ${response.status}` });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: `Gagal menghubungi URL: ${err.message}` });
    }
  });

  // POST manually push all current data to Google Sheets
  app.post('/api/sync/push', async (req, res) => {
    const db = readDb();
    const url = db.settings?.googleSheetsUrl;
    if (!url) {
      return res.status(400).json({ success: false, message: 'Silakan konfigurasikan URL Google Sheets terlebih dahulu!' });
    }

    try {
      const response = await fetchWithRedirects(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'syncAll',
          data: {
            users: db.users,
            peserta: db.peserta,
            kegiatan: db.kegiatan,
            points: db.points
          }
        })
      });

      if (!response.ok) {
        return res.status(response.status).json({ success: false, message: `Gagal sinkronisasi. Status: ${response.status}` });
      }

      const result: any = await response.json();
      if (result && result.success) {
        res.json({ success: true, message: 'Semua data berhasil disinkronkan ke Google Spreadsheet!' });
      } else {
        res.status(400).json({ success: false, message: result?.message || 'Gagal sinkronisasi.' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: `Error sinkronisasi: ${err.message}` });
    }
  });

  // POST manually pull data from Google Sheets
  app.post('/api/sync/pull', async (req, res) => {
    const db = readDb();
    const url = db.settings?.googleSheetsUrl;
    if (!url) {
      return res.status(400).json({ success: false, message: 'Silakan konfigurasikan URL Google Sheets terlebih dahulu!' });
    }

    try {
      // Pull Peserta
      const resPeserta = await fetchWithRedirects(`${url}?action=getPeserta`);
      const dataPeserta: any = await resPeserta.json();

      // Pull Kegiatan
      const resKegiatan = await fetchWithRedirects(`${url}?action=getKegiatan`);
      const dataKegiatan: any = await resKegiatan.json();

      // Pull Points
      const resPoint = await fetchWithRedirects(`${url}?action=getPoint`);
      const dataPoint: any = await resPoint.json();

      if (Array.isArray(dataPeserta)) {
        db.peserta = dataPeserta.map((p: any) => ({
          id: p.id || 'p_' + Math.random().toString(36).substr(2, 9),
          no_peserta: p.no_peserta || '',
          nisn: p.nisn || '',
          nama: p.nama || '',
          kelas: p.kelas || '',
          jurusan: p.jurusan || '',
          jk: p.jk || 'L',
          status: p.status || 'Aktif'
        }));
      }

      if (Array.isArray(dataKegiatan)) {
        db.kegiatan = dataKegiatan.map((k: any) => ({
          id: k.id || 'k_' + Math.random().toString(36).substr(2, 9),
          nama_kegiatan: k.nama_kegiatan || '',
          deskripsi: k.deskripsi || '',
          tanggal: k.tanggal || '',
          poin: Number(k.poin || 0),
          jenis: k.jenis || '',
          status: k.status || 'Aktif'
        }));
      }

      if (Array.isArray(dataPoint)) {
        db.points = dataPoint.map((pt: any) => ({
          id: pt.id || 'pt_' + Math.random().toString(36).substr(2, 9),
          id_peserta: pt.id_peserta || '',
          id_kegiatan: pt.id_kegiatan || '',
          poin: Number(pt.poin || 0),
          catatan: pt.catatan || '',
          tanggal_input: pt.tanggal_input || new Date().toISOString(),
          input_by: pt.input_by || 'Panitia'
        }));
      }

      writeDb(db);
      res.json({ success: true, message: 'Berhasil menarik data terbaru dari Google Spreadsheet ke aplikasi!' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: `Error menarik data: ${err.message}` });
    }
  });

  // Vite middleware for development or serving compiled asset in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
