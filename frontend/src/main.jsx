import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index.jsx';
import UploadData from './pages/UploadData.jsx';
import GeneracionVideo from './pages/GeneracionVideo.jsx';
import ImagesPreviewPage from './pages/ImagesPreviewPage.jsx';
import VideosPreviewPage from './pages/VideosPreviewPage.jsx';
import GeneracionesIADemo from './pages/GeneracionesIADemo.jsx';

import { VideoProvider } from './VideoContext';
import { DataProvider } from './DataContext.jsx';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <VideoProvider>
        <BrowserRouter>
          <App>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cargar_archivos" element={<UploadData />} />
              <Route path="/generacion_video" element={<GeneracionVideo />} />
              <Route path="/imagenes_ia" element={<ImagesPreviewPage />} />
              <Route path="/videos_ia" element={<VideosPreviewPage />} />
              <Route path="/generaciones_ia_demo" element={<GeneracionesIADemo />} />
            </Routes>
          </App>
        </BrowserRouter>
      </VideoProvider>
    </DataProvider>
  </StrictMode>,

)
