
export const buildLinearPath = async(startValue, startYear, targetValue, targetYear, precision) => {
    const values = [];
    
    const startYearNumber = parseInt(startYear, 10);
    const targetYearNumber = parseInt(targetYear, 10);
  
    const yearsDifference = targetYearNumber - startYearNumber;
  
    const valueIncrement = (targetValue - startValue) / yearsDifference;
  
    for (let i = 0; i <= yearsDifference; i++) {
      const currentYear = startYearNumber + i;
      const currentValue = startValue + i * valueIncrement;
      
      values.push({ value: currentValue.toFixed(precision), year: currentYear });
    }
    return values;
  };

  export const buildGeometricPath = async(startValue, startYear, targetValue, targetYear, precision) => {
    const values = [];
  
    const startYearNumber = parseInt(startYear, 10);
    const targetYearNumber = parseInt(targetYear, 10);
  
    const yearsDifference = targetYearNumber - startYearNumber;
  
    const growthFactor = Math.pow(targetValue / startValue, 1 / yearsDifference);
  
    for (let i = 0; i <= yearsDifference; i++) {
      const currentYear = startYearNumber + i;
      const currentValue = startValue * Math.pow(growthFactor, i);
  
      values.push({ value: currentValue.toFixed(precision), year: currentYear });
    }
  
    return values;
  };
  
