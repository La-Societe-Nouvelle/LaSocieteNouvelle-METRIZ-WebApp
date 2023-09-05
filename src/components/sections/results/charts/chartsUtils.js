export const changeOpacity = (rgbaColor, newOpacity) => {
  const rgbaArray = rgbaColor.split(",");
  rgbaArray[3] = newOpacity;
  return rgbaArray.join(",");
};

export const getCutOut = (width, factor) => {
  return width / factor;
};

export const getSuggestedMax = (max) => {
  if (max < 10) {
    return 10;
  }
  switch (true) {
    case max > 10 && max < 25:
      return 25;
    case max > 25 && max < 50:
      return 50;
    default:
      return 100;
  }
};
