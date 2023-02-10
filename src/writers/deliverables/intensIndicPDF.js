import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {
  getEvolution,
  getShortCurrentDateString,
  printValue,
} from "../../utils/Utils";
import metaIndics from "/lib/indics";

import {
  getIndicDescription,
  getKeySuppliers,
  getPercentageForConsumptionRows,
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
  comparativeData,
  chartLabel,
  download
) => {
  // ---------------------------------------------------------------
  const precision = metaIndics[indic].nbDecimals;
  const unitGrossImpact = metaIndics[indic].unitAbsolute;

  const indicDescription = getIndicDescription(indic);

  const branchProductionEvolution = getEvolution(
    comparativeData.production.divisionFootprint.indicators[indic].value,
    comparativeData.production.trendsFootprint.indicators[indic].data.at(-1)
      .value
  );

  const branchProductionTarget = getEvolution(
    comparativeData.production.trendsFootprint.indicators[indic].data[0].value,
    comparativeData.production.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value
  );

  const {
    production,
    revenue,
    intermediateConsumption,
    capitalConsumption,
    netValueAdded,
  } = financialData.aggregates;

  const firstMostImpactfulCompanies = sortExpensesByFootprintIndicator(
    financialData.companies,
    indic,
    "desc"
  ).slice(0, 2);

  const scdMostImpactfulCompanies = sortExpensesByFootprintIndicator(
    financialData.companies,
    indic,
    "desc"
  ).slice(2, 4);

  // Get chart canvas and encode it to import in document

  const canvasChart = document.getElementById("part-" + indic);
  const chartImage = canvasChart.toDataURL("image/png");

  const trendChart = document.getElementById("trend-prd-" + indic);
  const trendImage = trendChart.toDataURL("image/png");

  // ---------------------------------------------------------------

  const totalRevenue = revenue.amount;

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
    footer: function (currentPage, pageCount) {
      return {
        columns: [
          {
            text: "Edité le " + getShortCurrentDateString(),
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
            x: 20,
            y: 35,
            w: pageSize.width - 40,
            h: pageSize.height - 65,
            color: "#FFFFFF",
            r: 10,
          },
          // BOXES
          {
            type: "rect",
            x: 30,
            y: 90,
            w: 125,
            h: 60,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 167,
            y: 90,
            w: 125,
            h: 60,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 302,
            y: 90,
            w: 125,
            h: 60,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 438,
            y: 90,
            w: 125,
            h: 60,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // Box Vue de vos Soldes Intermediaires de Gestion
          {
            type: "rect",
            x: 30,
            y: 180,
            w: 535,
            h: 200,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 330,
            y: 260,
            w: 230,
            h: 120,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            color: "#FFFFFF",
            r: 10,
          },
          // Box Fournisseurs clés
          {
            type: "rect",
            x: 30,
            y: 410,
            w: 490,
            h: 70,
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
        columnGap: 30,
        columns: [
          {
            margin: [0, 20, 0, 0],
            width: "25%",
            alignment: "center",
            stack: [
              {
                text: printValue(totalRevenue, 0) + "€",
                style: "numbers",
              },
              {
                text: "de chiffre d'affaires",
              },
            ],
          },
          {
            margin: [0, 20, 0, 0],
            width: "25%",
            alignment: "center",
            stack: [
              {
                columnGap: 0,
                columns: [
                  {
                    width: "auto",
                    text: production.footprint.indicators[indic].value,
                    style: "numbers",
                    alignment: "right",
                  },
                  {
                    text: unit,
                    bold: true,
                    margin: [0, 8, 0, 0],
                  },
                ],
              },
              {
                text: " d'" + label,
              },
            ],
          },
          {
            margin: [0, 20, 0, 0],
            width: "25%",
            alignment: "center",
            stack: [
              {
                text: printValue(
                  production.footprint.indicators[indic].getGrossImpact(
                    production.amount
                  ),
                  precision
                ),
                style: "numbers",
                margin: [0, 0, 0, 0],
              },
              {
                text: "de " + unitGrossImpact,
                bold: true,
                margin: [0, 0, 0, 5],
              },
              {
                text: "liés à la production",
              },
            ],
          },
          {
            margin: [0, 10, 0, 0],
            width: "25%",
            alignment: "center",
            stack: [
              {
                text: "Ce qui représente",
                background: "#FFFFFF",
              },
              {
                text: "11 Millions",
                style: "numbers",
              },
              {
                text: " de Lorem Ipsum ",
              },
            ],
          },
        ],
      },
      {
        text: "\tImpacts de vos Soldes Intermédiaires de Gestion\t",
        style: "h2",
        alignment: "center",
        margin: [0, 30, 0, 20],
        background:"#FFFFFF"
      },
      {
        columns: [
          {
            width: "60%",
            columnGap : 50,
            columns: [
              {
                width: "30%",
                stack: [
                  {
                    layout: "noBorders",
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          {
                            text: "",
                            fillColor: "#191558",
                          },
                          {
                            text: "Consommations intermédiaires",
                            fontSize: 7,
                            bold: true,
                          },
                        ],
                      ],
                    },
                  },
                  {
                    margin: [0, 5, 0, 0],
                    layout: "noBorders",
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          {
                            text: "",
                            fillColor: "#8c8aab",
                          },
                          {
                            text: "Consommations de capital fixe",
                            fontSize: 7,
                            bold: true,
                          },
                        ],
                      ],
                    },
                  },
                  {
                    margin: [0, 5, 0, 0],
                    layout: "noBorders",
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          {
                            text: "",
                            fillColor: "#fb7a7f",
                          },
                          {
                            text: "Valeur ajoutée nette",
                            fontSize: 7,
                            bold: true,
                          },
                        ],
                      ],
                    },
                  },
                ],
              },
              {
                width: 150,
                image: chartImage,
              },
            ],
          },
          {
            margin: [0, 30, 25, 0],
            stack: [
              {
                text: "\tdont les comptes de charges les plus impactants \t",
                style: "h2",
                fontSize: 10,
                alignment: "center",
              },
              ///
              {
                table: {
                  heights: [10, 10, 10, 10],
                  body: [
                    ...getPercentageForConsumptionRows(
                      intermediateConsumption.amount,
                      financialData.getIntermediateConsumptionsAggregates()
                    ),
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
        ],
      },
      // KEY SUPPLIERS
      {
        text: "Les fournisseurs clés",
        style: "h2",
        alignment: "center",
        margin: [0, 35, 0, 0],
        background: "#FFFFFF",
      },
      {
        margin: [0, 10, 0, 0],
        columns: [
          {
            columnGap: 20,
            columns: [
              ...getKeySuppliers(firstMostImpactfulCompanies, indic, unit),
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
              ...getKeySuppliers(scdMostImpactfulCompanies, indic, unit),
            ],
          },
        ],
      },
      // TABLE SIG
      {
        margin: [0, 30, 0, 10],
        columns: [
          {
            width: "66%",
            style: "table",
            table: {
              body: [
                // HEADER
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
                    text: "Impact",
                    border: [false, false, true, false],
                  },
                  {
                    text: "Incertitude",
                    border: [false, false, true, false],
                  },
                ],
                // ROWS
                [
                  {
                    text: "Production",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    text: printValue(production.amount, 0) + " €",
                    margin: [2, 6, 2, 6],
                    alignment: "left",
                  },
                  {
                    columns: [
                      {
                        text: [
                          {
                            text:
                              printValue(
                                production.footprint.indicators[indic].value,
                                precision
                              ) + " ",
                          },
                          { text: unit, fontSize: "5" },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    columns: [
                      {
                        text: [
                          {
                            text:
                              printValue(
                                production.footprint.indicators[
                                  indic
                                ].getGrossImpact(production.amount),
                                precision
                              ) + " ",
                          },
                          { text: unitGrossImpact, fontSize: "5" },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    text:
                      printValue(
                        production.footprint.indicators[indic].uncertainty,
                        0
                      ) + " %",
                    fontSize: "5",
                    alignment: "right",
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
                            text:
                              printValue(
                                intermediateConsumption.footprint.indicators[
                                  indic
                                ].value,
                                precision
                              ) + " ",
                          },
                          { text: unit, fontSize: "5" },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    columns: [
                      {
                        text: [
                          {
                            text:
                              printValue(
                                intermediateConsumption.footprint.indicators[
                                  indic
                                ].getGrossImpact(
                                  intermediateConsumption.amount
                                ),
                                precision
                              ) + " ",
                          },
                          { text: unitGrossImpact, fontSize: "5" },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    text:
                      printValue(
                        intermediateConsumption.footprint.indicators[indic]
                          .uncertainty,
                        0
                      ) + " %",
                    fontSize: "5",
                    alignment: "right",
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
                            text:
                              printValue(
                                capitalConsumption.footprint.indicators[indic]
                                  .value,
                                precision
                              ) + " ",
                          },
                          { text: unit, fontSize: "5" },
                        ],
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: [
                          {
                            text:
                              printValue(
                                capitalConsumption.footprint.indicators[
                                  indic
                                ].getGrossImpact(capitalConsumption.amount),
                                precision
                              ) + " ",
                          },
                          { text: unitGrossImpact, fontSize: "5" },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    text:
                      printValue(
                        capitalConsumption.footprint.indicators[indic]
                          .uncertainty,
                        0
                      ) + " %",
                    fontSize: "5",
                    alignment: "right",
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
                            text:
                              printValue(
                                netValueAdded.footprint.indicators[indic].value,
                                precision
                              ) + " ",
                          },
                          { text: unit, fontSize: "5" },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    columns: [
                      {
                        text: [
                          {
                            text:
                              printValue(
                                netValueAdded.footprint.indicators[
                                  indic
                                ].getGrossImpact(netValueAdded.amount),
                                precision
                              ) + " ",
                          },
                          { text: unitGrossImpact, fontSize: "5" },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 6, 2, 6],
                  },
                  {
                    text:
                      printValue(
                        netValueAdded.footprint.indicators[indic].uncertainty,
                        0
                      ) + " %",
                    fontSize: "5",
                    alignment: "right",
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
          {
            text: "Ecart par rapport à la moyenne de la branche",
            alignment: "center",
            bold: true,
            fontSize: "7",
          },
        ],
      },

      {
        columnGap: 20,
        columns: [
          {
            width: "33%",
            stack: [
              {
                text: branchProductionEvolution + " % ",
                alignment: "center",
                style: "numbers",
                color: "#ffb642",
              },
              {
                text: "de baisse d'intensité de la branche depuis 2010",
                alignment: "center",
                margin: [0, 2, 0, 10],
                bold: true,
              },
              {
                text: branchProductionTarget + " % ",
                alignment: "center",
                fontSize: "9",
                style: "numbers",
                color: "#ffb642",
              },
              {
                text: "objectif de baisse de la branche pour correspondre aux objectifs 2030",
                alignment: "center",
                margin: [0, 2, 0, 0],
              },
            ],
          },

          {
            width: "*",
            stack: [
              {
                text: chartLabel,
                bold: true,
                fontSize: 8,
                margin: [0, 10, 0, 10],
              },
              {
                width: 250,
                image: trendImage,
                alignment: "left",
              },
            ],
          },
        ],
      },
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
        margin: [0, 5, 0, 0],
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
        margin: [0, 0, 0, 5],
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
        pdfMake.createPdf(docDefinition).open();
        //saveAs(blob, `${documentTitle}.pdf`);
      }

      resolve(blob);
    });
  });
};
