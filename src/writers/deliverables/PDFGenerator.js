import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { getAnalyse, getStatementNote } from "../../utils/Writers";
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

  // Get chart canvas and encode it to import in document
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

  // ---------------------------------------------------------------
  // Text Generation

  const statementNotes = getStatementNote(impactsData, indic);

  const analysisNotes = getAnalyse(
    impactsData,
    financialData,
    comparativeData,
    indic
  );

  // ---------------------------------------------------------------
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
    "Rapport_" +
    year +
    "_" +
    legalUnit.replaceAll(" ", "") +
    "-" +
    indic.toUpperCase();

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
    footer: function (currentPage, pageCount) {
      return {
        text: "Page " + currentPage.toString() + " sur " + pageCount,
        alignment: "right",
        margin: [0, 25, 20, 0],
      };
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
            y: margins.top - 20,
            w: pageSize.width - margins.left - margins.right + 40,
            h: pageSize.height - margins.top - 10,
            color: "#FFFFFF",
            r: 10,
          },
        ],
      };
    },
    info: {
      label: documentTitle,
      author: legalUnit,
      subject: "Rapport des impacts de votre entreprise",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content: [
      { text: "Résultat - " + label, style: "header" },
      {
        text: "Empreinte de vos Soldes Intermédiaires de Gestion",
        style: "h2",
        margin: [0, 10, 0, 20],
      },
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
            return i === 0 || i === node.table.widths.length ? 1 : 0;
          },
          vLineColor: function (i, node) {
            return i === 0 || i === node.table.widths.length ? "#f0f0f8" : "";
          },
          hLineColor: function (i, node) {
            return i === 0 ? "#191558" : "#f0f0f8";
          },
        },
      },
      { text: "Impacts directs", style: "h2", margin: [0, 10, 0, 10] },
      statementNotes.map((note) => note),

      // -- PAGE 2-------------------------------------------------------------------------
      {
        text: "Analyse - " + label,
        style: "header",
        pageBreak: "before",
      },

      { text: "Note d'analyse", style: "h2", margin: [0, 10, 0, 10] },
      analysisNotes.map((note) => ({ text: note, style: "text" })),
      {
        text: "Déclaration des impacts directs",
        style: "h2",
        margin: [0, 30, 0, 10],
      },
      {
        columns: [
          {
            stack: [
              { text: "Production ", style: "h4" },
              {
                image: productionChartImage,
                width: 225,
                margin: [0, 10, 0, 20],
              },
            ],
          },
          {
            stack: [
              {
                text: "Valeur ajoutée",
                style: "h4",
              },
              {
                image: canvasValueAddedImage,
                width: 225,
                margin: [0, 10, 0, 20],
              },
            ],
          },
        ],
      },
      {
        columns: [
          {
            stack: [
              {
                text: "Consommations intermédiaires ",
                style: "h4",
              },
              {
                image: canvasIntermediateConsumptionImage,
                width: 225,
                margin: [0, 10, 0, 20],
              },
            ],
          },
          {
            stack: [
              {
                text: "Consommation de Capital Fixe ",
                style: "h4",
              },
              {
                image: canvasFixedCapitalConsumptionImage,
                width: 225,
                margin: [0, 10, 0, 20],
              },
            ],
          },
        ],
      },
      ,
    ],
    defaultStyle: {
      fontSize: 10,
      color: "#191558",
    },
    styles: {
      header: {
        fontSize: 16,
        font: "Raleway",
        color: "#191558",
        bold: true,
        margin: [0, 10, 0, 10],
      },
      h2: {
        fontSize: 14,
        font: "Raleway",
        color: "#fa595f",
        bold: true,
      },
      h3: {
        fontSize: 12,
        font: "Raleway",
        color: "#191558",
        bold: true,
        margin: [0, 0, 0, 10],
      },
      h4: {
        fontSize: 10,
        font: "Raleway",
        margin: [0, 10, 0, 10],
        bold: true,
      },

      text: {
        alignment: "justify",
        lineHeight: 1.5,
      },
      table: {
        alignment: "right",
        fontSize: 9,
        margin: [0, 0, 0, 10],
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
        //pdfMake.createPdf(docDefinition).open();
        saveAs(blob, `${documentTitle}.pdf`);
      }

      resolve(blob);
    });
  });
};
