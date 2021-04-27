import './App.css';
import { OpenCvProvider } from 'opencv-react';
import React from 'react';
import { MyComponent } from './components'

function App() {

  const onLoaded = (cv) => {
    console.log('opencv loaded, cv')
  }

  return (
    <div className="App">
      <OpenCvProvider onLoad={onLoaded}>
        <MyComponent />
      </OpenCvProvider>
    </div>
  );
}

export default App;
