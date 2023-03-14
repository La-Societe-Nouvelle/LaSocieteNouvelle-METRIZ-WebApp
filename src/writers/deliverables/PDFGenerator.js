import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { getAnalyse, getStatementNote } from "../../utils/Writers";
import { generateIndicTableBody } from "./utils/generateTableBody";
import divisions from "/lib/divisions";

// --------------------------------------------------------------------------

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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

  const currentDate = new Date();
  const date = currentDate.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

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
    indic,
    period
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
        { text: legalUnit, margin: [20, 15, 0, 0], bold: true },
        {
          text: "Exercice  " + year,
          alignment: "right",
          margin: [0, 15, 20, 0],
          bold: true,
        },
      ],
    },
    footer: function (currentPage, pageCount) {
      return {
        columns: [
          {
            text: "Edité le " + date,
            margin: [20, 25, 0, 0],
          },
          {
            text: "Page " + currentPage.toString() + " sur " + pageCount,
            alignment: "right",
            margin: [0, 25, 20, 0],
          },
        ],

        fontSize: 7,
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
            y: margins.top - 15,
            w: pageSize.width - margins.left - margins.right + 40,
            h: pageSize.height - margins.top - 15,
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
      // TO DO : Create external function to create content to import
      { text: "Résultat - " + label, style: "header" },
      {
        text: "Empreintes de vos Soldes Intermédiaires de Gestion",
        style: "h2",
        margin: [0, 10, 0, 20],
      },
      {
        style: "table",
        table: {
          widths: ["*", "auto", "auto", "auto"],
          body: generateIndicTableBody(
            financialData.mainAggregates,
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
      { text: impactsData.comments[indic], margin: [0, 10, 0, 10] },

      // -- PAGE 2-------------------------------------------------------------------------
      {
        text: "Analyse - " + label,
        style: "header",
        pageBreak: "before",
      },

      { text: "Note d'analyse", style: "h2", margin: [0, 10, 0, 10] },
      analysisNotes.map((note) => ({ text: note, style: "text", fontSize: 9 })),
      {
        text: "Comparaisons",
        style: "h2",
        margin: [0, 30, 0, 10],
      },
      comparativeData.activityCode !== "00"
        ? {
            text:
              "Branche d'activité : " + divisions[comparativeData.activityCode],
            margin: [0, 0, 0, 10],
            font: "Raleway",
          }
        : "",
      {
        columns: [
          {
            stack: [
              { text: "Production ", style: "h4" },
              {
                image: productionChartImage,
                width: 225,
                margin: [0, 10, 0, 20],
                alignment: "center",
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
                alignment: "center",
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
                alignment: "center",
              },
              ///
              {
                table: {
                  widths: [1, "*"],
                  heights: [4, 4, 4, 4],
                  body: [
                    [
                      {
                        text: "",
                        fillColor: "#b0b9f7",
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                      {
                        text: "Valeur pour la France",
                        fontSize: 5,
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                    ],
                    [
                      {
                        text: "",
                        fillColor: "#d7dcfb",
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                      {
                        text: "Objectifs 2030 pour la France",
                        fontSize: 5,
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                    ],
                    [
                      {
                        text: "",
                        fillColor: "#ffb642",
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                      {
                        text: "Valeur pour la branche",
                        fontSize: 5,
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                    ],
                    [
                      {
                        text: "",
                        fillColor: "#ffdc8d",
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                      {
                        text: "Objectifs 2030 pour la branche",
                        fontSize: 5,
                        borderColor: [
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ],
                      },
                    ],
                  ],
                  layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 2 : 1;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 2 : 1;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? "white"
                        : "white";
                    },
                    vLineColor: function (i, node) {
                      return i === 0 || i === node.table.widths.length
                        ? "white"
                        : "white";
                    },
                  },
                },
              },
            ],
          },
          {
            stack: [
              {
                text: "Consommations de capital fixe ",
                style: "h4",
              },
              {
                image: canvasFixedCapitalConsumptionImage,
                width: 225,
                margin: [0, 10, 0, 20],
                alignment: "center",
              },
            ],
          },
        ],
      },
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
        margin: [0, 5, 0, 10],
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
      legendText: {
        fontSize: 7,
        margin: [0, 10, 0, 0],
      },
    },
  };

  return new Promise((resolve) => {
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      if (download) {
        saveAs(blob, `${documentTitle}.pdf`);
      }
      resolve(blob);
    });
  });
};
