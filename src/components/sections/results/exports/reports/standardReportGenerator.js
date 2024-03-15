// PDF Make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Lib
import metaIndics from "/lib/indics";
import divisions from "/lib/divisions";

// Utils
import { getShortCurrentDateString } from "/src/utils/periodsUtils";
import { generateSIGtable } from "./generateSIGtable";

import { buildFixedCapitalConsumptionsAggregates,buildIntermediateConsumptionsAggregates } from "/src/formulas/aggregatesBuilder";
import { getStatementNote } from "/src/utils/Writers";

import { loadFonts } from "../../../../../utils/exportsUtils";
import { pdfMargins, pdfPageSize } from "../../../../../constants/pdfConfig";

// --------------------------------------------------------------------------
//  Indicator Report
// --------------------------------------------------------------------------

pdfMake.vfs = pdfFonts.pdfMake.vfs;

//Call function to load fonts
loadFonts();

export const buildStandardReport = async ({
  session,
  indic,
  period,
  showAnalyses,
}) => {
  // Session data --------------------------------------------------

  const { legalUnit, financialData, impactsData, comparativeData, analysis } =
    session;

  // Metadata ------------------------------------------------------

  const { libelle, unit } = metaIndics[indic];

  // ---------------------------------------------------------------
  // Text Generation

  const currentPeriod = period.periodKey.slice(2);

  const statementNotes = getStatementNote(impactsData[period.periodKey], indic);

  const analysisNotes =
    analysis[period.periodKey][indic]?.isAvailable && showAnalyses
      ? analysis[period.periodKey][indic].analysis
      : null;

  // get Intermediate Aggregates
  const intermediateConsumptionsAggregates =
    await buildIntermediateConsumptionsAggregates(financialData, [period]);

  const fixedCapitalConsumptionsAggregates =
    await buildFixedCapitalConsumptionsAggregates(financialData, [period]);

  // ---------------------------------------------------------------
  // Get chart canvas and encode it to import in document

  const prodChartCanvas = document.getElementById(
    `comparative-chart-production-${indic}-print`
  );
  const prodChartImage = prodChartCanvas.toDataURL("image/png");

  const interConsChartCanvas = document.getElementById(
    `comparative-chart-intermediateConsumptions-${indic}-print`
  );
  const interConsChartImage = interConsChartCanvas.toDataURL("image/png");

  const valueAddedCanvas = document.getElementById(
    `comparative-chart-netValueAdded-${indic}-print`
  );

  const valueAddedImage = valueAddedCanvas.toDataURL("image/png");

  const fixedCapConsChartCanvas = document.getElementById(
    `comparative-chart-fixedCapitalConsumptions-${indic}-print`
  );
  const fixedCapConsChartImage = fixedCapConsChartCanvas.toDataURL("image/png");

  // ---------------------------------------------------------------
  // Document Property

  const documentTitle =
    "Rapport_" +
    currentPeriod +
    "_" +
    legalUnit.corporateName.replaceAll(" ", "") +
    "-" +
    indic.toUpperCase();

  // ---------------------------------------------------------------
  // PDF Content and Layout
  const docDefinition = {
    pageSize: pdfPageSize,
    pageMargins: [
      pdfMargins.left,
      pdfMargins.top,
      pdfMargins.right,
      pdfMargins.bottom,
    ],
    header: {
      columns: [
        { text: legalUnit.corporateName, margin: [20, 15, 0, 0], bold: true },
        {
          text: "Exercice  " + currentPeriod,
          alignment: "right",
          margin: [0, 15, 20, 0],
          bold: true,
        },
      ],
    },
    footer: function () {
      return {
        columns: [
          {
            text: "Edité le " + getShortCurrentDateString(),
            margin: [20, 25, 0, 0],
            font: "Raleway",
            fontSize: 7,
          },
        ],
      };
    },

    background: function () {
      return {
        canvas: [
          // Background
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
            x: pdfMargins.left - 20,
            y: pdfMargins.top - 15,
            w: pdfPageSize.width - pdfMargins.left - pdfMargins.right + 40,
            h: pdfPageSize.height - pdfMargins.top - 15,
            color: "#FFFFFF",
            r: 10,
          },
        ],
      };
    },
    info: {
      libelle: documentTitle,
      author: legalUnit.corporateName,
      subject: "Rapport des impacts de votre entreprise",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content: [
      { text: "Résultat - " + libelle, style: "header" },
      //--------------------------------------------------
      {
        text: "Empreintes de vos Soldes Intermédiaires de Gestion",
        style: "h2",
        margin: [0, 10, 0, 20],
      },
      {
        style: "table",
        table: {
          widths: ["*", "auto", "auto", "auto"],
          body: generateSIGtable(
            financialData.mainAggregates,
            financialData.productionAggregates,
            indic,
            unit,
            intermediateConsumptionsAggregates,
            fixedCapitalConsumptionsAggregates,
            period
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
            return i === 0 ? "" : "#f0f0f8";
          },
        },
      },
      //--------------------------------------------------
      { text: "Impacts directs", style: "h2", margin: [0, 10, 0, 10] },
      statementNotes.map((note) => note),
      {
        text: impactsData[period.periodKey].comments[indic],
        margin: [0, 10, 0, 10],
      },

      // ---------------------------------------------------------------------------
      //  PAGE 2
      {
        text: "Analyse - " + libelle,
        style: "header",
        pageBreak: "before",
      },
      // ---------------------------------------------------------------------------
      // Charts
      {
        text: "Comparaisons",
        style: "h2",
        margin: [0, 10, 0, 10],
      },
      comparativeData.comparativeDivision !== "00"
        ? {
            text:
              "Branche d'activité : " +
              divisions[comparativeData.comparativeDivision],
            margin: [0, 0, 0, 10],
            font: "Raleway",
          }
        : "",
      {
        margin: [0, 20, 0, 0],
        columns: [
          {
            stack: [
              {
                text: "Production ",
                style: "h4",
                alignment: "center",
                margin: [0, 0, 0, 20],
              },
              {
                image: prodChartImage,
                width: 200,
                alignment: "center",
              },
            ],
          },
          {
            stack: [
              {
                text: "Valeur ajoutée",
                style: "h4",
                alignment: "center",
                margin: [0, 0, 0, 20],
              },
              {
                image: valueAddedImage,
                width: 200,
                alignment: "center",
              },
            ],
          },
        ],
      },
      {
        margin: [0, 20, 0, 0],
        columns: [
          {
            stack: [
              {
                text: "Consommations intermédiaires ",
                style: "h4",
                alignment: "center",
                margin: [0, 0, 0, 20],
              },
              {
                image: interConsChartImage,
                width: 200,
                alignment: "center",
              },
              ///
              {
                margin: [0, 30, 0, 0],
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
                alignment: "center",
                margin: [0, 0, 0, 20],
              },
              {
                image: fixedCapConsChartImage,
                width: 200,
                alignment: "center",
              },
            ],
          },
        ],
      },
      // ---------------------------------------------------------------------------
      //  PAGE 3
      analysisNotes && [
        {
          text: "Analyse - " + libelle,
          style: "header",
          pageBreak: "before",
        },
        // Analysis note
        { text: "Note d'analyse", style: "h2", margin: [0, 10, 0, 10] },
        {
          text: analysisNotes,
          style: "text",
          fontSize: 9,
        },
      ],
    ],
    // ---------------------------------------------------------------------------
    // Style
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

  const standardReport = pdfMake.createPdf(docDefinition);

  return standardReport;
};
