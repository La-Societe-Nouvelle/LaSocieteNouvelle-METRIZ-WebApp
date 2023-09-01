import indicators from "/lib/indics";

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

  return closestYearData
    ? { value: closestYearData.value, year: closestYearData.year }
    : null;
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
/**
 * Get the metadata for indicators belonging to a specific category.
 * @param {Object} indicators - The object containing all indicators with their metadata.
 * @param {string} category - The category of indicators to filter.
 */
export const getIndicatorsMetaByCategory = (indicators, category) => {
  return Object.entries(indicators)
    .filter(([, indicator]) => indicator.category === category)
    .reduce((result, [key, value]) => {
      result[key.toLowerCase()] = value;
      return result;
    }, {});
};

/**
 * Get the metadata for indicators belonging to a specific category.
 * @param {Object} indicators - The object containing all indicators with their metadata.
 * @param {string} category - The category of indicators to filter.
 */
export const getIndicatorsMetaByType = (indicators, type) => {
  return Object.entries(indicators)
    .filter(([, indicator]) => indicator.type === type)
    .reduce((result, [key, value]) => {
      result[key.toLowerCase()] = value;
      return result;
    }, {});
};

/**
 * Get the values for indicators belonging to a specific category and optionally filtered by year.
 * @param {Object} data - The object containing indicator values, keyed by indicator name.
 * @param {string} category - The category of indicators to filter.
 * @param {number} year - Optional parameter to filter indicators by year.
 */

export const getIndicatorValuesByCategory = (data, category, year) =>
  Object.keys(data).reduce((filtered, indicator) => {
    const { value } = year
      ? getClosestYearData(data[indicator], year) || {}
      : data[indicator];
    if (
      indicators[indicator.toLowerCase()].category === category &&
      value !== undefined
    ) {
      filtered[indicator.toLowerCase()] = value;
    }
    return filtered;
  }, {});

  /**
 * Get the values for indicators belonging to a specific category and optionally filtered by year.
 * @param {Object} data - The object containing indicator values, keyed by indicator name.
 * @param {string} type - The type of indicators to filter.
 * @param {number} year - Optional parameter to filter indicators by year.
 */

export const getIndicatorValuesByType = (data, type, year) =>
Object.keys(data).reduce((filtered, indicator) => {
  const { value } = year
    ? getClosestYearData(data[indicator], year) || {}
    : data[indicator];
  if (
    indicators[indicator.toLowerCase()].type === type &&
    value !== undefined
  ) {
    filtered[indicator.toLowerCase()] = value;
  }
  return filtered;
}, {});


export const downloadChartImage = (chartId, fileName) => {
  const canvas = document.getElementById(chartId);
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = fileName;
  link.click();
};