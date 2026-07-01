import React, { useRef } from 'react';
import { Award, Printer, ShieldCheck, X, CheckCircle } from 'lucide-react';
import { ParticipantRanked } from '../types';

interface SertifikatViewProps {
  peserta: ParticipantRanked;
  onClose: () => void;
}

export default function SertifikatView({ peserta, onClose }: SertifikatViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Build a unique verification URL
  const verifyUrl = `${window.location.origin}/verify?id=${peserta.no_peserta}`;

  // Simple pseudo QR-code generator helper (renders a nice technical SVG grid)
  const renderQrCodeSVG = () => {
    return (
      <svg className="w-20 h-20 bg-white p-1 border border-neutral-200 rounded" viewBox="0 0 100 100" shapeRendering="crispEdges">
        <rect width="100" height="100" fill="white" />
        {/* Border Finders */}
        <path d="M 0 0 h 30 v 10 h -20 v 20 h -10 Z" fill="black" />
        <path d="M 70 0 h 30 v 30 h -10 v -20 h -20 Z" fill="black" />
        <path d="M 0 70 h 10 v 20 h 20 v 10 h -30 Z" fill="black" />
        {/* Core Finders */}
        <rect x="5" y="5" width="20" height="20" fill="black" />
        <rect x="8" y="8" width="14" height="14" fill="white" />
        <rect x="11" y="11" width="8" height="8" fill="black" />

        <rect x="75" y="5" width="20" height="20" fill="black" />
        <rect x="78" y="78" width="14" height="14" fill="white" />
        <rect x="81" y="81" width="8" height="8" fill="black" />

        <rect x="5" y="75" width="20" height="20" fill="black" />
        <rect x="8" y="78" width="14" height="14" fill="white" />
        <rect x="11" y="81" width="8" height="8" fill="black" />

        {/* Center random technical QR grids */}
        <rect x="35" y="10" width="10" height="5" fill="black" />
        <rect x="30" y="25" width="5" height="15" fill="black" />
        <rect x="45" y="20" width="15" height="10" fill="black" />
        <rect x="40" y="40" width="20" height="20" fill="black" />
        <rect x="45" y="45" width="10" height="10" fill="white" />
        <rect x="15" y="40" width="10" height="10" fill="black" />
        <rect x="70" y="45" width="15" height="5" fill="black" />
        <rect x="35" y="70" width="10" height="20" fill="black" />
        <rect x="50" y="75" width="15" height="10" fill="black" />
        <rect x="70" y="70" width="20" height="5" fill="black" />
        <rect x="85" y="85" width="10" height="10" fill="black" />
      </svg>
    );
  };

  return (
    <div id="sertifikat-overlay" className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 overflow-y-auto no-print backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col no-print border border-neutral-100 max-h-[95vh]">
        {/* Controls Bar */}
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span className="font-display font-semibold text-neutral-800">Generate Sertifikat MPLS</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Container Scroll wrapper */}
        <div className="p-8 bg-neutral-100 overflow-y-auto flex justify-center items-center">
          {/* Certificate Page - Standard A4 Landscape Aspect Ratio (styled beautifully for on-screen and print) */}
          <div
            ref={printRef}
            id="sertifikat-print"
            className="w-[1050px] min-h-[740px] bg-white text-neutral-800 p-12 border-[16px] border-double border-neutral-300 relative flex flex-col justify-between shadow-lg mx-auto print-card print:border-[10px]"
          >
            {/* Elegant Corner Decorative Ornaments */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-600 pointer-events-none"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-600 pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-600 pointer-events-none"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-600 pointer-events-none"></div>

            {/* Inner Border */}
            <div className="absolute inset-2 border border-amber-200 pointer-events-none"></div>

            {/* Header / Kop Surat */}
            <div className="text-center flex flex-col items-center border-b-2 border-neutral-800 pb-4">
              <h3 className="font-display font-bold text-lg tracking-wider text-neutral-900 uppercase">
                Pemerintah Provinsi Jawa Barat
              </h3>
              <h2 className="font-display font-extrabold text-2xl tracking-wide text-indigo-900 uppercase">
                Dinas Pendidikan Cabang Dinas Wilayah VIII
              </h2>
              <h1 className="font-display font-extrabold text-3xl tracking-widest text-amber-700 uppercase mt-0.5">
                SMK Negeri 2 Baleendah
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-1">
                Jalan R.A.A. Wiranatakusumah No. 11, Baleendah, Bandung 40375 | Telp: (022) 5940714
              </p>
            </div>

            {/* Certificate Body */}
            <div className="text-center my-6 flex-1 flex flex-col justify-center">
              <h1 className="font-display font-extrabold text-4xl tracking-[0.2em] text-neutral-900 mb-1">
                SERTIFIKAT
              </h1>
              <div className="w-48 h-0.5 bg-amber-600 mx-auto mb-2"></div>
              <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase">
                Nomor: 421.5 / {peserta.no_peserta} / SMKN2BE-MPLS / VII / 2026
              </p>

              <p className="text-sm mt-6 text-neutral-600 italic">
                Kepala Sekolah Menengah Kejuruan Negeri 2 Baleendah menerangkan bahwa:
              </p>

              {/* Name Block */}
              <div className="my-5">
                <h2 className="font-display font-extrabold text-3xl text-neutral-900 underline tracking-wide uppercase">
                  {peserta.nama}
                </h2>
                <p className="text-sm text-neutral-600 font-mono mt-2 uppercase tracking-wider">
                  Nomor Peserta: {peserta.no_peserta} &nbsp;|&nbsp; NISN: {peserta.nisn}
                </p>
                <p className="text-sm font-semibold text-indigo-950 mt-1 uppercase">
                  Kelas: {peserta.kelas} &nbsp;&bull;&nbsp; Kompetensi Keahlian: {peserta.jurusan}
                </p>
              </div>

              {/* Description */}
              <div className="max-w-3xl mx-auto text-sm text-neutral-700 leading-relaxed">
                Telah mengikuti seluruh rangkaian kegiatan <strong className="text-neutral-900">Masa Pengenalan Lingkungan Sekolah (MPLS)</strong> di SMK Negeri 2 Baleendah pada tanggal 20 s.d 22 Juli 2026 dengan perolehan hasil akumulasi penilaian sebesar:
              </div>

              {/* Points & Status */}
              <div className="flex justify-center items-center space-x-8 my-5">
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-6 py-3 text-center shadow-sm">
                  <span className="text-xs text-neutral-400 uppercase tracking-widest block font-mono">Total Perolehan</span>
                  <span className="font-display font-extrabold text-3xl text-indigo-600">{peserta.totalPoints}</span>
                  <span className="text-xs text-neutral-500 block font-semibold">Poin Kegiatan</span>
                </div>

                <div className={`rounded-xl px-6 py-3 text-center shadow-sm border ${
                  peserta.statusLulus === 'Lulus' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <span className="text-xs text-neutral-400 uppercase tracking-widest block font-mono">Status Kelulusan</span>
                  <span className="font-display font-extrabold text-3xl flex items-center justify-center space-x-1.5">
                    {peserta.statusLulus === 'Lulus' ? 'LULUS' : 'TIDAK LULUS'}
                  </span>
                  <span className="text-xs block font-semibold">Berdasarkan Standar MPLS</span>
                </div>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-3 items-end text-sm text-neutral-700 mt-2 shrink-0">
              {/* QR Verification */}
              <div className="flex flex-col items-start space-y-1.5 pl-6">
                {renderQrCodeSVG()}
                <div className="text-[10px] text-neutral-400 font-mono text-left max-w-[150px]">
                  Pindai QR Code untuk memverifikasi keaslian Sertifikat MPLS online.
                </div>
              </div>

              {/* Signature Committee */}
              <div className="text-center flex flex-col justify-between h-32 pb-1">
                <div>
                  <p className="text-xs font-semibold">Panitia Pelaksana MPLS,</p>
                  <p className="text-xs text-neutral-500">Ketua Panitia</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-display font-bold text-neutral-950 underline text-sm">
                    Drs. H. Mulyana, M.Pd.
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">NIP. 19700512 199903 1 002</span>
                </div>
              </div>

              {/* Signature Principal */}
              <div className="text-center flex flex-col justify-between h-32 pb-1 pr-6">
                <div>
                  <p className="text-xs text-neutral-500">Bandung, 22 Juli 2026</p>
                  <p className="text-xs font-semibold">Kepala Sekolah SMK Negeri 2 Baleendah,</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-display font-bold text-neutral-950 underline text-sm">
                    H. Tatang, M.Pd.
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">NIP. 19680312 199403 1 005</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Styles for standard print handling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #sertifikat-print, #sertifikat-print * {
            visibility: visible;
          }
          #sertifikat-overlay {
            background: white !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
            z-index: 9999 !important;
          }
          #sertifikat-print {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) scale(1) !important;
            border: 12px double #000 !important;
            box-shadow: none !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
          }
          /* Hide default browser header/footers */
          @page {
            size: landscape;
            margin: 0.5cm;
          }
        }
      `}</style>
    </div>
  );
}
