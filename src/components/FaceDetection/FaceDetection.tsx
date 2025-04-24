import React from "react";
import Webcam from "react-webcam";
import { useFaceDetection } from "../../hooks/useFaceDetection";
import "./FaceDetection.css";

function FaceDetection() {
  const { webcamRef, canvasRef } = useFaceDetection();

  return (
    <div className="face-detection-container">
      <h1>Face Detection</h1>
      <Webcam 
        ref={webcamRef} 
        className="face-detection-webcam"
      />
      <canvas
        ref={canvasRef}
        className="face-detection-canvas"
        width={640}
        height={480}
      />
    </div>
  );
}

export default FaceDetection;
