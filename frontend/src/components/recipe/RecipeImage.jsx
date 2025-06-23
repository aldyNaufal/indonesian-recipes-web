// src/components/recipe/RecipeImage.jsx
import React, { useState, useCallback, useEffect } from 'react';

const RecipeImage = ({ 
  src, 
  alt = 'Recipe Image', 
  className = '', 
  onLoad, 
  onError,
  fallbackSrc = null 
}) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  // PERBAIKAN 1: Tambahkan timeout untuk loading
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ RecipeImage: Loading timeout, forcing display');
        setIsLoading(false);
      }
    }, 5000); // 5 detik timeout

    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);

  const handleLoad = useCallback((e) => {
    console.log('✅ RecipeImage: Image loaded -', currentSrc);
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(e);
  }, [currentSrc, onLoad]);

  const handleError = useCallback((e) => {
    console.error('❌ RecipeImage: Image failed to load -', currentSrc);
    setIsLoading(false);
    
    // Jika ada fallback dan belum dicoba
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log('🔄 RecipeImage: Trying fallback -', fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setIsLoading(true); // Reset loading untuk fallback
      return;
    }
    
    // Jika ini adalah URL yang sudah dioptimasi dengan wsrv.nl, coba URL asli
    if (currentSrc.includes('wsrv.nl') && src !== currentSrc) {
      console.log('🔄 RecipeImage: Trying original URL -', src);
      setCurrentSrc(src);
      setIsLoading(true); // Reset loading untuk URL asli
      return;
    }
    
    setHasError(true);
    if (onError) onError(e);
  }, [currentSrc, fallbackSrc, src, onError]);

  // Reset state when src changes
  useEffect(() => {
    console.log('🔄 RecipeImage: Source changed to -', src);
    setHasError(false);
    setCurrentSrc(src);
    setIsLoading(true);
  }, [src]);

  if (hasError) {
    return null; // Return null so parent can show fallback
  }

  return (
    <div className="relative w-full h-full">
      {/* PERBAIKAN 2: Loading indicator overlay, bukan hide gambar */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            <div className="text-xs text-gray-600">Loading...</div>
          </div>
        </div>
      )}
      
      {/* PERBAIKAN 3: Gambar selalu tampil, tapi dengan opacity */}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        style={{ 
          opacity: isLoading ? 0 : 1,
          display: 'block' // Selalu tampil
        }}
      />
    </div>
  );
};

export default RecipeImage;