import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';
import html2pdf from 'html2pdf.js';
import {
  showErrorAlert,
  showLoadingAlert,
  hideLoadingAlert,
  showSuccessAlert
} from '../utils/alerts';

export default function useDetailPresenter(id) {
  const [recipe, setRecipe] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadRecipe() {
      showLoadingAlert("Membuka detail resep...");
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        const res = await apiGet(`/resep/${id}`);
        if (!res.error) {
          setRecipe(res.data);
          // Cek status bookmark
          const token = localStorage.getItem('token');
          const bookmarks = await apiGet('/bookmark', token);
          setSaved(bookmarks.data?.some((r) => r.recipeId === res.data.id));
        } else {
          showErrorAlert(res.message);
        }
      } catch (e) {
        showErrorAlert("Gagal memuat detail resep.");
      } finally {
        hideLoadingAlert();
      }
    }

    loadRecipe();
  }, [id]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const res = await apiPost('/bookmark', {
      recipeId: recipe.id,
      title: recipe.Title,
      image: recipe.Image,
    }, token);

    if (!res.error) {
      setSaved(true);
      showSuccessAlert("Resep telah disimpan!");
    } else {
      showErrorAlert(res.message || "Gagal menyimpan resep");
    }
  };

  const handlePrint = () => window.print();

  const handleTutorial = () => {
    const query = encodeURIComponent(recipe?.Title || '');
    window.open(`https://www.youtube.com/results?search_query=resep ${query}`, '_blank');
  };

  const handleExportPDF = () => {
    const detail = document.getElementById('recipe-detail');
    if (detail) html2pdf().from(detail).save(`${recipe.Title}.pdf`);
  };

  return { recipe, saved, handleSave, handlePrint, handleTutorial, handleExportPDF };
}
