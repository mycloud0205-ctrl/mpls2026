<?php
/**
 * PHP Backend API Router for MPLS SMKN 2 Baleendah
 * Acts as a drop-in replacement for server.ts on standard shared hostings.
 * 
 * Instructions:
 * 1. Upload your built frontend static files (from 'dist' folder) to the root of your hosting (e.g. public_html).
 * 2. Upload this 'api.php' and the '.htaccess' file to the exact same folder.
 * 3. Make sure the folder is writable so 'db.json' can be created and updated.
 */

// Enable CORS if necessary
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('DB_FILE', __DIR__ . '/db.json');

// --- DATABASE FUNCTIONS ---

function getInitialData() {
    return [
        "users" => [
            ["id" => "u1", "username" => "admin", "password" => "admin123", "role" => "Admin"],
            ["id" => "u2", "username" => "panitia", "password" => "panitia123", "role" => "Panitia"]
        ],
        "peserta" => [
            ["id" => "p1", "no_peserta" => "MPLS-001", "nisn" => "0081234567", "nama" => "Ahmad Fauzi", "kelas" => "X RPL 1", "jurusan" => "RPL", "jk" => "L", "status" => "Aktif"],
            ["id" => "p2", "no_peserta" => "MPLS-002", "nisn" => "0082345678", "nama" => "Siti Rahmawati", "kelas" => "X TKJ 2", "jurusan" => "TKJ", "jk" => "P", "status" => "Aktif"],
            ["id" => "p3", "no_peserta" => "MPLS-003", "nisn" => "0083456789", "nama" => "Budi Santoso", "kelas" => "X DKV 1", "jurusan" => "DKV", "jk" => "L", "status" => "Aktif"],
            ["id" => "p4", "no_peserta" => "MPLS-004", "nisn" => "0084567890", "nama" => "Dewi Lestari", "kelas" => "X TITL 1", "jurusan" => "TITL", "jk" => "P", "status" => "Aktif"],
            ["id" => "p5", "no_peserta" => "MPLS-005", "nisn" => "0085678901", "nama" => "Fajar Ramadhan", "kelas" => "X TPFL 2", "jurusan" => "TPFL", "jk" => "L", "status" => "Aktif"],
            ["id" => "p6", "no_peserta" => "MPLS-006", "nisn" => "0086789012", "nama" => "Chandra Wijaya", "kelas" => "X RPL 2", "jurusan" => "RPL", "jk" => "L", "status" => "Aktif"],
            ["id" => "p7", "no_peserta" => "MPLS-007", "nisn" => "0087890123", "nama" => "Anisa Fitriani", "kelas" => "X TKJ 1", "jurusan" => "TKJ", "jk" => "P", "status" => "Aktif"]
        ],
        "kegiatan" => [
            ["id" => "k1", "nama_kegiatan" => "Upacara Pembukaan & Apel Pagi", "deskripsi" => "Mengikuti upacara pembukaan MPLS dengan khidmat dan disiplin.", "tanggal" => "2026-07-20", "poin" => 20, "jenis" => "Wajib", "status" => "Aktif"],
            ["id" => "k2", "nama_kegiatan" => "Materi Wawasan Wiyata Mandala", "deskripsi" => "Pemaparan materi lingkungan sekolah, visi misi, dan budaya belajar.", "tanggal" => "2026-07-20", "poin" => 30, "jenis" => "Wajib", "status" => "Aktif"],
            ["id" => "k3", "nama_kegiatan" => "Pengenalan Ekstrakurikuler", "deskripsi" => "Menghadiri demo dan presentasi ekstrakurikuler SMKN 2 Baleendah.", "tanggal" => "2026-07-21", "poin" => 25, "jenis" => "Pilihan", "status" => "Aktif"],
            ["id" => "k4", "nama_kegiatan" => "PBB & Pembinaan Karakter", "deskripsi" => "Latihan baris-berbaris dan penegakan kedisiplinan bersama panitia.", "tanggal" => "2026-07-22", "poin" => 35, "jenis" => "Wajib", "status" => "Aktif"],
            ["id" => "k5", "nama_kegiatan" => "Kreativitas & Seni (Inaugurasi)", "deskripsi" => "Menampilkan bakat atau yel-yel kelompok pada acara penutupan.", "tanggal" => "2026-07-22", "poin" => 20, "jenis" => "Pilihan", "status" => "Aktif"]
        ],
        "points" => [
            ["id" => "po1", "id_peserta" => "p1", "id_kegiatan" => "k1", "poin" => 20, "catatan" => "Hadir tepat waktu dan rapi", "tanggal_input" => "2026-07-20T08:00:00Z", "input_by" => "panitia"],
            ["id" => "po2", "id_peserta" => "p1", "id_kegiatan" => "k2", "poin" => 30, "catatan" => "Sangat aktif bertanya saat sesi tanya jawab", "tanggal_input" => "2026-07-20T11:30:00Z", "input_by" => "panitia"],
            ["id" => "po3", "id_peserta" => "p2", "id_kegiatan" => "k1", "poin" => 20, "catatan" => "Mengikuti dengan baik", "tanggal_input" => "2026-07-20T08:05:00Z", "input_by" => "panitia"]
        ],
        "settings" => [
            "googleSheetsUrl" => ""
        ]
    ];
}

function readDb() {
    if (!file_exists(DB_FILE)) {
        $initial = getInitialData();
        writeDb($initial);
        return $initial;
    }
    $raw = file_get_contents(DB_FILE);
    $data = json_decode($raw, true);
    if (!$data) {
        return getInitialData();
    }
    // Ensure all keys exist
    if (!isset($data['users'])) $data['users'] = [];
    if (!isset($data['peserta'])) $data['peserta'] = [];
    if (!isset($data['kegiatan'])) $data['kegiatan'] = [];
    if (!isset($data['points'])) $data['points'] = [];
    if (!isset($data['settings'])) $data['settings'] = ['googleSheetsUrl' => ''];
    return $data;
}

function writeDb($data) {
    file_put_contents(DB_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// --- GOOGLE SHEETS REDIRECT HANDLER (CURL) ---

function curlFetch($url, $method = 'GET', $payload = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Automatically handle 302 redirects
    curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return [
            'success' => false,
            'code' => 500,
            'message' => 'gURL Error: ' . $error
        ];
    }
    
    return [
        'success' => $httpCode >= 200 && $httpCode < 300,
        'code' => $httpCode,
        'body' => $response
    ];
}

// Automatically sync updates to Google Sheets in background
function triggerBackgroundSync($db) {
    $url = isset($db['settings']['googleSheetsUrl']) ? $db['settings']['googleSheetsUrl'] : '';
    if (empty($url)) return;

    // We do synchronous POST during the request for PHP because PHP lacks background threads natively,
    // or we can run it fast using curl. Since sync is fast, a direct curl is highly reliable.
    curlFetch($url, 'POST', [
        'action' => 'syncAll',
        'data' => [
            'users' => $db['users'],
            'peserta' => $db['peserta'],
            'kegiatan' => $db['kegiatan'],
            'points' => $db['points']
        ]
    ]);
}

// --- ROUTE PARSING ---

$method = $_SERVER['REQUEST_METHOD'];
$route = isset($_GET['_route']) ? trim($_GET['_route'], '/') : '';

// Parse request body for POST/PUT/DELETE
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// --- ROUTER DISPATCHER ---

switch (true) {
    // ---------------------------------------------
    // AUTHENTICATION
    // ---------------------------------------------
    case ($route === 'auth/login' && $method === 'POST'):
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';

        if (empty($username) || empty($password)) {
            jsonResponse(["success" => false, "message" => "Username dan Password wajib diisi!"], 400);
        }

        $db = readDb();
        
        // 1. Check standard admin/panitia
        foreach ($db['users'] as $u) {
            if (strcasecmp($u['username'], $username) === 0 && $u['password'] === $password) {
                jsonResponse([
                    "success" => true,
                    "user" => [
                        "id" => $u['id'],
                        "username" => $u['username'],
                        "role" => $u['role']
                    ]
                ]);
            }
        }

        // 2. Check Siswa login (username = no_peserta, password = nisn)
        foreach ($db['peserta'] as $p) {
            if ($p['no_peserta'] === $username && $p['nisn'] === $password) {
                jsonResponse([
                    "success" => true,
                    "user" => [
                        "id" => $p['id'],
                        "username" => $p['nama'],
                        "role" => "Siswa",
                        "pesertaId" => $p['id']
                    ]
                ]);
            }
        }

        jsonResponse(["success" => false, "message" => "Username atau Password salah! (Siswa login dengan No. Peserta & Password NISN)"], 401);
        break;

    // ---------------------------------------------
    // USERS MANAGEMENT
    // ---------------------------------------------
    case ($route === 'users' && $method === 'GET'):
        $db = readDb();
        jsonResponse($db['users']);
        break;

    case ($route === 'users' && $method === 'POST'):
        $db = readDb();
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        $role = isset($input['role']) ? $input['role'] : 'Panitia';

        if (empty($username) || empty($password) || empty($role)) {
            jsonResponse(["success" => false, "message" => "Username, password, dan role wajib diisi!"], 400);
        }

        foreach ($db['users'] as $u) {
            if (strcasecmp($u['username'], $username) === 0) {
                jsonResponse(["success" => false, "message" => "Username '{$username}' sudah digunakan!"], 400);
            }
        }

        $newUser = [
            "id" => "u_" . time(),
            "username" => $username,
            "password" => $password,
            "role" => $role
        ];

        $db['users'][] = $newUser;
        writeDb($db);
        triggerBackgroundSync($db);
        jsonResponse(["success" => true, "user" => $newUser]);
        break;

    case (preg_match('/^users\/([^\/]+)$/', $route, $matches) && $method === 'DELETE'):
        $id = $matches[1];
        $db = readDb();
        $foundIndex = -1;
        foreach ($db['users'] as $idx => $u) {
            if ($u['id'] === $id) {
                $foundIndex = $idx;
                break;
            }
        }

        if ($foundIndex === -1) {
            jsonResponse(["success" => false, "message" => "User tidak ditemukan!"], 404);
        }

        if ($db['users'][$foundIndex]['username'] === 'admin') {
            jsonResponse(["success" => false, "message" => "User admin bawaan tidak dapat dihapus!"], 400);
        }

        array_splice($db['users'], $foundIndex, 1);
        writeDb($db);
        triggerBackgroundSync($db);
        jsonResponse(["success" => true, "message" => "User berhasil dihapus"]);
        break;

    // ---------------------------------------------
    // PESERTA (PARTICIPANTS)
    // ---------------------------------------------
    case ($route === 'peserta' && $method === 'GET'):
        $db = readDb();
        jsonResponse($db['peserta']);
        break;

    case ($route === 'peserta' && $method === 'POST'):
        $db = readDb();
        $no_peserta = isset($input['no_peserta']) ? trim($input['no_peserta']) : '';
        $nisn = isset($input['nisn']) ? trim($input['nisn']) : '';
        $nama = isset($input['nama']) ? trim($input['nama']) : '';
        $kelas = isset($input['kelas']) ? trim($input['kelas']) : '';
        $jurusan = isset($input['jurusan']) ? trim($input['jurusan']) : '';
        $jk = isset($input['jk']) ? trim($input['jk']) : '';
        $status = isset($input['status']) ? trim($input['status']) : 'Aktif';

        if (empty($no_peserta) || empty($nisn) || empty($nama) || empty($kelas) || empty($jurusan) || empty($jk)) {
            jsonResponse(["success" => false, "message" => "Semua data wajib diisi!"], 400);
        }

        foreach ($db['peserta'] as $p) {
            if ($p['no_peserta'] === $no_peserta) {
                jsonResponse(["success" => false, "message" => "Nomor Peserta {$no_peserta} sudah terdaftar!"], 400);
            }
            if ($p['nisn'] === $nisn) {
                jsonResponse(["success" => false, "message" => "NISN {$nisn} sudah terdaftar!"], 400);
            }
        }

        $newPeserta = [
            "id" => "p_" . time(),
            "no_peserta" => $no_peserta,
            "nisn" => $nisn,
            "nama" => $nama,
            "kelas" => $kelas,
            "jurusan" => $jurusan,
            "jk" => $jk,
            "status" => $status
        ];

        $db['peserta'][] = $newPeserta;
        writeDb($db);
        jsonResponse(["success" => true, "data" => $newPeserta]);
        break;

    case (preg_match('/^peserta\/([^\/]+)$/', $route, $matches) && $method === 'PUT'):
        $id = $matches[1];
        $db = readDb();
        $foundIndex = -1;
        foreach ($db['peserta'] as $idx => $p) {
            if ($p['id'] === $id) {
                $foundIndex = $idx;
                break;
            }
        }

        if ($foundIndex === -1) {
            jsonResponse(["success" => false, "message" => "Peserta tidak ditemukan!"], 404);
        }

        $no_peserta = isset($input['no_peserta']) ? trim($input['no_peserta']) : '';
        $nisn = isset($input['nisn']) ? trim($input['nisn']) : '';
        $nama = isset($input['nama']) ? trim($input['nama']) : '';
        $kelas = isset($input['kelas']) ? trim($input['kelas']) : '';
        $jurusan = isset($input['jurusan']) ? trim($input['jurusan']) : '';
        $jk = isset($input['jk']) ? trim($input['jk']) : '';
        $status = isset($input['status']) ? trim($input['status']) : '';

        // Check unique
        foreach ($db['peserta'] as $p) {
            if ($p['id'] !== $id) {
                if ($p['no_peserta'] === $no_peserta) {
                    jsonResponse(["success" => false, "message" => "Nomor Peserta sudah digunakan!"], 400);
                }
                if ($p['nisn'] === $nisn) {
                    jsonResponse(["success" => false, "message" => "NISN sudah digunakan!"], 400);
                }
            }
        }

        if (!empty($no_peserta)) $db['peserta'][$foundIndex]['no_peserta'] = $no_peserta;
        if (!empty($nisn)) $db['peserta'][$foundIndex]['nisn'] = $nisn;
        if (!empty($nama)) $db['peserta'][$foundIndex]['nama'] = $nama;
        if (!empty($kelas)) $db['peserta'][$foundIndex]['kelas'] = $kelas;
        if (!empty($jurusan)) $db['peserta'][$foundIndex]['jurusan'] = $jurusan;
        if (!empty($jk)) $db['peserta'][$foundIndex]['jk'] = $jk;
        if (!empty($status)) $db['peserta'][$foundIndex]['status'] = $status;

        writeDb($db);
        jsonResponse(["success" => true, "data" => $db['peserta'][$foundIndex]]);
        break;

    case (preg_match('/^peserta\/([^\/]+)$/', $route, $matches) && $method === 'DELETE'):
        $id = $matches[1];
        $db = readDb();
        $foundIndex = -1;
        foreach ($db['peserta'] as $idx => $p) {
            if ($p['id'] === $id) {
                $foundIndex = $idx;
                break;
            }
        }

        if ($foundIndex === -1) {
            jsonResponse(["success" => false, "message" => "Peserta tidak ditemukan!"], 404);
        }

        array_splice($db['peserta'], $foundIndex, 1);
        
        // Cascade delete point entries
        $db['points'] = array_values(array_filter($db['points'], function($pt) use ($id) {
            return $pt['id_peserta'] !== $id;
        }));

        writeDb($db);
        jsonResponse(["success" => true, "message" => "Peserta dan riwayat poin berhasil dihapus!"]);
        break;

    case ($route === 'peserta/import' && $method === 'POST'):
        $db = readDb();
        $dataList = isset($input['dataList']) ? $input['dataList'] : [];

        if (!is_array($dataList)) {
            jsonResponse(["success" => false, "message" => "Format data import salah!"], 400);
        }

        $addedCount = 0;
        $skippedCount = 0;

        foreach ($dataList as $item) {
            $no_peserta = isset($item['no_peserta']) ? trim($item['no_peserta']) : '';
            $nisn = isset($item['nisn']) ? trim($item['nisn']) : '';
            $nama = isset($item['nama']) ? trim($item['nama']) : '';
            $kelas = isset($item['kelas']) ? trim($item['kelas']) : '';
            $jurusan = isset($item['jurusan']) ? trim($item['jurusan']) : '';
            $jk = isset($item['jk']) ? trim($item['jk']) : '';
            $status = isset($item['status']) ? trim($item['status']) : 'Aktif';

            if (empty($no_peserta) || empty($nisn) || empty($nama) || empty($kelas) || empty($jurusan) || empty($jk)) {
                $skippedCount++;
                continue;
            }

            // Check duplicate
            $isDupe = false;
            foreach ($db['peserta'] as $p) {
                if ($p['no_peserta'] === $no_peserta || $p['nisn'] === $nisn) {
                    $isDupe = true;
                    break;
                }
            }

            if ($isDupe) {
                $skippedCount++;
                continue;
            }

            // Normallize JK
            $cleanJk = 'P';
            $upperJk = strtoupper($jk);
            if (strpos($upperJk, 'L') === 0 || $jk === 'Laki-laki') {
                $cleanJk = 'L';
            }

            $db['peserta'][] = [
                "id" => "p_" . uniqid() . "_" . time(),
                "no_peserta" => $no_peserta,
                "nisn" => $nisn,
                "nama" => $nama,
                "kelas" => $kelas,
                "jurusan" => strtoupper($jurusan),
                "jk" => $cleanJk,
                "status" => ($status === 'Tidak Aktif') ? 'Tidak Aktif' : 'Aktif'
            ];
            $addedCount++;
        }

        writeDb($db);
        jsonResponse(["success" => true, "addedCount" => $addedCount, "skippedCount" => $skippedCount]);
        break;

    // ---------------------------------------------
    // KEGIATAN (ACTIVITIES)
    // ---------------------------------------------
    case ($route === 'kegiatan' && $method === 'GET'):
        $db = readDb();
        jsonResponse($db['kegiatan']);
        break;

    case ($route === 'kegiatan' && $method === 'POST'):
        $db = readDb();
        $nama_kegiatan = isset($input['nama_kegiatan']) ? trim($input['nama_kegiatan']) : '';
        $deskripsi = isset($input['deskripsi']) ? trim($input['deskripsi']) : '';
        $tanggal = isset($input['tanggal']) ? trim($input['tanggal']) : '';
        $poin = isset($input['poin']) ? (int)$input['poin'] : 0;
        $jenis = isset($input['jenis']) ? trim($input['jenis']) : '';
        $status = isset($input['status']) ? trim($input['status']) : 'Aktif';

        if (empty($nama_kegiatan) || empty($tanggal) || empty($jenis)) {
            jsonResponse(["success" => false, "message" => "Semua data kegiatan wajib diisi!"], 400);
        }

        $newKegiatan = [
            "id" => "k_" . time(),
            "nama_kegiatan" => $nama_kegiatan,
            "deskripsi" => $deskripsi,
            "tanggal" => $tanggal,
            "poin" => $poin,
            "jenis" => $jenis,
            "status" => $status
        ];

        $db['kegiatan'][] = $newKegiatan;
        writeDb($db);
        jsonResponse(["success" => true, "data" => $newKegiatan]);
        break;

    case (preg_match('/^kegiatan\/([^\/]+)$/', $route, $matches) && $method === 'PUT'):
        $id = $matches[1];
        $db = readDb();
        $foundIndex = -1;
        foreach ($db['kegiatan'] as $idx => $k) {
            if ($k['id'] === $id) {
                $foundIndex = $idx;
                break;
            }
        }

        if ($foundIndex === -1) {
            jsonResponse(["success" => false, "message" => "Kegiatan tidak ditemukan!"], 404);
        }

        $nama_kegiatan = isset($input['nama_kegiatan']) ? trim($input['nama_kegiatan']) : '';
        $deskripsi = isset($input['deskripsi']) ? trim($input['deskripsi']) : '';
        $tanggal = isset($input['tanggal']) ? trim($input['tanggal']) : '';
        $poin = isset($input['poin']) ? $input['poin'] : null;
        $jenis = isset($input['jenis']) ? trim($input['jenis']) : '';
        $status = isset($input['status']) ? trim($input['status']) : '';

        if (!empty($nama_kegiatan)) $db['kegiatan'][$foundIndex]['nama_kegiatan'] = $nama_kegiatan;
        if ($deskripsi !== null) $db['kegiatan'][$foundIndex]['deskripsi'] = $deskripsi;
        if (!empty($tanggal)) $db['kegiatan'][$foundIndex]['tanggal'] = $tanggal;
        if ($poin !== null) $db['kegiatan'][$foundIndex]['poin'] = (int)$poin;
        if (!empty($jenis)) $db['kegiatan'][$foundIndex]['jenis'] = $jenis;
        if (!empty($status)) $db['kegiatan'][$foundIndex]['status'] = $status;

        writeDb($db);
        jsonResponse(["success" => true, "data" => $db['kegiatan'][$foundIndex]]);
        break;

    case (preg_match('/^kegiatan\/([^\/]+)$/', $route, $matches) && $method === 'DELETE'):
        $id = $matches[1];
        $db = readDb();
        $foundIndex = -1;
        foreach ($db['kegiatan'] as $idx => $k) {
            if ($k['id'] === $id) {
                $foundIndex = $idx;
                break;
            }
        }

        if ($foundIndex === -1) {
            jsonResponse(["success" => false, "message" => "Kegiatan tidak ditemukan!"], 404);
        }

        array_splice($db['kegiatan'], $foundIndex, 1);
        
        // Cascade delete points earned from this activity
        $db['points'] = array_values(array_filter($db['points'], function($pt) use ($id) {
            return $pt['id_kegiatan'] !== $id;
        }));

        writeDb($db);
        jsonResponse(["success" => true, "message" => "Kegiatan berhasil dihapus!"]);
        break;

    // ---------------------------------------------
    // POINTS (SCORE LOGS)
    // ---------------------------------------------
    case ($route === 'points' && $method === 'GET'):
        $db = readDb();
        jsonResponse($db['points']);
        break;

    case ($route === 'points' && $method === 'POST'):
        $db = readDb();
        $id_peserta = isset($input['id_peserta']) ? $input['id_peserta'] : '';
        $id_kegiatan = isset($input['id_kegiatan']) ? $input['id_kegiatan'] : '';
        $poin = isset($input['poin']) ? (int)$input['poin'] : 0;
        $catatan = isset($input['catatan']) ? trim($input['catatan']) : '';
        $input_by = isset($input['input_by']) ? trim($input['input_by']) : 'Panitia';
        $preventDuplicate = isset($input['preventDuplicate']) ? (bool)$input['preventDuplicate'] : false;

        if (empty($id_peserta) || empty($id_kegiatan)) {
            jsonResponse(["success" => false, "message" => "Peserta, kegiatan, dan poin wajib diisi!"], 400);
        }

        if ($preventDuplicate) {
            foreach ($db['points'] as $pt) {
                if ($pt['id_peserta'] === $id_peserta && $pt['id_kegiatan'] === $id_kegiatan) {
                    jsonResponse(["success" => false, "message" => "Poin untuk kegiatan ini sudah pernah diinput untuk peserta ini!"], 400);
                }
            }
        }

        $newPoint = [
            "id" => "pt_" . time(),
            "id_peserta" => $id_peserta,
            "id_kegiatan" => $id_kegiatan,
            "poin" => $poin,
            "catatan" => $catatan,
            "tanggal_input" => date('c'), // ISO8601
            "input_by" => $input_by
        ];

        $db['points'][] = $newPoint;
        writeDb($db);
        jsonResponse(["success" => true, "data" => $newPoint]);
        break;

    case (preg_match('/^points\/([^\/]+)$/', $route, $matches) && $method === 'DELETE'):
        $id = $matches[1];
        $db = readDb();
        $foundIndex = -1;
        foreach ($db['points'] as $idx => $pt) {
            if ($pt['id'] === $id) {
                $foundIndex = $idx;
                break;
            }
        }

        if ($foundIndex === -1) {
            jsonResponse(["success" => false, "message" => "Riwayat poin tidak ditemukan!"], 404);
        }

        array_splice($db['points'], $foundIndex, 1);
        writeDb($db);
        jsonResponse(["success" => true, "message" => "Riwayat perolehan poin dibatalkan/dihapus!"]);
        break;

    // ---------------------------------------------
    // RANKINGS & ANALYSIS
    // ---------------------------------------------
    case ($route === 'ranking' && $method === 'GET'):
        $db = readDb();
        $rankedList = [];

        foreach ($db['peserta'] as $p) {
            $totalPoints = 0;
            $pHistory = [];

            foreach ($db['points'] as $pt) {
                if ($pt['id_peserta'] === $p['id']) {
                    $totalPoints += (int)$pt['poin'];
                    
                    // Find activity title
                    $nama_kegiatan = 'Kegiatan Tidak Diketahui';
                    foreach ($db['kegiatan'] as $k) {
                        if ($k['id'] === $pt['id_kegiatan']) {
                            $nama_kegiatan = $k['nama_kegiatan'];
                            break;
                        }
                    }

                    $pHistory[] = [
                        "id" => $pt['id'],
                        "id_peserta" => $pt['id_peserta'],
                        "id_kegiatan" => $pt['id_kegiatan'],
                        "poin" => $pt['poin'],
                        "catatan" => $pt['catatan'],
                        "tanggal_input" => $pt['tanggal_input'],
                        "input_by" => $pt['input_by'],
                        "nama_kegiatan" => $nama_kegiatan
                    ];
                }
            }

            $statusLulus = ($totalPoints >= 100) ? 'Lulus' : 'Tidak Lulus';

            $rankedList[] = array_merge($p, [
                "totalPoints" => $totalPoints,
                "statusLulus" => $statusLulus,
                "history" => $pHistory
            ]);
        }

        // Sort desc by totalPoints
        usort($rankedList, function($a, $b) {
            return $b['totalPoints'] - $a['totalPoints'];
        });

        // Compute rank numbers
        $currentRank = 0;
        $lastPoints = -1;
        foreach ($rankedList as $idx => &$item) {
            if ($item['totalPoints'] !== $lastPoints) {
                $currentRank = $idx + 1;
                $lastPoints = $item['totalPoints'];
            }
            $item['rank'] = $currentRank;
        }

        jsonResponse($rankedList);
        break;

    case (preg_match('/^siswa\/profile\/([^\/]+)$/', $route, $matches) && $method === 'GET'):
        $pesertaId = $matches[1];
        $db = readDb();

        $pes = null;
        foreach ($db['peserta'] as $p) {
            if ($p['id'] === $pesertaId) {
                $pes = $p;
                break;
            }
        }

        if (!$pes) {
            jsonResponse(["success" => false, "message" => "Data peserta tidak ditemukan!"], 404);
        }

        // Calculate all ranks
        $mapped = [];
        foreach ($db['peserta'] as $p) {
            $pts = 0;
            foreach ($db['points'] as $pt) {
                if ($pt['id_peserta'] === $p['id']) {
                    $pts += (int)$pt['poin'];
                }
            }
            $mapped[] = [
                "id" => $p['id'],
                "totalPoints" => $pts
            ];
        }

        usort($mapped, function($a, $b) {
            return $b['totalPoints'] - $a['totalPoints'];
        });

        $rank = 1;
        $currentRank = 0;
        $lastPoints = -1;
        foreach ($mapped as $idx => $m) {
            if ($m['totalPoints'] !== $lastPoints) {
                $currentRank = $idx + 1;
                $lastPoints = $m['totalPoints'];
            }
            if ($m['id'] === $pesertaId) {
                $rank = $currentRank;
                break;
            }
        }

        // Prepare this student history
        $history = [];
        foreach ($db['points'] as $pt) {
            if ($pt['id_peserta'] === $pesertaId) {
                $nama_kegiatan = 'Kegiatan Tidak Diketahui';
                foreach ($db['kegiatan'] as $k) {
                    if ($k['id'] === $pt['id_kegiatan']) {
                        $nama_kegiatan = $k['nama_kegiatan'];
                        break;
                    }
                }
                $history[] = [
                    "id" => $pt['id'],
                    "id_peserta" => $pt['id_peserta'],
                    "id_kegiatan" => $pt['id_kegiatan'],
                    "poin" => $pt['poin'],
                    "catatan" => $pt['catatan'],
                    "tanggal_input" => $pt['tanggal_input'],
                    "input_by" => $pt['input_by'],
                    "nama_kegiatan" => $nama_kegiatan
                ];
            }
        }

        // Sort history by tanggal_input desc
        usort($history, function($a, $b) {
            return strtotime($b['tanggal_input']) - strtotime($a['tanggal_input']);
        });

        $totalPoints = 0;
        foreach ($history as $h) {
            $totalPoints += $h['poin'];
        }
        $statusLulus = ($totalPoints >= 100) ? 'Lulus' : 'Tidak Lulus';

        jsonResponse(array_merge($pes, [
            "totalPoints" => $totalPoints,
            "statusLulus" => $statusLulus,
            "rank" => $rank,
            "history" => $history
        ]));
        break;

    case ($route === 'analytics' && $method === 'GET'):
        $db = readDb();
        $totalPeserta = count($db['peserta']);
        $totalKegiatan = count($db['kegiatan']);
        
        $totalPoinGiven = 0;
        foreach ($db['points'] as $pt) {
            $totalPoinGiven += (int)$pt['poin'];
        }

        // Jurusan Stats
        $jurusanStats = [];
        foreach ($db['peserta'] as $p) {
            $jur = $p['jurusan'];
            
            $pts = 0;
            foreach ($db['points'] as $pt) {
                if ($pt['id_peserta'] === $p['id']) {
                    $pts += (int)$pt['poin'];
                }
            }

            if (!isset($jurusanStats[$jur])) {
                $jurusanStats[$jur] = ["totalPoints" => 0, "count" => 0];
            }
            $jurusanStats[$jur]['totalPoints'] += $pts;
            $jurusanStats[$jur]['count'] += 1;
        }

        $chartJurusan = [];
        foreach ($jurusanStats as $name => $stat) {
            $chartJurusan[] = [
                "name" => $name,
                "Rata-rata Poin" => $stat['count'] > 0 ? round($stat['totalPoints'] / $stat['count'], 1) : 0,
                "Total Poin" => $stat['totalPoints'],
                "Jumlah Peserta" => $stat['count']
            ];
        }

        // Top 5 Peserta
        $pesertaPoints = [];
        foreach ($db['peserta'] as $p) {
            $pts = 0;
            foreach ($db['points'] as $pt) {
                if ($pt['id_peserta'] === $p['id']) {
                    $pts += (int)$pt['poin'];
                }
            }
            $pesertaPoints[] = ["nama" => $p['nama'], "kelas" => $p['kelas'], "poin" => $pts];
        }

        usort($pesertaPoints, function($a, $b) {
            return $b['poin'] - $a['poin'];
        });
        $topPeserta = array_slice($pesertaPoints, 0, 5);

        jsonResponse([
            "totalPeserta" => $totalPeserta,
            "totalKegiatan" => $totalKegiatan,
            "totalPoinGiven" => $totalPoinGiven,
            "chartJurusan" => $chartJurusan,
            "topPeserta" => $topPeserta
        ]);
        break;

    // ---------------------------------------------
    // GOOGLE SHEETS SETTINGS & SYNC
    // ---------------------------------------------
    case ($route === 'sheets-code' && $method === 'GET'):
        // Fetch sheets-code by reading server.ts or outputting it directly.
        // We will output a nicely formatted sheets code directly in PHP
        $codeGs = <<<EOD
/**
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
    
    if (action === "syncAll") {
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
EOD;
        echo $codeGs;
        exit();
        break;

    case ($route === 'settings/sheets-url' && $method === 'GET'):
        $db = readDb();
        jsonResponse(["url" => isset($db['settings']['googleSheetsUrl']) ? $db['settings']['googleSheetsUrl'] : '']);
        break;

    case ($route === 'settings/sheets-url' && $method === 'POST'):
        $url = isset($input['url']) ? trim($input['url']) : '';
        $db = readDb();
        $db['settings']['googleSheetsUrl'] = $url;
        writeDb($db);
        jsonResponse(["success" => true, "message" => "URL Google Sheets berhasil disimpan!"]);
        break;

    case ($route === 'sync/test' && $method === 'POST'):
        $url = isset($input['url']) ? trim($input['url']) : '';
        if (empty($url)) {
            jsonResponse(["success" => false, "message" => "URL Web App tidak boleh kosong!"], 400);
        }

        $res = curlFetch($url . '?action=getPeserta', 'GET');
        if ($res['success']) {
            jsonResponse(["success" => true, "message" => "Koneksi ke Google Sheets Web App berhasil!"]);
        } else {
            jsonResponse(["success" => false, "message" => "Gagal menghubungi URL. Status: " . $res['code'] . " - " . (isset($res['message']) ? $res['message'] : '')], 400);
        }
        break;

    case ($route === 'sync/push' && $method === 'POST'):
        $db = readDb();
        $url = isset($db['settings']['googleSheetsUrl']) ? $db['settings']['googleSheetsUrl'] : '';
        if (empty($url)) {
            jsonResponse(["success" => false, "message" => "Silakan konfigurasikan URL Google Sheets terlebih dahulu!"], 400);
        }

        $res = curlFetch($url, 'POST', [
            'action' => 'syncAll',
            'data' => [
                'users' => $db['users'],
                'peserta' => $db['peserta'],
                'kegiatan' => $db['kegiatan'],
                'points' => $db['points']
            ]
        ]);

        if ($res['success']) {
            $body = json_decode($res['body'], true);
            if (isset($body['success']) && $body['success']) {
                jsonResponse(["success" => true, "message" => "Semua data berhasil disinkronkan ke Google Spreadsheet!"]);
            } else {
                jsonResponse(["success" => false, "message" => isset($body['message']) ? $body['message'] : 'Gagal sinkronisasi.'], 400);
            }
        } else {
            jsonResponse(["success" => false, "message" => "Error sinkronisasi: Status " . $res['code'] . " - " . (isset($res['message']) ? $res['message'] : '')], 500);
        }
        break;

    case ($route === 'sync/pull' && $method === 'POST'):
        $db = readDb();
        $url = isset($db['settings']['googleSheetsUrl']) ? $db['settings']['googleSheetsUrl'] : '';
        if (empty($url)) {
            jsonResponse(["success" => false, "message" => "Silakan konfigurasikan URL Google Sheets terlebih dahulu!"], 400);
        }

        // Pull Peserta
        $resPeserta = curlFetch($url . '?action=getPeserta', 'GET');
        $dataPeserta = json_decode($resPeserta['body'], true);

        // Pull Kegiatan
        $resKegiatan = curlFetch($url . '?action=getKegiatan', 'GET');
        $dataKegiatan = json_decode($resKegiatan['body'], true);

        // Pull Points
        $resPoint = curlFetch($url . '?action=getPoint', 'GET');
        $dataPoint = json_decode($resPoint['body'], true);

        if (is_array($dataPeserta)) {
            $db['peserta'] = [];
            foreach ($dataPeserta as $p) {
                $db['peserta'][] = [
                    "id" => isset($p['id']) && !empty($p['id']) ? $p['id'] : 'p_' . uniqid(),
                    "no_peserta" => isset($p['no_peserta']) ? $p['no_peserta'] : '',
                    "nisn" => isset($p['nisn']) ? $p['nisn'] : '',
                    "nama" => isset($p['nama']) ? $p['nama'] : '',
                    "kelas" => isset($p['kelas']) ? $p['kelas'] : '',
                    "jurusan" => isset($p['jurusan']) ? $p['jurusan'] : '',
                    "jk" => isset($p['jk']) ? $p['jk'] : 'L',
                    "status" => isset($p['status']) ? $p['status'] : 'Aktif'
                ];
            }
        }

        if (is_array($dataKegiatan)) {
            $db['kegiatan'] = [];
            foreach ($dataKegiatan as $k) {
                $db['kegiatan'][] = [
                    "id" => isset($k['id']) && !empty($k['id']) ? $k['id'] : 'k_' . uniqid(),
                    "nama_kegiatan" => isset($k['nama_kegiatan']) ? $k['nama_kegiatan'] : '',
                    "deskripsi" => isset($k['deskripsi']) ? $k['deskripsi'] : '',
                    "tanggal" => isset($k['tanggal']) ? $k['tanggal'] : '',
                    "poin" => isset($k['poin']) ? (int)$k['poin'] : 0,
                    "jenis" => isset($k['jenis']) ? $k['jenis'] : '',
                    "status" => isset($k['status']) ? $k['status'] : 'Aktif'
                ];
            }
        }

        if (is_array($dataPoint)) {
            $db['points'] = [];
            foreach ($dataPoint as $pt) {
                $db['points'][] = [
                    "id" => isset($pt['id']) && !empty($pt['id']) ? $pt['id'] : 'pt_' . uniqid(),
                    "id_peserta" => isset($pt['id_peserta']) ? $pt['id_peserta'] : '',
                    "id_kegiatan" => isset($pt['id_kegiatan']) ? $pt['id_kegiatan'] : '',
                    "poin" => isset($pt['poin']) ? (int)$pt['poin'] : 0,
                    "catatan" => isset($pt['catatan']) ? $pt['catatan'] : '',
                    "tanggal_input" => isset($pt['tanggal_input']) ? $pt['tanggal_input'] : date('c'),
                    "input_by" => isset($pt['input_by']) ? $pt['input_by'] : 'Panitia'
                ];
            }
        }

        writeDb($db);
        jsonResponse(["success" => true, "message" => "Semua data berhasil ditarik dari Google Spreadsheet ke database lokal!"]);
        break;

    default:
        jsonResponse(["success" => false, "message" => "Endpoint '{$route}' tidak ditemukan!"], 404);
        break;
}
