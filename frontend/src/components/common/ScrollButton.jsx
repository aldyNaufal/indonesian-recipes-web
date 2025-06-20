// src/components/common/ScrollButton.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ScrollButton = ({ direction, onClick, className = "" }) => {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors ${className}`}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
};

export default ScrollButton;