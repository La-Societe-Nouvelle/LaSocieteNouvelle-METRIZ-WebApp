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
  loadFonts,
  sortAccountsByFootprint,
  sortProvidersByContrib,
} from "../exportsUtils";

import { getClosestYearData } from "../../utils";


import { buildAggregatePeriodIndicator } from "/src/formulas/footprintFormulas";


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

  const prodChartCanvas = document.getElementById(
    `comparative-chart-production-${indic}-print`
  );
  const prodChartImage = prodChartCanvas.toDataURL("image/png");

  const doughtnutIC = document.getElementById(
    `sig-chart-intermediateConsumptions-${indic}-print`
  );
  const doughtnutICImage = doughtnutIC.toDataURL("image/png");

  const doughtnutCCF = document.getElementById(
    `sig-chart-fixedCapitalConsumptions-${indic}-print`
  );
  const doughtnutCCFImage = doughtnutCCF.toDataURL("image/png");

  const doughtnutNVA = document.getElementById(
    `sig-chart-netValueAdded-${indic}-print`
  );
  const doughtnutNVAImage = doughtnutNVA.toDataURL("image/png");

  // ---------------------------------------------------------------
  // key numbers

  const totalRevenue = revenue.periodsData[period.periodKey].amount;

  const contributionPercentage =
    revenue.periodsData[period.periodKey].footprint.indicators[indic].value;
  const contributionAmount = (contributionPercentage / 100) * totalRevenue;
  const contributionPerEuro = contributionAmount / totalRevenue;

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
    "Plaquette_" +
    indic.toUpperCase() +
    "_" +
    corporateName.replaceAll(" ", "") +
    "-" +
    currentPeriod;

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
            h: 125,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          //Sector Comparaison Chart
          {
            type: "rect",
            x: 30,
            y: 392,
            w: 210,
            h: 150,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // Expenses Performances
          {
            type: "rect",
            x: 30,
            y: 561,
            w: 210,
            h: 150,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // Most impacting expense accounts
          {
            type: "rect",
            x: 260,
            y: 394,
            w: 305,
            h: 170,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // Suppliers activity
          {
            type: "rect",
            x: 260,
            y: 582,
            w: 305,
            h: 110,
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
            margin: [40, 15, 40, 30],
            stack: [
              {
                text: "\tPour 1€ de chiffre d'affaires\t",
                alignment: "center",
                background: "#FFFFFF",
              },
              {
                margin: [0, 5, 0, 5],
                text: contributionPerEuro.toFixed(2) + " €",
                alignment: "center",
                style: "numbers",
              },
              {
                text: "de " + libelle,
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
                image: doughtnutICImage,
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
                image: doughtnutCCFImage,
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
                image: doughtnutNVAImage,
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
                image: prodChartImage,
                width: 130,
                alignment: "center",
              },
              {
                text: "\tEmpreinte de vos achats\t",
                style: "h3",
                margin: [0, 18, 0, 10],
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
                margin: [0, 5, 0, 0],
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
                margin: [0, 30, 0, 10],
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
        margin: [0, 50, 0, 0],
        font: "Roboto",
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