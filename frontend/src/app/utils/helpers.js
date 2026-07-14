import { toast } from "sonner";
import { API_BASE_URL, TOKEN_KEY } from "../context/AuthContext.jsx";

export const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/v1$/, "");

export function authFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function parseErrorMessage(response, fallback) {
  const body = await response.json().catch(() => null);
  const serverMessage = Array.isArray(body?.message) ? body.message[0] : body?.message;
  return serverMessage || fallback;
}

export function formatTanggal(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatLastLogin(dateStr) {
  if (!dateStr) return "Belum pernah login";
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${datePart}, ${hours}:${minutes}`;
}

export async function downloadArsip(doc) {
  if (!doc.fileUrl) {
    toast.error("Berkas tidak tersedia untuk diunduh.");
    return;
  }
  try {
    const response = await authFetch(`/arsip/${doc.id}/download`);
    if (!response.ok) throw new Error(await parseErrorMessage(response, "Gagal mengunduh berkas."));
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
