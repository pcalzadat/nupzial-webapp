import React from 'react';
import Header from './components/Header';

function App({ children }) {
  return (
    <div className="relative min-h-screen min-w-screen w-screen h-screen overflow-hidden">
      {/* Imagen de fondo */}
      <div className="fixed inset-0 -z-10 bg-cover bg-center bg-[url('./assets/img/fondo.jpg')] blur-sm select-none pointer-events-none" />
      {/* Overlay */}
      <div className="fixed inset-0 -z-10 bg-[#F7F4F1] opacity-90 select-none pointer-events-none" />
      {/* Header fijo */}
      <Header />
      {/* Contenido absolutamente centrado */}
      <main className="absolute inset-0 flex items-center justify-center w-full h-full z-10 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default App;
