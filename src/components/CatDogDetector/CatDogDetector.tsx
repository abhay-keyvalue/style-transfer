import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useCatDogDetection } from "../../hooks/useCatDogDetection";
import "./CatDogDetector.css";

const CatDogDetector: React.FC = () => {
  const {
    imageURL,
    prediction,
    isLoading,
    handleImageChange,
    predictImage
  } = useCatDogDetection();

  return (
    <Paper elevation={3} className="cat-dog-detector">
      <Typography variant="h5" component="h2" gutterBottom>
        Cat/Dog Detector
      </Typography>
      
      <Box className="button-container">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input"
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button 
            variant="contained" 
            component="span" 
            className="upload-button"
          >
            Upload Image
          </Button>
        </label>
        <Button
          variant="contained"
          onClick={predictImage}
          disabled={!imageURL || isLoading}
        >
          {isLoading ? "Processing..." : "Predict"}
        </Button>
      </Box>

      {imageURL && (
        <Box className="image-container">
          <img
            id="uploaded-image"
            src={imageURL}
            alt="upload"
            className="uploaded-image"
          />
        </Box>
      )}

      {prediction && (
        <Typography variant="body1" className="prediction-text">
          {prediction}
        </Typography>
      )}
    </Paper>
  );
};

export default CatDogDetector; 