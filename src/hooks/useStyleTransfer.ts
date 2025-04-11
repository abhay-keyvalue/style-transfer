import { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

interface UseStyleTransferResult {
  model: tf.GraphModel | null;
  isModelLoading: boolean;
  error: string | null;
  processImage: (contentImage: HTMLImageElement, styleImage: HTMLImageElement) => Promise<tf.Tensor>;
}

export const useStyleTransfer = (): UseStyleTransferResult => {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<tf.GraphModel | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        setError(null);
        const loadedModel = await tf.loadGraphModel(`${process.env.PUBLIC_URL || ''}/tfjs_model/model.json`);
        modelRef.current = loadedModel;
        setModel(loadedModel);
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Failed to load the style transfer model. Please refresh the page.');
      } finally {
        setIsModelLoading(false);
      }
    };

    loadModel();

    return () => {
      if (modelRef.current) {
        modelRef.current.dispose();
      }
    };
  }, []);

  const preprocessImage = (imageData: HTMLImageElement, intensity: number = 1): tf.Tensor => {
    const imageTensor = tf.browser.fromPixels(imageData);
    const normalized = imageTensor.div(tf.scalar(255.0));
    const scaled = normalized.mul(tf.scalar(intensity));
    return scaled.expandDims(0);
  };

  const processImage = async (
    contentImage: HTMLImageElement,
    styleImage: HTMLImageElement
  ): Promise<tf.Tensor> => {
    if (!modelRef.current) {
      throw new Error('Model is not loaded yet');
    }

    // Ensure images are loaded
    if (!contentImage.complete || !styleImage.complete) {
      await Promise.all([
        new Promise((resolve) => {
          if (contentImage.complete) resolve(null);
          else contentImage.onload = resolve;
        }),
        new Promise((resolve) => {
          if (styleImage.complete) resolve(null);
          else styleImage.onload = resolve;
        })
      ]);
    }

    const contentTensor = preprocessImage(contentImage, 1);
    const styleTensor = preprocessImage(styleImage, 0.9);

    const result = modelRef.current.execute([contentTensor, styleTensor]) as tf.Tensor;
    return tf.squeeze(result);
  };

  return {
    model,
    isModelLoading,
    error,
    processImage,
  };
}; 