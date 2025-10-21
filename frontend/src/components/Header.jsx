import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/img/labastilla-logo.png';
import { useData } from '../DataContext';

export default function Header() {
  const navigate = useNavigate();

  const { resetData } = useData();

  const handleNewVideo = () => {
    resetData();
    navigate('/cargar_archivos');
  };

  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-transparent z-50 fixed top-0 left-0">
      <a
        href="https://labastilla.com" // Cambia esta URL por la que desees
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        <img src={logo} alt="Logo La Bastilla" className="w-44" />
      </a>
      <div className="flex gap-4">
        <button
          className="px-6 py-2 text-black rounded-lg text-lg uppercase font-semibold hover:bg-[#D29591] transition"
          onClick={handleNewVideo}
        >
          Generar nuevo vídeo
        </button>
      </div>
    </header>
  );
}