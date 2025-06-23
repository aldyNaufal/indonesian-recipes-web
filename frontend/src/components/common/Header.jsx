import React, { useState, useRef, useEffect } from 'react';
import { User, Bookmark, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from "../../context/AuthContext"; // Import AuthContext
import { useNavigate } from "react-router-dom"; // Import untuk navigation
import logo from "../../assets/Group59.svg";

function Header() {
  // Gunakan AuthContext instead of local state
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout(); // Logout dari AuthContext
    setDropdownOpen(false);
    navigate("/"); // Redirect ke home
  };

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  return (
    <header className="bg-gradient-to-b from-[#B91C1C] to-[#E02929] text-white px-6 py-8 flex justify-between items-center shadow-md">
      <div className="ml-10">
        <img src={logo} alt="Logo" className="h-10 w-auto max-h-15 object-contain" />
      </div>
      
      <nav className="space-x-6 mr-10 flex items-center">
        <button onClick={() => navigate("/")} className="hover:underline">
          Home
        </button>
        <button onClick={() => navigate("/resep")} className="hover:underline">
          Recipes
        </button>
        <button onClick={() => navigate("/about")} className="hover:underline">
          About
        </button>
        
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
              {!isAuthenticated ? (
                <>
                  {/* Guest User Menu */}
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    Sudah punya akun? Login dulu yuk!
                  </div>
                  <button 
                    onClick={() => handleNavigation("/login")}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-left"
                  >
                    <LogIn className="w-4 h-4 mr-2" /> Login
                  </button>
                  <button 
                    onClick={() => handleNavigation("/register")}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 justify-between"
                  >
                    <div className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" /> Sign Up
                    </div>
                    <span className="bg-red-100 text-red-500 text-xs font-medium px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {/* Logged In User Menu */}
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    <div className="font-medium text-gray-700">
                      {user?.name || user?.username || 'User'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleNavigation("/bookmark")}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-left"
                  >
                    <Bookmark className="w-4 h-4 mr-2" /> Bookmark
                  </button>
                  <button 
                    onClick={() => handleNavigation("/profile")}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-left"
                  >
                    <User className="w-4 h-4 mr-2" /> Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-left border-t"
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