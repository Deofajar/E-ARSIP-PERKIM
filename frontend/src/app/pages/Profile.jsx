import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  User,
  Tag,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Landmark,
  Pencil,
  ShieldCheck,
  X,
  Check,
} from "lucide-react";
import { useAuth, API_BASE_URL, TOKEN_KEY } from "../context/AuthContext.jsx";

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

function formatActivityTime(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${datePart}, ${hours}:${minutes} WIB`;
}

function formatActivityLabel(activity) {
  if (!activity.details) return activity.action;
  if (activity.action === "Mengunduh") return `${activity.action} ${activity.details}`;
  return `${activity.action} (${activity.details})`;
}

function ProfileField({ icon: Icon, label, value, editable, isEditing, onChange, className = "" }) {
  const isMutable = editable && isEditing;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
        <Icon style={{ width: 12, height: 12 }} />
        {label}
      </label>
      <input
        value={value ?? ""}
        readOnly={!isMutable}
        onChange={isMutable ? (e) => onChange(e.target.value) : undefined}
        className={`w-full rounded-md px-3 py-2.5 text-sm text-slate-700 transition-colors ${
          isMutable
            ? "bg-white border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db]"
            : "bg-gray-50 border border-[#e2e8f0] focus:outline-none cursor-default"
        }`}
      />
    </div>
  );
}

const EMPTY_FORM = {
  email: "",
  noTelepon: "",
  unitKerja: "",
  jabatan: "",
  instansi: "",
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const roleLabel = user?.role === "admin" ? "Administrator" : "Staf";
  const defaultJabatan = user?.role === "admin" ? "Administrator Sistem" : "Staf Arsip";
  const mockEmail = user?.namaLengkap
    ? `${user.namaLengkap.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@pemkomedan.go.id`
    : "user@pemkomedan.go.id";

  useEffect(() => {
    if (!user?.id) return;
    authFetch(`/users/${user.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await parseErrorMessage(res, "Gagal memuat profil"));
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoadingProfile(false));

    setIsLoadingActivities(true);
    authFetch(`/users/${user.id}/activities`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await parseErrorMessage(res, "Gagal memuat aktivitas"));
        return res.json();
      })
      .then((data) => setActivities(data))
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoadingActivities(false));
  }, [user?.id]);

  const openEdit = () => {
    setFormData({
      email: profile?.email ?? "",
      noTelepon: profile?.noTelepon ?? "",
      unitKerja: profile?.unitKerja ?? "",
      jabatan: profile?.jabatan ?? "",
      instansi: profile?.instansi ?? "",
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData(EMPTY_FORM);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await authFetch(`/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Gagal memperbarui profil."));
      }
      const updated = await response.json();
      setProfile(updated);
      updateUser({
        email: updated.email,
        noTelepon: updated.noTelepon,
        unitKerja: updated.unitKerja,
        jabatan: updated.jabatan,
        instansi: updated.instansi,
      });
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayEmail = isEditing ? formData.email : profile?.email || mockEmail;
  const displayPhone = isEditing ? formData.noTelepon : profile?.noTelepon || "0812-3456-7890";
  const displayUnit = isEditing ? formData.unitKerja : profile?.unitKerja || "Sekretariat";
  const displayJabatan = isEditing ? formData.jabatan : profile?.jabatan || defaultJabatan;
  const displayInstansi = isEditing ? formData.instansi : profile?.instansi || "Dinas Perumahan, Kawasan Permukiman, Cipta Karya dan Tata Ruang, Pemko Medan";

  return (
    <div className="p-7 max-w-3xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1c2e]">Profil Saya</h2>
          <p className="text-slate-500 text-sm mt-0.5">Kelola informasi data diri Anda di sistem E-Arsip</p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={openEdit}
            disabled={isLoadingProfile}
            className="flex items-center gap-2 border border-[#e2e8f0] bg-white text-slate-600 text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Pencil style={{ width: 13, height: 13 }} />
            Edit Profil
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSaving}
              className="flex items-center gap-2 border border-[#e2e8f0] bg-white text-slate-600 text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <X style={{ width: 13, height: 13 }} />
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#1a56db] text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Check style={{ width: 13, height: 13 }} />
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        )}
      </div>

      {/* Top card – avatar & status */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 flex items-center gap-5">
        <div className="w-[72px] h-[72px] rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
          <User style={{ width: 32, height: 32, color: "#1a56db" }} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-[#0f1c2e] truncate">{user?.namaLengkap ?? "Memuat..."}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{displayJabatan}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              <ShieldCheck style={{ width: 10, height: 10 }} />
              {roleLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Middle card – informasi personal */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#0f1c2e] mb-5">Informasi Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileField icon={User} label="Nama Lengkap & Gelar" value={user?.namaLengkap ?? "-"} editable={false} isEditing={isEditing} />
          <ProfileField icon={Tag} label="NIP" value={user?.nip ?? "-"} editable={false} isEditing={isEditing} />
          <ProfileField
            icon={Mail}
            label="Email Dinas"
            value={displayEmail}
            editable
            isEditing={isEditing}
            onChange={(v) => setFormData((f) => ({ ...f, email: v }))}
          />
          <ProfileField
            icon={Phone}
            label="No. Telepon"
            value={displayPhone}
            editable
            isEditing={isEditing}
            onChange={(v) => setFormData((f) => ({ ...f, noTelepon: v }))}
          />
          <ProfileField
            icon={Building2}
            label="Unit Kerja"
            value={displayUnit}
            editable
            isEditing={isEditing}
            onChange={(v) => setFormData((f) => ({ ...f, unitKerja: v }))}
          />
          <ProfileField
            icon={Briefcase}
            label="Jabatan"
            value={displayJabatan}
            editable
            isEditing={isEditing}
            onChange={(v) => setFormData((f) => ({ ...f, jabatan: v }))}
          />
          <ProfileField
            icon={Landmark}
            label="Instansi"
            value={displayInstansi}
            editable
            isEditing={isEditing}
            onChange={(v) => setFormData((f) => ({ ...f, instansi: v }))}
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* Bottom card – aktivitas terakhir */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#0f1c2e] mb-4">Aktivitas Terakhir</h3>
        <div>
          {isLoadingActivities && (
            <div className="text-sm text-slate-400 text-center py-6">Memuat aktivitas...</div>
          )}
          {!isLoadingActivities && activities.length === 0 && (
            <div className="text-sm text-slate-400 text-center py-6">Belum ada aktivitas</div>
          )}
          {!isLoadingActivities &&
            activities.map((activity, i) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between gap-4 py-3 ${i < activities.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] flex-shrink-0" />
                  <span className="text-sm text-slate-700 truncate">{formatActivityLabel(activity)}</span>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {formatActivityTime(activity.createdAt)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
