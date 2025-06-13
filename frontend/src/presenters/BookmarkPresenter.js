import { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../utils/api';
import {
  showConfirmationAlert, showSuccessAlert, showErrorAlert
} from '../utils/alerts';

export default function useBookmarkPresenter() {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!token) return;

      const res = await apiGet('/bookmark', token);
      if (!res.error) {
        setSavedRecipes(res.data);
      } else {
        showErrorAlert(res.message || 'Gagal memuat bookmark');
      }
    };
    fetchBookmarks();
  }, []);

  const handleRemove = (id) => {
    showConfirmationAlert("Resep akan dihapus dari bookmark.", async () => {
      const res = await apiDelete(`/bookmark/${id}`, token);
      if (!res.error) {
        const updated = savedRecipes.filter((r) => r._id !== id);
        setSavedRecipes(updated);
        showSuccessAlert("Resep berhasil dihapus.");
      } else {
        showErrorAlert(res.message || "Gagal menghapus bookmark");
      }
    });
  };

  return { savedRecipes, handleRemove };
}
