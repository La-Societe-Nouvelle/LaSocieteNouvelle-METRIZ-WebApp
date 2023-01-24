
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {
  getAnalyse,
  getStatementNote,
} from "../../utils/Writers";
import { generateIndicTableBody } from "./generateTableBody";

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

export const basicPDFReport = (
  indic,
  title,
  unit,
  financialData,
  impactsData,
  comparativeData,
  download
) => {
  const canvasProduction = document.getElementById("production-" + indic);
  const canvasValueAdded = document.getElementById("netValueAdded-" + indic);
  const canvasIntermediateConsumption = document.getElementById(
    "intermediateConsumption-" + indic
  );
  const canvasFixedCapitalConsumption = document.getElementById(
    "capitalConsumption-" + indic
  );

  const productionChartImage = canvasProduction.toDataURL("image/png");
  const canvasIntermediateConsumptionImage =
    canvasIntermediateConsumption.toDataURL("image/png");
  const canvasValueAddedImage = canvasValueAdded.toDataURL("image/png");
  const canvasFixedCapitalConsumptionImage =
    canvasFixedCapitalConsumption.toDataURL("image/png");

  const statementNotes = getStatementNote(impactsData, indic);
  const analysisNotes = getAnalyse(
    impactsData,
    financialData,
    comparativeData,
    indic
  );

  const margins = {
    top: 40,
    bottom: 40,
    left: 40,
    right: 40,
  };
  const pageSize = {
    width: 595.28,
    height: 841.89,
  };
  const docDefinition = {
    pageSize: pageSize,
    pageMargins: [margins.top, margins.right, margins.bottom, margins.left],
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
            x: margins.left - 10,
            y: margins.top - 10,
            w: pageSize.width - margins.left - margins.right + 20,
            h: pageSize.height - margins.top - margins.bottom,
            color: "#FFFFFF",
            r: 10,
          },
        ],
      };
    },
    content: [
      { text: "Rapport des impacts de votre entreprise", style: "header" },
      {
        text: title,
        style: "h2",
      },
      { text: "Vue de vos Soldes Intermédiaires de Gestion", style: "h3" },
      {
        style: "table",
        table: {
          widths: ["*", "auto", "auto", "auto"],
          body: generateIndicTableBody(
            financialData.aggregates,
            indic,
            unit,
            financialData.getIntermediateConsumptionsAggregates(),
            financialData.getFixedCapitalConsumptionsAggregates()
          ),
        },
        layout: {
          hLineWidth: function (i, node) {
            return i === 0 ||
              i === 4 ||
              i === 10 ||
              i === 13 ||
              i === node.table.body.length
              ? 1
              : 0;
          },
          vLineWidth: function (i, node) {
            return 0;
          },
          hLineColor: function (i, node) {
            return i === 0 ? "#191558" : "#f0f0f8";
          },
        },
      },
      { text: "Impacts directs", style: "h3" },
      statementNotes.map((note) => note),
      { text: "Note d'analyse", style: "h3" },
      analysisNotes.map((note) => ({ text: note, style: "text" })),
      { text: "Déclaration des impacts directs", style: "h3" },
      {
        columns: [
          {
            stack: [
              { text: "Production ", style: "h5" },
              {
                image: productionChartImage,
                width: 100,
              },
            ],
          },
          {
            stack: [
              {
                text: "Valeur ajoutée",
                style: "h5",
              },
              {
                image: canvasValueAddedImage,
                width: 100,
              },
            ],
          },
          {
            stack: [
              {
                text: "Consommations intermédiaires ",
                style: "h5",
              },
              {
                image: canvasIntermediateConsumptionImage,
                width: 100,
              },
            ],
          },
          {
            stack: [
              {
                text: "Consommation de Capital Fixe ",
                style: "h5",
              },
              {
                image: canvasFixedCapitalConsumptionImage,
                width: 100,
              },
            ],
          },
        ],
      },
      ,
    ],
    defaultStyle: {
      fontSize: 9,
      color: "#191558",
    },
    styles: {
      header: {
        fontSize: 20,
        font: "Raleway",
        color: "#fa595f",
        bold: true,
        alignment: "center",
        margin: [0, 5, 0, 0],
      },
      h2: {
        fontSize: 16,
        font: "Raleway",
        color: "#191558",
        bold: true,
        alignment: "center",
        margin: [0, 15, 0, 15],
      },
      h3: {
        fontSize: 13,
        font: "Raleway",
        color: "#fa595f",
        bold: true,
        margin: [0, 20, 0, 10],
      },
      h4: {
        fontSize: 10,
        font: "Raleway",
        color: "#191558",
        margin: [0, 0, 0, 20],
      },
      h5: {
        fontSize: 7,
        font: "Raleway",
        margin: [0, 10, 0, 10],
        bold: true,
      },
      legalUnit: {
        font: "Raleway",
        fontSize: 16,
        color: "#fa595f",
        bold: true,
      },
      text: {
        alignment: "justify",
        lineHeight: 1.5,
      },
      table: {
        alignment: "right",
        fontSize: 8,
      },
      tableHeader: {
        fillColor: "#f0f0f8",
        bold: true,
        margin: [0, 5, 0, 5],
        color: "#191558",
        alignment: "center",
      },
      tableBold: {
        bold: true,
        alignment: "left",
      },
      tableLeft: {
        alignment: "left",
      },
    },
  };

  return new Promise((resolve) => {
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      if (download) {
        // Télécharger le PDF
        saveAs(blob, `${title}.pdf`);
      }

      resolve(blob);
    });
  });
  //pdfMake.createPdf(docDefinition).open();
};
