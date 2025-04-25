import React from "react";
import Webcam from "react-webcam";
import { useFaceDetection } from "../../hooks/useFaceDetection";
import { useFaceRecognition } from "../../hooks/useFaceRecognition";
import UserUpload from "./UserUpload";
import "./FaceDetection.css";

function FaceDetection() {
  const { webcamRef, canvasRef } = useFaceDetection();
  const { isTraining, addUser, trainModel } = useFaceRecognition();

  return (
    <div className="face-detection-container">
      <h1>Face Detection & Recognition</h1>
      
      <div className="camera-section">
        <div className="camera-container">
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

        <div className="upload-section">
          <UserUpload 
            onAddUser={addUser}
            onTrain={trainModel}
            isTraining={isTraining}
          />
        </div>
      </div>
    </div>
  );
}

export default FaceDetection;
