// src/components/MLRecommendations.jsx
import React from 'react';
import { useRecipes } from '../../hooks/useRecipes';

const MLRecommendations = ({ isLoggedIn, user, userPreferences }) => {
  const {
    guestRecipes,
    userRecipes,
    loading,
    mlLoading,
    error,
    mlError,
    retryMLRecommendations,
    checkMLHealth,
    hasMLRecommendations,
    debugInfo
  } = useRecipes(isLoggedIn, user, userPreferences);

  // Debug component untuk development
  const DebugPanel = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#f0f0f0',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 1000
      }}>
        <h4>Debug Info:</h4>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        <button onClick={checkMLHealth}>Check ML Health</button>
      </div>
    );
  };

  // Loading component
  const LoadingCard = () => (
    <div className="loading-card" style={{
      width: '200px',
      height: '250px',
      background: '#f5f5f5',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 10px'
    }}>
      <div>Loading...</div>
    </div>
  );

  // Recipe card component
  const RecipeCard = ({ recipe }) => (
    <div className="recipe-card" style={{
      width: '200px',
      height: '250px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      margin: '0 10px',
      cursor: 'pointer'
    }}>
      <img 
        src={recipe.image || recipe.image_url || '/placeholder-recipe.jpg'} 
        alt={recipe.title || recipe.name}
        style={{
          width: '100%',
          height: '120px',
          objectFit: 'cover'
        }}
        onError={(e) => {
          e.target.src = '/placeholder-recipe.jpg';
        }}
      />
      <div style={{ padding: '12px' }}>
        <h4 style={{ 
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: 'bold',
          lineHeight: '1.2',
          height: '34px',
          overflow: 'hidden'
        }}>
          {recipe.title || recipe.name}
        </h4>
        <p style={{
          margin: '0',
          fontSize: '12px',
          color: '#666',
          lineHeight: '1.3',
          height: '32px',
          overflow: 'hidden'
        }}>
          {recipe.description || recipe.summary || 'Resep lezat untuk Anda'}
        </p>
        <div style={{
          marginTop: '8px',
          fontSize: '11px',
          color: '#999'
        }}>
          {recipe.cooking_time && `⏱️ ${recipe.cooking_time} min`}
          {recipe.difficulty && ` • ${recipe.difficulty}`}
        </div>
      </div>
    </div>
  );

  // Recipe section component
  const RecipeSection = ({ title, recipes, isLoading }) => (
    <div style={{ marginBottom: '40px' }}>
      <h3 style={{ 
        marginBottom: '16px',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        {title}
      </h3>
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        paddingBottom: '10px',
        gap: '10px'
      }}>
        {isLoading ? (
          // Show loading cards
          Array.from({ length: 5 }, (_, i) => <LoadingCard key={i} />)
        ) : recipes.length > 0 ? (
          // Show actual recipes
          recipes.map((recipe, index) => (
            <RecipeCard 
              key={recipe.id || recipe._id || index} 
              recipe={recipe} 
            />
          ))
        ) : (
          // Show empty state
          <div style={{
            width: '100%',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontStyle: 'italic'
          }}>
            Belum ada rekomendasi tersedia
          </div>
        )}
      </div>
    </div>
  );

  // Error handling component
  const ErrorComponent = ({ error, onRetry }) => (
    <div style={{
      background: '#fee',
      border: '1px solid #fcc',
      borderRadius: '8px',
      padding: '16px',
      margin: '16px 0',
      color: '#c33'
    }}>
      <h4>Terjadi Kesalahan</h4>
      <p>{error}</p>
      <button 
        onClick={onRetry}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Coba Lagi
      </button>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <DebugPanel />
      
      <h2 style={{ marginBottom: '30px' }}>
        {isLoggedIn ? 'Rekomendasi Untuk Anda' : 'Resep Populer'}
      </h2>

      {/* General error */}
      {error && (
        <ErrorComponent 
          error={error} 
          onRetry={() => window.location.reload()} 
        />
      )}

      {/* ML-specific error */}
      {mlError && isLoggedIn && (
        <ErrorComponent 
          error={`ML Recommendations: ${mlError}`} 
          onRetry={retryMLRecommendations} 
        />
      )}

      {isLoggedIn && user ? (
        // Logged-in user sections
        <>
          <RecipeSection
            title="🎯 Khusus Untuk Kamu"
            recipes={userRecipes.untukKamu}
            isLoading={mlLoading}
          />
          
          <RecipeSection
            title="❤️ Sesuai Preferensi Kamu"
            recipes={userRecipes.preferensiSama}
            isLoading={mlLoading}
          />
          
          <RecipeSection
            title="🏆 Top WeRecooked"
            recipes={userRecipes.topWerecooked}
            isLoading={loading}
          />

          {/* Fallback untuk guest recipes jika ML gagal */}
          {!hasMLRecommendations && !mlLoading && (
            <>
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                padding: '12px',
                margin: '16px 0',
                color: '#856404'
              }}>
                <small>
                  Rekomendasi personal sedang dimuat. Menampilkan resep populer sementara.
                </small>
              </div>
              
              <RecipeSection
                title="💰 Menu Hemat"
                recipes={guestRecipes.topMenuHemat}
                isLoading={loading}
              />
              
              <RecipeSection
                title="👍 Banyak Disukai"
                recipes={guestRecipes.banyakDisukai}
                isLoading={loading}
              />
            </>
          )}
        </>
      ) : (
        // Guest user sections
        <>
          <RecipeSection
            title="💰 Menu Hemat"
            recipes={guestRecipes.topMenuHemat}
            isLoading={loading}
          />
          
          <RecipeSection
            title="👍 Banyak Disukai"
            recipes={guestRecipes.banyakDisukai}
            isLoading={loading}
          />
          
          <RecipeSection
            title="🏆 Top Andalan"
            recipes={guestRecipes.topAndalan}
            isLoading={loading}
          />
        </>
      )}

      {/* Login prompt for guests */}
      {!isLoggedIn && (
        <div style={{
          background: '#e3f2fd',
          border: '1px solid #90caf9',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          margin: '20px 0'
        }}>
          <h4>Dapatkan Rekomendasi Personal!</h4>
          <p>Masuk untuk mendapatkan rekomendasi resep yang disesuaikan dengan preferensi Anda.</p>
          <button style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Masuk Sekarang
          </button>
        </div>
      )}
    </div>
  );
};

export default MLRecommendations;