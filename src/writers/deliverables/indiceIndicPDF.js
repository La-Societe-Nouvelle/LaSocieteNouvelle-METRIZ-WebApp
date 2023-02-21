// PDF make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
// Libs
import metaIndics from "/lib/indics";
// Utils
import { getShortCurrentDateString, printValue } from "../../utils/Utils";
import {
  currentAnnualReduction,
  getIndicDescription,
  getKeySuppliers,
  getUncertaintyDescription,
  loadFonts,
  sortExpensesByFootprint,
  targetAnnualReduction,
} from "./utils/utils";

// --------------------------------------------------------------------------
//  Intensity Indicator Report
// --------------------------------------------------------------------------
pdfMake.vfs = pdfFonts.pdfMake.vfs;

//Call function to load fonts
loadFonts();

export const createIndiceIndicatorPDF = (
  title,
  libelleGrandeur,
  year,
  legalUnit,
  indic,
  unit,
  financialData,
  comparativeData,
  chartLabel,
  download
) => {
  // ---------------------------------------------------------------
  // utils

  const indicDescription = getIndicDescription(indic);
  const branchProductionTarget = targetAnnualReduction(
    comparativeData.production.targetDivisionFootprint.indicators[indic].data
  );

  const branchProductionEvolution = currentAnnualReduction(
    comparativeData.production.trendsFootprint.indicators[indic].data,
    year
  );

  const firstMostImpactfulCompanies = sortExpensesByFootprint(
    financialData.companies,
    indic,
    "desc"
  ).slice(0, 2);

  const scdMostImpactfulCompanies = sortExpensesByFootprint(
    financialData.companies,
    indic,
    "desc"
  ).slice(2, 4);

  const uncertaintyText = getUncertaintyDescription(
    "indice",
    production.footprint.indicators[indic].uncertainty
  );

  // ---------------------------------------------------------------
  // Variables
  const precision = metaIndics[indic].nbDecimals;

  const {
    production,
    revenue,
    netValueAdded,
    intermediateConsumption,
    capitalConsumption,
  } = financialData.aggregates;

  const totalRevenue = revenue.amount;

  // ---------------------------------------------------------------
  // Get chart canvas and encode it to import in document

  const deviationChart = document.getElementById("deviationChart-" + indic);
  const deviationImage = deviationChart.toDataURL("image/png");

  const trendChart = document.getElementById("trend-prd-" + indic);
  const trendImage = trendChart.toDataURL("image/png");

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
    "Fiche_" +
    indic.toUpperCase() +
    "_" +
    year +
    "-" +
    legalUnit.replaceAll(" ", "");

  // ---------------------------------------------------------------
  // PDF Content and Layout
  const docDefinition = {
    pageSize: pageSize,
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
    footer: function () {
      return {
        columns: [
          {
            text: "Edité le " + getShortCurrentDateString(),
            margin: [20, 25, 0, 0],
          },
        ],
        fontSize: 7,
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
            x: margins.left - 20,
            y: margins.top - 15,
            w: pageSize.width - margins.left - margins.right + 40,
            h: pageSize.height - margins.top - 15,
            color: "#FFFFFF",
            r: 10,
          },
          // Key Figures
          {
            type: "rect",
            x: 70,
            y: 105,
            w: 200,
            h: 65,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 325,
            y: 105,
            w: 200,
            h: 65,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // SIG
          {
            type: "rect",
            x: 30,
            y: 245,
            w: 535,
            h: 100,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // Key Suppliers
          {
            type: "rect",
            x: 30,
            y: 370,
            w: 535,
            h: 70,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // Key Figure + Chart
          {
            type: "rect",
            x: 30,
            y: 610,
            w: 180,
            h: 100,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 220,
            y: 610,
            w: 345,
            h: 160,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
        ],
      };
    },
    info: {
      title: documentTitle,
      author: legalUnit,
      subject: "Plaquette de résultat",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content: [
      { text: "Rapport - " + title, style: "header" },

      //--------------------------------------------------
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
                margin: [0, 5, 0, 0],
              },
            ],
          },

          {
            margin: [0, 30, 0, 30],
            stack: [
              {
                margin: [0, 5, 0, 5],
                text:
                  printValue(
                    netValueAdded.footprint.indicators[indic].value,
                    precision
                  ) +
                  " " +
                  unit,
                alignment: "center",
                style: "numbers",
              },
              {
                margin: [30, 0, 30, 0],
                text: "d'" + libelleGrandeur,
                alignment: "center",
              },
            ],
          },
        ],
      },
      //--------------------------------------------------
      {
        margin: [40, 0, 40, 0],
        text: indicDescription,
        alignment: "center",
      },
      //--------------------------------------------------
      // Box "Soldes Intermédiaires de Gestion"
      {
        text: "\tVue de vos Soldes Intermédiaires de Gestion\t",
        style: "h2",
      },
      {
        margin: [0, 10, 0, 10],
        columns: [
          {
            width: "25%",
            stack: [
              {
                text:
                  printValue(production.footprint.indicators[indic].value, 1) +
                  "%*",
                alignment: "center",
                bold: true,
                fontSize: 24,
                color: "#fa595f",
              },
              {
                text: "Taux associé",
                alignment: "center",
                bold: true,
                fontSize: 8,
                margin: [0, 5, 0, 0],
              },
              {
                text: "à la valeur produite",
                alignment: "center",
                bold: true,
                fontSize: 8,
              },
            ],
          },
          {
            stack: [
              {
                text:
                  printValue(
                    intermediateConsumption.footprint.indicators[indic].value,
                    1
                  ) + "%",
                alignment: "center",
                bold: true,
                fontSize: 24,
              },
              {
                text: "Consommations",
                alignment: "center",
                bold: true,
                fontSize: 8,
                margin: [0, 5, 0, 0],
              },
              {
                text: "intermédiaires",
                alignment: "center",
                bold: true,
                fontSize: 8,
              },
            ],
          },
          {
            stack: [
              {
                text:
                  printValue(
                    capitalConsumption.footprint.indicators[indic].value,
                    1
                  ) + "%",
                alignment: "center",
                bold: true,
                fontSize: 24,
              },
              {
                text: "Consommations",
                alignment: "center",
                bold: true,
                fontSize: 8,
                margin: [0, 5, 0, 0],
              },
              {
                text: "de capital fixe",
                alignment: "center",
                bold: true,
                fontSize: 8,
              },
            ],
          },
          {
            stack: [
              {
                text:
                  printValue(
                    netValueAdded.footprint.indicators[indic].value,
                    1
                  ) + "%",
                alignment: "center",
                bold: true,
                fontSize: 24,
              },
              {
                text: "Valeur ajoutée",
                alignment: "center",
                bold: true,
                fontSize: 8,
                margin: [0, 5, 0, 0],
              },
              {
                text: "nette",
                alignment: "center",
                bold: true,
                fontSize: 8,
              },
            ],
          },
        ],
      },
      //--------------------------------------------------
      // Key Suppliers
      {
        text: "Les fournisseurs clés",
        style: "h2",
        alignment: "center",
        margin: [0, 25, 0, 0],
        background: "#FFFFFF",
      },
      {
        margin: [0, 10, 0, 0],
        columns: [
          {
            columnGap: 20,
            columns: [
              ...getKeySuppliers(
                firstMostImpactfulCompanies,
                indic,
                unit,
                precision
              ),
            ],
          },
        ],
      },
      {
        margin: [0, 10, 0, 0],
        columns: [
          {
            columnGap: 20,
            columns: [
              ...getKeySuppliers(
                scdMostImpactfulCompanies,
                indic,
                unit,
                precision
              ),
            ],
          },
        ],
      },
      //--------------------------------------------------
      // SIG Table
      {
        margin: [0, 20, 0, 10],
        columns: [
          {
            width: "*",
            style: "table",
            table: {
              body: [
                // header
                [
                  {
                    text: "",
                    border: [false, false, true, false],
                  },
                  {
                    text: "Montant",
                    border: [false, false, true, false],
                  },
                  {
                    text: "Empreinte",

                    border: [false, false, true, false],
                  },

                  {
                    text: "Incert.*",
                    border: [false, false, true, false],
                    alignment: "center",
                  },
                ],
                // rows
                [
                  {},
                  {},
                  { text: unit, fontSize: "5", alignment: "right" },
                  { text: "%", fontSize: "5", alignment: "center" },
                ],
                [
                  {
                    text: "Production",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    text: printValue(production.amount, 0) + " €",
                    margin: [2, 6, 2, 6],
                    alignment: "right",
                  },
                  {
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              production.footprint.indicators[indic].value,
                              precision
                            ),
                          },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },

                  {
                    text: printValue(
                      production.footprint.indicators[indic].uncertainty,
                      0
                    ),
                    fontSize: "5",
                    alignment: "center",
                    margin: [2, 6, 2, 6],
                  },
                ],
                [
                  {
                    text: "Consommations intermédiaires",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    text: printValue(intermediateConsumption.amount, 0) + " €",
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },

                  {
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              intermediateConsumption.footprint.indicators[
                                indic
                              ].value,
                              precision
                            ),
                          },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    text: printValue(
                      intermediateConsumption.footprint.indicators[indic]
                        .uncertainty,
                      0
                    ),
                    fontSize: "5",
                    alignment: "center",
                    margin: [2, 6, 2, 6],
                  },
                ],
                [
                  {
                    text: "Consommations de capital fixe",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    text: printValue(capitalConsumption.amount, 0) + " €",
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              capitalConsumption.footprint.indicators[indic]
                                .value,
                              precision
                            ),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    text: printValue(
                      capitalConsumption.footprint.indicators[indic]
                        .uncertainty,
                      0
                    ),
                    fontSize: "5",
                    alignment: "center",
                    margin: [2, 6, 2, 6],
                  },
                ],
                [
                  {
                    text: "Valeur ajoutée nette",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    text: printValue(netValueAdded.amount, 0) + " €",
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              netValueAdded.footprint.indicators[indic].value,
                              precision
                            ),
                          },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },

                  {
                    text: printValue(
                      netValueAdded.footprint.indicators[indic].uncertainty,
                      0
                    ),
                    fontSize: "5",
                    alignment: "center",
                    margin: [2, 6, 2, 6],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: function (i, node) {
                return i === 0 || i === node.table.body.length ? 0 : 2;
              },

              vLineWidth: function (i, node) {
                return i === 0 || i === node.table.widths.length ? 0 : 2;
              },
              vLineColor: function (i, node) {
                return "#f0f0f8";
              },
              hLineColor: function (i, node) {
                return "#f0f0f8";
              },
            },
          },
          //--------------------------------------------------
          //Deviation chart

          {
            width: "auto",
            stack: [
              {
                text: "Ecart par rapport à la moyenne de la branche",
                alignment: "center",
                bold: true,
                fontSize: "7",
                margin: [0, 0, 0, 20],
              },
              {
                width: 245,
                image: deviationImage,
              },
            ],
          },
        ],
      },
      //--------------------------------------------------
      {
        columnGap: 40,
        columns: [
          //Left Box
          {
            width: "33%",
            margin: [0, 7, 0, 0],
            stack: [
              {
                text: branchProductionTarget
                  ? branchProductionTarget + " %"
                  : "-",
                alignment: "center",
                style: "numbers",
                color: "#ffb642",
              },
              {
                text: branchProductionTarget
                  ? "Objectif annuel de la branche"
                  : "Aucun objectif défini pour la branche",
                alignment: "center",
                margin: [0, 2, 0, 10],
                bold: true,
              },
              {
                text: branchProductionEvolution + " % ",
                alignment: "center",
                fontSize: "10",
                style: "numbers",
                color: "#ffb642",
              },
              {
                text: "Evolution observée pour l'année de l'exercice (Donnée estimée) ",
                alignment: "center",
                fontSize: "8",
                margin: [0, 2, 0, 0],
              },
            ],
          },
          //Right Box
          {
            width: "auto",
            stack: [
              {
                text: chartLabel,
                bold: true,
                fontSize: 7,
                margin: [0, 7, 0, 7],
              },
              {
                width: 250,
                image: trendImage,
              },
            ],
          },
        ],
      },
      //--------------------------------------------------
      {
        text: "* " + uncertaintyText,
        fontSize: 6,
        italics: true,
        font: "Roboto",
        margin: [0, 20, 0, 0],
      },
      ,
    ],
    //--------------------------------------------------
    // Style
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
      numbers: {
        fontSize: 18,
        bold: true,
      },
      table: {
        fontSize: 7,
        bold: true,
        alignment: "center",
        font: "Roboto",
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
