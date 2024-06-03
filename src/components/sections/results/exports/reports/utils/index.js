// Utils

// --------------------------------------------------
// Images

/**
 * Get the base64 data URL of a chart canvas by its ID.
 * @param {string} id - The ID of the chart canvas element.
 * @returns {string|null} The base64 data URL of the chart image or null if canvas element not found.
 */
export const getChartImageData = (id) => {
  const chartCanvas = document.getElementById(id);
  return chartCanvas ? chartCanvas.toDataURL("image/png") : null;
};

// --------------------------------------------------
// Files

/**
 * Load an image as a base64 data URL.
 * @param {string} imageUrl - The URL of the image to load.
 * @returns {Promise<string>} A promise resolving to the base64 data URL of the loaded image.
 */
export const loadImageAsDataURL = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

// --------------------------------------------------
// Color converter

/**
 * Convert an RGBA color to hexadecimal format.
 * @param {string} rgbaColor - The RGBA color string to convert.
 * @returns {string|null} The hexadecimal representation of the color or null if input is invalid.
 */
export function rgbaToHex(rgbaColor) {
  const rgbaRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/;
  const match = rgbaColor.match(rgbaRegex);

  if (!match) {
    return null; // No matching regex
  } else {
    const [, r, g, b, a = 1] = match;
    const alpha = Math.round(parseFloat(a) * 255)
      .toString(16)
      .padStart(2, "0");
    const red = parseInt(r, 10).toString(16).padStart(2, "0");
    const green = parseInt(g, 10).toString(16).padStart(2, "0");
    const blue = parseInt(b, 10).toString(16).padStart(2, "0");

    return `#${red}${green}${blue}${alpha !== "ff" ? alpha : ""}`;
  }
}

// --------------------------------------------------
// Formatter

/**
 * Truncate a string to a specified number of characters and append "..." if necessary.
 * @param {string} str - The string to truncate.
 * @param {number} nbChar - The maximum number of characters to allow before truncation.
 * @returns {string} The truncated string.
 */
export function cutString(str, nbChar) {
  if (str.length <= nbChar) return str;
  return str.substring(0, nbChar) + "...";
}

// --------------------------------------------------
// Text generation

/**
 * Add uncertainty text options for PDF generation.
 * @param {string} uncertaintyText - The text describing uncertainty.
 * @param {object} pdfPageSize - The size of the PDF page.
 * @param {object} pdfMargins - The margins of the PDF.
 * @param {object} defaultPosition - The default position for the text.
 * @returns {object} The options for uncertainty text.
 */
export const addUncertaintyText = (
  uncertaintyText,
  pdfPageSize,
  pdfMargins,
  defaultPosition
) => {
  const textOptions = {
    stack: [
      {
        margin: [0, 5, 0, 0],
        text: "* " + uncertaintyText,
      },
      {
        text: "** Source pour les données de comparaison : La Société Nouvelle",
        margin: [0, 5, 0, 0],
      },
    ],
    absolutePosition: {
      x: defaultPosition.startX,
      y: pdfPageSize.height - pdfMargins.bottom - 32,
    },
    style: "legend",
  };

  return textOptions;
};

/**
 * Get the description of an indicator.
 * @param {string} indic - The indicator code.
 * @returns {string|null} The description of the indicator or null if indicator code is invalid.
 */
export function getIndicDescription(indic) {
  let description;

  switch (indic) {
    case "art":
      description =
        "L'indicateur permet de rendre compte de la part de la valeur produite par des entreprises artisanales, créatives ou dont le savoir-faire est reconnu.";
      break;
    case "eco":
      description =
        "L'indicateur permet de rendre compte de la part de la valeur produite en France et celle issue des importations.";
      break;
    case "soc":
      description =
        "L'indicateur permet de rendre compte de la part de la valeur produite dans un intérêt social défini.";
      break;
    case "knw":
      description =
        "L'indicateur permet de rendre compte de la part de la valeur produite contribuant à la recherche, à la formation ou à l'enseignement.";
      break;
    case "ghg":
      description =
        "L'indicateur informe sur la quantité de gaz à effet de serre liée à la production de l'entreprise avec pour objectif d'identifier les entreprises les plus performantes.";
      break;
    case "mat":
      description =
        "L'indicateur informe sur le recours à l'extraction de ressources naturelles. L'objectif est de réduire l'extraction de matières premières et de favoriser la réutilisation et l'économie circulaire.";
      break;
    case "haz":
      description =
        "L'indicateur informe sur le degré d'utilisation de produits pouvant entraîner des conséquences néfastes sur la santé et/ou l'environnement. Son objectif est de diminuer le recours à ces catégories de produits.";
      break;
    case "nrg":
      description =
        "L'indicateur mesure la consommation d'énergie, directement liée à la consommation de ressources naturelles ou aux émissions de gaz à effet de serre. Il informe ainsi sur la pression exercée sur l'environnement.";
      break;
    case "was":
      description =
        " L'indicateur informe sur la quantité de déchets produite, avec pour objectif de la réduire. Il n'informe cependant pas sur le traitement des déchets (recyclages, destruction, etc.) et leur dangerosité.";
      break;
    case "wat":
      description =
        "L'indicateur informe sur l'utilisation de la ressource en eau, contribuant ainsi à la volonté de gestion globale des ressources naturelles qui sont en constante diminution.";
      break;
    case "geq":
      description =
        "L'indicateur informe sur les écarts de salaires entre les femmes et les hommes au sein des entreprises ayant contribué à la production de la valeur.";
      break;
    case "idr":
      description =
        "L'indicateur informe sur l'écart des rémunérations au sein des entreprises ayant contribué à la production de la valeur, dans le but d'encourager celles qui ont un partage plus équitable de la valeur produite.";
      break;
    default:
      description = null;
      break;
  }
  return description;
}

/**
 * Get the description of uncertainty for an indicator.
 * @param {string} typeIndic - The type of indicator.
 * @param {number} uncertainty - The level of uncertainty.
 * @returns {string} The description of uncertainty.
 */
export function getUncertaintyDescription(typeIndic, uncertainty) {
  let description;
  if (typeIndic == "intensite") {
    description =
      "L'incertitude provient des potentiels écarts dans l'évaluation de l'impact direct (mesure d'une grandeur physique) et de l'utilisation de données statistiques, en l'absence de données publiées pour un fournisseur, et/ou en amont, pour les empreintes publiées. Elle vise à se réduire avec la contribution de chaque acteur de la chaine de valeur et grâce aux retours statistiques obtenus.";
  } else {
    description =
      "Incertitude : " +
      uncertainty +
      "%. " +
      "L'incertitude provient de l'utilisation de données statistiques, directement, en l'absence de données publiées pour un fournisseur, et/ou en amont, pour les empreintes publiées (pour ces mêmes raisons). Elle vise à se réduire avec la contribution de chaque acteur de la chaine de valeur et grâce aux retours statistiques obtenus.";
  }

  return description;
}



// --------------------------------------------------
// Formulas

/**
 * Calculate the target annual reduction percentage.
 * @param {Array<object>} data - The data array.
 * @returns {string|undefined} The target annual reduction percentage or undefined if calculation fails.
 */
export function targetAnnualReduction(data) {
  let firstYearValue = data[0].value;
  let lastYearValue = data[data.length - 1].value;
  let yearsCount = data.length - 1;
  let totalReduction = firstYearValue - lastYearValue;
  let annualReduction = totalReduction / firstYearValue / yearsCount;
  let percentageReduction = (annualReduction * 100).toFixed(1);

  if (!isNaN(percentageReduction)) {
    percentageReduction =
      percentageReduction < 0
        ? " + " + Math.abs(percentageReduction)
        : "- " + percentageReduction;
  } else {
    percentageReduction = undefined;
  }

  return percentageReduction;
}

/**
 * Calculate the average evolution rate.
 * @param {Array<object>} data - The data array.
 * @returns {number} The average evolution rate.
 */
export function calculateAverageEvolutionRate(data) {
  let evolutionRates = [];
  let numberOfYears = 0;

  for (let i = 0; i < data.length - 1; i++) {
    const initialValue = data[i].value;
    const finalValue = data[i + 1].value;

    // Check if years are consecutive
    if (parseInt(data[i + 1].year) === parseInt(data[i].year) + 1) {
      numberOfYears++;
      const evolutionRate = ((finalValue - initialValue) / initialValue) * 100;
      evolutionRates.push(evolutionRate);
    } else {
      // Calculate annual evolution rate
      const numberOfAnnualEvolutionRates =
        parseInt(data[i + 1].year) - parseInt(data[i].year);
      const annualEvolutionRate =
        Math.pow(finalValue / initialValue, 1 / numberOfAnnualEvolutionRates) -
        1;
      numberOfYears += numberOfAnnualEvolutionRates;
      evolutionRates.push(annualEvolutionRate * 100);
    }
  }

  const sum = evolutionRates.reduce((a, b) => a + b, 0);
  const averageEvolutionRate = sum / numberOfYears;

  return averageEvolutionRate.toFixed(0);
}
