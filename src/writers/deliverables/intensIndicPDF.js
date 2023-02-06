import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { printValue } from "../../utils/Utils";
import {
  getIndicDescription,
  sortExpensesByFootprintIndicator,
} from "./utils/utils";

// --------------------------------------------------------------------------

pdfMake.vfs = pdfFonts.pdfMake.vfs;

pdfMake.fonts = {
  Raleway: {
    normal: "http://localhost:3000/fonts/Raleway/Raleway-Regular.ttf",
    bold: "http://localhost:3000/fonts/Raleway/Raleway-bold.ttf",
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

export const CreateIntensIndicatorPDF = (
  year,
  legalUnit,
  indic,
  label,
  unit,
  financialData,
  impactsData,
  comparativeData,
  download
) => {
  // ---------------------------------------------------------------

  console.log(indic)
  const indicDescription = getIndicDescription(indic);

  const {
    production,
    revenue,
    storedProduction,
    immobilisedProduction,
    intermediateConsumption,
    capitalConsumption,
    netValueAdded,
  } = financialData.aggregates;

  const mostImpactfulExpenses = sortExpensesByFootprintIndicator(
    financialData.expenses,
    indic,
    "desc"
  ).slice(0, 3);
  const leastImpactfulExpenses = sortExpensesByFootprintIndicator(
    financialData.expenses,
    indic,
    "asc"
  ).slice(0, 3);

  // Get chart canvas and encode it to import in document
  const canvasProduction = document.getElementById("production-" + indic);
  const productionChartImage = canvasProduction.toDataURL("image/png");

  // ---------------------------------------------------------------

  const totalRevenue = revenue.amount;
console.log(production)
  // Document Property

  const margins = {
    top: 50,
    bottom: 50,
    left: 40,
    right: 40,
  };
  const pageSize = {
    width: 595.28,
    height: 841.89,
  };

  const documentTitle =
    "Plaquette_" +
    indic.toUpperCase() +
    "_" +
    year +
    "-" +
    legalUnit.replaceAll(" ", "");

  // ---------------------------------------------------------------
  // PDF Content and Layout
  const docDefinition = {
    pageSize: pageSize,
    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
    header: {
      columns: [
        { text: legalUnit, margin: [20, 15, 0, 0] },
        {
          text: "Exercice  " + year,
          alignment: "right",
          margin: [0, 15, 20, 0],
        },
      ],
    },

    background: function () {
      return {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: 595.28,
            h: 841.89,
            color: "#f1f0f4",
          },
          {
            type: "rect",
            x: margins.left - 20,
            y: margins.top - 15,
            w: pageSize.width - margins.left - margins.right + 40,
            h: pageSize.height - margins.top - 15,
            color: "#FFFFFF",
            r: 10,
          },
          {
            type: "rect",
            x: 30,
            y: 105,
            w: 130,
            h: 60,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 200,
            y: 105,
            w: 140,
            h: 60,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 200,
            y: 105,
            w: 140,
            h: 60,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 200,
            y: 105,
            w: 140,
            h: 60,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // Box Vue de vos Soldes Intermediaires de Gestion
          {
            type: "rect",
            x: 30,
            y: 242,
            w: 535,
            h: 120,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },

        ],
      };
    },
    info: {
      label: documentTitle,
      author: legalUnit,
      subject: "Plaquette de résultat",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content: [
      { text: "Rapport - " + label, style: "header" },
      {
        columns: [
          {
            margin: [0, 30, 0, 30],
            stack: [
              {
                text: printValue(totalRevenue, 0) + "€",
                alignment: "center",
                style: "numbers",
              },
              {
                text: "de chiffre d'affaires",
                alignment: "center",
              },
            ],
          },

          {
            margin: [0, 15, 0, 30],
            stack: [
    
              {
                margin: [0, 5, 0, 0],
                text:"53%",
                alignment: "center",
                style: "numbers",
              },
              {
                text: " d'intensité de ",
                alignment: "center",
              },
              {
                text: label,
                alignment: "center",
              },
            ],
          },

          {
            margin: [0, 15, 0, 30],
            stack: [
     
              {
                margin: [0, 5, 0, 0],
                text: printValue(production.footprint.indicators[indic].value, precision) + " " + unit,
                alignment: "center",
                style: "numbers",
              },
              {
                text: "de COE émis",
                alignment: "center",
              },
              {
                text: "liés à la production",
                alignment: "center",
              },
            ],
          },
          {
            margin: [0, 15, 0, 30],
            stack: [
              {
                text: "Ce qui représente",
                alignment: "center",
                background: "#FFFFFF",
              },
              {
                margin: [0, 5, 0, 0],
                text: "11 Millions",
                alignment: "center",
                style: "numbers",
              },
              {
                text: " de Lorem Ipsum ",
                alignment: "center",
              },

            ],
          },
        ],
      },
      {
        text: indicDescription,
      },
      {
        text: "Impacts de vos Soldes Intérmediaires de Gestion",
        style: "h2",
      },
  
      ,
    ],
    defaultStyle: {
      fontSize: 10,
      color: "#191558",
      font: "Raleway",
    },
    styles: {
      header: {
        fontSize: 16,
        color: "#fa595f",
        bold: true,
        margin: [0, 5, 0, 10],
        alignment: "center",
      },
      h2: {
        fontSize: 12,
        color: "#fa595f",
        bold: true,
        alignment: "center",
        margin: [0, 20, 0, 10],
        background: "#FFFFFF",
      },
      h3: {
        fontSize: 12,
        color: "#fa595f",
        bold: true,
        margin: [0, 0, 0, 10],
      },
      h4: {
        fontSize: 10,
        margin: [0, 10, 0, 10],
        bold: true,
      },
      numbers: {
        fontSize: 18,
        bold: true,
      },
      bigNumber: {
        fontSize: 24,
        bold: true,
        color: "#fa595f",
      },
      branchNumber: {
        fontSize: 16,
        bold: true,
        color: "#ffb642",
      },
      text: {
        alignment: "justify",
        lineHeight: 1.5,
      },
    },
  };

  return new Promise((resolve) => {
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      if (download) {
        pdfMake.createPdf(docDefinition).open();
        //saveAs(blob, `${documentTitle}.pdf`);
      }

      resolve(blob);
    });
  });
};
