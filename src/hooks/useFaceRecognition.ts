import { useState } from 'react';
import * as faceapi from 'face-api.js';

interface UserData {
  name: string;
  images: string[];
}

interface FaceRecognitionState {
  users: UserData[];
  isTraining: boolean;
  model: faceapi.FaceMatcher | null;
}

export const useFaceRecognition = () => {
  const [state, setState] = useState<FaceRecognitionState>({
    users: [],
    isTraining: false,
    model: null
  });

  const addUser = (name: string, images: string[]) => {
    setState(prev => ({
      ...prev,
      users: [...prev.users, { name, images }]
    }));
  };

  const trainModel = async () => {
    if (state.users.length === 0) return;

    setState(prev => ({ ...prev, isTraining: true }));

    try {
      // Load face detection model
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

      // Process each user's images
      const labeledDescriptors = await Promise.all(
        state.users.map(async (user) => {
          const descriptors = await Promise.all(
            user.images.map(async (imageUrl) => {
              const img = await faceapi.fetchImage(imageUrl);
              const detections = await faceapi.detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();
              
              if (!detections) {
                throw new Error(`No face detected in image for user ${user.name}`);
              }
              
              return detections.descriptor;
            })
          );
          
          return new faceapi.LabeledFaceDescriptors(user.name, descriptors);
        })
      );

      // Create face matcher
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
      
      setState(prev => ({
        ...prev,
        model: faceMatcher,
        isTraining: false
      }));
    } catch (error) {
      console.error('Error training model:', error);
      setState(prev => ({ ...prev, isTraining: false }));
    }
  };

  const recognizeFace = async (videoElement: HTMLVideoElement) => {
    if (!state.model) return null;

    const detections = await faceapi.detectSingleFace(videoElement)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) return null;

    const bestMatch = state.model.findBestMatch(detections.descriptor);
    return bestMatch.label;
  };

  return {
    users: state.users,
    isTraining: state.isTraining,
    model: state.model,
    addUser,
    trainModel,
    recognizeFace
  };
};
