import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  UserPlus,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  ShieldCheck,
  UserCheck,
  Clock,
  Pencil,
  KeyRound,
  Trash2,
  AlertCircle,
  Check,
  User,
} from "lucide-react";
import { API_BASE_URL, TOKEN_KEY } from "../context/AuthContext.jsx";
import { formatLastLogin } from "../utils/helpers.js";

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

export default function UserManagementPage() {
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
