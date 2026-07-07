import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.jsx";

import bgPosBloc from "../../assets/bg-pos-bloc-medan.jpg";
import logoBerakhlak from "../../assets/logo-berakhlak.png";
import logoPemkotMedan from "../../assets/logo-pemkot-medan.png";
import logoMedanUntukSemua from "../../assets/logo-medan-untuk-semua.png";
import pejabatWalikota from "../../assets/pejabat-walikota-wawalikota.png";

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigate only after the AuthContext user state has actually committed —
  // calling navigate() right after login() can race the context update and
  // bounce ProtectedRoute back here with a still-stale (null) user.
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(nip, password);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgPosBloc})` }}
      />
      {/* Dark blue overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-900/75 to-blue-900/70" />

      {/* Header */}
      <header className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 px-4 sm:px-6 md:px-12 py-4 md:py-6">
        {/* Left: BerAKHLAK + Pemkot Medan logos, E-ARSIP title */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 max-w-full">
          <div className="flex items-center gap-2">
            <img src={logoBerakhlak} alt="Logo BerAKHLAK" className="h-6 sm:h-9 md:h-12 w-auto object-contain" />
            <img src={logoPemkotMedan} alt="Logo Pemkot Medan" className="h-6 sm:h-9 md:h-12 w-auto object-contain" />
          </div>
          <div className="sm:pl-3 sm:border-l border-white/30 max-w-[180px] sm:max-w-none">
            <div className="text-white font-bold text-lg sm:text-2xl md:text-3xl leading-tight tracking-wide">E-ARSIP</div>
            <div className="text-white/70 text-[11px] sm:text-xs md:text-sm leading-tight">
              Sistem Informasi Elektronik Tata Kelola Organisasi Daerah
            </div>
          </div>
        </div>

        {/* Right: Medan Untuk Semua logo */}
        <img src={logoMedanUntukSemua} alt="Logo Medan Untuk Semua" className="h-7 sm:h-9 md:h-11 w-auto object-contain" />
      </header>

      {/* Main content: 2-column, centered in remaining space */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-12 py-8 min-w-0">
        <div className="w-full min-w-0 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Login card */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-8 text-white">
              <h1 className="text-2xl font-bold">Masuk ke Sistem</h1>
              <p className="text-white/80 text-sm mt-1 mb-6">Masukkan NIP dan password Anda</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* NIP */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/90">NIP</label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      style={{ width: 16, height: 16 }}
                    />
                    <input
                      type="text"
                      value={nip}
                      onChange={(e) => setNip(e.target.value.trim())}
                      placeholder="Masukkan NIP"
                      className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/90">Password</label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      style={{ width: 16, height: 16 }}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2 text-sm text-white/90 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/40"
                  />
                  Ingat saya
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors shadow-md"
                >
                  {isSubmitting ? "Memproses..." : "Masuk"}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Leadership portraits (name badges are baked into the source image) */}
          <div className="w-full min-w-0 max-w-xl mx-auto lg:mx-0 lg:ml-auto">
            <img
              src={pejabatWalikota}
              alt="Rico Tri Putra Bayu Waas - Wali Kota Medan, H. Zakiyuddin Harahap - Wakil Wali Kota Medan"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-blue-900 text-white text-center py-3 px-4">
        <p className="text-xs md:text-sm">
          Bagian Organisasi Sekretariat Daerah Pemerintah Kota Medan
        </p>
      </footer>
    </div>
  );
}
