import React, {useState, useEffect, useRef, useContext, useCallback} from 'react';
import AlertContext from '../../helpers/contexts/AlertContext';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import {addPaddingToEye, reduceEye} from '../../helpers/adapters';

const StepperComponent = ({image, cv}) => {

  const [classifier, setClassifier] = useState(null);
  const [ model, setModel ] = useState(null);
  
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);

  const alert = useContext(AlertContext);

  useEffect(()=> {
    tf.loadLayersModel('ubiris_3x3_32/model.json').then(data => {
      setModel(data);
    })
    .catch(err => {
      alert.error('Error', 5);
      console.log(err);
    })
  }, []);
  
  useEffect(() => {
    if (cv) {
      createClassifier();
    }
  }, [cv])

  const imgOnLoad = (e) => {
    let mat = cv.imread(e.target);
    cv.imshow('outCanvas', mat);
    setTimeout(() => {
      detectEye(mat);
    }, 500)
  } 

  const createFileFromUrl = (path, url) => {
    axios.get(url)
      .then(res => {
        let classifier = new cv.CascadeClassifier();  // initialize classifier
        cv.FS_createDataFile('/', path, res.data, true, false, false);
        classifier.load(path);

        if(!classifier.empty()) {
          setClassifier(classifier);
        }
      })
      .catch(err => {
        alert.error('Error', 5);
        console.log(err);
      })
  };

  const detectEye = (image) => {
    if(classifier) {
      let gray = new cv.Mat();
      let eyes = new cv.RectVector();

      cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY, 0);
      classifier.detectMultiScale(gray, eyes, 1.1, 3, 0);

      let eye = eyes.get(0);
      gray.delete();

      if(!eye) {
        return;
      }

      for (let i = 0; i < eyes.size(); ++i) {           
        let tmpEye = eyes.get(i)
        if(eye.width < tmpEye.width) {
          eye = tmpEye;
        }
      }

      if(eye.height > 480 && eye.width > 480) {
        eye = reduceEye(eye);
      } else {
        eye = addPaddingToEye(eye);
      }
      let dst = image.roi(eye)  
      image.delete();

      cv.imshow('outCanvas1', dst);
      dst.delete();
      
      makePrediction();
    }
  }

  const createClassifier = () => {
    let eyeCascadeFile = 'haarcascade_eye_tree_eyeglasses.xml'; // path to xml
    createFileFromUrl(eyeCascadeFile, eyeCascadeFile);
  }

  const makePrediction = useCallback(() => {

    const tensor = tf.tidy(() => tf.browser.fromPixels(canvasRef.current, 3)
      .resizeNearestNeighbor([480,480])
      .expandDims()
      .toFloat()
      .div(255)
      .reverse(0));

    let prediction = model.predict(tensor);

    tf.browser.toPixels(prediction.squeeze()).then(
      r => {
        let imageData = new ImageData(r, 480, 480);
        canvasRef2.current.width = 480;
        canvasRef2.current.height = 480;
        canvasRef2.current?.getContext("2d")?.putImageData(imageData, 0,0);
      }
    )
  }, [model])

  return (
    <div className={"row"}>
      <div className={"col-12 col-sm-4"}>
        <div className="my-2">
          1. step
        </div>
        <canvas id='outCanvas' className={"w-75 h-75"} style={{border: '1px solid blue'}}></canvas>
      </div>
      <div className={"col-12 col-sm-4"}>
        <div className="my-2">
          2. step
        </div>
        <canvas id='outCanvas1' className={"w-75 h-75"} style={{border: '1px solid red'}} ref={canvasRef}></canvas>
      </div>
      <div className={"col-12 col-sm-4"}>
          <div className="my-2">
            3. step
          </div>
          <canvas id='outCanvas2' className={"w-75 h-75"} style={{border: '1px solid green'}} ref={canvasRef2}></canvas>
        {/* <button type="button" className="btn bg-primary text-white my-1" onClick={handlePrediction}>Predict</button> */}
      </div>
      <img ref={imgRef} onLoad={imgOnLoad} alt='err' style={{display: 'none'}} src={image}/>
    </div>
  )
}

export default StepperComponent;