import { useNavigate } from "react-router";
import { LogIn, ArrowRight } from "lucide-react";
import logoPemkotMedan from "../../assets/logo-pemkot-medan.png";
import logoBerakhlak from "../../assets/logo-berakhlak.png";
import logoMedanUntukSemua from "../../assets/logo-medan-untuk-semua.png";
import bgLandingHero from "../../assets/bg-landing-hero.jpg";

export default function LandingPage() {
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
