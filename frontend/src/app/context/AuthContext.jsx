import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const TOKEN_KEY = "token";
export const API_BASE_URL = "http://localhost:3000/api/v1";

function userFromToken(token) {
  const decoded = jwtDecode(token);
  if (decoded.exp && Date.now() >= decoded.exp * 1000) {
    return null;
  }
  return {
    id: decoded.sub,
    nip: decoded.nip,
    namaLengkap: decoded.namaLengkap,
    role: decoded.role,
    lastLogin: decoded.lastLogin ?? null,
  };
}

function readStoredUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const user = userFromToken(token);
    if (!user) localStorage.removeItem(TOKEN_KEY);
    return user;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = async (nip, password) => {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip, password }),
      });
    } catch {
      throw new Error("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const serverMessage = Array.isArray(body?.message) ? body.message[0] : body?.message;

      if (response.status === 401) {
        throw new Error(serverMessage || "NIP atau password salah");
      }
      if (response.status === 404) {
        throw new Error("Endpoint login tidak ditemukan (404)");
      }
      throw new Error(serverMessage || "Gagal login. Silakan coba lagi.");
    }

    const data = await response.json();
    const authenticatedUser = data.user
      ? {
          id: data.user.id,
          nip: data.user.nip,
          namaLengkap: data.user.namaLengkap,
          role: data.user.role,
          lastLogin: data.user.lastLogin ?? null,
        }
      : userFromToken(data.access_token);

    localStorage.setItem(TOKEN_KEY, data.access_token);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
