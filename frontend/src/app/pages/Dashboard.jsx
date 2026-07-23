import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Archive, ArrowUpRight, FileText, Layers, FilePlus, Clock, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { authFetch, formatTanggal } from "../utils/helpers.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [archives, setArchives] = useState([]);

  useEffect(() => {
    authFetch("/arsip")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Gagal memuat data arsip"))))
      .then((data) => setArchives(data))
      .catch((error) => toast.error(error.message));
  }, []);

  const recentDocs = archives.slice(0, 5);
  const total = archives.length;

  const now = new Date();
  const uploadBulanIni = archives.filter((d) => {
    const created = new Date(d.createdAt);
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const volumePerTahun = Object.entries(
    archives.reduce((acc, d) => {
      const year = new Date(d.tanggalSurat).getFullYear();
      acc[year] = (acc[year] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([year, total]) => ({ year, total }))
    .sort((a, b) => a.year - b.year);

  return (
    <div className="p-7 space-y-6">
      {/* Welcome row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1c2e]">Selamat Pagi, {user?.namaLengkap ?? "Memuat..."} 👋</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} · Sistem berjalan normal
          </p>
        </div>
        <button
          onClick={() => navigate("/upload")}
          className="flex items-center gap-2 bg-[#1a56db] text-white text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-[#1d4ed8] transition-colors shadow-sm"
        >
          <FilePlus style={{ width: 15, height: 15 }} /> Upload Arsip
        </button>
      </div>

      {/* Stat widgets */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Arsip", value: total.toLocaleString("id-ID"), icon: Archive, color: "#1a56db", bg: "#dbeafe", subtext: `+${uploadBulanIni.toLocaleString("id-ID")} bulan ini` },
          { label: "Upload Baru", value: uploadBulanIni.toLocaleString("id-ID"), icon: ArrowUpRight, color: "#16a34a", bg: "#dcfce7", subtext: "+18% dari bulan lalu" },
          { label: "Dokumen Aktif", value: total.toLocaleString("id-ID"), icon: FileText, color: "#d97706", bg: "#fef3c7", subtext: "83.8% dari total" },
          { label: "Unit Kerja", value: "12", icon: Layers, color: "#7c3aed", bg: "#ede9fe", subtext: "Semua terhubung" },
        ].map((w) => (
          <div key={w.label} className="bg-white rounded-xl border border-[#e2e8f0] p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="uppercase tracking-wide text-slate-500 text-[10px] md:text-xs font-semibold">{w.label}</div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: w.bg }}>
                <w.icon style={{ width: 16, height: 16, color: w.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0f1c2e] mb-1">{w.value}</div>
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-emerald-500 font-medium mt-1">
              <Check className="w-3 h-3" />
              {w.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="col-span-2 bg-white rounded-xl border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#0f1c2e]">Volume Arsip per Tahun</h3>
              <p className="text-xs text-slate-400 mt-0.5">Jumlah dokumen yang diarsipkan berdasarkan tahun surat</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#1a56db]" />
              <span className="text-xs text-slate-500">Jumlah Dokumen</span>
            </div>
          </div>
          {volumePerTahun.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-sm text-slate-400">
              Belum ada arsip yang diunggah
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={volumePerTahun} barSize={32} margin={{ left: -10, right: 0, bottom: 0, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeWidth={1.5} strokeOpacity={0.8} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#94a3b8", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f1c2e", border: "none", borderRadius: 8, fontSize: 12, color: "#e2e8f0" }}
                  cursor={{ fill: "#f1f5f9" }}
                  formatter={(v) => [v.toLocaleString("id-ID"), "Dokumen"]}
                />
                <Bar dataKey="total" fill="#1a56db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick access / recent */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 flex flex-col">
          <h3 className="text-sm font-bold text-[#0f1c2e] mb-4">Arsip Terbaru</h3>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {recentDocs.length === 0 && (
              <div className="text-xs text-slate-400 text-center py-6">Belum ada arsip yang diunggah</div>
            )}
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#f8fafc] cursor-pointer transition-colors group"
                onClick={() => navigate(`/arsip/${doc.id}`)}
              >
                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText style={{ width: 13, height: 13, color: "#1a56db" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#0f1c2e] truncate group-hover:text-[#1a56db] transition-colors">{doc.perihal}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock style={{ width: 9, height: 9 }} /> {formatTanggal(doc.tanggalSurat)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/arsip")}
            className="mt-4 w-full text-center text-xs text-[#1a56db] font-semibold hover:underline"
          >
            Lihat semua arsip →
          </button>
        </div>
      </div>
    </div>
  );
}
