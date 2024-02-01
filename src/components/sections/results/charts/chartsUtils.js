import { isValidNumber } from "../../../../utils/Utils";

export const changeOpacity = (rgbaColor, newOpacity) => {
  const rgbaArray = rgbaColor.split(",");
  rgbaArray[3] = newOpacity;
  return rgbaArray.join(",");
};

export const getCutOut = (width, factor) => {
  return width / factor;
};


// Get the maximum value on the Y-axis from multiple datasets
export const getMaxY = (datasets) => {
  const maxValues = datasets.map((dataset) => {
    if (dataset) {
      const max = Math.max(...dataset.data
        .filter(value => value)
        .map(value => value.y || value)
        .filter((yValue) => isValidNumber(yValue))
      );
      return max;
    }
    return 0;
  });

  const max = Math.max(...maxValues);

  // Thresholds to determine the maximum value
  const threshold1 = 10;
  const threshold2 = 25;
  const threshold3 = 50;
  
    // Return the appropriate maximum value
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

// Get the maximum value from aggregates footprints
export const getMaxFootprintValue = (session, period, indic) => {
  const { financialData } = session;
  const { mainAggregates } = financialData;
  let maxValue = 0;

  Object.values(mainAggregates).forEach((aggregate) => {
    const footprint = aggregate.getFootprint(period.periodKey, indic);
    const footprintValue = footprint ? footprint.value : 0;

    if (footprintValue > maxValue) {
      maxValue = footprintValue;
    }
  });
  return maxValue;
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


