import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Grid, Card, CardMedia, CardActions, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { useData } from '../DataContext'; 


const API_BASE_URL = 'http://localhost:8000';

export default function GeneracionesIADemo() {
  const location = useLocation();
  const navigate = useNavigate();

  const { dataContext, setDataContext } = useData();

  // States for each generation
  const [cartel, setCartel] = useState({ url: null, loading: false, error: '' });
  const [polaroid, setPolaroid] = useState({ url: null, imageUrl: null, loading: false, error: '' });
  const [pareja, setPareja] = useState({ url: null, imageUrl: null, loading: false, error: '' });
  const [video, setVideo] = useState({ url: null, loading: false, error: '' });
  const [finalVideoLoading, setFinalVideoLoading] = useState(false);
  const [finalVideoError, setFinalVideoError] = useState('');

  // Generate cartel (text to image)
  const generarCartel = async () => {
    console.log("Generando cartel", dataContext.persona1.nombre, dataContext.persona2.nombre);
    if (!dataContext.persona1.nombre || !dataContext.persona2.nombre) {
      setCartel(prev => ({ ...prev, error: 'Faltan los nombres' }));
      return;
    }
  
    setCartel(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/create_cartel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre1: dataContext.persona1.nombre,
          nombre2: dataContext.persona2.nombre
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', data);
        // If there's a placeholder URL in the error response, use it
        if (data.placeholder_url) {
          return setCartel(prev => ({ 
            ...prev, 
            url: `${API_BASE_URL}${data.placeholder_url}`, 
            loading: false,
            isPlaceholder: true
          }));
        }
        throw new Error(data.message || 'Error al generar el cartel');
      }

      // Use the URL provided by the backend
      setCartel(prev => ({
        ...prev,
        url: `${API_BASE_URL}${data.video_url}`,
        loading: false,
        error: ''
      }));
      
    } catch (error) {
      console.error('Error:', error);
      setCartel(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al generar el cartel'
      }));
    }
  };

  // Generate polaroid (image to image and video)
  const generarPolaroid = async () => {
    if (!dataContext.imagen) {
      setPolaroid(prev => ({ ...prev, error: 'No se ha subido ninguna imagen' }));
      return;
    }
    
    setPolaroid(prev => ({ ...prev, loading: true, error: '' }));
    
    const formData = new FormData();
    formData.append('fecha', dataContext.fecha);
    formData.append('imagen', dataContext.imagen);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/create_polaroid`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', data);
        // If there's a placeholder URL in the error response, use it
        if (data.video_url) {
          return setPolaroid(prev => ({
            ...prev,
            url: `${API_BASE_URL}${data.video_url}`,
            loading: false,
            isPlaceholder: true
          }));
        }
        throw new Error(data.message || 'Error al generar la polaroid');
      }
      
      // Use the URLs provided by the backend
      setPolaroid(prev => ({
        ...prev,
        imageUrl: data.image_url ? `${API_BASE_URL}${data.image_url}` : null,
        url: data.video_url ? `${API_BASE_URL}${data.video_url}` : null,
        loading: false,
        error: ''
      }));
      
    } catch (error) {
      console.error('Error:', error);
      setPolaroid(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al generar la polaroid'
      }));
    }
  };

  // Generate video (image to video)
  const generarPareja = async () => {
    if (!dataContext.imagen) {
      setPareja(prev => ({ ...prev, error: 'No se ha subido ninguna imagen' }));
      return;
    }
    
    setPareja(prev => ({ ...prev, loading: true, error: '' }));
    
    const formData = new FormData();
    formData.append('imagen', dataContext.imagen);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/create_video`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', data);
        // If there's a placeholder URL in the error response, use it
        if (data.video_url) {
          return setPareja(prev => ({
            ...prev,
            url: `${API_BASE_URL}${data.video_url}`,
            loading: false,
            isPlaceholder: true
          }));
        }
        throw new Error(data.message || 'Error al generar el video');
      }
      
      // Use the URL provided by the backend
      setPareja(prev => ({
        ...prev,
        url: data.video_url ? `${API_BASE_URL}${data.video_url}` : null,
        loading: false,
        error: ''
      }));
      
    } catch (error) {
      console.error('Error:', error);
      setPareja(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al generar el video'
      }));
    }
  };

  // Generate all content on component mount
  useEffect(() => {
    console.log("Generando todo");
    console.log("Data context", dataContext);
    if (dataContext.persona1.nombre && dataContext.persona2.nombre) generarCartel();
    if (dataContext.fecha && dataContext.imagen) generarPolaroid();
    if (dataContext.imagen) generarPareja();
  }, [0]);

  const renderMedia = (type) => {
    const data = type === 'cartel' ? cartel : type === 'polaroid' ? polaroid : pareja;
    const title = type === 'cartel' ? 'Cartel' : type === 'polaroid' ? 'Polaroid' : 'Pareja';
    const onRegenerate = type === 'cartel' ? generarCartel : type === 'polaroid' ? generarPolaroid : generarPareja;
      
    return (
      <Card>
        {data.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 225 }}>
            <CircularProgress />
          </Box>
        ) : data.error && !data.isPlaceholder ? (
          <Box sx={{ p: 2, height: 225, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography color="error" align="center">{data.error}</Typography>
          </Box>
        ) : data.url ? (
            <Box sx={{ position: 'relative', height: 225 }}>
              {console.log("data.url video", data.url)}
              <video
                autoPlay
                loop
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              >
                <source src={data.url} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </Box>
        ) : (
          <Box sx={{ height: 225, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>No hay {type} generado</Typography>
          </Box>
        )}
        <CardActions>
        <Button 
          variant="contained"
          onClick={onRegenerate} 
          disabled={data.loading}
          fullWidth
          sx={{
            backgroundColor: '#D29591',
            color: 'white',
            py: 1.5,
            '&:hover': {
              backgroundColor: '#AD5752',
              boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {data.loading ? <CircularProgress size={24} /> : `Volver a generar vídeo ${title}`}
        </Button>

        </CardActions>
      </Card>
    );
  };

  const handleGenerarVideoFinal = async () => {
    if (!cartel.url || !polaroid.url || !pareja.url) {
      setFinalVideoError('Por favor genera primero el cartel, la polaroid y la pareja');
      return;
    }

    setFinalVideoLoading(true);
    setFinalVideoError('');

    try {
      // Función para extraer la ruta relativa de la URL
      const getRelativePath = (url) => {
        try {
          const urlObj = new URL(url);
          // Si la URL incluye la ruta de la API, devolvemos solo la parte de la ruta
          if (urlObj.pathname.startsWith('/api/media/')) {
            return urlObj.pathname.replace('/api/media/', '');
          }
          // Si es una URL local, devolvemos solo la ruta
          return urlObj.pathname;
        } catch (e) {
          // Si no es una URL válida, asumimos que ya es una ruta relativa
          return url;
        }
      };

      const requestData = {
        cartel_video: getRelativePath(cartel.url),
        polaroid_video: getRelativePath(polaroid.url),
        pareja_video: getRelativePath(pareja.url)
      };

      console.log('Sending video generation request with:', requestData);

      const response = await fetch(`${API_BASE_URL}/api/generate_final_video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Video generation response:', data);

      if (data.status === 'success') {
        // Navegar a la página de visualización del video final
        navigate('/generacion_video', { 
          state: { 
            videoUrl: data.video_url.startsWith('http') 
              ? data.video_url 
              : `${API_BASE_URL}${data.video_url}`
          } 
        });
      } else {
        setFinalVideoError(data.message || 'Error al generar el video final');
      }
    } catch (error) {
      console.error('Error generating final video:', error);
      setFinalVideoError('Error al conectar con el servidor. Por favor, inténtalo de nuevo.');
    } finally {
      setFinalVideoLoading(false);
    }
  };

  const handleWhatsapp = async () => {
    //setLoading(true);
    try {
      const body= { to: dataContext.persona1.telefono };
      /*if (templateName && !text) {
        body.template_name = templateName ?? "hello_world"; // enviará template
      } else {
        body.text = text ?? "¡Hola desde mi app!";
      }*/

      const res = await fetch(`${API_BASE_URL}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      alert("Mensaje enviado ✅");
    } catch (e) {
      console.error(e);
      alert("No se pudo enviar el WhatsApp ❌");
    } finally {
     
    }
  };

  return (
    <div className='flex flex-col items-center justify-center w-[90%]  bg-[#F7F4F1] opacity-90 py-8 overflow-y-auto h-[80vh] max-h-[80vh]'>
      <h2 className="text-3xl font-bold mb-8 pt-140 md:pt-0">Elementos generados demo</h2>
      <Box sx={{ width: '100%', maxWidth: '1400px' }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom align="center">Cartel</Typography>
            {renderMedia('cartel')}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom align="center">Polaroid</Typography>
            {renderMedia('polaroid')}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom align="center">Pareja</Typography>
            {renderMedia('pareja')}
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          onClick={handleGenerarVideoFinal}
          disabled={finalVideoLoading || !cartel.url || !polaroid.url || !pareja.url}
          startIcon={finalVideoLoading ? <CircularProgress size={24} /> : null}
          sx={{ 
            mt: 2, 
            py: 1.5, 
            px: 4, 
            fontSize: '1.1rem',
            backgroundColor: '#AD5752',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#661B17',
              boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              color: '#a0a0a0',
              cursor: 'not-allowed',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {finalVideoLoading ? 'Generando video final...' : 'Generar Video Final'}
        </Button>

        <Button
          variant="contained"
          onClick={handleWhatsapp}
          startIcon={finalVideoLoading ? <CircularProgress size={24} /> : null}
          sx={{ 
            mt: 2, 
            py: 1.5, 
            px: 4, 
            fontSize: '1.1rem',
            backgroundColor: '#AD5752',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#661B17',
              boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              color: '#a0a0a0',
              cursor: 'not-allowed',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {dataContext.persona1.telefono ? `Enviar a ${dataContext.persona1.telefono}` : "Falta teléfono"}
        </Button>
          {finalVideoError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {finalVideoError}
            </Typography>
          )}
        </Box>
      </Box>
    </div>
  );
}
