import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Search,
  Upload,
  Users,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Key,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatLastLogin } from "../../utils/helpers.js";
import logoPemkotMedan from "../../../assets/logo-pemkot-medan.png";
import logoBerakhlak from "../../../assets/logo-berakhlak.png";

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
  if (pathname === "/profil") return "Profil Saya";
  return "";
}

export function AppShell({ children }) {
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
                      { icon: User, label: "Profil Saya", sub: "Lihat dan edit data profil", to: "/profil" },
                      { icon: Settings, label: "Pengaturan Akun", sub: "Preferensi & notifikasi" },
                      { icon: Key, label: "Ganti Password", sub: "Perbarui kata sandi Anda" },
                      { icon: HelpCircle, label: "Bantuan & Panduan", sub: "Dokumentasi penggunaan sistem" },
                    ].map(({ icon: Icon, label, sub, to }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (to) navigate(to);
                        }}
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
