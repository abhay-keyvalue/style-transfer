import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import Webcam from 'react-webcam';
import { SelectChangeEvent } from '@mui/material';

interface Device {
  deviceId: string;
  label: string;
  kind: string;
}

interface FaceLandmark {
  x: number;
  y: number;
  z?: number;
  name?: string;
  score?: number;
}

interface FaceDetectionHook {
  webcamRef: React.RefObject<Webcam | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  model: any;
  isDetecting: boolean;
  devices: Device[];
  selectedDevice: string;
  error: string;
  hasPermission: boolean;
  handleDeviceChange: (event: SelectChangeEvent<string>) => void;
  startDetection: () => void;
  stopDetection: () => void;
  drawBoundingBox: (ctx: CanvasRenderingContext2D, landmarks: FaceLandmark[], canvasWidth: number, canvasHeight: number) => void;
}

export const useFaceDetection = (): FaceDetectionHook => {
  const webcamRef = useRef<Webcam | null>(null);
  const modelRef = useRef<tf.GraphModel | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [model, setModel] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean>(false);


  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadGraphModel(`${process.env.PUBLIC_URL || ''}/face_model/model.json`);
        modelRef.current = loadedModel;
        console.log('Model loaded successfully', loadedModel);
        setModel(loadedModel);
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Failed to load the style transfer model. Please refresh the page.');
      } finally {
        //setIsModelLoading(false);
      }
    };

    loadModel();

    return () => {
      if (modelRef.current) {
        modelRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640,
            height: 480,
            facingMode: 'user'
          } 
        });
        setHasPermission(true);
        stream.getTracks().forEach(track => track.stop());
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setError('Camera access denied. Please allow camera access to use this feature.');
        setHasPermission(false);
      }
    };

    getDevices();
  }, []);

  const handleDeviceChange = (event: SelectChangeEvent<string>) => {
    setSelectedDevice(event.target.value);
  };

  const drawBoundingBox = (ctx: CanvasRenderingContext2D, landmarks: FaceLandmark[], canvasWidth: number, canvasHeight: number) => {
    if (!landmarks || !landmarks.length) {
      console.warn('Invalid landmarks:', landmarks);
      return;
    }

    // Find the bounding box from landmarks
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    landmarks.forEach((landmark) => {
      minX = Math.min(minX, landmark.x);
      minY = Math.min(minY, landmark.y);
      maxX = Math.max(maxX, landmark.x);
      maxY = Math.max(maxY, landmark.y);
    });

    // Scale coordinates to canvas dimensions
    const x = minX * canvasWidth;
    const y = minY * canvasHeight;
    const width = (maxX - minX) * canvasWidth;
    const height = (maxY - minY) * canvasHeight;

    // Validate coordinates
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
      console.warn('Invalid scaled coordinates:', { x, y, width, height });
      return;
    }

    // Draw the box
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Draw label
    ctx.fillStyle = '#00FF00';
    ctx.font = '16px Arial';
    ctx.fillText('Face', x, y - 5);
  };

  const detectFaces = async () => {
    if (!model || !webcamRef.current?.video || !canvasRef.current) {
      console.error('Required components not available for face detection');
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detect = async () => {
      console.log('Detecting faces', isDetecting);
      try {
        // Prepare input tensor
        const input = tf.browser.fromPixels(video)
          .resizeNearestNeighbor([192, 192])
          .expandDims(0)
          .toFloat()
          .div(255.0);


        // Run inference
        const predictions = await model.execute(input);
        const [boxes, scores, landmarks] = predictions;
        
        // Get the data from tensors
        const boxesData = await boxes.array();
        const scoresData = await scores.array();
        const landmarksData = await landmarks.array();
        
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Process each detection
        for (let i = 0; i < scoresData[0].length; i++) {
          if (scoresData[0][i] > 0.5) {  // Only process detections with confidence > 0.5
            const box = boxesData[0][i];
            
            // Convert normalized coordinates to pixel coordinates
            const x = box[0] * canvas.width;
            const y = box[1] * canvas.height;
            const width = (box[2] - box[0]) * canvas.width;
            const height = (box[3] - box[1]) * canvas.height;
            
            // Draw bounding box
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            
            // Draw confidence score
            ctx.fillStyle = '#00FF00';
            ctx.font = '16px Arial';
            ctx.fillText(`Face ${(scoresData[0][i] * 100).toFixed(1)}%`, x, y - 5);
          }
        }

        // Clean up tensors
        tf.dispose(predictions);

        // Continue detection loop
        requestAnimationFrame(detect);
      } catch (error) {
        console.error('Error during face detection:', error);
        setIsDetecting(false);
      }
    };

    // Start detection loop
    detect();
  };

  const startDetection = () => {
    if (!model) {
      console.error('Cannot start detection: model not loaded');
      setError('Face detection model not loaded. Please try again.');
      return;
    }

    if (!webcamRef.current?.video) {
      console.error('Cannot start detection: video not available');
      setError('Camera not available. Please check your camera permissions.');
      return;
    }

    console.log('Starting face detection');
    setIsDetecting(true);
    detectFaces();
  };

  const stopDetection = () => {
    setIsDetecting(false);
  };

  return {
    webcamRef,
    canvasRef,
    model,
    isDetecting,
    devices,
    selectedDevice,
    error,
    hasPermission,
    handleDeviceChange,
    startDetection,
    stopDetection,
    drawBoundingBox,
  };
}; 