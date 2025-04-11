# TensorFlow.js Samples

A React-based web application showcasing TensorFlow.js capabilities with two main features: Art Style Transfer and Real-time Object Detection. Built with modern web technologies, this project demonstrates the power of machine learning in the browser.

## Features

### Art Style Transfer
- Upload and process images directly in the browser
- Apply various artistic styles to your images
- Real-time style transfer using TensorFlow.js
- Download transformed images
- Modern UI built with Material-UI

### Object Detection
- Real-time object detection using webcam
- Built with COCO-SSD model
- Responsive design for all device sizes
- Clean and intuitive interface

## Tech Stack

- React 19
- TypeScript
- TensorFlow.js
- COCO-SSD model
- Material-UI
- Emotion (for styled components)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abhay-keyvalue/style-transfer.git
cd style-transfer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your default browser at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run deploy`

Deploys the application to GitHub Pages.

## Project Structure

- `src/components/`
  - `StyleTransfer/` - Art style transfer implementation
  - `ObjectDetection/` - Real-time object detection implementation
  - `TabPanel/` - Reusable tab panel component
- `src/hooks/` - Custom React hooks for TensorFlow.js operations
- `src/config/` - Configuration files and constants
- `src/filters/` - Style transfer model implementations
- `public/` - Static assets and HTML template

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- TensorFlow.js team for the style transfer and object detection models
- Create React App for the project setup
- Material-UI for the UI components
