// src/pages/Home.jsx
import React from 'react';
import HomeView from '../views/HomeView';
import HomePresenter from '../presenters/HomePresenter';

export default function HomePage() {
  return <HomeView presenter={HomePresenter()} />;
}