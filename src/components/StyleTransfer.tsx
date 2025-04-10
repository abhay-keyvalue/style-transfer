import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import './StyleTransfer.css';

const StyleTransfer: React.FC = () => {
  const [contentImage, setContentImage] = useState<string>('');
  const [styleImage, setStyleImage] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const contentImageRef = useRef<HTMLImageElement>(null);
  const styleImageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, setImage: (url: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (setImage: (url: string) => void) => {
    setImage('');
    setResultImage('');
  };

  useEffect(() => {
    const doStyleTransfer = async () => {
      if (!contentImage || !styleImage || !contentImageRef.current || !styleImageRef.current) return;

      try {
        setIsProcessing(true);
        setError('');
        console.log('doStyleTransfer called');
        const model = await tf.loadGraphModel('/tfjs_model/model.json');
        console.log('Model loaded successfully');
        
        const imageTensor = preprocess(contentImageRef.current);
        const styleImageTensor = preprocess(styleImageRef.current);

        console.log('Input tensor shapes:', {
          image: imageTensor.shape,
          style: styleImageTensor.shape
        });

        const result = model.execute([imageTensor, styleImageTensor]) as tf.Tensor;
        console.log('Model output shape:', result.shape);
        
        const squeezed = tf.squeeze(result);
        console.log('Squeezed shape:', squeezed.shape);
        
        if (!squeezed.shape || squeezed.shape.length !== 3) {
          throw new Error(`Unexpected tensor shape after squeezing: ${JSON.stringify(squeezed.shape)}`);
        }
        
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas not found');
        
        await tf.browser.toPixels(squeezed as tf.Tensor3D, canvas);
        setResultImage(canvas.toDataURL());
      } catch (error) {
        console.error('Error in style transfer:', error);
        setError(error instanceof Error ? error.message : 'An error occurred during style transfer');
      } finally {
        setIsProcessing(false);
      }
    };

    const preprocess = (imageData: HTMLImageElement) => {
      const imageTensor = tf.browser.fromPixels(imageData);
      const offset = tf.scalar(255.0);
      const normalized = tf.scalar(1.0).sub(imageTensor.div(offset));
      const batched = normalized.expandDims(0);
      return batched;
    };

    if (contentImage && styleImage) {
      doStyleTransfer();
    }
  }, [contentImage, styleImage]);

  return (
    <Box className="container">
      <Typography variant="h4" className="title">
        Neural Style Transfer
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box className="upload-section">
        {/* Content Image */}
        <Box className="upload-box">
          <Paper className="paper">
            <Typography variant="h6" gutterBottom>
              Content Image
            </Typography>
            <Box className="image-container">
              {contentImage ? (
                <>
                  <img
                    ref={contentImageRef}
                    src={contentImage}
                    alt="Content"
                    className="preview-image"
                  />
                  <IconButton
                    onClick={() => handleRemoveImage(setContentImage)}
                    className="delete-button"
                  >
                    <Delete />
                  </IconButton>
                </>
              ) : (
                <Box className="placeholder-box">
                  <Typography className="placeholder-text">
                    No image selected
                  </Typography>
                </Box>
              )}
            </Box>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
              fullWidth
            >
              Upload Content Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setContentImage)}
              />
            </Button>
          </Paper>
        </Box>

        {/* Style Image */}
        <Box className="upload-box">
          <Paper className="paper">
            <Typography variant="h6" gutterBottom>
              Style Image
            </Typography>
            <Box className="image-container">
              {styleImage ? (
                <>
                  <img
                    ref={styleImageRef}
                    src={styleImage}
                    alt="Style"
                    className="preview-image"
                  />
                  <IconButton
                    onClick={() => handleRemoveImage(setStyleImage)}
                    className="delete-button"
                  >
                    <Delete />
                  </IconButton>
                </>
              ) : (
                <Box className="placeholder-box">
                  <Typography className="placeholder-text">
                    No image selected
                  </Typography>
                </Box>
              )}
            </Box>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
              fullWidth
            >
              Upload Style Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setStyleImage)}
              />
            </Button>
          </Paper>
        </Box>

        {/* Result */}
        <Box className="upload-box">
          <Paper className="paper">
            <Typography variant="h6" gutterBottom>
              Stylized Result
            </Typography>
            <Box className="image-container">
              {isProcessing ? (
                <Box className="processing-box">
                  <CircularProgress className="spinner" />
                  <Typography className="processing-text">
                    Processing...
                  </Typography>
                </Box>
              ) : resultImage ? (
                <img
                  src={resultImage}
                  alt="Result"
                  className="preview-image"
                />
              ) : (
                <Box className="placeholder-box">
                  <Typography className="placeholder-text">
                    Result will appear here
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Hidden canvas for processing */}
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="hidden-canvas"
      />
    </Box>
  );
};

export default StyleTransfer;