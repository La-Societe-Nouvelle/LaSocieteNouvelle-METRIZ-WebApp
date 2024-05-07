import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Lib
import divisions from "/lib/divisions";
import metaIndics from "/lib/indics";

// Exports Utils
import {
  getMostImpactfulExpenseAccountRows,
  getUncertaintyDescription,
  targetAnnualReduction,
  calculateAverageEvolutionRate,
  addUncertaintyText,
  getIndicDescription,
} from "../exportsUtils";

import {
  calculateAvailableWidth,
  createRectObject,
  generateFooter,
  generateHeader,
  getChartImageData,
  getDocumentInfo,
  loadFonts,
  definePDFStyles,
  rgbaToHex,
} from "../../../../../utils/exportsUtils";

// Utils
import { printValue } from "/src/utils/formatters";
import {
  getMostImpactfulExpensesPart,
  sortAccountByImpact,
} from "../../utils";

// PDF Config
import {
  pdfMargins,
  pdfPageSize,
  defaultPosition,
} from "../../../../../constants/pdfConfig";

// Colors
import { aggregatesChartColors } from "../../../../../constants/chartColors";

// --------------------------------------------------------------------------
//  Report for Intensity Indicator
// --------------------------------------------------------------------------
pdfMake.vfs = pdfFonts.pdfMake.vfs;

//Call function to load fonts
loadFonts();

export const buildSummaryReportIntensityIndic = async ({
  session,
  indic,
  period,
}) => {
  // ---------------------------------------------------------------
  const { legalUnit, financialData, comparativeData } = session;

  const corporateName = legalUnit.corporateName;
  const currentPeriod = period.periodKey.slice(2);

  const { revenue } = financialData.productionAggregates;

  const { production } = financialData.mainAggregates;

  const precision = metaIndics[indic].nbDecimals;
  const unitGrossImpact = metaIndics[indic].unitAbsolute;
  const divisionName = divisions[comparativeData.comparativeDivision];

  const { libelle, unit } = metaIndics[indic];

  // UTILS
  let branchProductionTarget = null;

  const target = comparativeData.production.division.target.data[indic];

  if (target.length) {
    const linearTarget = target.filter((data) => data.path == "LIN" && data.flag == "f");
    branchProductionTarget = targetAnnualReduction(
      linearTarget
    );
  }

  let lastEstimatedData = comparativeData.production.division.history.data[
    indic
  ].filter((item) => item.year <= currentPeriod);

  lastEstimatedData = lastEstimatedData.slice(
    Math.max(lastEstimatedData.length - 2, 1)
  );

  let expensesAccounts = financialData.externalExpensesAccounts
    .filter((account) => account.periodsData.hasOwnProperty(period.periodKey))
    .map((account) => {
      return {
        ...account.periodsData[period.periodKey],
        accountLib: account.accountLib,
      };
    });

  const mostImpactfulExpenses = sortAccountByImpact(
    expensesAccounts,
    period.periodKey,
    indic,
    "desc"
  ).slice(0, 3);

  const mostImpactfulExpenseAccountsPart = getMostImpactfulExpensesPart(
    mostImpactfulExpenses,
    production.periodsData[period.periodKey].footprint.indicators[
      indic
    ].getGrossImpact(production.periodsData[period.periodKey].amount),
    indic
  );

  const branchProductionEvolution = calculateAverageEvolutionRate(lastEstimatedData);

  // Part des consommations intermédiaires
  const intermediateConsumptionsPart = getIntermediateConsumptionsPart(
    financialData,
    indic,
    period
  );

  const uncertaintyText = getUncertaintyDescription(
    "intensite",
    production.periodsData[period.periodKey].footprint.indicators[indic]
      .uncertainty
  );

  // ---------------------------------------------------------------
  // Get charts canvas and encode it to import in document

  const chartIds = [
    `gross-impact-chart-${indic}-print`,
    `deviation-chart-${indic}-print`,
    `trend-chart-${indic}-print`,
  ];

  const chartImages = {};
  chartIds.forEach((id) => {
    chartImages[id] = getChartImageData(id);
  });

  // ---------------------------------------------------------------

  const totalRevenue = revenue.periodsData[period.periodKey].amount;

  // ---------------------------------------------------------------
  // PDF Content and Layout

  // ---------------------------------------------------------------
  // Document Property

  let positionY = 90;
  const availableWidth = await calculateAvailableWidth(pdfPageSize, pdfMargins);
  const figureKeyBoxWidth = 125;
  const figureKeyBoxHeight = 60;

  const keyFigureBoxes = [
    {
      x: 30,
      y: positionY,
      width: figureKeyBoxWidth,
      height: figureKeyBoxHeight,
    },
    {
      x: 167,
      y: positionY,
      width: figureKeyBoxWidth,
      height: figureKeyBoxHeight,
    },
    {
      x: 302,
      y: positionY,
      width: figureKeyBoxWidth,
      height: figureKeyBoxHeight,
    },
    {
      x: 438,
      y: positionY,
      width: figureKeyBoxWidth,
      height: figureKeyBoxHeight,
    },
  ];

  const docDefinition = {
    pageSize: pdfPageSize,
    pageMargins: [
      pdfMargins.left,
      pdfMargins.top,
      pdfMargins.right,
      pdfMargins.bottom,
    ],
    header: generateHeader(corporateName,legalUnit.siren, currentPeriod),
    footer: generateFooter,
    background: function (currentPage) {
      const canvas = [];
      // Background rectangles
      canvas.push(
        createRectObject(
          0,
          0,
          pdfPageSize.width,
          pdfPageSize.height,
          0,
          null,
          null,
          "#f1f0f4"
        ),
        createRectObject(
          20,
          35,
          pdfPageSize.width - 40,
          pdfPageSize.height - 65,
          0,
          null,
          10,
          "#FFFFFF"
        )
      );

      if (currentPage == 1) {
        // Key Figures
        keyFigureBoxes.forEach((box) => {
          canvas.push(
            createRectObject(
              box.x,
              box.y,
              box.width,
              box.height,
              1,
              "#f1f0f4",
              10,
              null
            )
          );
        });

        // Box Répartition des impacts de la production

        positionY += 135;
        canvas.push(
          createRectObject(
            defaultPosition.startX,
            positionY,
            availableWidth,
            130,
            1,
            "#f1f0f4",
            10,
            null
          )
        );

        if (intermediateConsumptionsPart > 40) {
          canvas.push(
            createRectObject(
              365,
              positionY + 20,
              195,
              75,
              1,
              "#f1f0f4",
              10,
              "#FFFFFF"
            )
          );
        }

        // Objectifs

        positionY += 330;

        canvas.push(
          createRectObject(
            defaultPosition.startX,
            positionY,
            180,
            180,
            1,
            "#f1f0f4",
            10,
            null
          )
        );
        canvas.push(
          createRectObject(220, positionY, 345, 180, 1, "#f1f0f4", 10, null)
        );
      }
      return {
        canvas: canvas,
      };
    },
    info: {
      info: getDocumentInfo("Plaquette", indic, corporateName, currentPeriod),
    },
    content: [
      // Header
      ...buildHeaderSection(
        libelle,
        totalRevenue,
        production,
        branchProductionTarget,
        indic,
        period,
        unit,
        precision,
        unitGrossImpact
      ),
      //--------------------------------------------------
      ...buildProductionImpactSection(
        intermediateConsumptionsPart,
        mostImpactfulExpenseAccountsPart,
        indic,
        chartImages
      ),

      //--------------------------------------------------
      // SIG Table
      {
        margin: [0, 40, 0, 25],
        columns: [
          {
            ...buildSIGTableSection(
              financialData.mainAggregates,
              period,
              indic
            ),
          },
          //--------------------------------------------------
          //Deviation chart
          {
            ...buildDeviationChartSection(
              chartImages[`deviation-chart-${indic}-print`]
            ),
          },
        ],
      },

      //-------------------------------------------------
      // Branch Performance
      {
        ...buildBranchPerformanceSection(
          branchProductionTarget,
          branchProductionEvolution,
          lastEstimatedData,
          comparativeData,
          divisionName,
          chartImages,
          indic
        ),
      },
      //--------------------------------------------------
      addUncertaintyText(
        uncertaintyText,
        pdfPageSize,
        pdfMargins,
        defaultPosition
      ),
    ],
    //--------------------------------------------------
    // Style
    ...definePDFStyles(),
  };

  const summaryReport = pdfMake.createPdf(docDefinition);

  return summaryReport;
};

// SECTIONS CONTENT -----------------------------------------------------------
const buildHeaderSection = (
  libelle,
  totalRevenue,
  production,
  branchProductionTarget,
  indic,
  period,
  unit,
  precision,
  unitGrossImpact
) => {
  return [
    { text: libelle, style: "header" },
    //--------------------------------------------------
    {
      columns: [
        {
          margin: [0, 10, 0, 0],
          alignment: "center",
          stack: [
            {
              text: printValue(totalRevenue, 0) + "€",
              style: "numbers",
            },
            {
              text: "de chiffre d'affaires",
              fontSize: 8,
            },
          ],
        },
        {
          margin: [0, 10, 0, 0],
          alignment: "center",
          stack: [
            {
              text: [
                {
                  width: "auto",
                  text:
                    production.periodsData[period.periodKey].footprint
                      .indicators[indic].value + " ",
                  style: "numbers",
                },
                {
                  text: unit,
                  bold: true,
                },
              ],
            },
            {
              margin: [10, 5, 15, 0],
              text: "d'" + libelle,
              fontSize: 8,
            },
          ],
        },
        {
          margin: [0, 10, 0, 0],
          alignment: "center",
          stack: [
            {
              text: printValue(
                production.periodsData[period.periodKey].footprint.indicators[
                  indic
                ].getGrossImpact(
                  production.periodsData[period.periodKey].amount
                ),
                precision
              ),
              style: "numbers",
              margin: [0, 0, 0, 0],
            },
            {
              text: unitGrossImpact,
              bold: true,
              margin: [0, 0, 0, 5],
            },
            {
              text: "liés à la production",
              fontSize: 8,
            },
          ],
        },
        {
          margin: [0, 10, 0, 0],
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
                ? "Objectif annuel de la branche **"
                : "Aucun objectif défini pour la branche",
              fontSize: 8,
            },
          ],
        },
      ],
    },
    //--------------------------------------------------
    {
      margin: [10, 30, 10, 20],
      text: getIndicDescription(indic),
      alignment: "center",
    },
    //--------------------------------------------------
  ];
};

const buildProductionImpactSection = (
  intermediateConsumptionsPart,
  mostImpactfulExpenseAccountsPart,
  indic,
  chartImages
) => {
  return [
    {
      text: "\tRépartition des impacts de la production\t",
      style: "h2",
      alignment: "center",
      margin: [0, 0, 0, 10],
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
                  margin: [5, 20, 0, 0],
                  layout: "noBorders",
                  table: {
                    widths: [10, "auto"],
                    body: [
                      [
                        {
                          text: "",
                          fillColor: rgbaToHex(
                            aggregatesChartColors.intermediateConsumptions
                          ),
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
                  margin: [5, 5, 0, 0],
                  layout: "noBorders",
                  table: {
                    widths: [10, "auto"],
                    body: [
                      [
                        {
                          text: "",
                          fillColor: rgbaToHex(
                            aggregatesChartColors.fixedCapitalConsumptions
                          ),
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
                  margin: [5, 5, 0, 0],
                  layout: "noBorders",
                  table: {
                    widths: [10, "auto"],
                    body: [
                      [
                        {
                          text: "",
                          fillColor: rgbaToHex(
                            aggregatesChartColors.netValueAdded
                          ),
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
              height: 100,
              image: chartImages[`gross-impact-chart-${indic}-print`],
            },
          ],
        },
        buildChargesImpactSection(
          intermediateConsumptionsPart,
          mostImpactfulExpenseAccountsPart,
          rgbaToHex(aggregatesChartColors.intermediateConsumptions)
        ),
      ],
    },
  ];
};

// Sections  -----------------------------------------------------------


const buildSIGTableSection = (mainAggregates, period, indic) => {
  const {
    production,
    netValueAdded,
    intermediateConsumptions,
    fixedCapitalConsumptions,
  } = mainAggregates;

  const { unit, unitAbsolute, nbDecimals } = metaIndics[indic];
  return {
    width: "50%",
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
            text: "Impact",
          },
          {
            text: "Incertitude *",
            alignment: "center",
          },
        ],
        // rows
        [
          {},
          {},
          { text: "en " + unit, fontSize: "5", alignment: "center" },
          {
            text: "en " + unitAbsolute,
            fontSize: "5",
            alignment: "center",
          },
          { text: "en " + "%", fontSize: "5", alignment: "center" },
        ],
        buildTableRow(production, period, indic, nbDecimals),
        buildTableRow(intermediateConsumptions, period, indic, nbDecimals),
        buildTableRow(fixedCapitalConsumptions, period, indic, nbDecimals),
        buildTableRow(netValueAdded, period, indic, nbDecimals),
      ],
    },
    layout: {
      hLineWidth: function (i, node) {
        return i === 0 || i === 1 ? 0 : 1;
      },
      vLineWidth: function (i, node) {
        return i === 0 || i === node.table.widths.length ? 0 : 1;
      },
      vLineColor: function (i, node) {
        return "#f0f0f8";
      },
      hLineColor: function (i, node) {
        return "#f0f0f8";
      },
    },
  };
};

const buildTableRow = (aggregate, period, indic, precision) => {
  const data = aggregate.periodsData[period.periodKey];

  return [
    {
      text: aggregate.label,
      margin: [2, 7, 2, 8],
      alignment: "left",
    },
    {
      text: printValue(data.amount, 0) + " €",
      alignment: "right",
      margin: [2, 7, 2, 8],
    },
    {
      columns: [
        {
          text: [
            {
              text: printValue(
                data.footprint.indicators[indic].value,
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
      columns: [
        {
          text: [
            {
              text: printValue(
                data.footprint.indicators[indic].getGrossImpact(data.amount),
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
      text: printValue(data.footprint.indicators[indic].uncertainty, 0),
      fontSize: "5",
      alignment: "center",
      margin: [2, 7, 2, 8],
    },
  ];
};
const buildDeviationChartSection = (chartImage) => {
  return {
    width: "50%",
    stack: [
      {
        table: {
          widths: ["100%"],
          body: [
            [
              {
                text: "Ecart par rapport à la moyenne de la branche **",
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
            return 1;
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
        width: 240,
        image: chartImage,
      },
    ],
  };
};

const buildBranchPerformanceSection = (
  branchProductionTarget,
  branchProductionEvolution,
  lastEstimatedData,
  comparativeData,
  divisionName,
  chartImages,
  indic
) => {
  
  const branchReferenceText =
    "Branche de référence : " +
    comparativeData.comparativeDivision +
    " - " +
    divisionName;

  return {
    columnGap: 25,

    columns: [
      // Left Box
      {
        margin: [10, 0, 10, 10],
        width: "35%",

        stack: [
          {
            text: "\tObjectif de la branche **\t",
            style: "h2",
            alignment: "center",
            background: "#FFFFFF",
            margin: [0, 0, 0, 20],
          },
          {
            text: branchProductionTarget ? branchProductionTarget + " %" : "-",
            alignment: "center",
            style: "numbers",
            color: "#ffb642",
          },
          {
            text: branchProductionTarget
              ? "Objectif annuel"
              : "Aucun objectif défini",
            alignment: "center",
            margin: [0, 2, 10, 10],
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
                text: branchReferenceText,
              },
            ],
          },
        ],
      },
      // Right Box
      {
        width: "*",
        stack: [
          {
            text: "\tEvolution de la performance\t",
            style: "h2",
            alignment: "center",
            background: "#FFFFFF",
            margin: [0, 0, 0, 20],
          },
          {
            width: 320,
            image: chartImages[`trend-chart-${indic}-print`],
          },
        ],
      },
    ],
  };
};
const buildChargesImpactSection = (
  intermediateConsumptionsPart,
  mostImpactfulExpenseAccountsPart,
  bgColor
) => {
  let content = {
    stack: [
      // Arrow
      {
        svg: '<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" overflow="hidden"><defs><clipPath id="clip0"><rect x="501" y="221" width="60" height="60"/></clipPath></defs><g clip-path="url(#clip0)" transform="translate(-501 -221)"><path d="M518.001 229.075 517.981 231.688C517.981 232.024 518.239 232.281 518.575 232.281 518.911 232.281 519.169 232.024 519.169 231.688L519.208 227.729C519.208 227.591 519.169 227.472 519.07 227.353 519.07 227.333 519.05 227.333 519.03 227.314 519.01 227.294 519.01 227.274 518.971 227.254 518.971 227.254 518.951 227.234 518.931 227.234 518.931 227.234 518.911 227.215 518.892 227.215 518.812 227.155 518.714 227.135 518.615 227.135L514.656 227.096C514.32 227.096 514.062 227.353 514.062 227.69 514.062 228.026 514.32 228.283 514.656 228.283L517.11 228.303C514.953 231.41 511.925 232.895 508.105 232.697 506.225 232.578 504.384 232.123 502.663 231.331 502.366 231.193 502.029 231.311 501.891 231.608 501.752 231.885 501.851 232.242 502.148 232.4 503.989 233.251 505.987 233.766 508.026 233.884 510.935 234.043 515.013 233.33 518.001 229.075Z" fill="#191558"/></g></svg>',
        absolutePosition: { x: 330, y: 260 },
      },
      {
        text: "\tdont les comptes de charges\t",
        style: "h2",
        fontSize: 8,
        alignment: "center",
      },
      {
        text: "\tles plus impactants\t",
        style: "h2",
        fontSize: 8,
        alignment: "center",
      },
      ///
      {
        margin: [10, 10, 0, 0],
        table: {
          body: [
            ...getMostImpactfulExpenseAccountRows(
              mostImpactfulExpenseAccountsPart,
              bgColor
            ),
          ],
        },
      },
    ],
  };
  if (intermediateConsumptionsPart > 40) {
    return content;
  }
};

// Functions -----------------------------------------------------------

function getIntermediateConsumptionsPart(financialData, indic, period) {
  let total =
    financialData.mainAggregates.intermediateConsumptions.periodsData[
      period.periodKey
    ].footprint.indicators[indic].getGrossImpact(
      financialData.mainAggregates.intermediateConsumptions.periodsData[
        period.periodKey
      ].amount
    ) +
    financialData.mainAggregates.fixedCapitalConsumptions.periodsData[
      period.periodKey
    ].footprint.indicators[indic].getGrossImpact(
      financialData.mainAggregates.fixedCapitalConsumptions.periodsData[
        period.periodKey
      ].amount
    ) +
    financialData.mainAggregates.netValueAdded.periodsData[
      period.periodKey
    ].footprint.indicators[indic].getGrossImpact(
      financialData.mainAggregates.netValueAdded.periodsData[period.periodKey]
        .amount
    );

  const intermediateConsumptionsPart =
    (financialData.mainAggregates.intermediateConsumptions.periodsData[
      period.periodKey
    ].footprint.indicators[indic].getGrossImpact(
      financialData.mainAggregates.intermediateConsumptions.periodsData[
        period.periodKey
      ].amount
    ) /
      total) *
    100;

  return intermediateConsumptionsPart;
}
