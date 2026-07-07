import { useState } from "react";
import { Routes, Route, useLocation, useNavigate, useParams } from "react-router";
import Login from "./pages/Login.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import logoPemkotMedan from "../assets/logo-pemkot-medan.png";
import logoBerakhlak from "../assets/logo-berakhlak.png";
import logoMedanUntukSemua from "../assets/logo-medan-untuk-semua.png";
import bgLandingHero from "../assets/bg-landing-hero.jpg";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  Search,
  Upload,
  Users,
  Shield,
  LogIn,
  ArrowRight,
  ChevronDown,
  Eye,
  Info,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Tag,
  Archive,
  MapPin,
  FolderOpen,
  FilePlus,
  Bell,
  User,
  ArrowUpRight,
  Filter,
  X,
  Check,
  AlertCircle,
  Layers,
  Clock,
  Pencil,
  KeyRound,
  Trash2,
  UserPlus,
  UserCheck,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const SIDEBAR_NAV = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/arsip", label: "Pencarian Lanjutan", icon: Search },
  { path: "/upload", label: "Upload Arsip", icon: Upload },
  { path: "/manajemen-pengguna", label: "Manajemen Pengguna", icon: Users, adminOnly: true },
];

function getPageLabel(pathname) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/arsip") return "Pencarian Lanjutan";
  if (pathname.startsWith("/arsip/")) return "Detail Dokumen";
  if (pathname === "/upload") return "Upload Arsip";
  if (pathname === "/manajemen-pengguna") return "Manajemen Pengguna";
  return "";
}

const ARCHIVE_DATA = [
  { year: "2018", total: 342 },
  { year: "2019", total: 518 },
  { year: "2020", total: 487 },
  { year: "2021", total: 631 },
  { year: "2022", total: 724 },
  { year: "2023", total: 896 },
  { year: "2024", total: 1043 },
];

const DOCUMENTS = [
  { id: "SRT-2024-0891", perihal: "Permohonan Izin Operasional Gedung Baru", jenis: "Surat Masuk", tahun: 2024, tanggal: "12 Mar 2024", uploader: "Rizky Pratama", prioritas: "Tinggi", kategori: "Perizinan" },
  { id: "SRT-2024-0756", perihal: "Laporan Keuangan Triwulan I 2024", jenis: "Surat Keluar", tahun: 2024, tanggal: "05 Mar 2024", uploader: "Siti Rahayu", prioritas: "Normal", kategori: "Keuangan" },
  { id: "SRT-2023-1204", perihal: "Undangan Rapat Koordinasi Dinas", jenis: "Surat Masuk", tahun: 2023, tanggal: "28 Nov 2023", uploader: "Ahmad Fauzi", prioritas: "Normal", kategori: "Umum" },
  { id: "SRT-2023-1089", perihal: "Keputusan Penetapan Pemenang Tender", jenis: "SK Internal", tahun: 2023, tanggal: "15 Nov 2023", uploader: "Dewi Lestari", prioritas: "Rahasia", kategori: "Pengadaan" },
  { id: "SRT-2023-0934", perihal: "Permohonan Kenaikan Pangkat PNS", jenis: "Surat Masuk", tahun: 2023, tanggal: "03 Sep 2023", uploader: "Rizky Pratama", prioritas: "Normal", kategori: "Kepegawaian" },
  { id: "SRT-2022-1567", perihal: "Berita Acara Serah Terima Aset Daerah", jenis: "SK Internal", tahun: 2022, tanggal: "20 Des 2022", uploader: "Siti Rahayu", prioritas: "Tinggi", kategori: "Aset" },
  { id: "SRT-2022-1341", perihal: "Memo Internal Efisiensi Anggaran 2022", jenis: "Memo", tahun: 2022, tanggal: "18 Okt 2022", uploader: "Ahmad Fauzi", prioritas: "Normal", kategori: "Keuangan" },
  { id: "SRT-2021-0892", perihal: "Surat Tugas Tim Audit Eksternal", jenis: "Surat Keluar", tahun: 2021, tanggal: "07 Jun 2021", uploader: "Dewi Lestari", prioritas: "Tinggi", kategori: "Audit" },
];

const PRIORITY_COLORS = {
  "Tinggi": "bg-amber-100 text-amber-700 border-amber-200",
  "Normal": "bg-green-100 text-green-700 border-green-200",
  "Rahasia": "bg-red-100 text-red-700 border-red-200",
};

export default function App() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="size-full min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <Dashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/arsip"
          element={
            <ProtectedRoute>
              <AppShell>
                <ArchivePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/arsip/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <DetailPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <AppShell>
                <UploadPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manajemen-pengguna"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppShell>
                <UserManagementPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FRAME 1 – LANDING PAGE
───────────────────────────────────────────── */
function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgLandingHero})` }}
      />
      {/* Dark blue overlay for readability */}
      <div className="absolute inset-0 bg-blue-900/60" />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/40 to-transparent">
        {/* Left: Pemkot Medan logo + E-ARSIP text */}
        <div className="flex items-center gap-3">
          <img src={logoPemkotMedan} alt="Logo Pemkot Medan" className="h-10 w-auto object-contain flex-shrink-0" />
          <span className="text-white font-bold text-lg tracking-wide">E-ARSIP</span>
        </div>

        {/* Right: BerAKHLAK + Medan Untuk Semua logos, Login button */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex items-center gap-4">
            <img src={logoBerakhlak} alt="Logo BerAKHLAK" className="h-8 w-auto object-contain" />
            <img src={logoMedanUntukSemua} alt="Logo Medan Untuk Semua" className="h-8 w-auto object-contain" />
          </div>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-[#1a56db] font-semibold text-sm px-5 py-2 rounded-md hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Login
          </button>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        {/* Badge */}
        <div className="bg-white/20 backdrop-blur-sm text-white rounded-full px-4 py-1 text-sm font-medium">
          Portal Resmi Pemko Medan
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center mt-4 tracking-tight">
          Selamat Datang di Aplikasi E-ARSIP
        </h1>

        {/* Subtitle */}
        <p className="text-gray-200 text-lg md:text-xl text-center mt-4 max-w-2xl">
          Sistem Informasi Kearsipan Elektronik Terintegrasi Pemerintah Kota Medan
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/login")}
          className="mt-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-md flex items-center gap-2.5 transition-all shadow-xl shadow-blue-900/40 text-base"
        >
          Masuk ke Sistem
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Footer */}
      <footer className="relative z-20 text-center text-white text-xs md:text-sm py-4">
        © 2026 Bagian Organisasi Sekretariat Daerah Pemerintah Kota Medan
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP SHELL (Sidebar + Header)
───────────────────────────────────────────── */
function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pageLabel = getPageLabel(location.pathname);
  const visibleNav = SIDEBAR_NAV.filter((item) => !item.adminOnly || user?.role === "admin");
  const roleLabel = user?.role === "admin" ? "Administrator" : "Staf";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f9]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: "#0f1c2e" }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <img
              src={logoPemkotMedan}
              alt="Logo Pemkot Medan"
              className="h-10 w-auto object-contain flex-shrink-0"
            />
            <div>
              <div className="text-white font-bold text-sm">E-ARSIP</div>
              <div className="text-slate-400 text-xs">Substansi X</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Menu Utama</div>
          {visibleNav.map(({ path, label, icon: Icon, adminOnly }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#1a56db] text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-400 hover:bg-white/6 hover:text-slate-200"
                }`}
              >
                <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span className="flex-1 text-left">{label}</span>
                {adminOnly && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium tracking-wide">ADMIN</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1a56db]/40 flex items-center justify-center">
              <User style={{ width: 14, height: 14, color: "#93c5fd" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-200 text-xs font-medium truncate">{user?.name ?? "Pengguna"}</div>
              <div className="text-slate-500 text-[10px]">{roleLabel}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <LogOut style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3 text-sm">
            <img src={logoBerakhlak} alt="Logo BerAKHLAK" className="h-8 w-auto object-contain flex-shrink-0" />
            <div className="h-5 w-px bg-slate-200" />
            <span className="text-slate-400">E-Arsip</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-semibold">{pageLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-md hover:bg-slate-100 transition-colors">
              <Bell style={{ width: 18, height: 18, color: "#64748b" }} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-md transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#1a56db]/10 flex items-center justify-center">
                <User style={{ width: 13, height: 13, color: "#1a56db" }} />
              </div>
              <span className="text-slate-700 text-sm font-medium">{user?.name ?? "Pengguna"}</span>
              <ChevronDown style={{ width: 13, height: 13, color: "#94a3b8" }} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FRAME 2 – DASHBOARD
───────────────────────────────────────────── */
function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const total = ARCHIVE_DATA.reduce((s, d) => s + d.total, 0);

  return (
    <div className="p-7 space-y-6">
      {/* Welcome row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1c2e]">Selamat Pagi, {user?.name ?? "Pengguna"} 👋</h2>
          <p className="text-slate-500 text-sm mt-0.5">Minggu, 06 Juli 2025 · Sistem berjalan normal</p>
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
          { label: "Total Arsip", value: total.toLocaleString("id-ID"), delta: "+104 bulan ini", icon: Archive, color: "#1a56db", bg: "#dbeafe" },
          { label: "Upload Baru", value: "104", delta: "+18% dari bulan lalu", icon: ArrowUpRight, color: "#16a34a", bg: "#dcfce7" },
          { label: "Dokumen Aktif", value: "3.891", delta: "83.8% dari total", icon: FileText, color: "#d97706", bg: "#fef3c7" },
          { label: "Unit Kerja", value: "12", delta: "Semua terhubung", icon: Layers, color: "#7c3aed", bg: "#ede9fe" },
        ].map((w) => (
          <div key={w.label} className="bg-white rounded-xl border border-[#e2e8f0] p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">{w.label}</div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: w.bg }}>
                <w.icon style={{ width: 16, height: 16, color: w.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0f1c2e] mb-1">{w.value}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Check style={{ width: 11, height: 11, color: "#22c55e" }} />
              {w.delta}
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
              <p className="text-xs text-slate-400 mt-0.5">Jumlah dokumen yang diarsipkan 2018–2024</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#1a56db]" />
              <span className="text-xs text-slate-500">Jumlah Dokumen</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ARCHIVE_DATA} barSize={32} margin={{ left: -10, right: 0, bottom: 0, top: 5 }}>
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
        </div>

        {/* Quick access / recent */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 flex flex-col">
          <h3 className="text-sm font-bold text-[#0f1c2e] mb-4">Arsip Terbaru</h3>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {DOCUMENTS.slice(0, 5).map((doc) => (
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
                    <Clock style={{ width: 9, height: 9 }} /> {doc.tanggal}
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

/* ─────────────────────────────────────────────
   FRAME 3 – ARCHIVE / DATA GRID
───────────────────────────────────────────── */
function ArchivePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterYear, setFilterYear] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterPrio, setFilterPrio] = useState("");
  const [filterTeam, setFilterTeam] = useState("");

  const filtered = DOCUMENTS.filter((d) => {
    if (filterYear && String(d.tahun) !== filterYear) return false;
    if (filterCat && d.kategori !== filterCat) return false;
    if (filterPrio && d.prioritas !== filterPrio) return false;
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
        <p className="text-slate-500 text-sm mt-0.5">Gunakan filter di bawah untuk mempersempit hasil pencarian</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter style={{ width: 15, height: 15, color: "#1a56db" }} />
          <span className="text-sm font-semibold text-[#0f1c2e]">Filter Pencarian</span>
          {(filterYear || filterCat || filterPrio) && (
            <button
              onClick={() => { setFilterYear(""); setFilterCat(""); setFilterPrio(""); setFilterTeam(""); setPage(1); }}
              className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X style={{ width: 11, height: 11 }} /> Hapus Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Sel label="Rentang Tahun" value={filterYear} onChange={setFilterYear} opts={["2018","2019","2020","2021","2022","2023","2024"]} />
          <Sel label="Kategori" value={filterCat} onChange={setFilterCat} opts={["Perizinan","Keuangan","Kepegawaian","Pengadaan","Aset","Audit","Umum"]} />
          <Sel label="Tingkat Prioritas" value={filterPrio} onChange={setFilterPrio} opts={["Tinggi","Normal","Rahasia"]} />
          <Sel label="Unit/Tim" value={filterTeam} onChange={setFilterTeam} opts={["Sekretariat","Bidang I","Bidang II","Bidang III"]} />
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
                {["No. Surat","Perihal","Jenis","Tahun","Tanggal Upload","Uploader","Prioritas","Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#f1f5f9] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((doc, i) => (
                <tr
                  key={doc.id}
                  className={`hover:bg-[#f8fafc] transition-colors ${i < paged.length - 1 ? "border-b border-[#f4f6f9]" : ""}`}
                >
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-[#1a56db] font-semibold">{doc.id}</span>
                  </td>
                  <td className="px-4 py-3.5 max-w-[200px]">
                    <span className="text-slate-700 text-xs font-medium line-clamp-2 block">{doc.perihal}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{doc.jenis}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-slate-500">{doc.tahun}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{doc.tanggal}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">{doc.uploader}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[doc.prioritas]}`}>
                      {doc.prioritas}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        title="Preview"
                        onClick={() => navigate(`/arsip/${doc.id}`)}
                        className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-[#1a56db] transition-colors"
                      >
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                      <button
                        title="Detail"
                        onClick={() => navigate(`/arsip/${doc.id}`)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Info style={{ width: 14, height: 14 }} />
                      </button>
                      <button
                        title="Unduh"
                        className="p-1.5 rounded hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
                      >
                        <Download style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">
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

/* ─────────────────────────────────────────────
   FRAME 4 – DOCUMENT DETAIL / SPLIT VIEW
───────────────────────────────────────────── */
function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = DOCUMENTS.find((d) => d.id === id);
  const onBack = () => navigate("/arsip");

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
          {doc.id}
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
              {doc.id}_surat_resmi.pdf
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded hover:bg-white/10 transition-colors flex items-center gap-1.5">
                <Download style={{ width: 12, height: 12 }} /> Unduh
              </button>
            </div>
          </div>

          {/* Mock PDF page */}
          <div className="flex-1 overflow-y-auto flex items-start justify-center py-8 px-6">
            <div className="w-full max-w-lg bg-white rounded-sm shadow-2xl">
              {/* PDF content mockup */}
              <div className="p-10 text-xs" style={{ fontFamily: "Georgia, serif", lineHeight: 1.8, color: "#111" }}>
                {/* Letterhead */}
                <div className="flex items-start gap-4 border-b-2 border-gray-800 pb-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-gray-600" />
                  </div>
                  <div className="text-center flex-1">
                    <div className="font-bold text-[11px] uppercase tracking-wide">PEMERINTAH KOTA MEDAN</div>
                    <div className="text-[10px] uppercase tracking-wide">DINAS SUBSTANSI X</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">Jl. Kapten Maulana Lubis No. 2, Medan 20112</div>
                    <div className="text-[9px] text-gray-500">Telp. (061) 4515218 | Fax. (061) 4155765</div>
                  </div>
                </div>

                <div className="text-center mb-5">
                  <div className="font-bold text-[11px] uppercase underline">SURAT KEPUTUSAN</div>
                  <div className="text-[10px] mt-0.5">Nomor: {doc.id}</div>
                </div>

                <div className="mb-4">
                  <div className="font-bold mb-1">TENTANG</div>
                  <div className="pl-4 border-l-2 border-gray-300 italic">{doc.perihal}</div>
                </div>

                <div className="mb-3">
                  <span className="font-bold">KEPALA DINAS SUBSTANSI X KOTA MEDAN</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div><span className="font-bold">Menimbang </span>: a. bahwa dalam rangka meningkatkan kualitas pengelolaan administrasi dan pelayanan publik di lingkungan Pemerintah Kota Medan;</div>
                  <div className="pl-[82px]">b. bahwa berdasarkan ketentuan peraturan perundang-undangan yang berlaku, dipandang perlu untuk menetapkan keputusan ini;</div>
                  <div><span className="font-bold">Mengingat </span>: 1. Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah;</div>
                  <div className="pl-[74px]">2. Peraturan Pemerintah Nomor 18 Tahun 2016 tentang Perangkat Daerah;</div>
                </div>

                <div className="text-center font-bold mb-3 uppercase">MEMUTUSKAN:</div>
                <div className="mb-2"><span className="font-bold">Menetapkan </span>: {doc.perihal}</div>

                <div className="mt-6 flex justify-end">
                  <div className="text-center text-[10px]">
                    <div>Medan, {doc.tanggal}</div>
                    <div className="font-bold">Kepala Dinas Substansi X</div>
                    <div className="w-24 h-16 mx-auto my-2 border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-[8px]">
                      TTD + STEMPEL
                    </div>
                    <div className="font-bold underline">Drs. H. Surya Bahtiar, M.Si</div>
                    <div>NIP. 196805121994031004</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT – Metadata panel */}
        <div className="w-80 flex-shrink-0 bg-white border-l border-[#e2e8f0] overflow-y-auto flex flex-col">
          <div className="px-5 py-4 border-b border-[#f1f5f9]">
            <h3 className="font-bold text-sm text-[#0f1c2e]">Metadata Dokumen</h3>
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* Priority badge */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${PRIORITY_COLORS[doc.prioritas]}`}>
                {doc.prioritas === "Rahasia" ? "🔒 " : ""}{doc.prioritas}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{doc.jenis}</span>
            </div>

            {/* Meta fields */}
            <div className="space-y-4">
              {[
                { label: "ID Dokumen", value: doc.id, icon: Tag, mono: true },
                { label: "Tanggal Surat", value: doc.tanggal, icon: Calendar, mono: false },
                { label: "Perihal", value: doc.perihal, icon: FileText, mono: false },
                { label: "Kategori", value: doc.kategori, icon: FolderOpen, mono: false },
                { label: "Tahun Arsip", value: String(doc.tahun), icon: Clock, mono: true },
                { label: "Diunggah oleh", value: doc.uploader, icon: User, mono: false },
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
              <div className="space-y-2">
                {[
                  { label: "Lemari", value: "Lemari A" },
                  { label: "Rak / Laci", value: "Rak ke-2" },
                  { label: "Ordner / Binder", value: "Ordner Merah — 2023/IV" },
                  { label: "Nomor Urut Fisik", value: "No. 089" },
                ].map((loc) => (
                  <div key={loc.label} className="flex items-center justify-between text-xs">
                    <span className="text-amber-700 font-medium">{loc.label}</span>
                    <span className="font-bold text-amber-900" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{loc.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-5 border-t border-[#f1f5f9] space-y-2">
            <button className="w-full bg-[#1a56db] text-white text-sm font-semibold py-2.5 rounded-md hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2">
              <Download style={{ width: 15, height: 15 }} /> Unduh Dokumen
            </button>
            <button className="w-full border border-[#e2e8f0] text-slate-600 text-sm font-medium py-2.5 rounded-md hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Eye style={{ width: 15, height: 15 }} /> Lihat Riwayat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FRAME 5 – ADMIN UPLOAD FORM
───────────────────────────────────────────── */
function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStep, setUploadStep] = useState(0);
  const [formData, setFormData] = useState({
    nomorSurat: "",
    tanggal: "",
    perihal: "",
    jenis: "",
    kategori: "",
    prioritas: "",
    lemari: "",
    rak: "",
    ordner: "",
    keterangan: "",
  });
  const update = (k, v) => setFormData({ ...formData, [k]: v });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-7 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0f1c2e]">Upload Arsip Baru</h2>
        <p className="text-slate-500 text-sm mt-0.5">Unggah berkas dan lengkapi metadata untuk pengarsipan dokumen</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-7">
        {["Upload Berkas", "Isi Metadata", "Lokasi Fisik", "Konfirmasi"].map((label, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => setUploadStep(i)}
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                i < uploadStep ? "bg-emerald-500 text-white" :
                i === uploadStep ? "bg-[#1a56db] text-white shadow-lg shadow-blue-200" :
                "bg-slate-200 text-slate-400"
              }`}>
                {i < uploadStep ? <Check style={{ width: 10, height: 10 }} /> : i + 1}
              </div>
              <span className={i === uploadStep ? "text-[#1a56db]" : i < uploadStep ? "text-emerald-600" : "text-slate-400"}>
                {label}
              </span>
            </button>
            {i < 3 && <div className={`w-12 h-px mx-2 ${i < uploadStep ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) { setUploadedFile(file.name); setUploadStep(1); }
          }}
          className={`rounded-xl border-2 border-dashed transition-all cursor-pointer py-10 flex flex-col items-center justify-center text-center ${
            uploadedFile
              ? "border-emerald-300 bg-emerald-50"
              : isDragging
              ? "border-[#1a56db] bg-blue-50"
              : "border-[#cbd5e1] bg-white hover:border-[#1a56db] hover:bg-blue-50/30"
          }`}
        >
          {uploadedFile ? (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-sm font-bold text-emerald-700">{uploadedFile}</div>
              <div className="text-xs text-emerald-500 mt-1">Berkas siap untuk diarsipkan</div>
              <button
                onClick={() => { setUploadedFile(null); setUploadStep(0); }}
                className="mt-3 text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
              >
                <X style={{ width: 11, height: 11 }} /> Hapus
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Upload style={{ width: 24, height: 24, color: "#1a56db" }} />
              </div>
              <div className="text-sm font-bold text-slate-700">Seret & Lepas Berkas di Sini</div>
              <div className="text-xs text-slate-400 mt-1.5 mb-3">Format yang didukung: PDF · Maks. ukuran 25 MB</div>
              <label className="bg-[#1a56db] text-white text-xs font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-[#1d4ed8] transition-colors">
                Atau Pilih Berkas
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setUploadedFile(file.name); setUploadStep(1); }
                  }}
                />
              </label>
            </>
          )}
        </div>

        {/* Metadata form */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText style={{ width: 15, height: 15, color: "#1a56db" }} />
            <h3 className="text-sm font-bold text-[#0f1c2e]">Metadata Dokumen</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nomor Surat *" placeholder="contoh: 005/1234/DS-X/2024" value={formData.nomorSurat} onChange={(v) => update("nomorSurat", v)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Tanggal Surat *</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => update("tanggal", e.target.value)}
                className="border border-[#e2e8f0] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] bg-white"
              />
            </div>
            <FormField label="Perihal Surat *" placeholder="Deskripsi singkat isi surat" value={formData.perihal} onChange={(v) => update("perihal", v)} className="col-span-2" />
            <SelectField
              label="Jenis Dokumen *"
              value={formData.jenis}
              onChange={(v) => update("jenis", v)}
              opts={["Surat Masuk", "Surat Keluar", "SK Internal", "Memo", "Nota Dinas", "Berita Acara"]}
            />
            <SelectField
              label="Kategori *"
              value={formData.kategori}
              onChange={(v) => update("kategori", v)}
              opts={["Perizinan", "Keuangan", "Kepegawaian", "Pengadaan", "Aset", "Audit", "Umum"]}
            />
            <SelectField
              label="Tingkat Prioritas *"
              value={formData.prioritas}
              onChange={(v) => update("prioritas", v)}
              opts={["Normal", "Tinggi", "Rahasia"]}
            />
          </div>
        </div>

        {/* Physical location */}
        <div className="bg-white rounded-xl border border-amber-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin style={{ width: 15, height: 15, color: "#d97706" }} />
            <h3 className="text-sm font-bold text-[#0f1c2e]">Lokasi Penyimpanan Fisik</h3>
            <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">WAJIB DIISI</span>
          </div>
          <p className="text-xs text-slate-400 mb-5 pl-5">Tentukan lokasi fisik arsip cetak agar mudah ditemukan kembali</p>
          <div className="grid grid-cols-3 gap-4">
            <SelectField
              label="Lemari / Kabinet *"
              value={formData.lemari}
              onChange={(v) => update("lemari", v)}
              opts={["Lemari A", "Lemari B", "Lemari C", "Lemari D"]}
              accent
            />
            <SelectField
              label="Rak / Laci *"
              value={formData.rak}
              onChange={(v) => update("rak", v)}
              opts={["Rak ke-1", "Rak ke-2", "Rak ke-3", "Rak ke-4", "Rak ke-5"]}
              accent
            />
            <FormField label="Ordner / Binder *" placeholder="cth: Ordner Merah — 2024/I" value={formData.ordner} onChange={(v) => update("ordner", v)} accent />
          </div>
          <div className="mt-4">
            <FormField label="Keterangan Tambahan" placeholder="Catatan fisik lainnya (opsional)" value={formData.keterangan} onChange={(v) => update("keterangan", v)} />
          </div>
        </div>

        {/* Sticky save button */}
        <div className="sticky bottom-0 bg-[#f4f6f9] py-4 flex items-center justify-between border-t border-[#e2e8f0] -mx-7 px-7 mt-6">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <AlertCircle style={{ width: 12, height: 12 }} />
            Field bertanda * wajib diisi sebelum menyimpan
          </div>
          <div className="flex items-center gap-3">
            <button className="border border-[#e2e8f0] text-slate-600 text-sm font-medium px-5 py-2.5 rounded-md hover:bg-white transition-colors">
              Simpan Draf
            </button>
            <button
              onClick={handleSave}
              className={`text-sm font-bold px-7 py-2.5 rounded-md transition-all flex items-center gap-2 shadow-md ${
                saved
                  ? "bg-emerald-500 text-white shadow-emerald-200"
                  : "bg-[#1a56db] text-white hover:bg-[#1d4ed8] shadow-blue-200"
              }`}
            >
              {saved ? <><Check style={{ width: 15, height: 15 }} /> Tersimpan!</> : <><Archive style={{ width: 15, height: 15 }} /> Simpan & Arsipkan</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared form primitives ── */
function FormField({
  label, placeholder, value, onChange, className = "", accent = false,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className={`text-xs font-semibold ${accent ? "text-amber-700" : "text-slate-500"}`}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`border rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:border-[#1a56db] transition-colors bg-white placeholder-slate-300 ${
          accent
            ? "border-amber-200 focus:ring-amber-300/40"
            : "border-[#e2e8f0] focus:ring-[#1a56db]/30"
        }`}
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, opts, accent = false,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-semibold ${accent ? "text-amber-700" : "text-slate-500"}`}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-white border rounded-md pl-3 pr-7 py-2 text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:border-[#1a56db] transition-colors ${
            accent
              ? "border-amber-200 focus:ring-amber-300/40"
              : "border-[#e2e8f0] focus:ring-[#1a56db]/30"
          }`}
        >
          <option value="">— Pilih —</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FRAME 6 – USER MANAGEMENT PAGE
───────────────────────────────────────────── */

const SYSTEM_USERS = [
  {
    id: 1,
    nama: "Dewi Anggraini, S.Sos",
    nip: "198704122010012014",
    tim: "Sekretariat",
    role: "Admin",
    status: "Aktif",
    avatar: "DA",
    lastLogin: "06 Jul 2025, 08:45",
    email: "dewi.anggraini@pemkomedan.go.id",
  },
  {
    id: 2,
    nama: "Rizky Pratama, A.Md",
    nip: "199203072015031002",
    tim: "Bidang I — Perencanaan",
    role: "Staf",
    status: "Aktif",
    avatar: "RP",
    lastLogin: "05 Jul 2025, 14:32",
    email: "rizky.pratama@pemkomedan.go.id",
  },
  {
    id: 3,
    nama: "Siti Rahayu, S.Kom",
    nip: "199508182019022003",
    tim: "Bidang II — Keuangan",
    role: "Staf",
    status: "Aktif",
    avatar: "SR",
    lastLogin: "04 Jul 2025, 09:15",
    email: "siti.rahayu@pemkomedan.go.id",
  },
  {
    id: 4,
    nama: "Ahmad Fauzi, S.AP",
    nip: "198811052012011007",
    tim: "Bidang III — Kepegawaian",
    role: "Admin",
    status: "Aktif",
    avatar: "AF",
    lastLogin: "03 Jul 2025, 16:00",
    email: "ahmad.fauzi@pemkomedan.go.id",
  },
  {
    id: 5,
    nama: "Rina Kusuma, S.E",
    nip: "200001152022032001",
    tim: "Bidang I — Perencanaan",
    role: "Staf",
    status: "Aktif",
    avatar: "RK",
    lastLogin: "01 Jul 2025, 11:20",
    email: "rina.kusuma@pemkomedan.go.id",
  },
];

const AVATAR_COLORS = {
  DA: { bg: "#dbeafe", text: "#1a56db" },
  RP: { bg: "#dcfce7", text: "#16a34a" },
  SR: { bg: "#fce7f3", text: "#be185d" },
  AF: { bg: "#fef3c7", text: "#d97706" },
  RK: { bg: "#ede9fe", text: "#7c3aed" },
};

function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [users, setUsers] = useState(SYSTEM_USERS);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.nama.toLowerCase().includes(q) || u.nip.includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteTarget(null);
    showToast("Pengguna berhasil dihapus dari sistem.", "danger");
  };

  const toastColors = {
    success: { bg: "#f0fdf4", border: "#86efac", text: "#15803d", icon: Check },
    info: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", icon: KeyRound },
    danger: { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c", icon: Trash2 },
  };

  return (
    <div className="p-7 space-y-6 relative">
      {/* Toast */}
      {toast && (() => {
        const tc = toastColors[toast.type];
        const Icon = tc.icon;
        return (
          <div
            className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300"
            style={{ background: tc.bg, borderColor: tc.border, color: tc.text, minWidth: 280 }}
          >
            <Icon style={{ width: 15, height: 15 }} />
            {toast.msg}
          </div>
        );
      })()}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1c2e]">Kelola Pengguna Sistem</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Manajemen akun, hak akses, dan autentikasi pengguna E-Arsip
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1a56db] hover:bg-[#1d4ed8] text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors shadow-md shadow-blue-200"
        >
          <UserPlus style={{ width: 15, height: 15 }} />
          + Tambah Pengguna Baru
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-3">
        {[
          { label: "Total Pengguna", value: users.length, icon: Users, color: "#1a56db", bg: "#dbeafe" },
          { label: "Administrator", value: users.filter((u) => u.role === "Admin").length, icon: ShieldCheck, color: "#d97706", bg: "#fef3c7" },
          { label: "Staf Aktif", value: users.filter((u) => u.role === "Staf").length, icon: UserCheck, color: "#16a34a", bg: "#dcfce7" },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c.bg }}>
              <c.icon style={{ width: 15, height: 15, color: c.color }} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#0f1c2e]">{c.value}</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] px-5 py-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search style={{ width: 14, height: 14, position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NIP..."
            className="w-full border border-[#e2e8f0] rounded-md pl-8 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] bg-[#f8fafc] placeholder-slate-300 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X style={{ width: 12, height: 12, color: "#94a3b8" }} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-[#e2e8f0] text-slate-600 text-sm rounded-md pl-3 pr-8 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] transition-colors"
          >
            <option value="">Semua Role</option>
            <option value="Admin">Admin</option>
            <option value="Staf">Staf</option>
          </select>
          <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
        </div>

        <span className="ml-auto text-xs text-slate-400">
          Menampilkan <span className="font-semibold text-slate-600">{filtered.length}</span> dari {users.length} pengguna
        </span>
      </div>

      {/* Main data table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#f1f5f9]">
                {["Nama Pegawai", "NIP", "Tim / Fungsi", "Role", "Status", "Login Terakhir", "Aksi"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => {
                const av = AVATAR_COLORS[user.avatar] ?? { bg: "#f1f5f9", text: "#64748b" };
                return (
                  <tr
                    key={user.id}
                    className={`group hover:bg-[#f8fafc] transition-colors ${i < filtered.length - 1 ? "border-b border-[#f4f6f9]" : ""}`}
                  >
                    {/* Nama */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: av.bg, color: av.text }}
                        >
                          {user.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#0f1c2e] group-hover:text-[#1a56db] transition-colors">
                            {user.nama}
                          </div>
                          <div className="text-[10px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* NIP */}
                    <td className="px-5 py-4">
                      <span
                        className="text-xs text-slate-500"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {user.nip}
                      </span>
                    </td>

                    {/* Tim */}
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-600 font-medium">{user.tim}</span>
                    </td>

                    {/* Role badge */}
                    <td className="px-5 py-4">
                      {user.role === "Admin" ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                          <ShieldCheck style={{ width: 10, height: 10 }} />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-[#1a56db] border border-blue-200">
                          <User style={{ width: 10, height: 10 }} />
                          Staf
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700">Aktif</span>
                      </div>
                    </td>

                    {/* Login terakhir */}
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock style={{ width: 11, height: 11 }} />
                        {user.lastLogin}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5">
                        {/* Edit */}
                        <button
                          title="Edit Pengguna"
                          onClick={() => { setEditTarget(user); setShowModal(true); }}
                          className="p-2 rounded-md text-slate-400 hover:text-[#1a56db] hover:bg-blue-50 transition-colors"
                        >
                          <Pencil style={{ width: 14, height: 14 }} />
                        </button>
                        {/* Reset password */}
                        <button
                          title="Reset Password"
                          onClick={() => { setResetTarget(user.nama); showToast(`Link reset password dikirim ke ${user.email}`, "info"); }}
                          className="p-2 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <KeyRound style={{ width: 14, height: 14 }} />
                        </button>
                        {/* Delete */}
                        <button
                          title="Hapus Pengguna"
                          onClick={() => setDeleteTarget(user.id)}
                          className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <Users className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    <div className="text-sm text-slate-400 font-medium">Tidak ada pengguna yang ditemukan</div>
                    <div className="text-xs text-slate-300 mt-1">Coba ubah kata kunci atau filter pencarian</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3.5 border-t border-[#f1f5f9] flex items-center justify-between bg-[#fafbfc]">
          <span className="text-xs text-slate-400">
            Total <span className="font-semibold text-slate-600">{users.length}</span> pengguna terdaftar di sistem
          </span>
          <div className="flex items-center gap-1">
            <button disabled className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft style={{ width: 14, height: 14, color: "#64748b" }} />
            </button>
            <button className="w-7 h-7 rounded bg-[#1a56db] text-white text-xs font-medium">1</button>
            <button disabled className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight style={{ width: 14, height: 14, color: "#64748b" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-[#e2e8f0]">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 style={{ width: 22, height: 22, color: "#dc2626" }} />
            </div>
            <h3 className="text-base font-bold text-[#0f1c2e] text-center mb-1">Hapus Pengguna?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Tindakan ini tidak dapat dibatalkan. Pengguna akan kehilangan semua akses ke sistem E-Arsip.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-[#e2e8f0] text-slate-600 text-sm font-medium py-2.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 bg-red-600 text-white text-sm font-bold py-2.5 rounded-md hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit user modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-[#e2e8f0] overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#dbeafe] flex items-center justify-center">
                  <UserPlus style={{ width: 13, height: 13, color: "#1a56db" }} />
                </div>
                <h3 className="text-sm font-bold text-[#0f1c2e]">
                  {editTarget ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}
                </h3>
              </div>
              <button
                onClick={() => { setShowModal(false); setEditTarget(null); }}
                className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X style={{ width: 15, height: 15, color: "#64748b" }} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">Nama Lengkap & Gelar *</label>
                  <input
                    defaultValue={editTarget?.nama ?? ""}
                    placeholder="cth: Budi Santoso, S.Kom"
                    className="border border-[#e2e8f0] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] bg-white placeholder-slate-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">NIP *</label>
                  <input
                    defaultValue={editTarget?.nip ?? ""}
                    placeholder="18 digit NIP"
                    className="border border-[#e2e8f0] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] bg-white placeholder-slate-300"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">Email Dinas *</label>
                  <input
                    defaultValue={editTarget?.email ?? ""}
                    placeholder="nama@pemkomedan.go.id"
                    className="border border-[#e2e8f0] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] bg-white placeholder-slate-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-semibold text-slate-500">Tim / Fungsi *</label>
                  <div className="relative">
                    <select
                      defaultValue={editTarget?.tim ?? ""}
                      className="w-full bg-white border border-[#e2e8f0] text-slate-700 text-sm rounded-md pl-3 pr-7 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db]"
                    >
                      <option value="">— Pilih Tim —</option>
                      <option>Sekretariat</option>
                      <option>Bidang I — Perencanaan</option>
                      <option>Bidang II — Keuangan</option>
                      <option>Bidang III — Kepegawaian</option>
                    </select>
                    <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-semibold text-slate-500">Role Akses *</label>
                  <div className="relative">
                    <select
                      defaultValue={editTarget?.role ?? ""}
                      className="w-full bg-white border border-[#e2e8f0] text-slate-700 text-sm rounded-md pl-3 pr-7 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db]"
                    >
                      <option value="">— Pilih Role —</option>
                      <option>Admin</option>
                      <option>Staf</option>
                    </select>
                    <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                  </div>
                </div>
              </div>

              {!editTarget && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-2.5">
                  <AlertCircle style={{ width: 14, height: 14, color: "#1a56db", marginTop: 1, flexShrink: 0 }} />
                  <p className="text-xs text-blue-700">
                    Password sementara akan dikirimkan ke email dinas pengguna dan wajib diganti saat login pertama.
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-[#f1f5f9] flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); setEditTarget(null); }}
                className="border border-[#e2e8f0] text-slate-600 text-sm font-medium px-5 py-2.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditTarget(null);
                  showToast(editTarget ? "Data pengguna berhasil diperbarui." : "Pengguna baru berhasil ditambahkan.", "success");
                }}
                className="bg-[#1a56db] text-white text-sm font-bold px-6 py-2.5 rounded-md hover:bg-[#1d4ed8] transition-colors flex items-center gap-2 shadow-md shadow-blue-200"
              >
                <Check style={{ width: 14, height: 14 }} />
                {editTarget ? "Simpan Perubahan" : "Tambahkan Pengguna"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
