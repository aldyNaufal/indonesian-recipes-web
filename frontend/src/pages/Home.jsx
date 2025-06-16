// src/pages/Home.jsx
import React from 'react';
import HomeView from '../views/HomeView';
import useHomePresenter from '../presenters/HomePresenter'; // Ubah path sesuai lokasi file

export default function HomePage() {
  const presenter = useHomePresenter(); // Panggil hook di dalam komponen
  
  return <HomeView presenter={presenter} />;
}