import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  LogIn,
  ArrowRight,
  Archive,
  Search,
  Shield,
  MapPin,
  Users,
  Bell,
  CheckCircle2,
  ChevronDown,
  Mail,
  Phone,
} from "lucide-react";
import logoPemkotMedan from "../../assets/logo-pemkot-medan.png";
import logoBerakhlak from "../../assets/logo-berakhlak.png";
import logoMedanUntukSemua from "../../assets/logo-medan-untuk-semua.png";
import bgLandingHero from "../../assets/bg-landing-hero.jpg";
import pejabatWalikota from "../../assets/pejabat-walikota-wawalikota.png";
import { authFetch } from "../utils/helpers.js";

const KEPATUHAN = ["UU No. 43/2009", "Perpres No. 95/2018", "ISO 27001"];

const FITUR_UNGGULAN = [
  {
    icon: Archive,
    title: "Arsip Digital Terpusat",
    desc: "Seluruh dokumen dinas tersimpan dalam satu repositori digital yang terorganisir, lengkap dengan metadata dan riwayat pengelolaan.",
  },
  {
    icon: Search,
    title: "Pencarian Lanjutan",
    desc: "Temukan dokumen dalam hitungan detik berdasarkan nomor surat, perihal, kategori, maupun rentang tahun arsip.",
  },
  {
    icon: Shield,
    title: "Keamanan Berlapis",
    desc: "Autentikasi JWT, kontrol akses berbasis peran, dan pencatatan aktivitas menjaga integritas setiap dokumen negara.",
  },
  {
    icon: MapPin,
    title: "Lokasi Fisik Terintegrasi",
    desc: "Setiap arsip digital terhubung dengan lokasi penyimpanan fisiknya — lemari, rak, hingga ordner — untuk penelusuran ganda.",
  },
  {
    icon: Users,
    title: "Manajemen Pengguna",
    desc: "Administrasi akun terpusat dengan pembagian peran admin dan staf, memastikan akses sesuai kewenangan masing-masing.",
  },
  {
    icon: Bell,
    title: "Notifikasi Pintar",
    desc: "Pemberitahuan otomatis untuk setiap unggahan dokumen baru dan perubahan penting di lingkungan sistem.",
  },
];

const LANGKAH = [
  { no: "01", title: "Login ke Sistem", desc: "Masuk menggunakan NIP dan kata sandi yang terdaftar." },
  { no: "02", title: "Unggah Dokumen", desc: "Unggah berkas PDF beserta metadata dan lokasi fisik arsip." },
  { no: "03", title: "Verifikasi & Simpan", desc: "Sistem memvalidasi kelengkapan data sebelum tersimpan permanen." },
  { no: "04", title: "Cari & Kelola", desc: "Telusuri, unduh, dan kelola arsip kapan pun dibutuhkan." },
];

const REGULASI = [
  {
    badge: "UU No. 43/2009",
    desc: "Undang-Undang tentang Kearsipan — landasan hukum utama penyelenggaraan kearsipan nasional yang andal dan terpercaya.",
  },
  {
    badge: "PP No. 28/2012",
    desc: "Peraturan pelaksanaan UU Kearsipan yang mengatur pengelolaan arsip dinamis dan statis di lembaga pemerintahan.",
  },
  {
    badge: "Perpres No. 95/2018",
    desc: "Sistem Pemerintahan Berbasis Elektronik (SPBE) — mendorong digitalisasi layanan termasuk pengelolaan arsip.",
  },
  {
    badge: "Permen PANRB No. 5/2025",
    desc: "Ketentuan terbaru tentang tata kelola kearsipan elektronik dan transformasi digital birokrasi.",
  },
];

const FAQ = [
  {
    q: "Siapa yang dapat mengakses sistem E-Arsip?",
    a: "Sistem ini diperuntukkan bagi Aparatur Sipil Negara (ASN) di lingkungan Dinas Perumahan, Kawasan Permukiman, Cipta Karya dan Tata Ruang Pemko Medan yang telah terdaftar. Akses dibagi berdasarkan peran: administrator mengelola pengguna dan seluruh arsip, sedangkan staf dapat mengunggah dan menelusuri dokumen.",
  },
  {
    q: "Bagaimana cara mendapatkan akun?",
    a: "Akun dibuat oleh administrator sistem. Silakan hubungi admin di unit kerja Anda dengan menyertakan NIP dan data kepegawaian. Setelah akun dibuat, Anda akan menerima kata sandi awal yang disarankan untuk segera diganti.",
  },
  {
    q: "Apakah data yang tersimpan aman?",
    a: "Ya. Seluruh akses dilindungi autentikasi JWT, kata sandi disimpan dengan enkripsi bcrypt, dan setiap aktivitas penting tercatat dalam log sistem. Berkas fisik tetap tersimpan sebagai cadangan di lokasi arsip konvensional.",
  },
  {
    q: "Format berkas apa yang didukung?",
    a: "Saat ini sistem menerima berkas PDF dengan ukuran maksimal 25 MB per dokumen, untuk menjaga keseragaman format dan keterbacaan jangka panjang.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [totalArsip, setTotalArsip] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [tahunTertua, setTahunTertua] = useState(2018);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    // Public page: fetch stats best-effort. Anonymous visitors simply keep the defaults.
    authFetch("/arsip")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setTotalArsip(data.length);
        if (data.length > 0) {
          const minYear = Math.min(...data.map((d) => new Date(d.tanggalSurat).getFullYear()));
          if (Number.isFinite(minYear)) setTahunTertua(minYear);
        }
      })
      .catch(() => undefined);

    authFetch("/users")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setTotalUsers(data.length))
      .catch(() => undefined);
  }, []);

  const scrollToFitur = () => {
    document.getElementById("fitur-unggulan")?.scrollIntoView({ behavior: "smooth" });
  };

  const STATS = [
    { value: totalArsip.toLocaleString("id-ID"), label: "Total Dokumen Terarsip" },
    { value: "12", label: "Unit Kerja Terhubung" },
    { value: "99.9%", label: "Uptime Sistem" },
    { value: totalUsers.toLocaleString("id-ID"), label: "Pengguna Terdaftar" },
    { value: String(tahunTertua), label: "Tahun Arsip Tertua" },
    { value: "<1dtk", label: "Rata-rata Waktu Cari" },
  ];

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <div className="min-h-screen flex flex-col relative">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgLandingHero})` }}
        />
        {/* Dark blue overlay for readability */}
        <div className="absolute inset-0 bg-blue-900/70" />

        {/* Navbar */}
        <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <img src={logoPemkotMedan} alt="Logo Pemkot Medan" className="h-10 w-auto object-contain flex-shrink-0" />
            <span className="text-white font-bold text-lg tracking-wide">E-ARSIP</span>
          </div>
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
        <div className="relative z-10 flex-1 flex items-center px-6 md:px-10 pb-44 md:pb-36 pt-10">
          <div className="max-w-6xl mx-auto w-full">
            <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
              <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-[11px] md:text-xs font-bold tracking-[0.2em] rounded-full px-4 py-1.5">
                SISTEM KEARSIPAN DIGITAL RESMI
              </span>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white mt-5 tracking-tight leading-tight">
                Digitalisasi Arsip{" "}
                <span className="text-sky-300">Pemerintah Kota Medan</span>
              </h1>

              <p className="text-gray-200 text-base md:text-lg mt-5 max-w-2xl leading-relaxed">
                Platform pengelolaan arsip digital terintegrasi untuk mendukung tata kelola pemerintahan yang transparan, efisien, akuntabel, dan sesuai regulasi kearsipan nasional.
              </p>

              <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 mt-8 justify-center md:justify-start">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-md flex items-center gap-2.5 transition-all shadow-xl shadow-blue-900/40 text-sm md:text-base"
                >
                  Login ke Sistem
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollToFitur}
                  className="border border-white/40 text-white hover:bg-white/10 font-semibold px-7 py-3 rounded-md transition-all text-sm md:text-base"
                >
                  Lihat Fitur
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-8 justify-center md:justify-start">
                {KEPATUHAN.map((k) => (
                  <span
                    key={k}
                    className="bg-black/30 backdrop-blur-sm text-white/80 text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats bar (glassmorphism) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-y-4 px-6 py-5">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl md:text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-[10px] md:text-[11px] text-gray-300 mt-0.5 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          TENTANG E-ARSIP
      ═══════════════════════════════════════════ */}
      <section className="bg-white py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div>
            <span className="inline-block text-[#1a56db] bg-blue-50 border border-blue-100 text-[11px] font-bold tracking-[0.2em] rounded-full px-4 py-1.5">
              TENTANG E-ARSIP
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e] tracking-tight mt-4 leading-tight">
              Mewujudkan Birokrasi Modern & Akuntabel
            </h2>
            <p className="text-slate-500 text-base mt-4 leading-relaxed">
              E-Arsip mengintegrasikan pengelolaan arsip fisik dan digital dalam satu platform. Setiap dokumen yang diunggah tetap terhubung dengan lokasi penyimpanan fisiknya, sehingga penelusuran dapat dilakukan dari dua arah — cepat secara digital, tervalidasi secara konvensional.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <div className="text-xs font-bold tracking-widest text-[#1a56db] mb-2">VISI</div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menjadi sistem kearsipan digital terdepan yang mendukung pemerintahan Kota Medan yang modern dan melayani.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <div className="text-xs font-bold tracking-widest text-[#1a56db] mb-2">MISI</div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menghadirkan pengelolaan arsip yang cepat, aman, dan akuntabel bagi seluruh aparatur serta masyarakat.
                </p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-lg bg-gradient-to-br from-[#0f1c2e] via-[#1a56db] to-sky-400 aspect-[4/3] flex items-center justify-center">
              <div className="text-center px-8">
                <Archive className="w-16 h-16 text-white/80 mx-auto" />
                <div className="text-white font-bold text-xl mt-4">E-ARSIP</div>
                <div className="text-sky-100 text-sm mt-1">Arsip Digital Pemko Medan</div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md border border-white/60 rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-[#0f1c2e]">Sistem Aktif — Beroperasi sejak 2018</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PIMPINAN DAERAH
      ═══════════════════════════════════════════ */}
      <section id="pimpinan-daerah" className="bg-white pb-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e] tracking-tight">
              Pimpinan Daerah Kota Medan
            </h2>
            <p className="text-slate-500 text-base md:text-lg mt-3 max-w-2xl mx-auto">
              Komitmen kepemimpinan dalam mewujudkan tata kelola pemerintahan yang modern, transparan, dan berorientasi pada pelayanan publik.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={pejabatWalikota}
              alt="Rico Tri Putra Bayu Waas - Wali Kota Medan, H. Zakiyuddin Harahap - Wakil Wali Kota Medan"
              className="w-full max-w-2xl h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FITUR UNGGULAN
      ═══════════════════════════════════════════ */}
      <section id="fitur-unggulan" className="bg-[#f8fafc] py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[#1a56db] bg-blue-50 border border-blue-100 text-[11px] font-bold tracking-[0.2em] rounded-full px-4 py-1.5">
              FITUR UNGGULAN
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1c2e] tracking-tight mt-4">
              Semua yang Anda Butuhkan dalam Satu Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {FITUR_UNGGULAN.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-[#1a56db]" />
                </div>
                <h3 className="text-base font-bold text-[#0f1c2e] mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CARA PENGGUNAAN
      ═══════════════════════════════════════════ */}
      <section className="bg-[#0f1c2e] py-20 px-6 md:px-10 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-sky-300 bg-white/5 border border-white/10 text-[11px] font-bold tracking-[0.2em] rounded-full px-4 py-1.5">
              CARA PENGGUNAAN
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4">
              Mulai Dalam 4 Langkah Mudah
            </h2>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Connecting line (desktop only) */}
            <div className="hidden lg:block absolute top-9 left-[12%] right-[12%] h-px bg-white/15" />
            {LANGKAH.map((l) => (
              <div key={l.no} className="relative bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="w-[72px] h-[72px] mx-auto rounded-full bg-[#1a56db] flex items-center justify-center text-xl font-extrabold shadow-lg shadow-blue-900/50 relative z-10">
                  {l.no}
                </div>
                <h3 className="text-base font-bold mt-5">{l.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-md inline-flex items-center gap-2.5 transition-all shadow-xl shadow-blue-900/40"
            >
              Mulai Sekarang
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          REGULASI & FAQ
      ═══════════════════════════════════════════ */}
      <section className="bg-white py-20 px-6 md:px-10 border-t border-[#f1f5f9]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Regulasi */}
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f1c2e] tracking-tight leading-tight">
              Dibangun di Atas Landasan Regulasi yang Kuat
            </h2>
            <div className="space-y-4 mt-8">
              {REGULASI.map((r) => (
                <div key={r.badge} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-[#1a56db] text-white mb-2.5">
                    {r.badge}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f1c2e] tracking-tight leading-tight">
              Pertanyaan yang Sering Ditanyakan
            </h2>
            <div className="space-y-3 mt-8">
              {FAQ.map((f, i) => (
                <div key={f.q} className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-bold text-[#0f1c2e]">{f.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-[#f1f5f9] pt-3">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════ */}
      <section className="px-6 md:px-10 pb-20 bg-white">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#1a56db] to-sky-500 rounded-3xl px-8 md:px-16 py-14 text-center shadow-xl shadow-blue-200">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Siap Memulai Transformasi Digital Kearsipan Anda?
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-8 bg-white text-[#1a56db] hover:bg-blue-50 font-bold px-8 py-3.5 rounded-md inline-flex items-center gap-2.5 transition-all shadow-lg"
          >
            Login ke Sistem
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="bg-[#0f1c2e] text-slate-300 pt-16 pb-8 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/10">
          {/* About column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logoPemkotMedan} alt="Logo Pemkot Medan" className="h-10 w-auto object-contain flex-shrink-0" />
              <span className="text-white font-bold text-lg tracking-wide">E-ARSIP</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sistem Informasi Kearsipan Elektronik Terintegrasi — mendukung tata kelola pemerintahan Kota Medan yang modern, transparan, dan akuntabel.
            </p>
          </div>

          {/* Quick links column */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Tautan Cepat</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => navigate("/")} className="text-slate-400 hover:text-white transition-colors">
                  Beranda
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/login")} className="text-slate-400 hover:text-white transition-colors">
                  Masuk ke Sistem
                </button>
              </li>
              <li className="text-slate-400">Portal Resmi Pemko Medan</li>
              <li className="text-slate-400">Kebijakan Privasi Data</li>
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Kontak Kami</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" />
                Jl. Kapten Maulana Lubis No. 2, Medan, Sumatera Utara 20112
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 flex-shrink-0 text-slate-500" />
                (061) 4521300
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 flex-shrink-0 text-slate-500" />
                info@pemkomedan.go.id
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs md:text-sm text-slate-500 pt-6">
          © 2026 Bagian Organisasi Sekretariat Daerah Pemerintah Kota Medan
        </div>
      </footer>
    </div>
  );
}
