
  export const reduceEye = (eye) => {
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
    
    return eye;
  }

  export const addPaddingToEye = (eye) => {

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