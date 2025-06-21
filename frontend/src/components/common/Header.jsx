import React, { useState, useRef, useEffect } from 'react';
import { User, Bookmark, LogOut, LogIn, UserPlus } from 'lucide-react';
import logo from "../../assets/Group59.svg";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <header className="bg-gradient-to-b from-[#B91C1C] to-[#E02929] text-white px-6 py-8 flex justify-between items-center shadow-md">
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

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-md shadow-xl z-50 transition-all duration-200 ease-out origin-top scale-95 hover:scale-100">
              {!isLoggedIn ? (
                <>
                  {/* Informasi kontekstual */}
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    Sudah punya akun? Login dulu yuk!
                  </div>

                  <a href="/login" className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <LogIn className="w-4 h-4 mr-2" /> Login
                  </a>

                  <a href="/signup" className="flex items-center px-4 py-2 hover:bg-gray-100 justify-between">
                    <div className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" /> Sign Up
                    </div>
                    <span className="bg-red-100 text-red-500 text-xs font-medium px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </a>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    Akun Saya
                  </div>

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
