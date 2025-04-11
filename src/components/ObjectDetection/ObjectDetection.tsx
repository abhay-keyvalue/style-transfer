import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useObjectDetection } from '../../hooks/useObjectDetection';
import './ObjectDetection.css';

const ObjectDetection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    model,
    isWebcamEnabled,
    isWebcamSupported,
    enableWebcam,
    videoRef,
    liveViewRef,
    cameras,
    selectedCamera,
    setSelectedCamera,
    getCameras
  } = useObjectDetection();

  useEffect(() => {
    if (isWebcamSupported()) {
      getCameras();
    }
  }, [isWebcamSupported, getCameras]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main',
            mb: 2
          }}
        >
          Object Detection
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          Real-time object detection using TensorFlow.js
        </Typography>
      </Box>

      <Box 
        id="demos" 
        className={!model ? 'invisible' : ''}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        {cameras.length > 0 && !isWebcamEnabled && (
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel id="camera-select-label">Select Camera</InputLabel>
            <Select
              labelId="camera-select-label"
              value={selectedCamera}
              label="Select Camera"
              onChange={(e) => setSelectedCamera(e.target.value)}
            >
              {cameras.map((camera) => (
                <MenuItem key={camera.deviceId} value={camera.deviceId}>
                  {camera.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box
          id="liveView"
          className="video-container"
          ref={liveViewRef}
          sx={{
            position: 'relative',
            width: isMobile ? '100%' : '640px',
            height: isMobile ? '360px' : '480px',
            backgroundColor: 'grey.100',
            borderRadius: 1,
            overflow: 'hidden',
            boxShadow: 3,
          }}
        >
          <video
            id="webcam"
            ref={videoRef}
            autoPlay
            playsInline
            className={isWebcamEnabled ? '' : 'hidden'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {!isWebcamEnabled && isWebcamSupported() && (
            <Button
              variant="contained"
              color="primary"
              onClick={enableWebcam}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                py: 1.5,
                px: 3,
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Enable Camera
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ObjectDetection; 