import React, { useState } from 'react';
import { AppBar, Tabs, Tab, Box } from '@mui/material';
import './App.css';
import StyleTransfer from './components/StyleTransfer/StyleTransfer';
import ObjectDetection from './components/ObjectDetection/ObjectDetection';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="basic tabs example"
          centered
        >
          <Tab label="Style Transfer" />
          <Tab label="Object Detection" />
        </Tabs>
      </AppBar>
      
      <TabPanel value={tabValue} index={0}>
        <StyleTransfer />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ObjectDetection />
      </TabPanel>
    </div>
  );
}

export default App;