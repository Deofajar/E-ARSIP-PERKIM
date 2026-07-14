import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Filter,
  X,
  Search,
  ChevronDown,
  AlertCircle,
  Eye,
  Info,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { authFetch, parseErrorMessage, formatTanggal, downloadArsip } from "../utils/helpers.js";

export default function ArchivePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterYear, setFilterYear] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [archives, setArchives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handle = setTimeout(() => {
      setIsLoading(true);
      const qs = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
      authFetch(`/arsip${qs}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res, "Gagal memuat data arsip"));
          return res.json();
        })
        .then((data) => setArchives(data))
        .catch((error) => toast.error(error.message))
        .finally(() => setIsLoading(false));
    }, 350);

    return () => clearTimeout(handle);
  }, [searchQuery]);

  const filtered = archives.filter((d) => {
    if (filterYear && String(new Date(d.tanggalSurat).getFullYear()) !== filterYear) return false;
    if (filterCat && d.kategori !== filterCat) return false;
    return true;
  });

  const perPage = 6;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const Sel = ({ label, value, onChange, opts }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => { onChange(e.target.value); setPage(1); }}
          className="w-full bg-white border border-[#e2e8f0] text-slate-700 text-xs rounded-md pl-3 pr-7 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db]"
        >
          <option value="">Semua</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
      </div>
    </div>
  );

  return (
    <div className="p-7 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#0f1c2e]">Pencarian Lanjutan</h2>
        <p className="text-slate-500 text-sm mt-0.5">Cari berdasarkan nomor surat, perihal, atau kategori — atau gunakan filter di bawah</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter style={{ width: 15, height: 15, color: "#1a56db" }} />
          <span className="text-sm font-semibold text-[#0f1c2e]">Filter Pencarian</span>
          {(filterYear || filterCat || searchQuery) && (
            <button
              onClick={() => { setFilterYear(""); setFilterCat(""); setSearchQuery(""); setPage(1); }}
              className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X style={{ width: 11, height: 11 }} /> Hapus Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Cari Dokumen</label>
            <div className="relative">
              <Search style={{ width: 13, height: 13, position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Nomor surat, perihal, atau kategori..."
                className="w-full bg-white border border-[#e2e8f0] text-slate-700 text-xs rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db]"
              />
            </div>
          </div>
          <Sel label="Rentang Tahun" value={filterYear} onChange={setFilterYear} opts={["2018","2019","2020","2021","2022","2023","2024","2025","2026"]} />
          <Sel label="Kategori" value={filterCat} onChange={setFilterCat} opts={["Perizinan","Keuangan","Kepegawaian","Pengadaan","Aset","Audit","Umum"]} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between">
          <span className="text-sm font-semibold text-[#0f1c2e]">
            Hasil Ditemukan: <span className="text-[#1a56db]">{filtered.length}</span> dokumen
          </span>
          <span className="text-xs text-slate-400" style={{ fontFamily: "'DM Mono', monospace" }}>
            Halaman {page} / {totalPages || 1}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc]">
                {["No. Surat","Perihal","Kategori","Tahun","Tanggal Surat","Uploader","Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#f1f5f9] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">Memuat data arsip...</td>
                </tr>
              )}
              {!isLoading && paged.map((doc, i) => (
                <tr
                  key={doc.id}
                  onClick={() => navigate(`/arsip/${doc.id}`)}
                  className={`hover:bg-[#f8fafc] transition-colors cursor-pointer ${i < paged.length - 1 ? "border-b border-[#f4f6f9]" : ""}`}
                >
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-[#1a56db] font-semibold">{doc.nomorSurat}</span>
                  </td>
                  <td className="px-4 py-3.5 max-w-[200px]">
                    <span className="text-slate-700 text-xs font-medium line-clamp-2 block">{doc.perihal}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{doc.kategori}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-slate-500">{new Date(doc.tanggalSurat).getFullYear()}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatTanggal(doc.tanggalSurat)}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">{doc.uploader?.namaLengkap ?? "-"}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Preview"
                        onClick={(e) => { e.stopPropagation(); navigate(`/arsip/${doc.id}`); }}
                        className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-[#1a56db] transition-colors"
                      >
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                      <button
                        type="button"
                        title="Detail"
                        onClick={(e) => { e.stopPropagation(); navigate(`/arsip/${doc.id}`); }}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Info style={{ width: 14, height: 14 }} />
                      </button>
                      <button
                        type="button"
                        title="Unduh"
                        onClick={(e) => { e.stopPropagation(); downloadArsip(doc); }}
                        className="p-1.5 rounded hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
                      >
                        <Download style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Tidak ada dokumen yang sesuai dengan filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-[#f1f5f9] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Menampilkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} dari {filtered.length} entri
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft style={{ width: 15, height: 15, color: "#64748b" }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                  page === n ? "bg-[#1a56db] text-white" : "hover:bg-slate-100 text-slate-500"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight style={{ width: 15, height: 15, color: "#64748b" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
