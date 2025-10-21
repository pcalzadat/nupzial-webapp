import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useVideo } from '../VideoContext';

export default function CargarArchivos() {
  const navigate = useNavigate();
  const fileInputs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [fileNames, setFileNames] = useState(['', '', '', '']);
  const [files, setFiles] = useState([null, null, null, null]);
  const { setVideoUrl } = useVideo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (idx, e) => {
    const file = e.target.files[0];
    const newFileNames = [...fileNames];
    const newFiles = [...files];
    newFileNames[idx] = file?.name || '';
    newFiles[idx] = file || null;
    setFileNames(newFileNames);
    setFiles(newFiles);
  };

  const handleGenerarVideo = async () => {
    setError('');
    setSuccess('');
    if (files.some((f) => !f)) {
      setError('Por favor selecciona los 4 vídeos.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file, idx) => {
        formData.append(`video${idx + 1}`, file);
      });
      // Cambia la URL según tu backend
      const response = await fetch('http://localhost:8000/api/unir_videos', {
        method: 'POST',
        body: formData,
      });

      console.log("Holi");
      
      if (!response.ok) throw new Error('Error al unir los vídeos.');
      // Descargar el vídeo generado
      console.log("YESS");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setVideoUrl(url);
      setSuccess('Vídeo generado correctamente.');
      navigate('/generacion_video');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <h2 className="text-3xl font-semibold mb-6">Cargar archivos de vídeo</h2>
      {[0, 1, 2, 3].map((idx) => (
        <div key={idx} className="mb-2 w-full max-w-xs">
          <input
            type="file"
            accept="video/*"
            ref={fileInputs[idx]}
            onChange={(e) => handleFileChange(idx, e)}
            className="mb-1 w-full"
          />
          {fileNames[idx] && (
            <p className="text-gray-700 text-sm">Archivo {idx + 1}: {fileNames[idx]}</p>
          )}
        </div>
      ))}
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition mt-4 disabled:opacity-50"
        onClick={handleGenerarVideo}
        disabled={loading}
      >
        {loading ? 'Generando vídeo...' : 'Generar vídeo'}
      </button>
    </div>
  );
}
