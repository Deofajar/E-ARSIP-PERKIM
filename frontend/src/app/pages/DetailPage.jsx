import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ChevronLeft,
  FileText,
  ChevronRight,
  Download,
  AlertCircle,
  Tag,
  Calendar,
  FolderOpen,
  Clock,
  User,
  MapPin,
} from "lucide-react";
import { authFetch, parseErrorMessage, formatTanggal, downloadArsip, FILE_BASE_URL } from "../utils/helpers.js";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const [viewerWidth, setViewerWidth] = useState(700);
  const viewerRef = useRef(null);
  const onBack = () => navigate("/arsip");

  useEffect(() => {
    setIsLoading(true);
    authFetch(`/arsip/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await parseErrorMessage(res, "Dokumen tidak ditemukan"));
        return res.json();
      })
      .then((data) => setDoc(data))
      .catch(() => setDoc(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!viewerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setViewerWidth(Math.min(width - 32, 900));
    });
    observer.observe(viewerRef.current);
    return () => observer.disconnect();
  }, [doc]);

  if (isLoading) {
    return <div className="p-10 text-center text-slate-400 text-sm">Memuat dokumen...</div>;
  }

  if (!doc) {
    return (
      <div className="p-10 text-center text-slate-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
        Dokumen tidak ditemukan.
        <button
          onClick={onBack}
          className="block mx-auto mt-3 text-sm text-[#1a56db] font-semibold hover:underline"
        >
          Kembali ke daftar arsip
        </button>
      </div>
    );
  }

  const fileUrl = doc.fileUrl ? `${FILE_BASE_URL}${doc.fileUrl}` : null;

  return (
    <div className="flex h-full flex-col">
      {/* Sub-header */}
      <div className="bg-white border-b border-[#e2e8f0] px-6 py-3.5 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1a56db] transition-colors font-medium"
        >
          <ChevronLeft style={{ width: 16, height: 16 }} /> Kembali ke Daftar
        </button>
        <div className="h-4 w-px bg-slate-200" />
        <span className="text-sm text-slate-400">Detail Dokumen</span>
        <span className="text-[10px] bg-blue-50 text-[#1a56db] border border-blue-100 px-2 py-0.5 rounded-full font-semibold ml-auto" style={{ fontFamily: "'DM Mono', monospace" }}>
          {doc.nomorSurat}
        </span>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT – PDF Viewer */}
        <div className="flex-1 bg-[#374151] flex flex-col">
          {/* Viewer toolbar */}
          <div className="bg-[#1f2937] px-4 py-2.5 flex items-center gap-3 border-b border-white/10">
            <span className="text-slate-300 text-xs font-medium flex items-center gap-2">
              <FileText style={{ width: 13, height: 13, color: "#60a5fa" }} />
              {doc.fileUrl?.split("/").pop() ?? "dokumen.pdf"}
            </span>
            {numPages > 1 && (
              <div className="flex items-center gap-2 mx-auto">
                <button
                  type="button"
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft style={{ width: 14, height: 14 }} />
                </button>
                <span className="text-slate-300 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
                  Halaman {pageNumber} / {numPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                  disabled={pageNumber >= numPages}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadArsip(doc)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <Download style={{ width: 12, height: 12 }} /> Unduh
              </button>
            </div>
          </div>

          {/* Real PDF viewer (rendered client-side via pdf.js, independent of browser's native PDF plugin) */}
          <div ref={viewerRef} className="flex-1 bg-slate-500 min-h-[500px] overflow-y-auto flex justify-center py-4">
            {!fileUrl ? (
              <div className="flex items-center justify-center h-full min-h-[500px] text-slate-300 text-sm">
                Berkas tidak tersedia
              </div>
            ) : pdfError ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-slate-300 text-sm gap-2">
                <AlertCircle className="w-8 h-8 opacity-50" />
                Gagal memuat pratinjau PDF.
              </div>
            ) : (
              <Document
                file={fileUrl}
                onLoadSuccess={({ numPages: n }) => { setNumPages(n); setPageNumber(1); setPdfError(false); }}
                onLoadError={() => setPdfError(true)}
                loading={<div className="flex items-center justify-center h-full min-h-[500px] text-slate-300 text-sm">Memuat pratinjau...</div>}
              >
                <Page pageNumber={pageNumber} width={viewerWidth} />
              </Document>
            )}
          </div>
        </div>

        {/* RIGHT – Metadata panel */}
        <div className="w-80 flex-shrink-0 bg-white border-l border-[#e2e8f0] overflow-y-auto flex flex-col">
          <div className="px-5 py-4 border-b border-[#f1f5f9]">
            <h3 className="font-bold text-sm text-[#0f1c2e]">Metadata Dokumen</h3>
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* Kategori badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-blue-50 text-[#1a56db] border-blue-100">
                {doc.kategori}
              </span>
            </div>

            {/* Meta fields */}
            <div className="space-y-4">
              {[
                { label: "Nomor Surat", value: doc.nomorSurat, icon: Tag, mono: true },
                { label: "Tanggal Surat", value: formatTanggal(doc.tanggalSurat), icon: Calendar, mono: false },
                { label: "Perihal", value: doc.perihal, icon: FileText, mono: false },
                { label: "Kategori", value: doc.kategori, icon: FolderOpen, mono: false },
                { label: "Tahun Arsip", value: String(new Date(doc.tanggalSurat).getFullYear()), icon: Clock, mono: true },
                { label: "Diunggah oleh", value: doc.uploaderNama ?? doc.uploader?.namaLengkap ?? "-", icon: User, mono: false },
              ].map((f) => (
                <div key={f.label}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <f.icon style={{ width: 11, height: 11, color: "#94a3b8" }} />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{f.label}</span>
                  </div>
                  <div
                    className="text-sm text-[#0f1c2e] font-medium pl-4"
                    style={f.mono ? { fontFamily: "'DM Mono', monospace", fontSize: 12 } : {}}
                  >
                    {f.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Physical storage – highlighted section */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center">
                  <MapPin style={{ width: 14, height: 14, color: "#d97706" }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-800">Lokasi Penyimpanan Fisik</div>
                  <div className="text-[10px] text-amber-600">Arsip Konvensional</div>
                </div>
              </div>
              <div className="text-xs font-bold text-amber-900" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                {doc.storageLocation || "-"}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-5 border-t border-[#f1f5f9] space-y-2">
            <button
              type="button"
              onClick={() => downloadArsip(doc)}
              className="w-full bg-[#1a56db] text-white text-sm font-semibold py-2.5 rounded-md hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2"
            >
              <Download style={{ width: 15, height: 15 }} /> Unduh Dokumen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
