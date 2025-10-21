import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Box, Grid, Card, CardMedia, CardActions, CircularProgress } from '@mui/material';
import { data, useLocation, useNavigate } from 'react-router-dom';

import { useData } from '../DataContext'; 


const API_BASE_URL = 'http://localhost:8000';

export default function ImagesPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { dataContext, setDataContext } = useData();
  const isDemo = dataContext.demoGeneration;

  // Accede a las imágenes pasadas por navigate
  const cartelImage = dataContext.cartelImgUrl;

  console.log("dataContext en ImagesPreviewPage:", dataContext);

  // States for each generation
  const [cartel, setCartel] = useState({ url: null, imageUrl: cartelImage, loading: false, error: '' });
  const [pareja, setPareja] = useState({ url: null, imageUrl: null, loading: false, error: '' });

  const [finalVideoLoading, setFinalVideoLoading] = useState(false);
  const [finalVideoError, setFinalVideoError] = useState('');

  // Evita ejecución doble en StrictMode
  const initCalledRef = useRef(false);

  // Generate cartel (text to image)
  const generarCartel = async () => {
    console.log("Generando cartel", dataContext.persona1.nombre, dataContext.persona2.nombre);
    
    if (!cartelImage) {
      setCartel(prev => ({ ...prev, error: 'Faltan la imagen del cartel' }));
      return;
    }

    setCartel(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/create_cartel_video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: dataContext.id,
          nombre1: dataContext.persona1.nombre,
          nombre2: dataContext.persona2.nombre,
          image_url: dataContext.cartelImgUrl,
          demo: isDemo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error response:', data);
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

      setCartel(prev => ({
        ...prev,
        url: `${data.video_url}`,
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

  // Generate video (image to video)
  const generarPareja = async () => {

    console.log("imagenParejaUrl:", dataContext.imagenParejaUrl);

    if (!dataContext.imagenParejaUrl) {
      setPareja(prev => ({ ...prev, error: 'No se ha subido ninguna imagen' }));
      return;
    }
    
    setPareja(prev => ({ ...prev, loading: true, error: '' }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/create_video_pareja`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: dataContext.id,
          image_url: dataContext.imagenParejaUrl,
          demo: isDemo
        })
      });
      
      const data = await response.json();
      console.log("Video generation response:", data);
      
      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.message || 'Error al generar el video');
      }
      
      // Use the URL provided by the backend
      setPareja(prev => ({
        ...prev,
        url: data.video_url,
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

    // Protege contra doble ejecución en dev (StrictMode)
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    console.log("Generando todo");
    console.log("Data context", dataContext);
    if (cartelImage) generarCartel();
    if (dataContext.imagenParejaUrl) generarPareja();
  }, [cartelImage]);

  const renderMedia = (type) => {
    const data = type === 'cartel' ? cartel : pareja;
    const title = type === 'cartel' ? 'Cartel' : 'Pareja';
    const onRegenerate = type === 'cartel' ? generarCartel : generarPareja;
      
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
    if (!cartel.url /*|| !pareja.url*/) {
      setFinalVideoError('Por favor genera primero el cartel, la polaroid y la pareja');
      return;
    }

    setFinalVideoLoading(true);
    setFinalVideoError('');

    try {

      const requestData = {
        id: dataContext.id,
        nombre1: dataContext.persona1.nombre,
        nombre2: dataContext.persona2.nombre,
        email1: dataContext.persona1.email,
        email2: dataContext.persona2.email,
        cartel_video: cartel.url,
        pareja_video: pareja.url,
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
            videoUrl: data.video_path
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

  return (
    <div className='flex flex-col items-center justify-center w-[90%]  bg-[#F7F4F1] opacity-90 py-8 overflow-y-auto h-[80vh] max-h-[80vh]'>
      <h2 className="text-3xl font-bold mb-8 pt-140 md:pt-0">Elementos generados</h2>
      {/* Previsualización de imágenes pequeñas */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
        {cartelImage && (
          <Box sx={{ width: 80, height: 80, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
            <img src={cartelImage} alt="Cartel preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        )}
      </Box>
      <Box sx={{ width: '100%', maxWidth: '1400px' }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom align="center">Cartel</Typography>
            {renderMedia('cartel')}
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
          disabled={finalVideoLoading || !cartel.url /*|| !pareja.url*/}
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
