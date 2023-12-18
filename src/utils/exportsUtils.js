export function loadFonts() {
    pdfMake.fonts = {
      Raleway: {
        normal:
          "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Regular.ttf",
        bold: "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Bold.ttf",
      },
      // download default Roboto font from cdnjs.com
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
  }
  

  export const calculateAvailableWidth = async (pageSize, margins) => {
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
  
  export function createRectObject(x, y, w, h, lineWidth, lineColor, r, color) {
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
    if (color) {
      rectObj.color = color;
    }
    return rectObj;
  }
  
  export function getChartImageData(id) {
    const chartCanvas = document.getElementById(id);
    return chartCanvas ? chartCanvas.toDataURL("image/png") : null;
  }
  
  