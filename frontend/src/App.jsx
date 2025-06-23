// App.js
import { Routes, Route, useLocation} from "react-router-dom";
import { useEffect } from "react";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/home/Home";
import RecipePage from "./pages/recipe/Recipes";
import DetailPage from "./pages/recipe/Detail";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/about/About";
import BookmarkPage from "./pages/bookmark/Bookmark";
import ProfilePage from "./pages/profile/Profile";
import LoginPage from "./pages/authentication/Login";
import RegisterPage from "./pages/authentication/Register";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import ChangePassword from "./pages/profile/ChangePassword";
import EditProfilePage from "./pages/profile/EditProfile";
import PreferencesPage from "./pages/question/PreferencesPage";
import CategoryPage from './pages/recipe/Category';
import Layout from "./components/common/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute  from "./components/auth/PublicRoutes";
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
    <AuthProvider>
      <SearchProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Routes - tanpa Layout */}
          <Route path="/login" 
            element=
            {<PublicRoute>
              <LoginPage/>
            </PublicRoute> } 
          />
          <Route path="/register" 
            element={<RegisterPage />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes - tanpa Layout */}
          <Route 
            path="/form" 
            element={
              <ProtectedRoute>
                <PreferencesPage />
              </ProtectedRoute>
                
            } 
          />
          <Route 
            path="/change-password" 
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes dengan Layout */}
          <Route path="/" element={<Layout />}>
            {/* Public Routes dengan Layout */}
            <Route index element={<HomePage />} />
            <Route path="resep" element={<RecipePage />} />
            <Route path="resep/:id" element={<DetailPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="about" element={<AboutPage />} />
            
            {/* Protected Routes dengan Layout */}
            <Route 
              path="bookmark" 
              element={
                <ProtectedRoute>
                  <BookmarkPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="ubah-profil" 
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </SearchProvider>
    </AuthProvider>
  );
}