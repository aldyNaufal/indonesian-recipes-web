import React, { useState, useRef, useEffect } from 'react';
import { User, Bookmark, LogOut } from 'lucide-react';
import logo from "../assets/Group59.svg"

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulasi status login
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-b from-[#B91C1C] to-[#E02929] text-white px-6 py-8 flex justify-between items-center">
      <div className="ml-10">
        <img src={logo} alt="Logo" className="h-10 w-auto max-h-15 object-contain" />
      </div>
      <nav className="space-x-6 mr-10 flex items-center">
        <a href="/" className="hover:underline">Home</a>
        <a href="/resep" className="hover:underline">Recipes</a>
        <a href="/about" className="hover:underline">About</a>
        
        {/* User Icon Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="hover:text-gray-300 focus:outline-none"
          >
            <User className="w-6 h-6" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-md shadow-lg z-50">
              {!isLoggedIn ? (
                <>
                  <a href="/login" className="block px-4 py-2 hover:bg-gray-100">Login</a>
                  <a href="/signup" className="block px-4 py-2 hover:bg-gray-100">Sign Up</a>
                </>
              ) : (
                <>
                  <a href="/bookmark" className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <Bookmark className="w-4 h-4 mr-2" /> Bookmark
                  </a>
                  <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
