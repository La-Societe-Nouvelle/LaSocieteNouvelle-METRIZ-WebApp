// Utils
import { getShortCurrentDateString } from "/src/utils/periodsUtils";

// --------------------------------------------------
// loader fonts

export const loadFonts = () => 
{
  pdfMake.fonts = {
    // download Raleway
    Raleway: {
      normal:     "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Regular.ttf",
      bold:       "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Bold.ttf",
    },
    // download default Roboto font from cdnjs.com
    Roboto: {
      normal:      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
      bold:        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
      italics:     "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
      bolditalics: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
    },
  };
}

// --------------------------------------------------
// width

export const calculateAvailableWidth = async (
  pageSize, 
  margins
) => {
  return pageSize.width - (margins.left + margins.right);
};

export const calculateBoxWidth = async (
  availableWidth,
  numberOfBoxes,
  spaceBetweenBoxes
) => {
  return (
    (availableWidth - spaceBetweenBoxes * (numberOfBoxes - 1)) / numberOfBoxes
  );
};

// --------------------------------------------------
// shapes

export const createRectObject = (x, y, w, h, lineWidth, lineColor, r, color) =>
{
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
  };

  return rectObj;
}

// --------------------------------------------------
// images

export const getChartImageData = (id) => {
  const chartCanvas = document.getElementById(id);
  return chartCanvas ? chartCanvas.toDataURL("image/png") : null;
}

// --------------------------------------------------
// header / footer

export const generateHeader = (corporateName, currentPeriod) =>
{
  return {
    columns: [
      {
        text: corporateName, 
        margin: [20, 15, 0, 0], 
        bold: true,
      }, {
        text: "Exercice  " + currentPeriod,
        alignment: "right",
        margin: [0, 15, 20, 0],
        bold: true,
      }
    ],
  };
}

export const generateFooter = () => {
  return {
    columns: [
      {
        text: "Edité le " + getShortCurrentDateString(),
        margin: [30, 30, 0, 0],
      },
    ],
    alignment: "left",
    fontSize: 6,
  };
}

// --------------------------------------------------
// Document properties

export const getDocumentInfo = (report, indic, corporateName, currentPeriod) => 
{
  return {
    title: getDocumentTitle(report, indic, corporateName, currentPeriod),
    author: corporateName,
    subject: "Plaquette de résultat",
    creator: "Metriz - La Société Nouvelle",
    producer: "Metriz - La Societé Nouvelle",
  };
}

const getDocumentTitle = (report, indic, corporateName, currentPeriod) => 
{
  const title = 
      report
    + "_" 
    + indic.toUpperCase()
    + "_" 
    + corporateName.replaceAll(" ", "")
    + "-" 
    + currentPeriod;
  
  return title;
}


// --------------------------------------------------
// Styles

export function definePDFStyles() 
{
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
        color: "#fa595f",
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
    },
  };
}

// color converter
export function rgbaToHex(rgbaColor) 
{
  const rgbaRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/;
  const match = rgbaColor.match(rgbaRegex);

  // no matching regex
  if (!match) {
    return null;
  } 
  
  // if matching
  else {
    const [, r, g, b, a = 1] = match;
    const alpha = Math.round(parseFloat(a) * 255).toString(16).padStart(2, '0');
    const red = parseInt(r, 10).toString(16).padStart(2, '0');
    const green = parseInt(g, 10).toString(16).padStart(2, '0');
    const blue = parseInt(b, 10).toString(16).padStart(2, '0');

    return `#${red}${green}${blue}${alpha !== 'ff' ? alpha : ''}`;
  }
}