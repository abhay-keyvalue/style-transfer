import { useState, useEffect, useRef } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

interface DetectionResult {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

interface CameraDevice {
  deviceId: string;
  label: string;
  facing?: 'user' | 'environment' | 'left' | 'right';
}

export const useObjectDetection = () => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const childrenRef = useRef<HTMLElement[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const liveViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const isWebcamSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId}`,
          facing: undefined // We'll determine this when the camera is actually used
        }));
      setCameras(videoDevices);
      
      // Try to get the back camera by default
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error enumerating cameras:', error);
    }
  };

  const enableWebcam = async () => {
    if (!model) {
      console.warn('Model not loaded yet');
      return;
    }

    setIsWebcamEnabled(true);

    try {
      const constraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          facingMode: !selectedCamera ? 'environment' : undefined
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const clearPredictions = () => {
    childrenRef.current.forEach(child => {
      if (liveViewRef.current && child.parentNode === liveViewRef.current) {
        liveViewRef.current.removeChild(child);
      }
    });
    childrenRef.current = [];
  };

  const createPredictionElement = (prediction: DetectionResult) => {
    const label = document.createElement('p');
    label.innerText = `${prediction.class} - with ${Math.round(prediction.score * 100)}% confidence.`;
    label.style.cssText = `
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

    const box = document.createElement('div');
    box.setAttribute('class', 'highlighter');
    box.style.cssText = `
      left: ${prediction.bbox[0]}px;
      top: ${prediction.bbox[1]}px;
      width: ${prediction.bbox[2]}px;
      height: ${prediction.bbox[3]}px;
      position: absolute;
      border: 2px solid #00ff00;
    `;

    return { label, box };
  };

  const predictWebcam = async () => {
    if (!model || !videoRef.current || !liveViewRef.current) return;

    clearPredictions();

    const predictions = await model.detect(videoRef.current);

    predictions.forEach(prediction => {
      if (prediction.score > 0.66) {
        const { label, box } = createPredictionElement(prediction);
        
        if (liveViewRef.current) {
          liveViewRef.current.appendChild(box);
          liveViewRef.current.appendChild(label);
          childrenRef.current.push(box, label);
        }
      }
    });

    window.requestAnimationFrame(predictWebcam);
  };

  return {
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
  };
}; 