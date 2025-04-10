import React, { useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import './StyleTransfer.css';

// Import filter images
import filter1 from '../filters/filter_01.jpg';
import filter2 from '../filters/filter_02.jpg';
import filter3 from '../filters/filter_03.jpg';
import filter4 from '../filters/filter_04.jpg';
import filter5 from '../filters/filter_05.jpg';
import filter6 from '../filters/filter_06.jpg';
import filter7 from '../filters/filter_07.jpg';
import filter8 from '../filters/filter_08.jpg';
import filter9 from '../filters/filter_09.jpg';

// Define available filters
const filters = [
  { id: 'filter1', name: 'Van Gogh - Starry Night', image: filter1 },
  { id: 'filter2', name: 'Picasso - Cubism', image: filter2 },
  { id: 'filter3', name: 'Monet - Water Lilies', image: filter3 },
  { id: 'filter4', name: 'Kandinsky - Abstract', image: filter4 },
  { id: 'filter5', name: 'Hokusai - The Great Wave', image: filter5 },
  { id: 'filter6', name: 'Dali - Surrealism', image: filter6 },
  { id: 'filter7', name: 'Mondrian - Composition', image: filter7 },
  { id: 'filter8', name: 'Klimt - The Kiss', image: filter8 },
  { id: 'filter9', name: 'Matisse - Cut-Outs', image: filter9 },
];

const StyleTransfer: React.FC = () => {
  const [contentImage, setContentImage] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isGenerateEnabled, setIsGenerateEnabled] = useState<boolean>(false);
  const contentImageRef = useRef<HTMLImageElement>(null);
  const filterImageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setContentImage(e.target?.result as string);
          setError('');
          setIsGenerateEnabled(!!selectedFilter);
        };
        img.onerror = () => {
          setError('Failed to load image');
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    setResultImage('');
    setIsGenerateEnabled(!!contentImage);
  };

  const handleRemoveImage = () => {
    setContentImage('');
    setResultImage('');
    setIsGenerateEnabled(false);
  };

  const handleGenerate = async () => {
    if (!contentImage || !selectedFilter || !contentImageRef.current || !filterImageRef.current) return;

    try {
      setIsProcessing(true);
      setError('');
      console.log('doStyleTransfer called');

      const model = await tf.loadGraphModel('/tfjs_model/model.json');
      console.log('Model loaded successfully');

      // Ensure images are loaded
      const contentImg = contentImageRef.current;
      const filterImg = filterImageRef.current;

      if (!contentImg.complete || !filterImg.complete) {
        await Promise.all([
          new Promise((resolve) => {
            if (contentImg.complete) resolve(null);
            else contentImg.onload = resolve;
          }),
          new Promise((resolve) => {
            if (filterImg.complete) resolve(null);
            else filterImg.onload = resolve;
          })
        ]);
      }

      const imageTensor = preprocess(contentImg, 1);
      const filterImageTensor = preprocess(filterImg, 1);

      console.log('Input tensor shapes:', {
        image: imageTensor.shape,
        style: filterImageTensor.shape
      });

      // Apply style transfer with reduced weight
      const styleWeight = 0.5; // Adjust this value between 0 and 1 to control style influence
      const result = model.execute([imageTensor, filterImageTensor.mul(tf.scalar(styleWeight))]) as tf.Tensor;
      
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

  const preprocess = (imageData: HTMLImageElement, intensity: number = 1) => {

    const imageTensor = tf.browser.fromPixels(imageData);
    const offset = tf.scalar(255.0);
    const normalized = tf.scalar(1.0).sub(imageTensor.div(offset));
    
    const scaled = normalized.mul(tf.scalar(intensity));
    
    const batched = scaled.expandDims(0);
    return batched;
  };

  const handleDownload = () => {
    if (!resultImage) return;
    
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'styled-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box className="container">
      <Typography variant="h3" className="title" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        ArtStyle Transfer
      </Typography>
      <Typography variant="subtitle1" className="title" sx={{ color: '#666', mb: 4 }}>
        Transform your photos with the styles of famous artists
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
                    onClick={handleRemoveImage}
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
                onChange={handleImageUpload}
              />
            </Button>
          </Paper>
        </Box>

        {/* Filters */}
        <Box className="upload-box">
          <Paper className="paper">
            <Typography variant="h6" gutterBottom>
              Select Filter
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="filter-select-label">Art Style</InputLabel>
              <Select
                labelId="filter-select-label"
                value={selectedFilter}
                label="Art Style"
                onChange={(e) => handleFilterSelect(e.target.value)}
              >
                {filters.map((filter) => (
                  <MenuItem key={filter.id} value={filter.id}>
                    {filter.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedFilter && (
              <Box className="filter-preview">
                <img
                  ref={filterImageRef}
                  src={filters.find(f => f.id === selectedFilter)?.image}
                  alt="Selected Filter"
                />
              </Box>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerate}
              disabled={!isGenerateEnabled || isProcessing}
            >
              {isProcessing ? 'Generating...' : 'Generate Stylized Image'}
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
                <div className="image-container">
                  <img
                    src={resultImage}
                    alt="Result"
                    className="preview-image"
                  />
                </div>
              ) : (
                <Box className="placeholder-box">
                  <Typography className="placeholder-text">
                    Result will appear here
                  </Typography>
                </Box>
              )}
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleDownload}
              disabled={!resultImage}
              className="download-button-container"
            >
              Download
            </Button>
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