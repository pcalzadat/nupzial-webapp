import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Card, CardContent, CardActions, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';

const API_BASE_URL = 'http://localhost:8000'; 
const BACKEND_ORIGIN = new URL(API_BASE_URL).origin;
const FRONT_ORIGIN = window.location.origin;

async function checkAuth() {
  const res = await fetch(`${API_BASE_URL}/mail/me`, { credentials: 'include' });
  const data = await res.json();
  return !!data.authenticated;
}

function openLoginPopup() {
  const w = 480, h = 640;
  const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2);
  const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
  // Nota: ya no necesitas pasar origin en la URL; lo codificaremos en el `state` del backend
  const url = `${API_BASE_URL}/mail/login?popup=1`;
  return window.open(url, 'graphLogin',
    `width=${w},height=${h},left=${x},top=${y},resizable,scrollbars`
  );
}

function waitForAuthMessage(timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      window.removeEventListener('message', onMsg);
      reject(new Error('Tiempo de autenticación agotado'));
    }, timeoutMs);

    function onMsg(ev) {
      try {
        // ✅ El mensaje VIENE del popup (backend), así que ev.origin debe ser http://localhost:8000
        if (ev.origin !== BACKEND_ORIGIN) return;
        const { data } = ev;
        if (data && data.type === 'graph-auth-complete' && data.ok) {
          clearTimeout(t);
          window.removeEventListener('message', onMsg);
          resolve(true);
        }
      } catch {}
    }

    window.addEventListener('message', onMsg);
  });
}

const VideoFinal = ({ videoUrl }) => {
  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
      <video
        controls
        autoPlay
        loop
        className="absolute top-0 left-0 w-full h-full object-contain"
      >
        <source src={videoUrl} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
    </div>
  );
};

export default function GeneracionVideo() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: 'Tu boda con La Bastilla',
    message: 'Sabemos que estás deseando que llegue tu día especial, desde La Bastilla te cuidamos y queremos enseñarte cómo podría ser con nosotros.',
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const location = useLocation();
  const navigate = useNavigate();

  console.log('Location state:', location.state);

  useEffect(() => {
    if (location.state?.videoUrl) {
      setVideoUrl(location.state.videoUrl);
    }
  }, [location.state]);

  const handleVolver = () => {
    navigate('/generaciones_ia');
  };

  const handleOpenEmailDialog = () => {
    setEmailDialogOpen(true);
  };

  const handleCloseEmailDialog = () => {
    setEmailDialogOpen(false);
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleEnviar = async () => {

    if (!emailData.to) {
      setNotification({
        open: true,
        message: 'Por favor ingresa un correo electrónico',
        severity: 'error'
      });
      return;
    }

  setLoading(true);
  try {
    // 1) ¿Hay sesión delegada con Graph?
    let authed = await checkAuth();

    // 2) Si no, inicia sesión en popup (sin redirigir la SPA)
    if (!authed) {
      const popup = openLoginPopup();
      try {
        await waitForAuthMessage(); 
        // Espera 500ms para asegurar que la cookie esté disponible
        await new Promise(res => setTimeout(res, 500));
        authed = await checkAuth();
      } finally {
        // cierra si sigue abierto
        if (popup && !popup.closed) popup.close();
      }
    }

    if (!authed) {
      throw new Error('No se pudo autenticar con Microsoft para enviar el correo');
    }

    // 3) Construye el cuerpo del correo.
    //    Añadimos el enlace del video (si lo hay) al HTML:
    const bodyHtml =
      (emailData.message ? `<p>${emailData.message}</p>` : '') +
      (videoUrl ? `<p>Puedes ver/descargar tu vídeo aquí: <a href="${videoUrl}" target="_blank" rel="noopener">Ver video</a></p>` : '');

    // 4) Llamada al backend
    const resp = await fetch(`${API_BASE_URL}/mail/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // importante para la cookie de sesión
      body: JSON.stringify({
        to: [emailData.to],
        subject: emailData.subject || 'Tu video',
        body_html: bodyHtml || undefined,
        body_text: emailData.message || undefined,
        save_to_sent_items: true
        // attachments: [] // si quisieras inyectar adjuntos pequeños en Base64
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      const detail = data?.detail?.graph_error || data?.detail || data;
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }

    setNotification({
      open: true,
      message: 'Correo enviado exitosamente',
      severity: 'success'
    });
    setEmailDialogOpen(false);

  } catch (error) {
    console.error('Error al enviar el correo:', error);
    setNotification({
      open: true,
      message: error.message || 'Error al enviar el correo',
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className='w-full h-full overflow-y-auto flex items-center justify-center p-4'>
      <div className='w-full max-w-[1200px] flex flex-col items-center'>
        <h2 className="text-3xl font-bold mb-8">Vídeo Final</h2>
        <Box sx={{ width: '100%', maxWidth: '1000px' }}>
          <Card>
            <CardContent>
              {error ? (
                <Typography color="error" align="center">{error}</Typography>
              ) : videoUrl ? (
                <div className="flex justify-center">
                  <VideoFinal videoUrl={videoUrl} />
                </div>
              ) : (
                <Box sx={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography>No hay video disponible</Typography>
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', padding: 2, gap: 4 }}>
              {/*<Button 
                variant="contained"
                onClick={handleVolver}
                disabled={loading}
                sx={{ 
                  backgroundColor: '#D29591',
                  color: 'white',
                  fontWeight: 'bold',
                  py: 1.5,
                  px: 4,
                  '&:hover': {
                    backgroundColor: '#AD5752',
                    boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Volver a la generación
              </Button>
              <Button 
                variant="contained"
                onClick={handleOpenEmailDialog}
                disabled={!videoUrl || loading}
                sx={{ 
                  backgroundColor: '#AD5752',
                  color: 'white',
                  fontWeight: 'bold',
                  py: 1.5,
                  px: 4,
                  '&:hover': {
                    backgroundColor: '#661B17',
                    boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:disabled': {
                    backgroundColor: '#cccccc',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar por correo'}
              </Button>*/}
            </CardActions>
          </Card>
        </Box>
      </div>

      {/* Diálogo para enviar correo */}
      <Dialog open={emailDialogOpen} onClose={handleCloseEmailDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Enviar video por correo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Correo electrónico del destinatario"
              name="to"
              type="email"
              value={emailData.to}
              onChange={handleEmailChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Asunto"
              name="subject"
              value={emailData.subject}
              onChange={handleEmailChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Mensaje"
              name="message"
              value={emailData.message}
              onChange={handleEmailChange}
              fullWidth
              multiline
              rows={4}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEmailDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEnviar} 
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#AD5752',
              '&:hover': {
                backgroundColor: '#661B17',
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificación */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
