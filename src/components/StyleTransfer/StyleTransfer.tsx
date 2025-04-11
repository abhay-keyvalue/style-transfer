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
import { useStyleTransfer } from '../../hooks/useStyleTransfer';
import { filters } from '../../config/filters';
import './StyleTransfer.css';

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
  
  const { isModelLoading, error: modelError, processImage } = useStyleTransfer();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    if (!contentImage || !selectedFilter || !contentImageRef.current || !filterImageRef.current) {
      setError('Please select both content image and style filter');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      const result = await processImage(contentImageRef.current, filterImageRef.current);
      
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');
      
      await tf.browser.toPixels(result as tf.Tensor3D, canvas);
      setResultImage(canvas.toDataURL());
    } catch (error) {
      console.error('Error in style transfer:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during style transfer');
    } finally {
      setIsProcessing(false);
    }
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
      <Typography variant="h4" className="title" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        ArtStyle Transfer
      </Typography>
      <Typography variant="subtitle1" className="title" sx={{ color: '#666', mb: 4 }}>
        Transform your photos with the styles of famous artists
      </Typography>

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
      {(error || modelError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || modelError}
        </Alert>
      )}

      {isModelLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading style transfer model... Please wait.
        </Alert>
      )}
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