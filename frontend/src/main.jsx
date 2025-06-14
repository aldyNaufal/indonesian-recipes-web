import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";
import "./index.css";

// Gunakan environment variable atau default ke "/"
const baseUrl = import.meta.env.VITE_BASE_URL || "/";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={baseUrl}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);