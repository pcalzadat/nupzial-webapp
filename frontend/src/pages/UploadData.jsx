import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useVideo } from '../VideoContext';
import { useData } from '../DataContext';

const API_BASE_URL = 'http://localhost:8000';

export default function UploadData() {
  const navigate = useNavigate();

  const { dataContext, setDataContext } = useData();

  const [nombre1, setNombre1] = useState("");
  const [nombre2, setNombre2] = useState("");
  const [telefono1, setTelefono1] = useState("");
  const [telefono2, setTelefono2] = useState("");
  const [email1, setEmail1] = useState("");
  const [email2, setEmail2] = useState("");
  const [fecha, setFecha] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenName, setImagenName] = useState("");

  const [demo, setDemo] = useState(false);
  
  const { setVideoUrl } = useVideo();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    console.log("Data context changed:", dataContext);
  }, [dataContext]);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    setImagenName(file?.name || '');
    setImagen(file || null);
  };

  const handleGenerarVideo = async () => {
    setError("");
    setSuccess("");
    
    // Validar cada campo individualmente
    const camposFaltantes = [];
    if (!nombre1.trim()) camposFaltantes.push("Nombre 1");
    if (!telefono1.trim()) camposFaltantes.push("Teléfono 1");
    if (!email1.trim()) camposFaltantes.push("Email 1");
    if (!nombre2.trim()) camposFaltantes.push("Nombre 2");
    if (!telefono2.trim()) setTelefono2("");
    if (!email2.trim()) setEmail2("");
    if (!fecha) camposFaltantes.push("Fecha");
    if (!imagen) camposFaltantes.push("Imagen");
    
    if (camposFaltantes.length > 0) {
      setError(`Por favor completa los siguientes campos: ${camposFaltantes.join(', ')}`);
      return;
    }
    
    setLoading(true);
    try {
      // Primero subir la imagen al backend (/api/saveImage)
      const formData = new FormData();
      formData.append('file', imagen, imagenName || imagen.name);

      const res = await fetch(`${API_BASE_URL}/api/saveImage`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Error subiendo la imagen: ${res.status} ${errBody}`);
      }

      const resJson = await res.json();
      const imagenUrl = resJson.image_url || "";
      console.log("Imagen subida, URL recibida:", imagenUrl);

      if (!imagenUrl) {
        throw new Error("No se recibió URL de la imagen desde el servidor");
      }

      // Set the names and image URL in context (if needed elsewhere)
      setDataContext({
          ...dataContext,
          id: resJson.id,
          persona1: { nombre: nombre1, telefono: telefono1, email: email1 },
          persona2: { nombre: nombre2, telefono: telefono2, email: email2},
          fecha: fecha.split('-').reverse().join('-'),
          imagen: imagen,
          imagenParejaUrl: imagenUrl,
          demoGeneration: false
        });
      
      // Navigate to GeneracionesIA with all form data
      navigate("/imagenes_ia");
      
      setSuccess("Datos preparados correctamente.");
    } catch (err) {
      setError(err.message || "Error al generar vídeo");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarVideoDemo = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    console.log("Generando vídeo demo con datos de prueba.");

    try {
      // Primero subir la imagen al backend (/api/saveImage)
      const formData = new FormData();
      formData.append('file', imagen, imagenName || imagen.name);

      const res = await fetch(`${API_BASE_URL}/api/saveImage`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Error subiendo la imagen: ${res.status} ${errBody}`);
      }

      const resJson = await res.json();
      const imagenUrl = resJson.image_url || "";
      console.log("Imagen subida, URL recibida:", imagenUrl);

      if (!imagenUrl) {
        throw new Error("No se recibió URL de la imagen desde el servidor");
      }

      // Set the names and image URL in context (if needed elsewhere)
      setDataContext({
          ...dataContext,
          id: resJson.id,
          persona1: { nombre: nombre1, telefono: telefono1, email: email1 },
          persona2: { nombre: nombre2, telefono: telefono2, email: email2},
          fecha: fecha.split('-').reverse().join('-'),
          imagenParejaUrl: imagenUrl,
          demoGeneration: true
        });
      
      // Navigate to GeneracionesIA with all form data
      navigate("/imagenes_ia");
      setSuccess("Datos preparados correctamente.");
    } catch (err) {
      setError(err.message || "Error al generar vídeo");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="flex flex-col items-center justify-center w-[90%] h-[80vh] bg-[#F7F4F1] opacity-90">
      <div className="flex flex-col w-full max-w-4xl justify-center items-center overflow-y-auto">
      <h2 className="text-3xl text-center font-bold w-[80%] md:w-full mb-8 mt-42 md:mt-0">Cargar archivos para generar el vídeo</h2>
          <div className='flex flex-col md:flex-row gap-x-8 gap-y-2 md:gap-y-8 justify-center items-center'>
          <div className="flex flex-col flex-1">
            <div className="mb-4 w-full">
              <label className="block text-left text-sm font-bold text-gray-400 mb-1" htmlFor="nombre1">Nombre 1*</label>
              <input
                id="nombre1"
                type="text"
                placeholder="Nombre Apellido"
                value={nombre1}
                onChange={e => setNombre1(e.target.value)}
                className="mb-1 w-full px-3 py-2 border rounded border-[#D29591]"
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-left text-sm font-bold text-gray-400 mb-1" htmlFor="telefono1">Teléfono 1*</label>
              <input
                id="telefono1"
                type="text"
                placeholder="+34 765567453"
                value={telefono1}
                onChange={e => setTelefono1(e.target.value)}
                className="mb-1 w-full px-3 py-2 border rounded border-[#D29591]"
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-left text-sm font-bold text-gray-400 mb-1" htmlFor="email1">Email 1*</label>
              <input
                id="email1"
                type="text"
                placeholder="email@email.com"
                value={email1}
                onChange={e => setEmail1(e.target.value)}
                className="mb-1 w-full px-3 py-2 border rounded border-[#D29591]"
              />
            </div>
          </div>

          <div className="flex flex-col flex-1">
            <div className="mb-4 w-full">
              <label className="block text-left text-sm font-bold text-gray-400 mb-1" htmlFor="nombre2">Nombre 2*</label>
              <input
                id="nombre2"
                type="text"
                placeholder="Nombre Apellido"
                value={nombre2}
                onChange={e => setNombre2(e.target.value)}
                className="mb-1 w-full px-3 py-2 border rounded border-[#D29591]"
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-left text-sm font-bold text-gray-400 mb-1" htmlFor="telefono2">Teléfono 2</label>
              <input
                id="telefono2"
                type="text"
                placeholder="+34 765567453"
                value={telefono2}
                onChange={e => setTelefono2(e.target.value)}
                className="mb-1 w-full px-3 py-2 border rounded border-[#D29591]"
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-left text-sm font-bold text-gray-400 mb-1" htmlFor="email2">Email 2</label>
              <input
                id="email2"
                type="text"
                placeholder="email@email.com"
                value={email2}
                onChange={e => setEmail2(e.target.value)}
                className="mb-1 w-full px-3 py-2 border rounded border-[#D29591]"
              />
            </div>
          </div>
          
          <div className="flex flex-col flex-1 items-center justify-center">
            <div className="mb-4 w-full">
              <label className="block text-left text-sm font-bold text-gray-400 mb-1" htmlFor="fecha">Fecha en que se conocieron*</label>
              <input
                id="fecha"
                type="date"
                placeholder="Fecha"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="mb-1 w-full px-3 py-2 border rounded border-[#D29591]"
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-left text-sm font-bold text-gray-400 mb-1" htmlFor="file-input">
                Imagen de pareja*
              </label>
              <label
                htmlFor="file-input"
                className="inline-block w-full px-6 py-2 bg-[#D29591] text-white rounded-lg text-lg hover:bg-[#AD5752] cursor-pointer transition text-center"
              >
                {imagenName ? 'Cambiar imagen' : 'Cargar imagen'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                className="hidden"
                id="file-input"
              />
              {imagenName && (
                <p className="text-gray-700 text-sm mt-2">
                  Archivo seleccionado: {imagenName}
                </p>
              )}
            </div>
          </div>
        </div>
        {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      <div className='flex gap-4'>
        <button
          className="px-10 py-3 bg-[#D29591] text-white rounded-lg text-lg hover:bg-[#AD5752] transition mt-2 md:mt-12 mb-8 md:mb-0 disabled:opacity-50"
          onClick={handleGenerarVideoDemo}
          disabled={loading}
        >
          {loading ? 'Generando vídeo...' : 'Generar vídeo demo'}
        </button>
        <button
          className="px-10 py-3 bg-[#AD5752] text-white rounded-lg text-lg hover:bg-[#661B17] transition mt-2 md:mt-12 mb-8 md:mb-0 disabled:opacity-50"
          onClick={handleGenerarVideo}
          disabled={loading}
        >
          {loading ? 'Generando vídeo...' : 'Generar vídeo real'}
        </button>
      </div>
      </div>
      
      
    </div>
  );
}
