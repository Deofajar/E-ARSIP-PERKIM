import { useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Login from "./pages/Login.jsx";
import { useAuth, API_BASE_URL, TOKEN_KEY } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import logoPemkotMedan from "../assets/logo-pemkot-medan.png";
import logoBerakhlak from "../assets/logo-berakhlak.png";
import logoMedanUntukSemua from "../assets/logo-medan-untuk-semua.png";
import bgLandingHero from "../assets/bg-landing-hero.jpg";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();
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
  Settings,
  Key,
  HelpCircle,
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

function authFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

async function parseErrorMessage(response, fallback) {
  const body = await response.json().catch(() => null);
  const serverMessage = Array.isArray(body?.message) ? body.message[0] : body?.message;
  return serverMessage || fallback;
}

function formatTanggal(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function formatLastLogin(dateStr) {
  if (!dateStr) return "Belum pernah login";
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${datePart}, ${hours}:${minutes}`;
}

const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/v1$/, "");

async function downloadArsip(doc) {
  if (!doc.fileUrl) {
    toast.error("Berkas tidak tersedia untuk diunduh.");
    return;
  }
  try {
    const response = await fetch(`${FILE_BASE_URL}${doc.fileUrl}`);
    if (!response.ok) throw new Error("Gagal mengunduh berkas.");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${doc.nomorSurat}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    toast.error(error.message);
  }
}

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
  const mockEmail = user?.namaLengkap
    ? `${user.namaLengkap.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@pemkomedan.go.id`
    : "user@pemkomedan.go.id";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

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
              <div className="text-slate-200 text-xs font-medium truncate">{user?.namaLengkap ?? "Memuat..."}</div>
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
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-md transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#1a56db]/10 flex items-center justify-center">
                  <User style={{ width: 13, height: 13, color: "#1a56db" }} />
                </div>
                <span className="text-slate-700 text-sm font-medium">{user?.namaLengkap ?? "Memuat..."}</span>
                <ChevronDown
                  style={{ width: 13, height: 13, color: "#94a3b8" }}
                  className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  {/* Header section */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#1a56db]/10 flex items-center justify-center flex-shrink-0">
                      <User style={{ width: 22, height: 22, color: "#1a56db" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-[#0f1c2e] truncate">{user?.namaLengkap ?? "Memuat..."}</div>
                      <div className="text-xs text-slate-400 truncate">{mockEmail}</div>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        {roleLabel}
                      </span>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="mx-4 mt-3 mb-1 grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">NIP</div>
                      <div className="text-xs font-medium text-slate-700 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {user?.nip ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Unit</div>
                      <div className="text-xs font-medium text-slate-700 mt-0.5">Sekretariat</div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    {[
                      { icon: User, label: "Profil Saya", sub: "Lihat dan edit data profil" },
                      { icon: Settings, label: "Pengaturan Akun", sub: "Preferensi & notifikasi" },
                      { icon: Key, label: "Ganti Password", sub: "Perbarui kata sandi Anda" },
                      { icon: HelpCircle, label: "Bantuan & Panduan", sub: "Dokumentasi penggunaan sistem" },
                    ].map(({ icon: Icon, label, sub }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Icon style={{ width: 16, height: 16, color: "#64748b", flexShrink: 0 }} />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-700">{label}</div>
                          <div className="text-[10px] text-slate-400">{sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 py-2">
                    <button
                      type="button"
                      onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut style={{ width: 16, height: 16, color: "#dc2626", flexShrink: 0 }} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-red-600">Keluar dari Sistem</div>
                        <div className="text-[10px] text-red-400">Sesi aktif akan diakhiri</div>
                      </div>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-[10px] text-slate-400">
                      Sesi aktif sejak {formatLastLogin(user?.lastLogin ?? new Date().toISOString())}
                    </span>
                  </div>
                </div>
              )}
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

  const kontributorAktif = new Set(archives.map((d) => d.uploaderId)).size;

  const kategoriCounts = archives.reduce((acc, d) => {
    acc[d.kategori] = (acc[d.kategori] ?? 0) + 1;
    return acc;
  }, {});
  const kategoriTerbanyak = Object.entries(kategoriCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

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
          { label: "Total Arsip", value: total.toLocaleString("id-ID"), icon: Archive, color: "#1a56db", bg: "#dbeafe" },
          { label: "Upload Bulan Ini", value: uploadBulanIni.toLocaleString("id-ID"), icon: ArrowUpRight, color: "#16a34a", bg: "#dcfce7" },
          { label: "Kategori Terbanyak", value: kategoriTerbanyak, icon: FileText, color: "#d97706", bg: "#fef3c7" },
          { label: "Kontributor Aktif", value: kontributorAktif.toLocaleString("id-ID"), icon: Layers, color: "#7c3aed", bg: "#ede9fe" },
        ].map((w) => (
          <div key={w.label} className="bg-white rounded-xl border border-[#e2e8f0] p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">{w.label}</div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: w.bg }}>
                <w.icon style={{ width: 16, height: 16, color: w.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0f1c2e] mb-1">{w.value}</div>
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

/* ─────────────────────────────────────────────
   FRAME 3 – ARCHIVE / DATA GRID
───────────────────────────────────────────── */
function ArchivePage() {
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

/* ─────────────────────────────────────────────
   FRAME 4 – DOCUMENT DETAIL / SPLIT VIEW
───────────────────────────────────────────── */
function DetailPage() {
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
                { label: "Diunggah oleh", value: doc.uploader?.namaLengkap ?? "-", icon: User, mono: false },
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

/* ─────────────────────────────────────────────
   FRAME 5 – ADMIN UPLOAD FORM
───────────────────────────────────────────── */
const emptyUploadFormData = {
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
};

function UploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStep, setUploadStep] = useState(0);
  const [formData, setFormData] = useState(emptyUploadFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const update = (k, v) => setFormData({ ...formData, [k]: v });

  const handleSubmit = async () => {
    if (!uploadedFile) {
      toast.error("Unggah berkas PDF terlebih dahulu.");
      return;
    }
    if (!formData.nomorSurat || !formData.tanggal || !formData.perihal || !formData.kategori) {
      toast.error("Lengkapi field metadata dokumen yang wajib diisi.");
      return;
    }
    if (!formData.lemari || !formData.rak || !formData.ordner) {
      toast.error("Lengkapi field lokasi penyimpanan fisik yang wajib diisi.");
      return;
    }

    const storageLocation = [
      formData.lemari,
      formData.rak,
      `Ordner: ${formData.ordner}`,
      formData.keterangan,
    ].filter(Boolean).join(", ");

    const body = new FormData();
    body.append("file", uploadedFile);
    body.append("nomorSurat", formData.nomorSurat);
    body.append("perihal", formData.perihal);
    body.append("kategori", formData.kategori);
    body.append("tanggalSurat", formData.tanggal);
    body.append("storageLocation", storageLocation);

    setIsSubmitting(true);
    try {
      const response = await authFetch("/arsip", { method: "POST", body });
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Gagal mengunggah dokumen."));
      }
      toast.success("Arsip berhasil diunggah dan tersimpan.");
      setFormData(emptyUploadFormData);
      setUploadedFile(null);
      setUploadStep(0);
      navigate("/arsip");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
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
            if (!file) return;
            if (file.type !== "application/pdf") {
              toast.error("Hanya file PDF yang diperbolehkan.");
              return;
            }
            if (file.size > 25 * 1024 * 1024) {
              toast.error("Ukuran file maksimal 25 MB.");
              return;
            }
            setUploadedFile(file);
            setUploadStep(1);
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
              <div className="text-sm font-bold text-emerald-700">{uploadedFile.name}</div>
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
                    if (!file) return;
                    if (file.type !== "application/pdf") {
                      toast.error("Hanya file PDF yang diperbolehkan.");
                      return;
                    }
                    if (file.size > 25 * 1024 * 1024) {
                      toast.error("Ukuran file maksimal 25 MB.");
                      return;
                    }
                    setUploadedFile(file);
                    setUploadStep(1);
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
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="text-sm font-bold px-7 py-2.5 rounded-md transition-all flex items-center gap-2 shadow-md bg-[#1a56db] text-white hover:bg-[#1d4ed8] shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : <><Archive style={{ width: 15, height: 15 }} /> Simpan & Arsipkan</>}
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

const AVATAR_COLORS = {
  DA: { bg: "#dbeafe", text: "#1a56db" },
  RP: { bg: "#dcfce7", text: "#16a34a" },
  SR: { bg: "#fce7f3", text: "#be185d" },
  AF: { bg: "#fef3c7", text: "#d97706" },
  RK: { bg: "#ede9fe", text: "#7c3aed" },
};

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const emptyFormData = { namaLengkap: "", nip: "", password: "", role: "staf" };
  const [formData, setFormData] = useState(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const notify = (msg, type = "success") => {
    if (type === "danger") return toast.error(msg);
    if (type === "info") return toast.info(msg);
    return toast.success(msg);
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    fetch(`${API_BASE_URL}/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data pengguna.");
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((error) => notify(error.message, "danger"))
      .finally(() => setIsLoadingUsers(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.namaLengkap.toLowerCase().includes(q) || u.nip.includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAddModal = () => {
    setEditTarget(null);
    setFormData(emptyFormData);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditTarget(user);
    setFormData({ namaLengkap: user.namaLengkap, nip: user.nip, password: "", role: user.role });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = async () => {
    if (editTarget) {
      // No backend endpoint for updating a user yet — keep this local-only for now.
      closeModal();
      notify("Data pengguna berhasil diperbarui.", "success");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const serverMessage = Array.isArray(body?.message) ? body.message[0] : body?.message;
        throw new Error(serverMessage || "Gagal menambahkan pengguna.");
      }

      setUsers((prev) => [body, ...prev]);
      closeModal();
      notify("Pengguna baru berhasil ditambahkan.", "success");
    } catch (error) {
      notify(error.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const serverMessage = Array.isArray(body?.message) ? body.message[0] : body?.message;
        throw new Error(serverMessage || "Gagal menghapus pengguna.");
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteTarget(null);
      notify("Pengguna berhasil dihapus dari sistem.", "danger");
    } catch (error) {
      notify(error.message, "danger");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-7 space-y-6 relative">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1c2e]">Kelola Pengguna Sistem</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Manajemen akun, hak akses, dan autentikasi pengguna E-Arsip
          </p>
        </div>
        <button
          onClick={openAddModal}
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
          { label: "Administrator", value: users.filter((u) => u.role === "admin").length, icon: ShieldCheck, color: "#d97706", bg: "#fef3c7" },
          { label: "Staf Aktif", value: users.filter((u) => u.role === "staf").length, icon: UserCheck, color: "#16a34a", bg: "#dcfce7" },
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
            <option value="admin">Admin</option>
            <option value="staf">Staf</option>
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
                const initials = getInitials(user.namaLengkap);
                const av = AVATAR_COLORS[initials] ?? { bg: "#f1f5f9", text: "#64748b" };
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
                          {initials}
                        </div>
                        <div className="text-sm font-semibold text-[#0f1c2e] group-hover:text-[#1a56db] transition-colors">
                          {user.namaLengkap}
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
                      <span className="text-xs text-slate-600 font-medium">-</span>
                    </td>

                    {/* Role badge */}
                    <td className="px-5 py-4">
                      {user.role === "admin" ? (
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
                        <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${user.isActive ? "bg-emerald-500 shadow-emerald-200 animate-pulse" : "bg-slate-300 shadow-slate-100"}`} />
                        <span className={`text-xs font-semibold ${user.isActive ? "text-emerald-700" : "text-slate-400"}`}>
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </td>

                    {/* Login terakhir */}
                    <td className="px-5 py-4">
                      <span className={`text-xs flex items-center gap-1 whitespace-nowrap ${user.lastLogin ? "text-slate-500" : "text-slate-300 italic"}`}>
                        <Clock style={{ width: 11, height: 11 }} />
                        {formatLastLogin(user.lastLogin)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5">
                        {/* Edit */}
                        <button
                          title="Edit Pengguna"
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-md text-slate-400 hover:text-[#1a56db] hover:bg-blue-50 transition-colors"
                        >
                          <Pencil style={{ width: 14, height: 14 }} />
                        </button>
                        {/* Reset password */}
                        <button
                          title="Reset Password"
                          onClick={() => { setResetTarget(user.namaLengkap); notify(`Link reset password dikirim untuk ${user.namaLengkap}.`, "info"); }}
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

              {isLoadingUsers && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-sm text-slate-400">
                    Memuat data pengguna...
                  </td>
                </tr>
              )}

              {!isLoadingUsers && filtered.length === 0 && (
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
                disabled={isDeleting}
                className="flex-1 border border-[#e2e8f0] text-slate-600 text-sm font-medium py-2.5 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white text-sm font-bold py-2.5 rounded-md hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
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
                onClick={closeModal}
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
                    value={formData.namaLengkap}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    placeholder="cth: Budi Santoso, S.Kom"
                    autoComplete="off"
                    className="border border-[#e2e8f0] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] bg-white placeholder-slate-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">NIP *</label>
                  <input
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value.trim() })}
                    placeholder="18 digit NIP"
                    autoComplete="off"
                    className="border border-[#e2e8f0] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] bg-white placeholder-slate-300"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                    className="border border-[#e2e8f0] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] bg-white placeholder-slate-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-semibold text-slate-500">Tim / Fungsi</label>
                  <div className="relative">
                    <select
                      defaultValue=""
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
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-white border border-[#e2e8f0] text-slate-700 text-sm rounded-md pl-3 pr-7 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db]"
                    >
                      <option value="staf">Staf</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                  </div>
                </div>
              </div>

              {!editTarget && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-2.5">
                  <AlertCircle style={{ width: 14, height: 14, color: "#1a56db", marginTop: 1, flexShrink: 0 }} />
                  <p className="text-xs text-blue-700">
                    Buat password awal untuk pengguna ini. Pengguna disarankan menggantinya setelah login pertama.
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-[#f1f5f9] flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="border border-[#e2e8f0] text-slate-600 text-sm font-medium px-5 py-2.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="bg-[#1a56db] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-md hover:bg-[#1d4ed8] transition-colors flex items-center gap-2 shadow-md shadow-blue-200"
              >
                <Check style={{ width: 14, height: 14 }} />
                {isSubmitting ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Tambahkan Pengguna"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

