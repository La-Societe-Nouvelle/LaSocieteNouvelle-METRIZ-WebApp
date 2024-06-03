
// Utils ---------------------------------------------------------------------
import { getShortCurrentDateString } from "/src/utils/periodsUtils";

// Layout --------------------------------------------------------------------

// --------------------------------------------------
// Width

/**
 * Calculate the available width for content on a page.
 * @param {object} pageSize - The size of the page.
 * @param {object} margins - The margins of the page.
 * @returns {number} The available width.
 */
export const calculateAvailableWidth = async (pageSize, margins) => {
  return pageSize.width - (margins.left + margins.right);
};

// --------------------------------------------------
// Shapes

/**
 * Create a rectangle object.
 * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
 * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
 * @param {number} w - The width of the rectangle.
 * @param {number} h - The height of the rectangle.
 * @param {number} lineWidth - The line width of the rectangle's border.
 * @param {string} lineColor - The color of the rectangle's border.
 * @param {number} r - The radius of the rectangle's corners.
 * @param {string} color - The fill color of the rectangle.
 * @returns {object} The rectangle object.
 */
export const createRectObject = (
  x,
  y,
  w,
  h,
  lineWidth,
  lineColor,
  r,
  color
) => {
  const rectObj = {
    type: "rect",
    x,
    y,
    w,
    h,
    lineWidth,
    lineColor,
    r,
  };

  // add color
  if (color) {
    rectObj.color = color;
  }

  return rectObj;
};

// --------------------------------------------------
// Header / Footer

/**
 * Generate the header for the document.
 * @param {string} corporateName - The name of the company.
 * @param {string} siren - The SIREN number.
 * @param {string} currentPeriod - The current period.
 * @returns {object} The header configuration.
 */
export const generateHeader = (corporateName, siren, currentPeriod) => {
  return {
    columns: [
      {
        text: siren ? "SIREN : " + siren : "",
      },
      {
        alignment: "center",
        text: corporateName,
      },
      {
        text: "Exercice  " + currentPeriod,
        alignment: "right",
      },
    ],
    fontSize: 7,
    margin: [20, 15, 20, 0],
  };
};

/**
 * Generate the footer for the document.
 * @param {string} corporateName - The name of the company.
 * @returns {object} The footer configuration.
 */
export const generateFooter = (corporateName) => {
  return {
    columns: [
      {
        text: "Edité le " + getShortCurrentDateString(),
        margin: [30, 30, 0, 0],
      },
      {
        width: "50%",
        text: corporateName,
        margin: [0, 30, 0, 0],
      },
    ],
    alignment: "left",
    fontSize: 7,
  };
};

// --------------------------------------------------
// Document Properties

/**
 * Get the document information.
 * @param {string} report - The report name.
 * @param {string} indic - The indicator.
 * @param {string} corporateName - The name of the company.
 * @param {string} currentPeriod - The current period.
 * @returns {object} The document information.
 */
export const getDocumentInfo = (
  report,
  indic,
  corporateName,
  currentPeriod
) => {

  const documentTitle =
    report +
    "_" +
    indic.toUpperCase() +
    "_" +
    corporateName.replaceAll(" ", "") +
    "-" +
    currentPeriod;
    
  return {
    title: documentTitle,
    author: corporateName,
    subject: "Plaquette de résultat",
    creator: "Metriz - La Société Nouvelle",
    producer: "Metriz - La Societé Nouvelle",
  };
};



// --------------------------------------------------
// Styles

/**
 * Define the PDF styles.
 * @returns {object} The PDF styles.
 */
export function definePDFStyles() {
  return {
    defaultStyle: {
      fontSize: 10,
      color: "#191558",
      font: "Raleway",
    },
    styles: {
      header: {
        fontSize: 14,
        color: "#fa595f",
        bold: true,
        margin: [0, 10, 0, 10],
        alignment: "center",
      },
      h2: {
        fontSize: 12,
        color: "#191558",
        bold: true,
        alignment: "center",
        background: "#FFFFFF",
      },
      h3: {
        fontSize: 12,
        color: "#fa595f",
        bold: true,
        margin: [0, 0, 0, 10],
      },
      numbers: {
        fontSize: 18,
        bold: true,
      },
      bigNumber: {
        bold: true,
        color: "#fa595f",
        margin: [0, 5, 0, 5],
      },
      branchNumber: {
        fontSize: 16,
        bold: true,
        color: "#ffb642",
        margin: [0, 5, 0, 5],
      },
      table: {
        fontSize: 6,
        bold: true,
        alignment: "center",
        font: "Roboto",
      },
      legend: {
        fontSize: 6,
        italics: true,
        font: "Roboto",
        color: "#666671",
      },
    },
  };
}

// --------------------------------------------------
// Fonts

/**
 * Load fonts for the PDF.
 */
export const loadFonts = () => {
  pdfMake.fonts = {
    Raleway: {
      normal:
        "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Regular.ttf",
      bold: "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Bold.ttf",
    },
    Roboto: {
      normal:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
      bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
      italics:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
      bolditalics:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
    },
  };
};

