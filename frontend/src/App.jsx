// App.js
import { Routes, Route, useLocation} from "react-router-dom";
import { useEffect } from "react";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import HomePage from "./views/HomeView";
import RecipePage from "./views/RecipesView";
import DetailPage from "./pages/Detail";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/About";
import BookmarkPage from "./pages/Bookmark";
import ProfilePage from "./pages/Profile";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import EditProfilePage from "./pages/EditProfile";
import PreferencesPage from "./pages/PreferencesPage";
import Layout from "./components/common/Layout";
import "./index.css";

// Komponen untuk menangani scroll behavior
function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    if (!document.startViewTransition) {
      window.scrollTo(0, 0);
      return;
    }
    
    document.startViewTransition(() => {
      window.scrollTo(0, 0);
    });
  }, [location.pathname]);
  
  return null;
}

export default function App() {
  return (
    <AuthProvider> {/* Bungkus dengan AuthProvider */}
      <SearchProvider>
        <ScrollToTop />
        <Routes>
          {/* Routes tanpa Layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/set-preferences" element={<PreferencesPage />} />
          
          {/* Routes dengan Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="resep" element={<RecipePage />} />
            <Route path="resep/:id" element={<DetailPage />} />
            <Route path="bookmark" element={<BookmarkPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="ubah-profil" element={<EditProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </SearchProvider>
    </AuthProvider>
  );
}