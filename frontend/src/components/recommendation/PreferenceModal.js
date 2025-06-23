import React, { useState } from 'react';

const PreferenceModal = ({ isOpen, onClose, onSubmit }) => {
  const [preferences, setPreferences] = useState({
    categories: [],
    difficulty: '',
    top_k: 10
  });

  const categories = [
    'Ayam',
    'Sapi',
    'Udang',
    'Ikan',
    'Kambing',
    'Telur'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleCategoryToggle = (category) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (preferences.categories.length === 0) {
      alert('Pilih minimal satu kategori');
      return;
    }
    onSubmit(preferences);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Preferensi Masakan</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Categories */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Kategori Favorit (pilih minimal 1):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="rounded"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Tingkat Kesulitan:
              </label>
              <select
                value={preferences.difficulty}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  difficulty: e.target.value
                }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Semua Tingkat</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Dapatkan Rekomendasi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreferenceModal;