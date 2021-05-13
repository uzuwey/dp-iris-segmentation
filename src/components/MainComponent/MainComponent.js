import { useOpenCv } from 'opencv-react';
import React , {useState} from 'react';
import {WebcamComponent, StepperComponent, Loading} from '..';

const MainComponent = () => {
  const { loaded, cv } = useOpenCv();
  const [imageUrl, setImageUrl] = useState(null);

  const handleOnChange = (e) => {
    const { files } = e.target;
    if( files && files?.length > 0 ) {
      setImageUrl(URL.createObjectURL(files[0]));
    }
  }

  return (
    <div className="container">
      {
        loaded ? 
        (
          <>
            <div>
              <h1> Capture/insert image</h1>
              <div className={"row my-1"}>
                <div className={"col"}>
                  <div className="custom-file">
                    <input type="file" accept="image/*" className="custom-file-input" id="inputGroupFile02" onChange={handleOnChange}/>
                    <label className="custom-file-label" htmlFor="inputGroupFile02" aria-describedby="inputGroupFileAddon02">Choose file</label>
                  </div>
                </div>
              </div>
              <WebcamComponent setImageUrl={setImageUrl}/>
            </div>
            <>
              <StepperComponent image={imageUrl} cv={cv}/>
            </>
          </>
        )
        : <Loading />
      }
    </div>
  )
}

export default MainComponent;