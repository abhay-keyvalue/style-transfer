import React, { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import './ObjectDetection.css';

const ObjectDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const liveViewRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const childrenRef = useRef<HTMLElement[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Load the COCO-SSD model
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    loadModel();
  }, []);

  const getUserMediaSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const enableCam = async () => {
    if (!model) {
      console.warn('Model not loaded yet');
      return;
    }

    setIsWebcamEnabled(true);

    const constraints = {
      video: true
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const predictWebcam = async () => {
    if (!model || !videoRef.current || !liveViewRef.current) return;

    // Remove previous predictions
    childrenRef.current.forEach(child => {
      if (liveViewRef.current && child.parentNode === liveViewRef.current) {
        liveViewRef.current.removeChild(child);
      }
    });
    childrenRef.current = [];

    // Get predictions
    const predictions = await model.detect(videoRef.current);

    // Draw predictions
    predictions.forEach(prediction => {
      if (prediction.score > 0.66) {
        const p = document.createElement('p');
        p.innerText = `${prediction.class} - with ${Math.round(prediction.score * 100)}% confidence.`;
        p.style.cssText = `
          margin-left: ${prediction.bbox[0]}px;
          margin-top: ${prediction.bbox[1] - 10}px;
          width: ${prediction.bbox[2] - 10}px;
          top: 0;
          left: 0;
          position: absolute;
          color: white;
          background: rgba(0, 0, 0, 0.5);
          padding: 2px;
          font-size: 12px;
        `;

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style.cssText = `
          left: ${prediction.bbox[0]}px;
          top: ${prediction.bbox[1]}px;
          width: ${prediction.bbox[2]}px;
          height: ${prediction.bbox[3]}px;
          position: absolute;
          border: 2px solid #00ff00;
        `;

        if (liveViewRef.current) {
          liveViewRef.current.appendChild(highlighter);
          liveViewRef.current.appendChild(p);
          childrenRef.current.push(highlighter, p);
        }
      }
    });

    // Continue predicting
    window.requestAnimationFrame(predictWebcam);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" className="title" sx={{ 
          fontWeight: 'bold', 
          color: 'primary.main',
          mb: 2
        }}>
          Object Detection
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
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
          }}
        >
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
              overflow: 'hidden'
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
            {!isWebcamEnabled && getUserMediaSupported() && (
              <Button
                variant="contained"
                color="primary"
                onClick={enableCam}
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
                Enable Webcam
              </Button>
            )}
          </Box>
        </Box>
    </Container>
  );
};

export default ObjectDetection; 