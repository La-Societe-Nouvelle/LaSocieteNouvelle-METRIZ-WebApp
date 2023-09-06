// PDF make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Lib
import divisions from "/lib/divisions";
import metaIndics from "/lib/indics";

// Utils
import { getShortCurrentDateString } from "/src/utils/periodsUtils";
import {
  calculateAverageEvolutionRate,
  getIndicDescription,
  getKeySuppliers,
  getUncertaintyDescription,
  loadFonts,
  sortProvidersByImpact,
  targetAnnualReduction,
} from "./deliverablesUtils";
import { printValue } from "../Utils";

// --------------------------------------------------------------------------
//  Intensity Indicator Report
// --------------------------------------------------------------------------
pdfMake.vfs = pdfFonts.pdfMake.vfs;

//Call function to load fonts
loadFonts();

export const buildSummaryReportIndexIndic = ({
  session,
  indic,
  period
}) => {
  // ---------------------------------------------------------------
  // Variables

  const { libelle, unit, libelleGrandeur } = metaIndics[indic];

  const {
    legalUnit,
    financialData,
    comparativeData
  } = session;

  const corporateName = legalUnit.corporateName;
  const currentPeriod = period.periodKey.slice(2);
  const precision = metaIndics[indic].nbDecimals;
  const divisionName = divisions[comparativeData.activityCode];

  const { revenue } = financialData.productionAggregates;

  const {
    production,
    netValueAdded,
    intermediateConsumptions,
    fixedCapitalConsumptions,
  } = financialData.mainAggregates;

  const totalRevenue = revenue.periodsData[period.periodKey].amount;

  // ---------------------------------------------------------------
  // utils

  const indicDescription = getIndicDescription(indic);

  let branchProductionTarget = null;

  if (comparativeData.production.division.target.data[indic]) {
    branchProductionTarget = targetAnnualReduction(
      comparativeData.production.division.target.data[indic]
    );
  }

  let lastEstimatedData = comparativeData.production.division.history.data[indic]
    .filter((item) => item.year <= currentPeriod);

  lastEstimatedData = lastEstimatedData.slice(
    Math.max(lastEstimatedData.length - 2, 1)
  );

  const branchProductionEvolution =
    calculateAverageEvolutionRate(lastEstimatedData);

  const providers = financialData.providers.filter((provider) => {
    return Object.keys(provider.periodsData).some(
      (key) => key === period.periodKey
    );
  });

  const firstMostImpactfulCompanies = sortProvidersByImpact(
    providers,
    indic,
    "desc"
  ).slice(0, 2);

  const scdMostImpactfulCompanies = sortProvidersByImpact(
    providers,
    indic,
    "desc"
  ).slice(2, 4);

  const uncertaintyText = getUncertaintyDescription(
    "indice",
    production.periodsData[period.periodKey].footprint.indicators[indic]
      .uncertainty
  );

  // ---------------------------------------------------------------
  // Get chart canvas and encode it to import in document

  const deviationChart = document.getElementById(
    `deviation-chart-${indic}-print`
  );
  const deviationImage = deviationChart.toDataURL("image/png");

  const trendChart = document.getElementById(`trend-chart-${indic}-print`);
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
    currentPeriod +
    "-" +
    corporateName.replaceAll(" ", "");

  // ---------------------------------------------------------------
  // PDF Content and Layout
  const docDefinition = {
    pageSize: pageSize,
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
    header: {
      columns: [
        { text: corporateName, margin: [20, 15, 0, 0], bold: true },
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
            y: 90,
            w: 200,
            h: 65,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 325,
            y: 90,
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
            y: 220,
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
            y: 340,
            w: 535,
            h: 75,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // Target + Chart
          {
            type: "rect",
            x: 30,
            y: 602,
            w: 180,
            h: 140,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 220,
            y: 602,
            w: 345,
            h: 150,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
        ],
      };
    },
    info: {
      title: documentTitle,
      author: corporateName,
      subject: "Plaquette de résultat",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content: [
      { text: libelle, style: "header" },

      //--------------------------------------------------
      {
        margin: [0, 20, 0, 25],
        columns: [
          {
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
            stack: [
              {
                margin: [0, 5, 0, 5],
                text:
                  printValue(
                    revenue.periodsData[period.periodKey].footprint.indicators[
                      indic
                    ].value,
                    precision
                  ) +
                  " " +
                  unit,
                alignment: "center",
                style: "numbers",
              },
              {
                text:
                  indic == "idr"
                    ? "Rapport interdécile "
                    : "d'" + libelleGrandeur,
                alignment: "center",
              },
            ],
          },
        ],
      },
      //--------------------------------------------------
      {
        text: indicDescription,
        alignment: "center",
      },
      //--------------------------------------------------
      // Box "Soldes Intermédiaires de Gestion"
      {
        text: "\tEmpreintes de vos Soldes Intermédiaires de Gestion\t",
        style: "h2",
      },
      {
        margin: [0, 10, 0, 10],
        columns: [
          {
            width: "25%",
            stack: [
              {
                alignment: "center",
                bold: true,
                fontSize: 24,
                color: "#fa595f",
                text: [
                  {
                    text: printValue(
                      production.periodsData[period.periodKey].footprint
                        .indicators[indic].value,
                      precision
                    ),
                  },
                  {
                    text: indic == "idr" ? " " : "%",
                  },
                ],
              },
              {
                text: "Indice associé",
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
                alignment: "center",
                bold: true,
                fontSize: 24,
                text: [
                  {
                    text: printValue(
                      intermediateConsumptions.periodsData[period.periodKey]
                        .footprint.indicators[indic].value,
                      precision
                    ),
                  },
                  {
                    text: indic == "idr" ? " " : "%",
                  },
                ],
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
                alignment: "center",
                bold: true,
                fontSize: 24,
                text: [
                  {
                    text: printValue(
                      fixedCapitalConsumptions.periodsData[period.periodKey]
                        .footprint.indicators[indic].value,
                      precision
                    ),
                  },
                  {
                    text: indic == "idr" ? " " : "%",
                  },
                ],
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
                alignment: "center",
                bold: true,
                fontSize: 24,
                text: [
                  {
                    text: printValue(
                      netValueAdded.periodsData[period.periodKey].footprint
                        .indicators[indic].value,
                      precision
                    ),
                  },
                  {
                    text: indic == "idr" ? " " : "%",
                  },
                ],
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
        text: "\tFournisseurs clés\t",
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
        margin: [0, 25, 0, 0],
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
                  },
                  {
                    text: "Montant",
                  },
                  {
                    text: "Empreinte",
                  },

                  {
                    text: "Incert.*",
                    alignment: "center",
                  },
                ],
                // rows
                [
                  {},
                  {},
                  {
                    text: unit ? unit : "Rapport interdécile",
                    fontSize: "5",
                    alignment: "right",
                  },
                  { text: "%", fontSize: "5", alignment: "center" },
                ],
                [
                  {
                    text: "Production",
                    margin: [2, 7, 2, 8],
                    alignment: "left",
                  },
                  {
                    text:
                      printValue(
                        production.periodsData[period.periodKey].amount,
                        0
                      ) + " €",
                    margin: [2, 7, 2, 8],
                    alignment: "right",
                  },
                  {
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              production.periodsData[period.periodKey].footprint
                                .indicators[indic].value,
                              precision
                            ),
                          },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 7, 2, 8],
                  },

                  {
                    text: printValue(
                      production.periodsData[period.periodKey].footprint
                        .indicators[indic].uncertainty,
                      0
                    ),
                    fontSize: "5",
                    alignment: "center",
                    margin: [2, 7, 2, 8],
                  },
                ],
                [
                  {
                    text: "Cons. intermédiaires",
                    margin: [2, 7, 2, 8],
                    alignment: "left",
                  },
                  {
                    text:
                      printValue(
                        intermediateConsumptions.periodsData[period.periodKey]
                          .amount,
                        0
                      ) + " €",
                    alignment: "right",
                    margin: [2, 7, 2, 8],
                  },

                  {
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              intermediateConsumptions.periodsData[
                                period.periodKey
                              ].footprint.indicators[indic].value,
                              precision
                            ),
                          },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 7, 2, 8],
                  },
                  {
                    text: printValue(
                      intermediateConsumptions.periodsData[period.periodKey]
                        .footprint.indicators[indic].uncertainty,
                      0
                    ),
                    fontSize: "5",
                    alignment: "center",
                    margin: [2, 7, 2, 8],
                  },
                ],
                [
                  {
                    text: "Cons. de capital fixe",
                    alignment: "left",
                    margin: [2, 7, 2, 8],
                  },
                  {
                    text:
                      printValue(
                        fixedCapitalConsumptions.periodsData[period.periodKey]
                          .amount,
                        0
                      ) + " €",
                    alignment: "right",
                    margin: [2, 7, 2, 8],
                  },
                  {
                    alignment: "right",
                    margin: [2, 7, 2, 8],
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              fixedCapitalConsumptions.periodsData[
                                period.periodKey
                              ].footprint.indicators[indic].value,
                              precision
                            ),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    text: printValue(
                      fixedCapitalConsumptions.periodsData[period.periodKey]
                        .footprint.indicators[indic].uncertainty,
                      0
                    ),
                    fontSize: "5",
                    alignment: "center",
                    margin: [2, 7, 2, 8],
                  },
                ],
                [
                  {
                    text: "Valeur ajoutée nette",
                    alignment: "left",
                    margin: [2, 7, 2, 8],
                  },
                  {
                    text:
                      printValue(
                        netValueAdded.periodsData[period.periodKey].amount,
                        0
                      ) + " €",
                    alignment: "right",
                    margin: [2, 7, 2, 8],
                  },
                  {
                    columns: [
                      {
                        text: [
                          {
                            text: printValue(
                              netValueAdded.periodsData[period.periodKey]
                                .footprint.indicators[indic].value,
                              precision
                            ),
                          },
                        ],
                      },
                    ],
                    alignment: "right",
                    margin: [2, 7, 2, 8],
                  },

                  {
                    text: printValue(
                      netValueAdded.periodsData[period.periodKey].footprint
                        .indicators[indic].uncertainty,
                      0
                    ),
                    fontSize: "5",
                    alignment: "center",
                    margin: [2, 7, 2, 8],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: function (i, node) {
                return i === 0 || i === 1 ? 0 : 2;
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
            width: "*",
            stack: [
              {
                table: {
                  widths: ["100%"],
                  body: [
                    [
                      {
                        text: "Ecart par rapport à la moyenne de la branche",
                        width: "100%",
                        fontSize: "6",
                        bold: true,
                        alignment: "center",
                        font: "Roboto",
                        border: [false, false, false, true],
                      },
                    ],
                  ],
                },
                layout: {
                  hLineWidth: function (i, node) {
                    return 2;
                  },

                  hLineColor: function (i, node) {
                    return "#f0f0f8";
                  },
                  paddingTop: function (i, node) {
                    return 0;
                  },

                  paddingBottom: function (i, node) {
                    return 12;
                  },
                },
              },
              {
                margin: [0, 1, 0, 0],
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
            stack: [
              {
                text: "\tObjectif de la branche\t",
                style: "h2",
                alignment: "center",
                background: "#FFFFFF",
              },
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
                  ? "Objectif annuel"
                  : "Aucun objectif défini",
                alignment: "center",
                margin: [0, 2, 0, 10],
                bold: true,
              },
              {
                text:
                  branchProductionEvolution > 0
                    ? " + " + branchProductionEvolution + " % "
                    : branchProductionEvolution + " % ",
                alignment: "center",
                fontSize: "10",
                style: "numbers",
                color: "#ffb642",
              },
              {
                text:
                  "Taux d'évolution moyen observé entre " +
                  lastEstimatedData[0].year +
                  " et " +
                  lastEstimatedData[1].year,
                alignment: "center",
                fontSize: "8",
                margin: [0, 2, 0, 0],
              },
              {
                margin: [0, 15, 0, 0],
                fontSize: 6,
                text: [
                  {
                    text:
                      "Branche de référence : " +
                      comparativeData.activityCode +
                      " - ",
                  },
                  {
                    text: divisionName,
                  },
                ],
              },
            ],
          },
          //Right Box
          {
            width: "*",
            stack: [
              {
                text: "\tEvolution de la performance de la branche\t",
                style: "h2",
                alignment: "center",
                background: "#FFFFFF",
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
        fontSize: 6,
        bold: true,
        alignment: "center",
        font: "Roboto",
      },
    },
  };

  const summaryReport = pdfMake.createPdf(docDefinition);

  return summaryReport;
}