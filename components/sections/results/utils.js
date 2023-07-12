
/**
 * Retrieves the value and year for the closest year to the given year from the dataset,
 * or the closest available year if there is no data for the given year.
 * @param {object} data - The dataset containing year-value pairs.
 * @param {string} currentYear - The target year.
 * @returns {object|null} - The value and year for the closest year or null if no data is available.
 */
export const getClosestYearData = (data, currentYear) => {
  if (!data) {
    return null;
  }

  let closestYearData = null;
  const years = Object.keys(data);
  const closestYear = years.reduce((a, b) => {
    return Math.abs(b - currentYear) < Math.abs(a - currentYear) ? b : a;
  });

  closestYearData = data[closestYear];

  return closestYearData ? { value: closestYearData.value, year: closestYearData.year } : null;
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
