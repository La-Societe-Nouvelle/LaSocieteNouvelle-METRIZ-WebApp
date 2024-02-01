// PDF make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Lib
import divisions from "/lib/divisions";
import metaIndics from "/lib/indics";

// Exports Utils
import {
  addUncertaintyText,
  calculateAverageEvolutionRate,
  cutString,
  filterProvidersByPeriod,
  getIndicDescription,
  getUncertaintyDescription,
  targetAnnualReduction,
} from "../exportsUtils";

import {
  createRectObject,
  generateFooter,
  generateHeader,
  getDocumentInfo,
  loadFonts,
  definePDFStyles,
  calculateAvailableWidth,
  getChartImageData,
} from "../../../../../utils/exportsUtils";

// Utils
import { sortByImpact } from "../../utils";
import { printValue } from "/src/utils/formatters";

// PDF Config
import {
  defaultPosition,
  pdfMargins,
  pdfPageSize,
} from "../../../../../constants/pdfConfig";

// --------------------------------------------------------------------------
//  Report for Index Indicator
// --------------------------------------------------------------------------
pdfMake.vfs = pdfFonts.pdfMake.vfs;

//Call function to load fonts
loadFonts();

export const buildSummaryReportIndexIndic = async ({
  session,
  indic,
  period,
}) => {
  // Session data --------------------------------------------------

  const { legalUnit, financialData, comparativeData } = session;

  const corporateName = legalUnit.corporateName;
  const currentPeriod = period.periodKey.slice(2);

  // Metadata ------------------------------------------------------
  const divisionName = divisions[comparativeData.comparativeDivision];

  // ---------------------------------------------------------------
  // PDF Data
  const { production } = financialData.mainAggregates;

  const { revenue } = financialData.productionAggregates;

  // ---------------------------------------------------------------
  // utils

  let branchProductionTarget = null;
  const target = comparativeData.production.division.target.data[indic];

  if (target.length) {
    const linearTarget = target.filter((data) => data.path == "LIN" && data.flag == "f");
    branchProductionTarget = targetAnnualReduction(linearTarget);
  }

  let lastEstimatedData = comparativeData.production.division.history.data[
    indic
  ].filter((item) => item.year <= currentPeriod);

  lastEstimatedData = lastEstimatedData.slice(
    Math.max(lastEstimatedData.length - 2, 1)
  );

  const branchProductionEvolution = calculateAverageEvolutionRate(lastEstimatedData);

  let providers = filterProvidersByPeriod(financialData, period);

  const { topProviders, nextTopProviders } = getImpactData(indic, providers);

  const uncertaintyText = getUncertaintyDescription(
    "indice",
    production.periodsData[period.periodKey].footprint.indicators[indic]
      .uncertainty
  );

  // ---------------------------------------------------------------
  // Get charts canvas and encode it to import in document
 
  const chartIds = [
    `deviation-chart-${indic}-print`,
    `trend-chart-${indic}-print`,
  ];

  const chartImages = {};
  chartIds.forEach((id) => {
    chartImages[id] = getChartImageData(id);
  });


  // ---------------------------------------------------------------
  // Document Property
  let positionY = defaultPosition.startY;

  const availableWidth = await calculateAvailableWidth(pdfPageSize, pdfMargins);

  const figureKeyBoxWidth = 200;
  const figureKeyBoxHeight = 65;

  const keyFigureBoxes = [
    {
      x: 70,
      y: positionY,
      width: figureKeyBoxWidth,
      height: figureKeyBoxHeight,
    },
    {
      x: 325,
      y: positionY,
      width: figureKeyBoxWidth,
      height: figureKeyBoxHeight,
    },
  ];

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
    header: generateHeader(corporateName, currentPeriod),
    footer: generateFooter,

    background: function () {
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

      // Empreintes SIG
      positionY += 127;

      canvas.push(
        createRectObject(
          defaultPosition.startX,
          positionY,
          availableWidth,
          90,
          1,
          "#f1f0f4",
          10,
          null
        )
      );
      positionY += 110;
      canvas.push(
        createRectObject(
          defaultPosition.startX,
          positionY,
          availableWidth,
          80,
          1,
          "#f1f0f4",
          10,
          null
        )
      );
      positionY += 272;

      canvas.push(
        createRectObject(
          defaultPosition.startX,
          positionY,
          180,
          150,
          1,
          "#f1f0f4",
          10,
          null
        )
      );

      canvas.push(
        createRectObject(
          220,
          positionY,
          345,
          150,
          1,
          "#f1f0f4",
          10,
          null
        )
      );

      return {
        canvas: canvas,
      };
    },
    info: {
      info: getDocumentInfo("Plaquette", indic, corporateName, currentPeriod),
    },
    content: [
      // Header
      ...buildHeaderSection(revenue, indic, period),
      //--------------------------------------------------
      // Box "Soldes Intermédiaires de Gestion"
      ...buildSigFootprintSection(
        financialData.mainAggregates,
        indic,
        period
      ),
      //--------------------------------------------------
      // Key Suppliers
      ...buildKeyProvidersSection(topProviders, nextTopProviders, indic),
      //--------------------------------------------------
      // SIG Table
      {
        margin: [0, 25, 0, 20],
        columns: [
          {
            ...buildSIGTableSection(
              financialData.mainAggregates,
              period,
              indic,
            ),
          },
          //--------------------------------------------------
          //Deviation chart
          {
            ...buildDeviationChartSection(chartImages[`deviation-chart-${indic}-print`])
          },
        ],
      },
      //--------------------------------------------------
      // Branch Performance
      {
        ...buildBranchPerformanceSection( branchProductionTarget,
          branchProductionEvolution,
          lastEstimatedData,
          comparativeData,
          divisionName,
          chartImages,
          indic)
      },
      //--------------------------------------------------
      addUncertaintyText(uncertaintyText, pdfPageSize, pdfMargins,defaultPosition), 
      ,
    ],
    //--------------------------------------------------
    // Style

    ...definePDFStyles(),
  };

  const summaryReport = pdfMake.createPdf(docDefinition);

  return summaryReport;
};

// SECTIONS CONTENT -----------------------------------------------------------

const buildHeaderSection = (revenue, indic, period) => {
  const { libelle, unit, libelleGrandeur } = metaIndics[indic];

  const totalRevenue = revenue.periodsData[period.periodKey].amount;

  return [
    { text: libelle, style: "header" },
    //--------------------------------------------------
    {
      margin: [0, 20, 0, 0],
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
          margin: [60, 0, 60, 0],
          stack: [
            {
              text:
                printValue(
                  revenue.periodsData[period.periodKey].footprint.indicators[
                    indic
                  ].value,
                  1
                ) +
                " " +
                unit,
              alignment: "center",
              style: "numbers",
            },
            {
              margin: indic == "idr" ? [0, 5, 0, 12] :  [0, 5, 0, 0],
              text: indic == "idr" ? "Rapport interdécile D9/D1" : "d'" + libelleGrandeur,
              alignment: "center",
            },
          ],
        },
      ],
    },
    //--------------------------------------------------
    {
      margin: [0, 30, 0, 10],
      text: getIndicDescription(indic),
      alignment: "center",
    },
    //--------------------------------------------------
  ];
};

// Sections  -----------------------------------------------------------

const buildSigFootprintSection = (mainAggregates, indic, period) => {
  const { unit, nbDecimals } = metaIndics[indic];

  const {
    production,
    netValueAdded,
    intermediateConsumptions,
    fixedCapitalConsumptions,
  } = mainAggregates;

  return [
    // Box "Soldes Intermédiaires de Gestion"
    {
      text: "\tEmpreintes de vos Soldes Intermédiaires de Gestion\t",
      style: "h2",
      margin: [0, 0, 0, 15],
    },
    {
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
                    nbDecimals
                  ),
                },
                {
                  text: unit,
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
                    nbDecimals
                  ),
                },
                {
                  text: unit,
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
                    nbDecimals
                  ),
                },
                {
                  text: unit,
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
                    nbDecimals
                  ),
                },
                {
                  text: unit,
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
  ];
};

const buildKeyProvidersSection = (topProviders, nextTopProviders, indic) => {
  return [
    {
      text: "\tFournisseurs clés\t",
      style: "h2",
      alignment: "center",
      margin: [0, 30, 0, 15],
      background: "#FFFFFF",
    },
    generateKeyProviderColumns(topProviders, indic),
    generateKeyProviderColumns(nextTopProviders, indic),
  ];
};

const generateKeyProviderColumns = (providers, indic) => {
  const { unit, nbDecimals } = metaIndics[indic];

  providers = providers.filter(
    (provider) =>
      !provider.isDefaultAccount &&
      provider.footprintStatus === 200 &&
      provider.footprint.isValid()
  );

  const keyProviders = generateKeyProviders(providers, indic, unit, nbDecimals);

  return {
    margin: [10, 0, 10, 10],
    columns: [
      {
        columnGap: 20,
        columns: keyProviders,
      },
    ],
  };
};

const generateKeyProviders = (providers, indic, unit, precision) =>
  providers.map((provider) => ({
    stack: [
      {
        text: cutString(provider.providerLib, 40),
        fontSize: 8,
        bold: true,
      },
      {
        text:
          indic === "idr"
            ? `Rapport interdécile : ${provider.footprint.indicators[
                indic
              ].value.toFixed(precision)}`
            : `${provider.footprint.indicators[indic].value.toFixed(
                precision
              )} ${unit}`,
        fontSize: 7,
      },
    ],
  }
)
);

const buildSIGTableSection = (mainAggregates, period, indic) => {
  const {
    production,
    netValueAdded,
    intermediateConsumptions,
    fixedCapitalConsumptions,
  } = mainAggregates;

  const { unit, nbDecimals } = metaIndics[indic];

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
            text: "Incertitude *",
            alignment: "center",
          },
        ],
        // rows
        [
          {},
          {},
          {
            text: unit ,
            fontSize: "5",
            alignment: "right",
          },
          { text: "%", fontSize: "5", alignment: "center" },
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
                text: "Ecart par rapport à la moyenne de la branche",
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
        image : chartImage
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
    columnGap: 40,
    columns: [
      // Left Box
      {
        margin: [10, 0, 0, 0],
        width: "33%",
        stack: [
          {
            text: "\tObjectif de la branche\t",
            style: "h2",
            alignment: "center",
            background: "#FFFFFF",
            margin: [0, 0, 0, 10],
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
            text: "\tEvolution de la performance de la branche\t",
            style: "h2",
            alignment: "center",
            background: "#FFFFFF",
          },
          {
            width: 300,
            image: chartImages[`trend-chart-${indic}-print`],
          },
        ],
      },
    ],
  };
};


// Functions -----------------------------------------------------------

function getImpactData(indic, providers) {
  providers = providers.filter(
    (provider) =>
      provider.footprintStatus == 200 && provider.footprint.isValid()
  );

  const topProviders = sortByImpact(providers, indic, "desc").slice(
    0,
    2
  );
  const nextTopProviders = sortByImpact(
    providers,
    indic,
    "desc"
  ).slice(2, 4);

  return {
    topProviders,
    nextTopProviders,
  };
}
