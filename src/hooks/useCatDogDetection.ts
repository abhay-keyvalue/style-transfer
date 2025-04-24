import { useState, useEffect } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";

export const useCatDogDetection = () => {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
      } catch (error) {
        console.error("Error loading model:", error);
        setPrediction("Error loading model. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageURL(URL.createObjectURL(file));
      setPrediction("");
    }
  };

  const predictImage = async () => {
    if (!model || !imageURL) return;

    try {
      setIsLoading(true);
      const image = document.getElementById("uploaded-image") as HTMLImageElement;
      if (!image) return;

      const predictions = await model.classify(image);
      console.log(predictions);

        const animalPrediction = predictions?.[0];
        console.log('animalPrediction', animalPrediction);
        if(animalPrediction) {
          setPrediction(`Detected: ${animalPrediction?.className} (${(animalPrediction?.probability || 0 * 100).toFixed(2)}% confidence)`);
        } else {
          setPrediction("No cat or dog detected in the image.");
        }

    } catch (error) {
      console.error("Error making prediction:", error);
      setPrediction("Error making prediction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    imageURL,
    prediction,
    isLoading,
    handleImageChange,
    predictImage
  };
}; 