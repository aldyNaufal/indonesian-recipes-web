import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/were-cooked.png";

export default function Navbar() {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const navLinks = user ? (
    <>
      <Link to="/" className="hover:underline">
        Beranda
      </Link>
      <Link to="/bookmark" className="hover:underline">
        Bookmark
      </Link>
      <Link to="/about" className="hover:underline">
        Tentang
      </Link>
      <Link to="/profile" className="hover:underline">
        Profil
      </Link>
      {user.role === "admin" && (
        <Link to="/admin-dashboard" className="hover:underline">
          Dashboard
        </Link>
      )}
    </>
  ) : (
    <>
      <Link to="/" className="hover:underline">
        Beranda
      </Link>
      <Link to="/about" className="hover:underline">
        Tentang
      </Link>
      <Link to="/login" className="hover:underline">
        Login
      </Link>
      <Link to="/register" className="hover:underline">
        Daftar
      </Link>
    </>
  );

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <img src={logo} alt="Logo" className="h-10" />

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white text-2x bg-transparent absolute right-20 top-5"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-6">{navLinks}</div>

        {/* Dark mode toggle */}
        <div className="ml-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isDark}
              onChange={() => setIsDark(!isDark)}
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-2 mt-4 px-4">
          {navLinks}
        </div>
      )}
    </nav>
  );
}
