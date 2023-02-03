import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { printValue } from "../../utils/Utils";
import { getIndicDescription, sortExpensesByFootprintIndicator } from "./utils/utils";

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

export const CreateContribIndicatorPDF = (
  year,
  legalUnit,
  indic,
  label,
  unit,
  financialData,
  impactsData,
  comparativeData,
  download
) => {
  // ---------------------------------------------------------------

const indicDescription = getIndicDescription(indic);
console.log(indicDescription)
  const {
    production,
    revenue,
    storedProduction,
    immobilisedProduction,
    intermediateConsumption,
    capitalConsumption,
    netValueAdded,
  } = financialData.aggregates;

  const mostImpactfulExpenses = sortExpensesByFootprintIndicator(
    financialData.expenses,
    indic,
    "desc"
  ).slice(0, 3);
  const leastImpactfulExpenses = sortExpensesByFootprintIndicator(
    financialData.expenses,
    indic,
    "asc"
  ).slice(0, 3);



  // Get chart canvas and encode it to import in document
  const canvasProduction = document.getElementById("production-" + indic);
  const productionChartImage = canvasProduction.toDataURL("image/png");

  const doughtnutIC = document.getElementById("dn-ic-" + indic);
  const doughtnutICImage = doughtnutIC.toDataURL("image/png");

  const doughtnutCCF = document.getElementById("dn-ccf-" + indic);
  const doughtnutCCFImage = doughtnutCCF.toDataURL("image/png");

  const doughtnutNVA = document.getElementById("dn-nva-" + indic);
  const doughtnutNVAImage = doughtnutNVA.toDataURL("image/png");

  // ---------------------------------------------------------------

  const totalRevenue = revenue.amount;
  const contributionPercentage = revenue.footprint.indicators[indic].value;
  const contributionAmount = (contributionPercentage / 100) * totalRevenue;
  const contributionPerEuro = contributionAmount / totalRevenue;

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
            x: margins.left - 20,
            y: margins.top - 15,
            w: pageSize.width - margins.left - margins.right + 40,
            h: pageSize.height - margins.top - 15,
            color: "#FFFFFF",
            r: 10,
          },
          {
            type: "rect",
            x: 70,
            y: 105,
            w: 200,
            h: 60,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 325,
            y: 105,
            w: 200,
            h: 60,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          // Box Vue de vos Soldes Intermediaires de Gestion
          {
            type: "rect",
            x: 30,
            y: 242,
            w: 535,
            h: 120,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 30,
            y: 392,
            w: 220,
            h: 280,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 275,
            y: 392,
            w: 290,
            h: 220,
            lineWidth: 2,
            lineColor: "#f1f0f4",
            r: 10,
          },
          {
            type: "rect",
            x: 275,
            y: 632,
            w: 290,
            h: 90,
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
              },
            ],
          },

          {
            margin: [0, 15, 0, 30],
            stack: [
              {
                text: "Pour 1€ de chiffre d'affaires",
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
                text: " de ",
                alignment: "center",
              },
              {
                text: label,
                alignment: "center",
              },
            ],
          },
        ],
      },
      {
        text: indicDescription
      },
      // Box Vue de vos Soldes Intérmediaires de Gestion
      {
        text: "Vue de vos Soldes Intérmediaires de Gestion",
        style: "h2",
      },
      {
        margin: [0, 0, 0, 10],
        columns: [
          {
            width: 150,
            margin: [10, 0, 10, 0],
            stack: [
              {
                text:
                  printValue(production.footprint.indicators[indic].value, 0) +
                  "%",
                alignment: "center",
                style: "bigNumber",
              },
              {
                text: "de votre production pour la " + label,
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
                text: "Consommation",
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
      {
        margin: [0, 30, 0, 0],
        columnGap: 40,
        columns: [
          {
            width: 200,
            stack: [
              {
                text: "Comparaison avec la branche d'activité",
                style: "h2",
                margin: [0, 0, 0, 0],
              },
              {
                image: productionChartImage,
                width: 200,
                alignment: "center",
              },
              {
                text: "Performances de vos achats ",
                style: "h3",
                margin: [0, 20, 0, 0],
                alignment: "center",
              },
              {
                text: "36%",
                alignment: "center",
                style: "bigNumber",
                margin: [0, 10, 0, 0],
              },
              {
                text: "de vos achats contribuent aux Métiers d'Art et du Savoir Faire",
                alignment: "center",
                bold: true,
              },
              {
                text: "36%",
                alignment: "center",
                style: "branchNumber",
                margin: [0, 10, 0, 0],
              },
              {
                text: "des achats de la branche contribuent aux Métiers d'Art et du Savoir Faire",
                alignment: "center",
                fontSize: 8,
              },
            ],
          },
          {
            stack: [
              {
                text: "Les comptes de charges les plus impactants",
                style: "h2",
                margin: [0, 0, 0, 10],
              },

              {
                text: "Les plus contributifs ",
                fontSize: 10,
                bold: true,
                margin: [10, 0, 0, 10],
              },

              mostImpactfulExpenses.map((expense) => ({
                text:  expense.account + " - " + expense.accountLib,
                margin: [10, 0, 0, 10],
              })),
             
              {
                text: "Les moins contributifs ",
                fontSize: 10,
                bold: true,
                margin: [10, 15, 0, 10],
              },
              leastImpactfulExpenses.map((expense) => ({
                text:  expense.account + " - " + expense.accountLib,
                margin: [10, 0, 0, 10],
              })),
             
              // ACTIVITES FOURNISSEURS
              {
                text: "Type d'activité des fournisseurs",
                style: "h2",
                margin: [0, 30, 0, 10],
              },
              mostImpactfulExpenses.map((expense) => ({
                text:  expense.accountAux + " - " + expense.accountAuxLib,
                margin: [10, 0, 0, 10],
              })),
             
            
            ],
          },
        ],
      },

      ,
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
      h4: {
        fontSize: 10,
        margin: [0, 10, 0, 10],
        bold: true,
      },
      numbers: {
        fontSize: 18,
        bold: true,
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
