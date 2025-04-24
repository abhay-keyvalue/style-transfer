import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";

interface BlazeFaceModel {
  estimateFaces: (input: HTMLVideoElement, returnTensors: boolean) => Promise<any[]>;
}

export const useFaceDetection = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<BlazeFaceModel | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const drawFaceBox = (predictions: any[]) => {
    if (!canvasRef.current || !webcamRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;

    predictions.forEach((prediction) => {
      const start = prediction.topLeft;
      const end = prediction.bottomRight;
      ctx.strokeRect(start[0], start[1], end[0] - start[0], end[1] - start[1]);
    });
  };

  const detectFace = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4 &&
      model
    ) {
      const predictions = await model.estimateFaces(webcamRef.current.video, false);
      if (predictions.length > 0) {
        drawFaceBox(predictions);
      } else {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(detectFace, 2000);
    return () => clearInterval(interval);
  }, [model]);

  return {
    webcamRef,
    canvasRef
  };
}; 