import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Grid, Card, CardMedia, CardActions, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000';

export default function GeneracionesIA() {
  const location = useLocation();
  const { nombre1, nombre2, fecha, imagen } = location.state || {};
  
  // States for each generation
  const [cartel, setCartel] = useState({ url: null, loading: false, error: '' });
  const [polaroid, setPolaroid] = useState({ url: null, loading: false, error: '' });
  const [video, setVideo] = useState({ url: null, loading: false, error: '' });

  // Generate cartel (text to image)
  const generarCartel = async () => {
    console.log("Generando cartel", { nombre1, nombre2 });
    if (!nombre1 || !nombre2) {
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
          nombre1: nombre1,
          nombre2: nombre2
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error('Error generando el cartel');
      }
      
      const data = await response.json();
      setCartel(prev => ({ ...prev, url: data.image_path, loading: false }));
    } catch (err) {
      setCartel(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  // Generate polaroid (image to image)
  const generarPolaroid = async () => {
    console.log("Generando polaroid");
    if (!fecha || !imagen) {
      setPolaroid(prev => ({ ...prev, error: 'Faltan la fecha o la imagen' }));
      return;
    }
  
    setPolaroid(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const formData = new FormData();
      formData.append('fecha', fecha);
      formData.append('imagen', imagen);
      
      const response = await fetch(`${API_BASE_URL}/api/create_polaroid`, {
        method: 'POST',
        body: formData,  // Remove Content-Type header, let the browser set it
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error('Error generando la polaroid');
      }
  
      const data = await response.json();
      setPolaroid(prev => ({ ...prev, url: data.image_path, loading: false }));
    } catch (err) {
      console.error('Error en generarPolaroid:', err);
      setPolaroid(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  // Generate video (image to video)
  const generarVideo = async () => {
    console.log("Generando video");
    if (!imagen) {
      setVideo(prev => ({ ...prev, error: 'No hay imagen disponible' }));
      return;
    }

    setVideo(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const formData = new FormData();
      formData.append('imagen', imagen);
      
      const response = await fetch(`${API_BASE_URL}/api/create_video`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Error generando el video');
      const data = await response.json();
      setVideo(prev => ({ ...prev, url: data.video_path, loading: false }));
    } catch (err) {
      setVideo(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  // Generate all content on component mount
  useEffect(() => {
    console.log("Generando todo");
    console.log("nombre1", nombre1);
    console.log("nombre2", nombre2);
    console.log("fecha", fecha);
    console.log("imagen", imagen);
    if (nombre1 && nombre2) generarCartel();
    if (fecha && imagen) generarPolaroid();
    if (imagen) generarVideo();
  }, [nombre1, nombre2, fecha, imagen]);

  const renderMedia = (type) => {
    const data = type === 'cartel' ? cartel : type === 'polaroid' ? polaroid : video;
    const title = type === 'cartel' ? 'Cartel' : type === 'polaroid' ? 'Polaroid' : 'Video';
    const onRegenerate = type === 'cartel' ? generarCartel : type === 'polaroid' ? generarPolaroid : generarVideo;
    
    return (
      <Card>
        {data.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 225 }}>
            <CircularProgress />
          </Box>
        ) : data.error ? (
          <Box sx={{ p: 2, height: 225, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography color="error" align="center">{data.error}</Typography>
          </Box>
        ) : data.url ? (
          type === 'video' ? (
            <CardMedia
              component="video"
              controls
              height="225"
              src={data.url}
            />
          ) : (
            <CardMedia
              component="img"
              height="225"
              image={data.url}
              alt={title}
              sx={{ objectFit: 'contain' }}
            />
          )
        ) : (
          <Box sx={{ height: 225, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>No hay {type} generado</Typography>
          </Box>
        )}
        <CardActions>
          <Button 
            fullWidth 
            variant="contained" 
            color="primary" 
            onClick={onRegenerate}
            disabled={data.loading}
          >
            {data.loading ? 'Generando...' : `Regenerar ${title}`}
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <div className='flex flex-col items-center justify-center w-[90%] min-h-[80vh] bg-[#F7F4F1] opacity-90 py-8'>
      <h2 className="text-3xl font-bold mb-8">Elementos generados</h2>
      <Box sx={{ width: '100%', maxWidth: '1200px' }}>
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
            <Typography variant="h6" gutterBottom align="center">Video</Typography>
            {renderMedia('video')}
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
