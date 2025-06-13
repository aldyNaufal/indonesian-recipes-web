import { createContext, useState } from "react";

export const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [ingredients, setIngredients] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [page, setPage] = useState(1); // for pagination

  return (
    <SearchContext.Provider value={{
      ingredients, setIngredients,
      filteredRecipes, setFilteredRecipes,
      page, setPage
    }}>
      {children}
    </SearchContext.Provider>
  );
}
