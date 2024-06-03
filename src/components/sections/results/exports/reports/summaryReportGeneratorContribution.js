// La Société Nouvelle

// PDF make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Lib
import metaDivisions from "/lib/divisions";
import metaIndics from "/lib/indics";

import { buildAggregatePeriodIndicator } from "/src/formulas/footprintFormulas";

 

// Utils
import { printValue } from "/src/utils/formatters";
import { getClosestYearData } from "../../utils";

// PDF Config
import { pdfMargins, pdfPageSize, defaultPosition } from "../../../../../constants/pdfConfig";
import { calculateAvailableWidth, createRectObject, definePDFStyles, generateFooter, generateHeader, getDocumentInfo, loadFonts } from "./utils/layout";
import { addUncertaintyText, cutString, getChartImageData, getIndicDescription, getUncertaintyDescription } from "./utils";


// --------------------------------------------------------------------------
//  Report for Contribution Indicator
// --------------------------------------------------------------------------

pdfMake.vfs = pdfFonts.pdfMake.vfs;

loadFonts();

export const buildSummaryReportContributionIndic = async ({
  session,
  indic,
  period
}) => {

  // Session data --------------------------------------------------

  const {
    legalUnit,
    financialData,
    comparativeData
  } = session;

  const { production } = financialData.mainAggregates;

  const corporateName = legalUnit.corporateName;
  const currentPeriod = period.periodKey.slice(2);
  
  // Metadata ------------------------------------------------------
  
  const { 
    libelle, 
    unit,
    unitAbsolute,
    nbDecimals
  } = metaIndics[indic];
  
  const divisionName = metaDivisions[comparativeData.comparativeDivision];
  
  // ---------------------------------------------------------------
  // PDF Data

  const { totalRevenue} = await getFinancialData(financialData, period, indic);

  const {externalExpensesAccounts,externalExpensesContribution} = await processExternalExpenseAccounts(financialData, period,indic)

  const providers = filterProvidersByPeriod(financialData, period);

  const {mostImpactfulExpenses, leastImpactfulExpenses, mostImpactfulProviders} = getImpactData(externalExpensesAccounts,period,indic, providers)


  const uncertaintyText = getUncertaintyDescription(
    "proportion",
    production.periodsData[period.periodKey].footprint.indicators[indic]
      .uncertainty
  );

  const currentICdivisionData = getClosestYearData(
    comparativeData.intermediateConsumptions.division.history.data[indic],
    currentPeriod
  );

  // ---------------------------------------------------------------
  // Get charts canvas and encode it to import in document
 
  const chartIds = [
    `comparative-chart-production-${indic}-print`,
    `sig-chart-intermediateConsumptions-${indic}-print`,
    `sig-chart-fixedCapitalConsumptions-${indic}-print`,
    `sig-chart-netValueAdded-${indic}-print`,
  ];

  const chartImages = {};
  chartIds.forEach((id) => {
    chartImages[id] = getChartImageData(id);
  });


  // ---------------------------------------------------------------
  // key numbers
  let positionY = defaultPosition.startY;

  const availableWidth = await calculateAvailableWidth(pdfPageSize, pdfMargins);

  const figureKeyBoxWidth = 200;
  const figureKeyBoxHeight = 65;

  const keyFigureBoxes = [
    { x: 70, y: positionY, width: figureKeyBoxWidth, height: figureKeyBoxHeight },
    { x: 325, y: positionY, width: figureKeyBoxWidth, height: figureKeyBoxHeight },
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
    header: generateHeader(corporateName,legalUnit.siren, currentPeriod),
    footer: generateFooter(corporateName),
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
      positionY += 145; 
   
      canvas.push(
        createRectObject(defaultPosition.startX, positionY, availableWidth, 180, 1, "#f1f0f4", 10, null)
      );

      positionY += 215; 

      // Comparaison avec la branche d'activité
      canvas.push(createRectObject(defaultPosition.startX, positionY, 210, 170, 1, "#f1f0f4", 10, null));

      // Comptes de charges les plus impactants
      canvas.push(createRectObject(260, positionY, 305, 170, 1, "#f1f0f4", 10, null));




      return {
        canvas: canvas,
      };
    },
    info: getDocumentInfo("Plaquette", indic, corporateName, currentPeriod),
    content: [
      // Header
      ...buildHeaderSection(
        libelle,
        totalRevenue,
        production,
        period,
        indic
      ),

      //--------------------------------------------------
      // Box "Soldes Intermédiaires de Gestion"
      ...buildSigFootprintSection(
        indic,
        chartImages
      ),
      //--------------------------------------------------
      {
        columnGap: 40,
        columns: [
          // Left Box
          
          {
            width: "40%",
            stack: [
              ...buildLeftColumnContent(indic,chartImages, externalExpensesContribution, currentICdivisionData, comparativeData, divisionName),
            ],
          },
          // Right Box
          {
            width: "60%",
            stack: [
              ...buildRightColumnContent(mostImpactfulExpenses, leastImpactfulExpenses, mostImpactfulProviders, indic, unit, unitAbsolute, nbDecimals, period),
            ],
          },
        ],
      },
      //--------------------------------------------------
      addUncertaintyText(uncertaintyText, pdfPageSize, pdfMargins, defaultPosition), 
      ,
    ],
    //--------------------------------------------------
    //Style
    ...definePDFStyles(),
  };

  const summaryReport = pdfMake.createPdf(docDefinition);

  return summaryReport
}

// Sections  -----------------------------------------------------------
const buildHeaderSection = (libelle, totalRevenue, production, period, indic) => {
  return [
    { text: libelle, style: "header" },
    //--------------------------------------------------
    {
      margin: [0, 25, 0, 25],
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
              text:
                printValue(
                  production.periodsData[period.periodKey].footprint
                    .indicators[indic].value,
                  1
                ) + "%*",
              alignment: "center",
              style: "numbers",
            },
            {
              text: "Taux de contribution de la production",
              alignment: "center",
              margin: [0, 5, 0, 0],
            },
          ],
        },
      ],
    },
    //--------------------------------------------------
    {
      margin: [50, 20, 50, 20],
      text: getIndicDescription(indic),
      alignment: "center",
    },
    //--------------------------------------------------

  ];
}
const buildSigFootprintSection = (indic, chartImages) => {
  

  return [
    // Box "Soldes Intermédiaires de Gestion"
    {
      text: "\tEmpreintes de vos Soldes Intermédiaires de Gestion\t",
      style: "h2",
      margin: [0, 0, 0, 30],
    },
    {
      columns: [
        {
          stack: [
            {
              image: chartImages[`sig-chart-intermediateConsumptions-${indic}-print`],
              alignment: "center",
              width: 100,
              height: 100,
            },
            {
              text: "Consommations",
              alignment: "center",
              bold: true,
              fontSize: 9,
              margin: [0, 10, 0, 0],
            },
            {
              text: "intermédiaires",
              alignment: "center",
              bold: true,
              fontSize: 9,
            },
          ],
        },
        {
          stack: [
            {
              image: chartImages[`sig-chart-fixedCapitalConsumptions-${indic}-print`],
              alignment: "center",
              width: 100,
              height: 100,
            },
            {
              text: "Consommations",
              alignment: "center",
              bold: true,
              fontSize: 9,
              margin: [0, 10, 0, 0],
            },
            {
              text: "de capital fixe",
              alignment: "center",
              bold: true,
              fontSize: 9,
            },
          ],
        },
        {
          stack: [
            {
              image: chartImages[`sig-chart-netValueAdded-${indic}-print`],
              width: 100,
              height: 100,
              alignment: "center",
            },
            {
              text: "Valeur ajoutée",
              alignment: "center",
              bold: true,
              fontSize: 9,
              margin: [0, 10, 0, 0],
            },
            {
              text: "nette",
              alignment: "center",
              bold: true,
              fontSize: 9,
            },
          ],
        },
      ],
    },
  ];
}

const buildLeftColumnContent = (indic,chartImages, externalExpensesContribution, currentICdivisionData, comparativeData, divisionName) => {

  return [
    {
      text: "\tComparaison avec la branche**\t",
      style: "h2",
      margin: [0, 40, 0, 20],
      alignment: "center", 
    },
    {
      image:
      chartImages[`comparative-chart-production-${indic}-print`],
      width: 190,
      margin: [10, 0, 0, 5],
    },
   
  ]

}

const buildRightColumnContent = (mostImpactfulExpenses, leastImpactfulExpenses, mostImpactfulProviders, indic, unit, unitAbsolute, nbDecimals, period) => {
  return [
    {
      text: "\tComptes de charges les plus impactants\t",
      style: "h2",
      margin: [0, 40, 0, 10],
    },
    {
      text: "Les plus contributifs ",
      fontSize: 10,
      bold: true,
      margin: [0, 10, 0, 10],
    },

    mostImpactfulExpenses.map((expense) => ({
      text: cutString(
        expense.accountNum + " - " + expense.accountLib,
        60
      ),
      fontSize: 8,
    })),

    {
      text: "Les moins contributifs ",
      fontSize: 10,
      bold: true,
      margin: [0, 10, 0, 10],
    },
    leastImpactfulExpenses.map((expense) => ({
      text: cutString(
        expense.accountNum + " - " + expense.accountLib,
        60
      ),
      fontSize: 8,
    })),


  ]
};


// Functions -----------------------------------------------------------


async function getFinancialData(financialData, period, indic) {
  const { revenue } = financialData.productionAggregates;
  const totalRevenue = revenue.periodsData[period.periodKey].amount;

  const contributionPercentage =
    revenue.periodsData[period.periodKey].footprint.indicators[indic].value;
  const contributionAmount = (contributionPercentage / 100) * totalRevenue;
  const contributionPerEuro = contributionAmount / totalRevenue;



  return {
    totalRevenue,
    contributionPerEuro,
  };
}

async function processExternalExpenseAccounts(financialData, period, indic){

  const externalExpensesAccounts = financialData.externalExpensesAccounts.filter((account) =>
    account.periodsData.hasOwnProperty(period.periodKey)
  );

  const externalPurchaseAccounts  = financialData.externalExpensesAccounts.filter((account) =>
    /^60[^(8|9)]/.test(account.accountNum)
  );


  const externalExpensesContribution = await buildAggregatePeriodIndicator(
    indic,
    externalPurchaseAccounts ,
    period.periodKey
  );


  return {
    externalExpensesAccounts,
    externalExpensesContribution,
  };
};


function getImpactData(externalExpensesAccounts, period, indic, providers){

  const mostImpactfulExpenses = sortAccountsByFootprint(
    externalExpensesAccounts,
    period,
    indic,
    "desc"
  ).slice(0, 3);

  const leastImpactfulExpenses = sortAccountsByFootprint(
    externalExpensesAccounts,
    period,
    indic,
    "asc"
  ).slice(0, 3);

  const mostImpactfulProviders = sortProvidersByContrib(
    period.periodKey,
    providers,
    indic,
    "desc"
  ).slice(0, 4);

  return {
    mostImpactfulExpenses,
    leastImpactfulExpenses,
    mostImpactfulProviders,
  };
};

// --------------------------------------------------
// Sorting

/**
 * Sort accounts by footprint indicator value.
 * @param {Array<object>} accounts - The accounts to sort.
 * @param {object} period - The period object.
 * @param {string} indicator - The indicator code.
 * @param {string} order - The sort order ('asc' or 'desc').
 * @returns {Array<object>} The sorted accounts.
 */
function sortAccountsByFootprint(accounts, period, indicator, order) {
  const sortedAccounts = accounts.sort((a, b) => {
    const valueA =
      a.periodsData[period.periodKey].footprint.indicators[indicator].value;
    const valueB =
      b.periodsData[period.periodKey].footprint.indicators[indicator].value;
    if (order === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return sortedAccounts;
}



/**
 * Sort providers by contribution to an indicator.
 * @param {string} periodKey - The period key.
 * @param {Array<object>} expensesAccounts - The expenses accounts to sort.
 * @param {string} indicator - The indicator code.
 * @param {string} order - The sort order ('asc' or 'desc').
 * @returns {Array<object>} The sorted expenses accounts.
 */
function sortProvidersByContrib(
  periodKey,
  expensesAccounts,
  indicator,
  order
) {
  const sortedExpensesAccounts = expensesAccounts
    .sort((a, b) => {
      const valueA = a.footprint.indicators[indicator].getGrossImpact(
        a.periodsData[periodKey].amount
      );
      const valueB = b.footprint.indicators[indicator].getGrossImpact(
        b.periodsData[periodKey].amount
      );

      if (order === "asc") {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    })
    .slice(0, 4)
    .sort((a, b) => {
      let sortedAccountA = 100 - a.footprint.indicators[indicator].value;
      let sortedAccountB = 100 - b.footprint.indicators[indicator].value;
      return sortedAccountB - sortedAccountA;
    });

  return sortedExpensesAccounts;
}



// --------------------------------------------------
// Filters

/**
 * Filter providers by period.
 * @param {object} financialData - The financial data object.
 * @param {object} period - The period object.
 * @returns {Array<object>} The filtered providers.
 */
function filterProvidersByPeriod(financialData, period) {
  return financialData.providers.filter((provider) => {
    return Object.keys(provider.periodsData).some(
      (key) => key === period.periodKey
    );
  });
}