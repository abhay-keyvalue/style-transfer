import React from 'react';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import Webcam from 'react-webcam';
import { useFaceDetection } from '../../hooks/useFaceDetection';
import './FaceDetection.css';

const FaceDetection: React.FC = () => {
  const {
    webcamRef,
    canvasRef,
    isDetecting,
    devices,
    selectedDevice,
    error,
    hasPermission,
    handleDeviceChange,
    startDetection,
    stopDetection,
  } = useFaceDetection();

  return (
    <Box className="face-detection-container">
      <Typography variant="h5" className="face-detection-title">
        Face Detection
      </Typography>
      
      {error && (
        <Alert severity="error" className="error-alert">
          {error}
        </Alert>
      )}

      {hasPermission && (
        <FormControl className="camera-select">
          <InputLabel id="camera-select-label">Camera</InputLabel>
          <Select
            labelId="camera-select-label"
            value={selectedDevice}
            label="Camera"
            onChange={handleDeviceChange}
          >
            {devices.map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {hasPermission && (
        <Box className="camera-container">
          <Webcam
            ref={webcamRef}
            videoConstraints={{
              deviceId: selectedDevice,
            }}
            className="webcam"
          />
          <canvas
            ref={canvasRef}
            className="canvas-overlay"
          />
        </Box>
      )}

      {hasPermission && (
        <Box className="controls-container">
          <Button
            variant="contained"
            color="primary"
            onClick={startDetection}
            disabled={isDetecting}
          >
            Start Detection
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={stopDetection}
            disabled={!isDetecting}
          >
            Stop Detection
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FaceDetection; 