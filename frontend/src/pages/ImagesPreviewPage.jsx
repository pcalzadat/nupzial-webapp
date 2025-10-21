import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Box, Grid, Card, CardMedia, CardActions, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { useData } from '../DataContext'; 


const API_BASE_URL = 'http://localhost:8000';

export default function ImagesPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { dataContext, setDataContext } = useData();

  // States for each generation
  const [cartel, setCartel] = useState({ imageUrl: null, loading: false, error: '' });

  const [aiVideosLoading, setAiVideosLoading] = useState(false);
  const [finalVideoError, setFinalVideoError] = useState('');

  console.log("Is demo?", dataContext.demoGeneration);
  const isDemo = dataContext.demoGeneration;

  // Evita ejecución doble en StrictMode
  const initCalledRef = useRef(false);

  // Generate all content on component mount
  useEffect(() => {
    // Protege contra doble ejecución en dev (StrictMode)
    if (initCalledRef.current) return;
    initCalledRef.current = true;
    
    if ((dataContext.persona1.nombre && dataContext.persona2.nombre && dataContext.fecha) || isDemo) {
      generarCartel();
    }
  }, [dataContext.persona1.nombre, dataContext.persona2.nombre, dataContext.fecha, isDemo]);
  
  // Generate cartel (text to image)
  const generarCartel = async () => {
    if ((!dataContext.persona1.nombre || !dataContext.persona2.nombre || !dataContext.fecha) && !isDemo) {
      setCartel(prev => ({ ...prev, error: 'Faltan los nombres' }));
      return;
    }

    if(dataContext.cartelImgUrl){
      console.log("Usando cartel almacenado en el contexto:", dataContext.cartelImgUrl);
      setCartel({ imageUrl: dataContext.cartelImgUrl, loading: false, error: '' });
      return;
    }

    setCartel(prev => ({ ...prev, loading: true, error: '' }));

    try {
      // Paso 1: Generar la imagen del cartel
      const responseImg = await fetch(`${API_BASE_URL}/api/edit_cartel_image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: dataContext.id,
          nombre1: dataContext.persona1.nombre,
          nombre2: dataContext.persona2.nombre,
          email1: dataContext.persona1.nombre,
          email2: dataContext.persona2.nombre,
          telef1: dataContext.persona1.nombre,
          telef2: dataContext.persona2.nombre,
          fecha: dataContext.fecha,
          image_url: '',
        }),
      });

      const dataImg = await responseImg.json();

      if (!responseImg.ok || !dataImg.image_url) {
        setCartel(prev => ({
          ...prev,
          loading: false,
          error: dataImg.message || 'No se pudo generar la imagen del cartel'
        }));
        return;
      }

      const imageUrl = dataImg.image_url;

      setDataContext({
          ...dataContext,
          cartelImgUrl: imageUrl
        });

      setCartel(prev => ({
        ...prev,
        imageUrl,
        loading: false,
        error: ''
      }));

    } catch (error) {
      setCartel(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al generar el cartel'
      }));
    }
  };


  const renderCartel = () => (
    <Card>
      {cartel.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 225 }}>
          <CircularProgress />
        </Box>
      ) : cartel.error ? (
        <Box sx={{ p: 2, height: 225, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography color="error" align="center">{cartel.error}</Typography>
        </Box>
      ) : cartel.imageUrl ? (
        <CardMedia
          component="img"
          image={cartel.imageUrl}
          alt="Cartel generado"
          sx={{ height: 225, objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ height: 225, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>No hay cartel generado</Typography>
        </Box>
      )}
      <CardActions>
        <Button 
          variant="contained"
          onClick={generarCartel} 
          disabled={cartel.loading}
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
          {cartel.loading ? <CircularProgress size={24} /> : 'Volver a generar imagen Cartel'}
        </Button>
      </CardActions>
    </Card>
  );

  const handleAiVideosGeneration = () => {
    if (!cartel.imageUrl) {
      setFinalVideoError('Por favor genera primero el cartel');
      return;
    }

    // Navega a VideosPreviewPage pasando las imágenes como parámetros
    navigate('/videos_ia', {
      state: {
        cartelImage: cartel.imageUrl
      }
    });
  };

  return (
    <div className='flex flex-col items-center justify-center w-[90%]  bg-[#F7F4F1] opacity-90 py-8 overflow-y-auto h-[80vh] max-h-[80vh]'>
      <h2 className="text-3xl font-bold mb-8 pt-140 md:pt-0">Elementos generados</h2>
      <Box sx={{ width: '100%', maxWidth: '1400px' }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom align="center">Save the date</Typography>
            {renderCartel()}
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleAiVideosGeneration}
            disabled={aiVideosLoading || !cartel.imageUrl /*|| !polaroid.url*/}
            startIcon={aiVideosLoading ? <CircularProgress size={24} /> : null}
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
            {aiVideosLoading ? 'Generando vídeos con IA...' : 'Generar vídeos con IA'}
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
