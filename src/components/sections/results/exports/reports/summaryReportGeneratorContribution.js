// La Société Nouvelle

// PDF make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Lib
import metaDivisions from "/lib/divisions";
import metaIndics from "/lib/indics";

// Utils
import { printValue } from "/src/utils/formatters";
import { getShortCurrentDateString } from "/src/utils/periodsUtils";
import {
  cutString,
  getIndicDescription,
  getIntensKeyProviders,
  getUncertaintyDescription,
  sortAccountsByFootprint,
  sortProvidersByContrib,
} from "../exportsUtils";

import { getClosestYearData } from "../../utils";

import { calculateAvailableWidth, calculateBoxWidth, createRectObject, generateFooter, generateHeader, getChartImageData, loadFonts } from "../../../../../utils/exportsUtils";

import { buildAggregatePeriodIndicator } from "/src/formulas/footprintFormulas";

import { pdfMargins, pdfPageSize } from "../../../../../constants/pdfConfig";


// --------------------------------------------------------------------------
//  Report for Contribution Indicator
// --------------------------------------------------------------------------

pdfMake.vfs = pdfFonts.pdfMake.vfs;

//Call function to load fonts
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
  const { revenue } = financialData.productionAggregates;
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
  // utils

  const indicDescription = getIndicDescription(indic);
  const externalExpensesAccounts =
    financialData.externalExpensesAccounts.filter((account) =>
      account.periodsData.hasOwnProperty(period.periodKey)
    );

  let filteredExternalExpensesAccounts =
    financialData.externalExpensesAccounts.filter((account) =>
      /^60[^(8|9)]/.test(account.accountNum)
    );
  // Calcul du taux de contribution des achats
  const contribExternalAccounts = await buildAggregatePeriodIndicator(
    indic,
    filteredExternalExpensesAccounts,
    period.periodKey
  );

  const providers = financialData.providers.filter((provider) => {
    return Object.keys(provider.periodsData).some(
      (key) => key === period.periodKey
    );
  });

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

  const totalRevenue = revenue.periodsData[period.periodKey].amount;

  const contributionPercentage =
    revenue.periodsData[period.periodKey].footprint.indicators[indic].value;
  const contributionAmount = (contributionPercentage / 100) * totalRevenue;
  const contributionPerEuro = contributionAmount / totalRevenue;



  const availableWidth = await calculateAvailableWidth(pdfPageSize, pdfMargins);


  const figureKeyBoxWidth = 200;
  const figureKeyBoxHeight = 65;

 
  const keyFigureBoxes = [
    { x: 70, y: 100, width: figureKeyBoxWidth, height: figureKeyBoxHeight },
    { x: 325, y: 100, width: figureKeyBoxWidth, height: figureKeyBoxHeight },
  ];
  
  // ---------------------------------------------------------------
  // PDF Content and Layout

  const docDefinition = {
    pageSize: pdfPageSize,
    pageMargins: [pdfMargins.left, pdfMargins.top, pdfMargins.right, pdfMargins.bottom],
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
      canvas.push(
        createRectObject(30, 235, availableWidth, 125, 1, "#f1f0f4", 10, null)
      );

      // Comparaison avec la branche d'activité
      canvas.push(createRectObject(30, 380, 210, 170, 1, "#f1f0f4", 10, null));

      // Comptes de charges les plus impactants
      canvas.push(createRectObject(260, 380, 305, 170, 1, "#f1f0f4", 10, null));

      //Empreinte de vos achat
      canvas.push(createRectObject(30, 570, 210, 150, 1, "#f1f0f4", 10, null));

      //Fournisseurs clés
      canvas.push(createRectObject(260, 570, 305, 150, 1, "#f1f0f4", 10, null));

      return {
        canvas: canvas,
      };
    
    },
    info: {
      title: getDocumentTitle(indic, corporateName, currentPeriod),
      author: corporateName,
      subject: "Plaquette de résultat",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content: [
      { text: libelle, style: "header" },
      //--------------------------------------------------
      {
        columns: [       
          {
            margin: [0, 20, 0, 0],
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
            margin: [60, 5, 60, 15],
            stack: [
              {
                text: "\tPour 1€ de chiffre d'affaires\t",
                alignment: "center",
                background: "#FFFFFF",
              },
              {
                margin: [0, 5, 0, 0],
                text: contributionPerEuro.toFixed(2) + " €",
                alignment: "center",
                style: "numbers",
              },
              {
                margin: [0, 5, 0, 0],
                text: "de " + libelle,
                alignment: "center",
              },
            ],
          },
        ],
      },
      //--------------------------------------------------
      {
        margin: [0, 10, 0, 0],
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
                text:
                  printValue(
                    production.periodsData[period.periodKey].footprint
                      .indicators[indic].value,
                    1
                  ) + "%*",
                alignment: "center",
                style: "bigNumber",
                fontSize: 26,
              },
              {
                text: "Taux de contribution de la production",
                alignment: "center",
                bold: true,
              },
            ],
          },
          {
            stack: [
              {
                image: chartImages[`sig-chart-intermediateConsumptions-${indic}-print`],
                alignment: "center",
                width: 60,
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
                image: chartImages[`sig-chart-fixedCapitalConsumptions-${indic}-print`],
                alignment: "center",
                width: 60,
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
                image: chartImages[`sig-chart-netValueAdded-${indic}-print`],
                width: 60,
                alignment: "center",
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
      {
        columnGap: 40,
        columns: [
          // Left Box
          {
            width: "40%",
            stack: [
              {
                text: "\tComparaison avec la branche d'activité\t",
                style: "h2",
              },
              {
                image: chartImages[`comparative-chart-production-${indic}-print`],
                width: 130,
                alignment: "center",
              },
              {
                text: "\tEmpreinte de vos achats\t",
                style: "h3",
                margin: [0, 20, 0, 10],
                alignment: "center",
                background: "#FFFFFF",
              },
              {
                text: printValue(contribExternalAccounts.value, 1) + " %",
                alignment: "center",
                style: "bigNumber",
                fontSize: 20,
              },
              {
                text: "Taux de contribution de vos achats",
                alignment: "center",
                bold: true,
                margin: [0, 0, 0, 10],
              },
              {
                text: currentICdivisionData.value + " %",
                alignment: "center",
                style: "branchNumber",
              },
              {
                text: "Moyenne de la branche",
                alignment: "center",
                fontSize: 8,
                bold: true,
              },
              {
                margin: [10, 5, 0, 0],
                fontSize: 8,
                alignment: "center",
                text: [
                  {
                    text: comparativeData.comparativeDivision + " - ",
                  },
                  {
                    text: cutString(divisionName, 120),
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
                text: "\tComptes de charges les plus impactants\t",
                style: "h2",
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
              })),

              // ACTIVITES FOURNISSEURS
              {
                text: "\tFournisseurs clés\t",
                style: "h2",
                margin: [0, 30, 0, 20],
              },
              ...getIntensKeyProviders(
                mostImpactfulProviders,
                indic,
                unit,
                unitAbsolute,
                nbDecimals,
                period
              ),
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
        absolutePosition: { x: 30, y: pdfPageSize.height - pdfMargins.bottom - 15 },
      },
      ,
    ],
    //--------------------------------------------------
    //Style

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
        margin: [0, 10, 0, 10],
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
      numbers: {
        fontSize: 18,
        bold: true,
      },
      bigNumber: {
        bold: true,
        color: "#fa595f",
        margin: [0, 5, 0, 5],
      },
      branchNumber: {
        fontSize: 16,
        bold: true,
        color: "#ffb642",
        margin: [0, 5, 0, 5],
      },
    },
  };

  const summaryReport = pdfMake.createPdf(docDefinition);

  return summaryReport
}

function getDocumentTitle(indic, corporateName, currentPeriod) {
  return "Plaquette_" +
    indic.toUpperCase() +
    "_" +
    corporateName.replaceAll(" ", "") +
    "-" +
    currentPeriod;
}
