import React, {useRef, useCallback} from 'react';
import Webcam from "react-webcam";

const WebcamComponent = ({setImageUrl}) => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot({width: 3840, height: 2160});
    setImageUrl(imageSrc);
  }, [webcamRef, setImageUrl]);

  return (
    <div className="d-none d-sm-block ">
      <div className="w-100 bg-dark p-4">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className={"w-50 h-50"}
        />
      </div>
      <button className="btn bg-primary text-white my-1" onClick={capture}>Capture photo</button>
    </div>
  )
}

export default WebcamComponent;