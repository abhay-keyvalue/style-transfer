import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemText, 
  Typography, 
  Box, 
  IconButton,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './App.css';
import StyleTransfer from './components/StyleTransfer/StyleTransfer';
import ObjectDetection from './components/ObjectDetection/ObjectDetection';
import FaceDetection from './components/FaceDetection/FaceDetection';
import CatDogDetector from './components/CatDogDetector/CatDogDetector';

const App: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          Tensorflow Samples
        </Typography>
      </Box>
      <List>
        <ListItemButton 
          selected={selectedTab === 0}
          onClick={() => handleTabChange(0)}
        >
          <ListItemText primary="Style Transfer" />
        </ListItemButton>
        <ListItemButton 
          selected={selectedTab === 1}
          onClick={() => handleTabChange(1)}
        >
          <ListItemText primary="Object Detection" />
        </ListItemButton>
        <ListItemButton 
          selected={selectedTab === 2}
          onClick={() => handleTabChange(2)}
        >
          <ListItemText primary="Face Detection" />
        </ListItemButton>
        <ListItemButton 
          selected={selectedTab === 3}
          onClick={() => handleTabChange(3)}
        >
          <ListItemText primary="Cat/Dog Detector" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <div className="App">
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - 240px)` },
            ml: { sm: `240px` },
            display: { xs: 'block', sm: 'none' }
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Tensorflow Samples
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Box
          component="nav"
          sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 240,
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 240px)` },
            mt: { xs: 7, sm: 0 }
          }}
        >
          {selectedTab === 0 && <StyleTransfer />}
          {selectedTab === 1 && <ObjectDetection />}
          {selectedTab === 2 && <FaceDetection />}
          {selectedTab === 3 && <CatDogDetector />}
        </Box>
      </Box>
    </div>
  );
};

export default App;