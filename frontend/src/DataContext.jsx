import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

const initialData = {
  id: null,
  persona1: { nombre: '', telefono: '', email: '' },
  persona2: { nombre: '', telefono: '', email: '' },
  fecha: '',
  imagen: null,
  imagenParejaUrl: null,
  cartelImgUrl: null,
  demoGeneration: false
};

export function DataProvider({ children }) {
  const [dataContext, setDataContext] = useState(() => {
    const stored = localStorage.getItem('data');
    return stored ? JSON.parse(stored) : initialData;
  });

  useEffect(() => {
    localStorage.setItem('dataContext', JSON.stringify(dataContext));
  }, [dataContext]);

  // Método para resetear los datos y limpiar el localStorage
  const resetData = () => {
    setDataContext(initialData);
    localStorage.removeItem('data');
    localStorage.removeItem('dataContext');
  };

  return (
    <DataContext.Provider value={{ dataContext, setDataContext, resetData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}