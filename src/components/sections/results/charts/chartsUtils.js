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



export function getAggregatesDistribution(aggregates, periodKey) {
  const amounts = aggregates.map((item) => item.periodsData[periodKey].amount || 0);
  const totalAmount = amounts.reduce((total, amount) => total + amount, 0);

  // Calculate percentages and add value to aggregate
  const aggregatesWithPercentages = aggregates.map((item, index) => {
    const percentage = ((amounts[index] / totalAmount) * 100).toFixed(0);
    return { ...item, percentage: Number(percentage) };
  });


  return aggregatesWithPercentages;
}


export function generateFadeColors(startColor, steps) {
  const colors = [];
  const [r, g, b, a] = startColor.match(/\d+/g);

  for (let i = 0; i < steps; i++) {
    const alpha = parseFloat(a) * (1 - i / steps ); 

    colors.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
  }

  return colors;
}