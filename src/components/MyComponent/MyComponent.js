import { useOpenCv } from 'opencv-react';
import React , { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import Webcam from "react-webcam";


const videoConstraints = {
  width: 3840,
  height: 2160,
  facingMode: "user"
};

const MyComponent = () => {
  const { loaded, cv } = useOpenCv()

  const [imageUrl, setImageUrl] = useState(null);
  const [classifier, setClassifier] = useState(null);
  const imgRef = useRef(null);
  const [ model, setModel ] = useState(null);
  const canvasRef = useRef(null);

  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot({width: 3840, height: 2160});
    setImageUrl(imageSrc);
  }, [webcamRef, setImageUrl]);

  useEffect(()=> {
    tf.loadLayersModel('model.json').then(data => setModel(data));
  }, []);
  
  useEffect(() => {
    if (loaded && cv) {
      createClassifier();
    }
  }, [loaded, cv])

  const handleOnChange = (e) => {
    const { files } = e.target;
    if( files && files?.length > 0 ) {
      setImageUrl(URL.createObjectURL(files[0]));
    }
  }

  const imgOnLoad = (e) => {
    console.log(e);
    let mat = cv.imread(e.target);
    console.log(mat);
    cv.imshow('outCanvas', mat);
    setTimeout(() => {
      detectEye(mat);
    }, 500)
  }

  const reduceEye = (eye) => {
    console.log(eye);
    let reduce_w = (eye.width - 480) * 0.5 
    let reduce_h = (eye.height - 480) * 0.5 

    let lowX = eye.x + reduce_w;
    let lowY = eye.y + reduce_h;

    eye = {
      height: 480,
      width: 480,
      x: lowX,
      y: lowY
    }
    
    console.log(eye);
    return eye;
  }

  const addPaddingToEye = (eye) => {

    let paddingX = 480 - eye.width;
    let paddingY = 480 - eye.height;

    let lowX = eye.x - (paddingX * 0.5);
    let lowY = eye.y - (paddingY * 0.5);

    eye = {
      height: 480,
      width: 480,
      x: lowX,
      y: lowY
    }

    return eye;
  }

  const createFileFromUrl = function(path, url) {
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
        console.log(err);
      })
  };

  const detectEye = (image) => {
    if(loaded && classifier) {
      let gray = new cv.Mat();
      let eyes = new cv.RectVector();

      cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY, 0);
      classifier.detectMultiScale(gray, eyes, 1.1, 3, 0);
      
      if(eyes.length === 0) {
        return
      }

      console.log(eyes);

      let eye = eyes.get(0);
      console.log(eye);
      gray.delete();

      for (let i = 0; i < eyes.size(); ++i) {           
        let tmpEye = eyes.get(i)
        if(eye.width < tmpEye.width) {
          eye = tmpEye;
        }
      }

      console.log(eye);

      if(eye.height > 480 && eye.width > 480) {
        eye = reduceEye(eye);
      } else {
        eye = addPaddingToEye(eye);
      }
      
      let dst = image.roi(eye)  
      image.delete();
      cv.imshow('outCanvas2', dst);
      dst.delete();
      
      console.log(eyes);
    }
  }

  const createClassifier = () => {
    let eyeCascadeFile = 'haarcascade_eye_tree_eyeglasses.xml'; // path to xml
    createFileFromUrl(eyeCascadeFile, eyeCascadeFile);
  }

  const handlePrediction = useCallback(() => {

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
        canvasRef.current?.getContext("2d")?.putImageData(imageData, 0,0);
        // cv.imshow('outCanvas', imageData)
      }
    )
  }, [cv, imageUrl, model])

  return (
    <div>
      {
        loaded ? 
        (
          <div>
            <div style={{margin: '10px 0px'}}>
              <input type='file' onChange={handleOnChange}></input>
            </div>
            <div>
              <div>
                <canvas id='outCanvas' style={{width: '480px', height: '480px', border: '1px solid black'}}></canvas>
                <canvas id='outCanvas2' style={{width: '480px', height: '480px', border: '1px solid red', marginLeft:'10px'}} ref={canvasRef}></canvas>
                <img ref={imgRef} onLoad={imgOnLoad} alt='err' style={{display: 'none'}} src={imageUrl}/>
              </div>

              <button type="button" onClick={handlePrediction} style={{margin: '10px 0px'}}>Predict</button>
            </div>
            <div>
              <div>
                <Webcam
                  audio={false}
                  height={640}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  // videoConstraints={videoConstraints}
                  width={640}
                />
              </div>
              <div style={{margin: '10px 0px'}}>
                <button className="btn bg-primary text-white" onClick={capture}>Capture photo</button>
              </div>
            </div>
          </div>
        )
        : <div>loading...</div>
      }
    </div>
  )
}

export default MyComponent;