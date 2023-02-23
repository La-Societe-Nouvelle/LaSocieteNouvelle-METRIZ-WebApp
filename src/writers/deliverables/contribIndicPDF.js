// PDF make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
// Utils
import { getShortCurrentDateString, printValue } from "../../utils/Utils";
import {
  cutString,
  getIndicDescription,
  getUncertaintyDescription,
  loadFonts,
  sortCompaniesByFootprint,
  sortCompaniesByImpact,
} from "./utils/utils";

// --------------------------------------------------------------------------
//  Contribution Indicator Report
// --------------------------------------------------------------------------

pdfMake.vfs = pdfFonts.pdfMake.vfs;

//Call function to load fonts
loadFonts();

export const createContribIndicatorPDF = (
  title,
  year,
  legalUnit,
  indic,
  financialData,
  comparativeData,
  download
) => {
  // ---------------------------------------------------------------

  const { production, revenue, externalExpenses } = financialData.aggregates;

  // ---------------------------------------------------------------
  // utils
  const indicDescription = getIndicDescription(indic);

  const mostImpactfulExpenses = sortCompaniesByFootprint(
    financialData.expenses,
    indic,
    "desc"
  ).slice(0, 3);

  const leastImpactfulExpenses = sortCompaniesByFootprint(
    financialData.expenses,
    indic,
    "asc"
  ).slice(0, 3);

  const mostImpactfulCompanies = sortCompaniesByImpact(
    financialData.companies,
    indic,
    "desc"
  ).slice(0, 4);

  const uncertaintyText = getUncertaintyDescription(
    "proportion",
    production.footprint.indicators[indic].uncertainty
  );

  // ---------------------------------------------------------------
  // Get charts canvas and encode it to import in document

  const canvasProduction = document.getElementById("production-" + indic);
  const productionChartImage = canvasProduction.toDataURL("image/png");

  const doughtnutIC = document.getElementById("dn-ic-" + indic);
  const doughtnutICImage = doughtnutIC.toDataURL("image/png");

  const doughtnutCCF = document.getElementById("dn-ccf-" + indic);
  const doughtnutCCFImage = doughtnutCCF.toDataURL("image/png");

  const doughtnutNVA = document.getElementById("dn-nva-" + indic);
  const doughtnutNVAImage = doughtnutNVA.toDataURL("image/png");

  // ---------------------------------------------------------------
  // key numbers

  const totalRevenue = revenue.amount;
  const contributionPercentage = revenue.footprint.indicators[indic].value;
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
    legalUnit.replaceAll(" ", "") +
    "-" +
    year;

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
            h: 100,
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
      { text: title, style: "header" },
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
                text: "de " + title,
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
                  printValue(production.footprint.indicators[indic].value, 1) +
                  "%*",
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
                width: 120,
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
                width: 120,
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
                width: 120,
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
                text: "Production",
                fontSize: 9,
                bold: true,
              },
              {
                image: productionChartImage,
                width: 200,
                alignment: "center",
              },
              {
                text: "\tPerformances de vos achats\t",
                style: "h3",
                margin: [0, 20, 0, 10],
                alignment: "center",
                background: "#FFFFFF",
              },
              {
                text:
                  printValue(
                    externalExpenses.footprint.indicators[indic].value,
                    1
                  ) + " %",
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
                text:
                  printValue(
                    comparativeData.intermediateConsumption.divisionFootprint
                      .indicators[indic].value,
                    1
                  ) + " %",
                alignment: "center",
                style: "branchNumber",
              },
              {
                text: "Moyenne de la branche",
                alignment: "center",
                fontSize: 8,
              },
            ],
          },
          // Right Box
          {
            width: "*",
            stack: [
              {
                text: "\tLes comptes de charges les plus impactants\t",
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
                  expense.account + " - " + expense.accountLib,
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
                  expense.account + " - " + expense.accountLib,
                  60
                ),
              })),

              // ACTIVITES FOURNISSEURS
              {
                text: "\tFournisseurs clés\t",
                style: "h2",
                margin: [0, 30, 0, 10],
              },
              mostImpactfulCompanies
                .filter((company) => !company.isDefaultAccount)
                .map((company) => (
                  {
                    text: company.corporateId + " - " + company.corporateName,
                  },
                  {
                    text: company.corporateId + " - " + company.corporateName,
                  }
                )),
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

  return new Promise((resolve) => {
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      if (download) {
        saveAs(blob, `${documentTitle}.pdf`);
      }

      resolve(blob);
    });
  });
};
