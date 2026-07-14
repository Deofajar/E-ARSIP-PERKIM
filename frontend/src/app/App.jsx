import { Routes, Route } from "react-router";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ArchivePage from "./pages/ArchivePage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import UserManagementPage from "./pages/UserManagementPage.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

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
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <AppShell>
                <Profile />
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
