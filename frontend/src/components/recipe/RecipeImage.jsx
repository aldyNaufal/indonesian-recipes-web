// src/components/recipe/RecipeImage.jsx
import React, { useState } from 'react';

const RecipeImage = ({ src, alt, className, onLoad, onError }) => {
  const [imageState, setImageState] = useState('loading');
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleImageLoad = (e) => {
    setImageState('loaded');
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e) => {
    console.log('Image failed to load:', currentSrc);
    
    if (currentSrc.includes('https://')) {
      const newSrc = currentSrc.replace('https://', 'http://');
      setCurrentSrc(newSrc);
      console.log('Trying HTTP version:', newSrc);
    } else if (currentSrc.includes('http://')) {
      const newSrc = currentSrc.replace('http://', '//');
      setCurrentSrc(newSrc);
      console.log('Trying protocol-relative version:', newSrc);
    } else {
      setImageState('error');
      if (onError) onError(e);
    }
  };

  if (imageState === 'error') {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100`}>
        <div className="text-center">
          <div className="text-4xl mb-2">🍽️</div>
          <div className="text-xs text-gray-500">Gambar tidak tersedia</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="text-4xl opacity-50">🍽️</div>
        </div>
      )}
    </div>
  );
};

export default RecipeImage;