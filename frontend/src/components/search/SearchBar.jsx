// src/components/search/SearchBar.jsx
import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  onSearch, 
  placeholder = "Cari resep favorit Anda..." 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);
    }
  };

  const handleSearchClick = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="relative max-w-md mx-auto">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      />
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer" 
        onClick={handleSearchClick}
      />
    </div>
  );
};

export default SearchBar;