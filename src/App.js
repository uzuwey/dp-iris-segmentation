import './App.css';
import { OpenCvProvider } from 'opencv-react';
import React from 'react';
import { MainComponent } from './components';
import { AlertProvider } from './helpers/contexts/AlertContext';
import { Alert } from './components';

function App() {

  const onLoaded = (cv) => {
    console.log('opencv loaded, cv')
  }

  return (
    <div className="App">
      <AlertProvider>
        <OpenCvProvider onLoad={onLoaded}>
          <MainComponent />
          <Alert />
        </OpenCvProvider>
      </AlertProvider>
    </div>
  );
}

export default App;
