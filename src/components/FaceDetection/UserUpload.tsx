import React, { useState } from "react";
import "./UserUpload.css";

interface UserUploadProps {
  onAddUser: (name: string, images: string[]) => void;
  onTrain: () => void;
  isTraining: boolean;
}

const UserUpload: React.FC<UserUploadProps> = ({
  onAddUser,
  onTrain,
  isTraining,
}) => {
  const [name, setName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const newPreviewUrls: string[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        newImages.push(result);
        newPreviewUrls.push(result);
        if (newImages.length === files.length) {
          setImages((prev) => [...prev, ...newImages]);
          setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && images.length > 0) {
      onAddUser(name, images);
      setName("");
      setImages([]);
      setPreviewUrls([]);
    }
  };

  return (
    <div className="user-upload-container">
      <h2>Add User for Face Recognition</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">User Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter user's name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="images">Upload Face Images</label>
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            required
          />
        </div>
        {previewUrls.length > 0 && (
          <div className="image-previews">
            {previewUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Preview ${index + 1}`}
                title={`Image ${index + 1}`}
              />
            ))}
          </div>
        )}
        <div className="buttons-container">
          <button
            type="submit"
            className="add-user-button"
            disabled={!name || images.length === 0}
          >
            Add User
          </button>
          <button
            onClick={onTrain}
            disabled={isTraining || images.length === 0}
            className={`train-button ${isTraining ? "loading" : ""}`}
          >
            {isTraining ? "Training Model..." : "Train Model"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserUpload;
