import { Link } from "react-router-dom";

export default function BookmarkView({ presenter }) {
  const { savedRecipes, handleRemove } = presenter;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-2" transition-colors duration-300>
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl" transition-colors duration-300>
        <h1 className="text-2xl font-bold mb-4">Resep Tersimpan</h1>

        {savedRecipes.length === 0 ? (
          <p className="text-gray-500">Belum ada resep yang disimpan.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
            {savedRecipes.map((recipe) => (
              <div key={recipe._id} className="bg-gray-50 p-4 rounded-xl shadow dark:bg-gray-700 dark:border-gray-500">
                <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover rounded-lg mb-2" />
                <h2 className="text-lg font-semibold text-blue-700 hover:underline dark:text-white">
                  <Link to={`/resep/${recipe.recipeId}`}>{recipe.title}</Link>
                </h2>
                <button onClick={() => handleRemove(recipe._id)} className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                  Hapus dari Bookmark
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
