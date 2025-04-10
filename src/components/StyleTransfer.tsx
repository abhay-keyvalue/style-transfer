import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import './StyleTransfer.css';

const StyleTransfer: React.FC = () => {
  const [contentImage, setContentImage] = useState<string>('');
  const [styleImage, setStyleImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const contentImageRef = useRef<HTMLImageElement>(null);
  const styleImageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, setImage: (url: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const doStyleTransfer = async () => {
      if (!contentImage || !styleImage || !contentImageRef.current || !styleImageRef.current) return;

      try {
        setIsProcessing(true);
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
        
        const canvas = document.getElementById('stylizedImage') as HTMLCanvasElement;
        await tf.browser.toPixels(squeezed as tf.Tensor3D, canvas);
      } catch (error) {
        console.error('Error in style transfer:', error);
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
    <div className="style-transfer-container">
      <h1 className="title">Neural Style Transfer</h1>
      <p className="subtitle">Transform your images with artistic styles</p>
      
      <div className="upload-section">
        <div className="upload-box">
          <h2>Content Image</h2>
          <label className="file-input-label">
            Choose Content Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setContentImage)}
              className="file-input"
            />
          </label>
          {contentImage ? (
            <img
              ref={contentImageRef}
              src={contentImage}
              alt="Content"
              className="preview-image"
            />
          ) : (
            <div className="upload-placeholder">
              <p>No image selected</p>
            </div>
          )}
        </div>

        <div className="upload-box">
          <h2>Style Image</h2>
          <label className="file-input-label">
            Choose Style Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setStyleImage)}
              className="file-input"
            />
          </label>
          {styleImage ? (
            <img
              ref={styleImageRef}
              src={styleImage}
              alt="Style"
              className="preview-image"
            />
          ) : (
            <div className="upload-placeholder">
              <p>No image selected</p>
            </div>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="processing">
          <div className="spinner"></div>
          <p>Processing your images...</p>
        </div>
      )}

      <div className="result-section">
        <h2>Result</h2>
        <canvas id="stylizedImage" className="result-canvas"></canvas>
      </div>
    </div>
  );
};

export default StyleTransfer;