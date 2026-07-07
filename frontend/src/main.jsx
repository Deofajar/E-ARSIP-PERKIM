
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router";
  import { Toaster } from "sonner";
  import App from "./app/App.jsx";
  import { AuthProvider } from "./app/context/AuthContext.jsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </BrowserRouter>,
  );
