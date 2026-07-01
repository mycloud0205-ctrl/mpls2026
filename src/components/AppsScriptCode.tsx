import React, { useState, useEffect } from 'react';
import { Database, FileCode, Check, Copy, HelpCircle, Layers, Server, RefreshCw, Link, ShieldCheck, AlertTriangle, ArrowUpFromLine, ArrowDownToLine } from 'lucide-react';

export default function AppsScriptCode() {
  const [copied, setCopied] = useState(false);
  const [codeGs, setCodeGs] = useState('');
  const [sheetsStructure, setSheetsStructure] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  // New States for Google Sheets connection
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);
  const [syncingPush, setSyncingPush] = useState(false);
  const [syncingPull, setSyncingPull] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async (urlToTest: string) => {
    try {
      const res = await fetch('/api/sync/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToTest })
      });
      const data = await res.json();
      setTestStatus({ success: data.success, message: data.message });
    } catch (err: any) {
      setTestStatus({ success: false, message: 'Tidak dapat menghubungi Apps Script: ' + err.message });
    }
  };

  useEffect(() => {
    // Load script code
    fetch('/api/sheets-code')
      .then((res) => res.json())
      .then((data) => {
        setCodeGs(data.codeGs);
        setSheetsStructure(data.sheetsStructure);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Load saved sheets URL
    fetch('/api/settings/sheets-url')
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setSheetsUrl(data.url);
          // Try to test connection if url is present
          handleTestConnection(data.url);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeGs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUrl(true);
    setTestStatus(null);

    try {
      // 1. Save URL to backend settings
      const saveRes = await fetch('/api/settings/sheets-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sheetsUrl })
      });
      const saveData = await saveRes.json();

      if (saveData.success) {
        // 2. Test connection
        if (sheetsUrl) {
          await handleTestConnection(sheetsUrl);
        } else {
          setTestStatus({ success: true, message: 'URL berhasil dikosongkan. Aplikasi akan berjalan offline menggunakan penyimpanan lokal.' });
        }
      } else {
        setTestStatus({ success: false, message: 'Gagal menyimpan URL settings.' });
      }
    } catch (err: any) {
      setTestStatus({ success: false, message: 'Terjadi kesalahan sistem: ' + err.message });
    } finally {
      setSavingUrl(false);
    }
  };

  const handlePushToSheets = async () => {
    if (!window.confirm('PERINGATAN: Ini akan menimpa seluruh data di Google Sheets dengan data dari aplikasi lokal Anda. Lanjutkan?')) {
      return;
    }
    setSyncingPush(true);
    try {
      const res = await fetch('/api/sync/push', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
    } catch (err: any) {
      alert('Gagal menyinkronkan data: ' + err.message);
    } finally {
      setSyncingPush(false);
    }
  };

  const handlePullFromSheets = async () => {
    if (!window.confirm('PERINGATAN: Ini akan menimpa seluruh data aplikasi lokal dengan data dari Google Sheets. Lanjutkan?')) {
      return;
    }
    setSyncingPull(true);
    try {
      const res = await fetch('/api/sync/pull', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
      window.location.reload(); // Reload to refresh all tabs with pulled data
    } catch (err: any) {
      alert('Gagal mengambil data dari Google Sheets: ' + err.message);
    } finally {
      setSyncingPull(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-900 text-white px-6 py-5">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-indigo-200" />
          <div>
            <h2 className="font-display font-semibold text-lg">Integrasi Google Spreadsheet & Apps Script</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Hubungkan aplikasi web ini dengan Google Spreadsheet sebagai database utama Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Connection Setup Card */}
        <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-800">Koneksi &amp; Sinkronisasi Google Sheets</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Konfigurasikan URL Web App Google Apps Script Anda untuk mengaktifkan sinkronisasi data dua arah. Aplikasi juga otomatis mengunggah perubahan data secara real-time saat Anda melakukan input di web!
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveAndConnect} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                required
                placeholder="https://script.google.com/macros/s/.../exec"
                value={sheetsUrl}
                onChange={(e) => setSheetsUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-neutral-400"
              />
              <button
                type="submit"
                disabled={savingUrl}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:bg-neutral-300 shrink-0"
              >
                {savingUrl ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghubungkan...</span>
                  </>
                ) : (
                  <span>Simpan &amp; Hubungkan</span>
                )}
              </button>
            </div>
          </form>

          {/* Test Status Feedback */}
          {testStatus && (
            <div className={`p-3 rounded-lg border text-xs flex items-start space-x-2 ${
              testStatus.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {testStatus.success ? (
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold block">{testStatus.success ? 'Koneksi Sukses!' : 'Koneksi Gagal!'}</span>
                <p className="text-[11px] text-neutral-600 mt-0.5">{testStatus.message}</p>
              </div>
            </div>
          )}

          {/* Manual Sync Actions */}
          {sheetsUrl && (
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handlePushToSheets}
                  disabled={syncingPush}
                  className="flex-1 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {syncingPush ? (
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <ArrowUpFromLine className="w-4.5 h-4.5" />
                  )}
                  <span>Kirim Semua Data Lokal ke Google Sheets (Push)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePullFromSheets}
                  disabled={syncingPull}
                  className="flex-1 px-3 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {syncingPull ? (
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <ArrowDownToLine className="w-4.5 h-4.5" />
                  )}
                  <span>Tarik Data Terbaru dari Google Sheets (Pull)</span>
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 italic leading-relaxed bg-neutral-50 p-2.5 border border-neutral-150 rounded-lg">
                *Tips: Jika Anda menggunakan Spreadsheet yang baru dibuat (masih kosong), silakan jalankan <strong>Kirim Semua Data Lokal (Push)</strong> terlebih dahulu untuk secara otomatis membuat lembar lembar tab (Sheet) beserta judul kolomnya!
              </p>
            </div>
          )}
        </div>

        {/* Step-by-Step Guide */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Langkah Persiapan Google Spreadsheet:</span>
          </h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs">
              <span className="font-bold text-indigo-600 block mb-1">Langkah 1:</span>
              Buat Google Spreadsheet baru. Ubah namanya menjadi <strong className="text-neutral-800">"Database MPLS SMKN 2 Baleendah"</strong>.
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs">
              <span className="font-bold text-indigo-600 block mb-1">Langkah 2:</span>
              Buat 4 lembar tab (Sheet) dengan nama persis:
              <ul className="list-disc pl-4 mt-1 font-mono text-[11px] text-indigo-950 space-y-0.5">
                <li>Users</li>
                <li>Peserta</li>
                <li>Kegiatan</li>
                <li>Point</li>
              </ul>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs">
              <span className="font-bold text-indigo-600 block mb-1">Langkah 3:</span>
              Pada baris pertama (Row 1) setiap Sheet, ketik kolom header persis seperti skema di bawah ini.
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs">
              <span className="font-bold text-indigo-600 block mb-1">Langkah 4:</span>
              Buka menu <strong className="text-neutral-800">Extensions &gt; Apps Script</strong>, hapus kode lama, lalu tempelkan kode di samping.
            </div>
          </div>
        </div>

        {/* Database Sheets Schema */}
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
          <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
            Skema Kolom Baris Pertama (Headers)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(sheetsStructure).map(([sheetName, cols]) => (
              <div key={sheetName} className="bg-white p-3 rounded-lg border border-neutral-200">
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-bold text-neutral-800 font-mono">Sheet: {sheetName}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(cols as string[]).map((col) => (
                    <span
                      key={col}
                      className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded font-mono text-[10px]"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployment Instruction */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
          <h4 className="font-semibold flex items-center space-x-1.5 mb-1">
            <Server className="w-4 h-4 text-amber-600" />
            <span>Cara Deploy Apps Script:</span>
          </h4>
          <ol className="list-decimal pl-5 space-y-1 mt-1 text-amber-800">
            <li>Di halaman Google Apps Script, klik tombol biru <strong>"Deploy"</strong> di kanan atas, lalu pilih <strong>"New deployment"</strong>.</li>
            <li>Klik ikon gerigi di sebelah "Select type", lalu pilih <strong>"Web app"</strong>.</li>
            <li>Ubah bagian <strong>"Execute as"</strong> menjadi <strong>"Me (email Anda)"</strong>.</li>
            <li>Ubah bagian <strong>"Who has access"</strong> menjadi <strong>"Anyone"</strong> (Sangat penting agar API bisa diakses oleh frontend).</li>
            <li>Klik <strong>"Deploy"</strong>, selesaikan otorisasi izin akun Google Anda, lalu salin <strong>"Web App URL"</strong> yang diberikan.</li>
          </ol>
        </div>

        {/* Code Visualizer */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-neutral-800 flex items-center space-x-1.5">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Kode Google Apps Script (Code.gs)</span>
            </h3>
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                copied
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700 hover:text-neutral-900'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl border border-neutral-200 overflow-hidden bg-neutral-900">
            {loading ? (
              <div className="h-64 flex flex-col justify-center items-center text-neutral-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="text-xs">Memuat kode Google Apps Script...</span>
              </div>
            ) : (
              <pre className="p-4 overflow-x-auto text-xs text-neutral-300 font-mono leading-relaxed max-h-[350px] overflow-y-auto">
                <code>{codeGs}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
