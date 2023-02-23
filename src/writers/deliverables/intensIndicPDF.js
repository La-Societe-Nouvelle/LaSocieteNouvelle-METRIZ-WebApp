import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { getShortCurrentDateString, printValue } from "../../utils/Utils";
import metaIndics from "/lib/indics";

import {
  getPercentageForConsumptionRows,
  getUncertaintyDescription,
  loadFonts,
  sortCompaniesByImpact,
  targetAnnualReduction,
  getIntensKeySuppliers,
  calculateAverageEvolutionRate,
} from "./utils/utils";

// --------------------------------------------------------------------------

pdfMake.vfs = pdfFonts.pdfMake.vfs;

//Call function to load fonts
loadFonts();

export const createIntensIndicatorPDF = (
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

  const {
    production,
    revenue,
    intermediateConsumption,
    capitalConsumption,
    netValueAdded,
  } = financialData.aggregates;

  const precision = metaIndics[indic].nbDecimals;
  const unitGrossImpact = metaIndics[indic].unitAbsolute;

  // UTILS
  const branchProductionTarget = targetAnnualReduction(
    comparativeData.production.targetDivisionFootprint.indicators[indic].data
  );


  let lastEstimatedData = comparativeData.production.trendsFootprint.indicators[indic].data.filter((item) => item.flag == "e" && item.year <= year);
  lastEstimatedData = lastEstimatedData.slice(Math.max(lastEstimatedData.length - 2, 1));
  
    
  const branchProductionEvolution = calculateAverageEvolutionRate(lastEstimatedData);

  
  const firstMostImpactfulCompanies = sortCompaniesByImpact(
    financialData.companies,
    indic,
    "desc"
  ).slice(0, 2);

  const scdMostImpactfulCompanies = sortCompaniesByImpact(
    financialData.companies,
    indic,
    "desc"
  ).slice(2, 4);



  const intermediateConsumptionPart = getIntermediateConsumptionsPart(
    financialData,
    indic
  );

  const uncertaintyText = getUncertaintyDescription(
    "intensite",
    production.footprint.indicators[indic].uncertainty
  );

  // Get chart canvas and encode it to import in document

  const canvasChart = document.getElementById("part-" + indic);
  const chartImage = canvasChart.toDataURL("image/png");

  const deviationChart = document.getElementById("deviationChart-" + indic);
  const deviationImage = deviationChart.toDataURL("image/png");

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
    background: function (currentPage) {
      let canvas = [
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
      ];

      if (currentPage == 1) {
        canvas.push(
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
          // Box Empreintes de vos Soldes Intermediaires de Gestion
          {
            type: "rect",
            x: 30,
            y: 180,
            w: 535,
            h: 140,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          createBoxIntermediateConsumption(intermediateConsumptionPart),
          // Box Fournisseurs clés
          {
            type: "rect",
            x: 30,
            y: 340,
            w: 535,
            h: 70,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // Chiffre + graphique
          {
            type: "rect",
            x: 30,
            y: 590,
            w: 180,
            h: 140,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 220,
            y: 590,
            w: 345,
            h: 165,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          }
        );
      }

      return {
        canvas: canvas,
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
      { text:  label, style: "header" },
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
                fontSize: 9,
              },
            ],
          },
          {
            margin: [0, 20, 0, 0],
            width: "25%",
            stack: [
              {
                alignment: "center",
                text: [
                  {
                    width: "auto",
                    text: production.footprint.indicators[indic].value + " ",
                    style: "numbers",
                  },
                  {
                    text: unit,
                    bold: true,
                  },
                ],
              },
              {
                margin: [0, 5, 0, 0],
                text: "d'" + label,
                alignment: "center",
                fontSize: 9,
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
                fontSize: 9,
              },
            ],
          },
          {
            margin: [0, 20, 0, 0],
            width: "25%",
            alignment: "center",
            stack: [
              {
                alignment: "center",
                text: [
                  {
                    width: "auto",
                    text: branchProductionTarget
                      ? branchProductionTarget + " %"
                      : "-",
                    style: "numbers",
                  },
                ],
              },
              {
                margin: [0, 5, 0, 0],
                text: branchProductionTarget
                  ? "Objectif annuel de la branche"
                  : "Aucun objectif défini pour la branche",
                fontSize: 9,
              },
            ],
          },
        ],
      },
      {
        text: "\tEmpreintes de vos Soldes Intermédiaires de Gestion\t",
        style: "h2",
        alignment: "center",
        margin: [0, 30, 0, 20],
        background: "#FFFFFF",
      },
      {
        columnGap: 45,
        columns: [
          {
            width: "60%",
            columns: [
              {
                stack: [
                  {
                    margin: [0, 20, 0, 0],
                    layout: "noBorders",
                    table: {
                      widths: [10, "auto"],
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
                      widths: [10, "auto"],
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
                      widths: [10, "auto"],
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
                width: 100,
                image: chartImage,
              },
            ],
          },
          createChargesImpactContent(
            intermediateConsumptionPart,
            financialData.aggregates.intermediateConsumption,
            financialData,
            indic
          ),
        ],
      },
      // KEY SUPPLIERS
      {
        text: "\tLes fournisseurs clés\t",
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
              ...getIntensKeySuppliers(
                firstMostImpactfulCompanies,
                indic,
                unit,
                unitGrossImpact,
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
              ...getIntensKeySuppliers(
                scdMostImpactfulCompanies,
                indic,
                unit,
                unitGrossImpact,
                precision
              ),
            ],
          },
        ],
      },
      // TABLE SIG
      {
        margin: [0, 25, 0, 10],
        columns: [
          {
            width: "*",
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
                    text: "Incert.*",
                    border: [false, false, true, false],
                    alignment: "center",
                  },
                ],
                // ROWS
                [
                  {},
                  {},
                  { text: "en " + unit, fontSize: "5", alignment: "center" },
                  {
                    text: "en " + unitGrossImpact,
                    fontSize: "5",
                    alignment: "center",
                  },
                  { text: "en " + "%", fontSize: "5", alignment: "center" },
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
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              production.footprint.indicators[
                                indic
                              ].getGrossImpact(production.amount),
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
                    text: "Conso. intermédiaires",
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
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              intermediateConsumption.footprint.indicators[
                                indic
                              ].getGrossImpact(intermediateConsumption.amount),
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
                    text: "Conso. de capital fixe",
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
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              capitalConsumption.footprint.indicators[
                                indic
                              ].getGrossImpact(capitalConsumption.amount),
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
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              netValueAdded.footprint.indicators[
                                indic
                              ].getGrossImpact(netValueAdded.amount),
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
          {
            width: "auto",
            stack: [
              {
                text: "Ecart par rapport à la moyenne de la branche",
                alignment: "center",
                bold: true,
                fontSize: "7",
                margin: [0, 0, 0, 14],
              },
              {
                width: 245,
                image: deviationImage,
              },
            ],
          },
        ],
      },

      {
        columnGap: 40,
        columns: [
          {
            width: "33%",
            margin: [0, 10, 0, 0],
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
                text: "Taux d'évolution moyen observé entre " + lastEstimatedData[0].year + " et " + lastEstimatedData[1].year ,
                alignment: "center",
                fontSize: "8",
                margin: [0, 2, 0, 0],
              },
            ],
          },
          {
            width: "auto",
            stack: [
              {
                text: chartLabel,
                bold: true,
                fontSize: 7,
                margin: [0, 10, 0, 10],
              },
              {
                width: 260,
                image: trendImage,
              },
            ],
          },
        ],
      },
      {
        text: "* " + uncertaintyText,
        fontSize: 6,
        italics: true,
        margin: [0, 20, 0, 0],
        font: "Roboto",
      },
    ],
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
        fontSize: 6,
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

function createChargesImpactContent(
  intermediateConsumptionPart,
  intermediateConsumption,
  financialData,
  indic
) {
  let content = {
    stack: [
      // Arrow
      {
        svg: '<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" overflow="hidden"><defs><clipPath id="clip0"><rect x="501" y="221" width="60" height="60"/></clipPath></defs><g clip-path="url(#clip0)" transform="translate(-501 -221)"><path d="M518.001 229.075 517.981 231.688C517.981 232.024 518.239 232.281 518.575 232.281 518.911 232.281 519.169 232.024 519.169 231.688L519.208 227.729C519.208 227.591 519.169 227.472 519.07 227.353 519.07 227.333 519.05 227.333 519.03 227.314 519.01 227.294 519.01 227.274 518.971 227.254 518.971 227.254 518.951 227.234 518.931 227.234 518.931 227.234 518.911 227.215 518.892 227.215 518.812 227.155 518.714 227.135 518.615 227.135L514.656 227.096C514.32 227.096 514.062 227.353 514.062 227.69 514.062 228.026 514.32 228.283 514.656 228.283L517.11 228.303C514.953 231.41 511.925 232.895 508.105 232.697 506.225 232.578 504.384 232.123 502.663 231.331 502.366 231.193 502.029 231.311 501.891 231.608 501.752 231.885 501.851 232.242 502.148 232.4 503.989 233.251 505.987 233.766 508.026 233.884 510.935 234.043 515.013 233.33 518.001 229.075Z" fill="#191558"/></g></svg>',
        absolutePosition: { x: 330, y: 260 },
      },
      {
        text: "\tdont les comptes de charges les plus impactants\t",
        style: "h2",
        fontSize: 9,
        alignment: "center",
      },
      ///
      {
        table: {
          body: [
            ...getPercentageForConsumptionRows(
              intermediateConsumption.footprint.indicators[
                indic
              ].getGrossImpact(intermediateConsumption.amount),
              financialData.getIntermediateConsumptionsAggregates(),
              indic
            ),
          ],
          layout: {
            hLineWidth: function (i) {
              return i === 0 || i === 4 ? 2 : 1;
            },
            vLineWidth: function (i) {
              return i === 0 || i === 4 ? 2 : 1;
            },
            hLineColor: function (i) {
              return "white";
            },
            vLineColor: function (i) {
              return "white";
            },
          },
        },
      },
    ],
  };
  if (intermediateConsumptionPart > 40) {
    return content;
  }
}

function getIntermediateConsumptionsPart(financialData, indic) {
  let total =
    financialData.aggregates.intermediateConsumption.footprint.indicators[
      indic
    ].getGrossImpact(financialData.aggregates.intermediateConsumption.amount) +
    financialData.aggregates.capitalConsumption.footprint.indicators[
      indic
    ].getGrossImpact(financialData.aggregates.capitalConsumption.amount) +
    financialData.aggregates.netValueAdded.footprint.indicators[
      indic
    ].getGrossImpact(financialData.aggregates.netValueAdded.amount);

  const intermediateConsumptionPart =
    (financialData.aggregates.intermediateConsumption.footprint.indicators[
      indic
    ].getGrossImpact(financialData.aggregates.intermediateConsumption.amount) /
      total) *
    100;

  return intermediateConsumptionPart;
}

function createBoxIntermediateConsumption(intermediateConsumptionPart) {
  let rect;

  if (intermediateConsumptionPart > 40) {
    rect = {
      type: "rect",
      x: 360,
      y: 230,
      w: 200,
      h: 75,
      lineWidth: 2,
      lineColor: "#f1f0f4",
      color: "#FFFFFF",
      r: 10,
    };
  } else {
    rect = {
      type: "rect",
      x: 310,
      y: 240,
      w: 0,
      h: 0,
      lineColor: "#ffffff",
      color: "#FFFFFF",
    };
  }

  return rect;
}
