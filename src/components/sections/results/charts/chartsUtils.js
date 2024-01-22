export const changeOpacity = (rgbaColor, newOpacity) => {
  const rgbaArray = rgbaColor.split(",");
  rgbaArray[3] = newOpacity;
  return rgbaArray.join(",");
};

export const getCutOut = (width, factor) => {
  return width / factor;
};

export const getMaxY = (datasets) => {
  const maxValues = datasets.map((dataset) => {
    if (dataset) {
      const max = Math.max(...dataset.filter((value) => value != null));
      return max;
    }
    return 0;
  });

  const max = Math.max(...maxValues);

  const threshold1 = 10;
  const threshold2 = 25;
  const threshold3 = 50;
  
  if (max < threshold1) {
    return threshold1;
  } else if (max < threshold2) {
    return threshold2;
  } else if (max < threshold3) {
    return threshold3;
  } else {
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