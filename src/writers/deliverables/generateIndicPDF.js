// Utils
import { printValue } from "/src/utils/Utils";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { writeStatementECO } from "./writeIndicstatement";
import { analysisTextWriterART } from "../analysis/analysisTextWriterART";
import { analysisTextWriterIDR } from "../analysis/analysisTextWriterIDR";
import { analysisTextWriterECO } from "../analysis/analysisTextWriterECO";
import { analysisTextWriterGEQ } from "../analysis/analysisTextWriterGEQ";
import { analysisTextWriterGHG } from "../analysis/analysisTextWriterGHG";
import { analysisTextWriterHAZ } from "../analysis/analysisTextWriterHAZ";
import { analysisTextWriterKNW } from "../analysis/analysisTextWriterKNW";
import { analysisTextWriterMAT } from "../analysis/analysisTextWriterMAT";
import { analysisTextWriterNRG } from "../analysis/analysisTextWriterNRG";
import { analysisTextWriterSOC } from "../analysis/analysisTextWriterSOC";
import { analysisTextWriterWAS } from "../analysis/analysisTextWriterWAS";
import { analysisTextWriterWAT } from "../analysis/analysisTextWriterWAT";

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

export const generateIndicPDF = (
  indic,
  title,
  unit,
  legalUnit,
  year,
  financialData,
  impactsData,
  comparativeData,
  branche
) => {

  const indicImage = "http://localhost:3000/resources/icon-ese-bleues/" + indic + ".png";

  let today = new Date();

  const canvasProduction = document.getElementById("production-" + indic);
  const canvasValueAdded = document.getElementById("netValueAdded-" + indic);
  const canvasIntermediateConsumption = document.getElementById("intermediateConsumption-" + indic);
  const canvasFixedCapitalConsumption = document.getElementById("capitalConsumption-" + indic);


  const productionChartImg = canvasProduction.toDataURL("image/png");

  const statementNotes = getStatementNote(impactsData, indic);
  const analysisNotes = getAnalyse(
    impactsData,
    financialData,
    comparativeData,
    indic
  );

  // FINANCIAL DATA
  const {
    production,
    revenue,
    storedProduction,
    immobilisedProduction,
    intermediateConsumption,
    capitalConsumption,
    netValueAdded,
  } = financialData.aggregates;

  const margins = {
    top: 40,
    bottom: 40,
    left: 40,
    right: 40,
  };
  const pageSize = {
    width: 595.28,
    height: 841.89,
  };
  const docDefinition = {
    pageSize: pageSize,
    pageMargins: [margins.top, margins.right, margins.bottom, margins.left],
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
            x: margins.left - 10,
            y: margins.top - 10,
            w: pageSize.width - margins.left - margins.right + 20,
            h: pageSize.height - margins.top - margins.bottom,
            color: "#FFFFFF",
            r: 10,
          },
        ],
      };
    },
    content: [
      { text: "Rapport des impacts de votre entreprise", style: "header" },
      {
        text: title,
        style: "h2",
      }, 
      {
        image: 'indicImage',
        width: 80,
        height: 80,
        absolutePosition: { x: pageSize.width - margins.left - 30, y: -10 },
        opacity: 1,
    },

      // "\n",
      // { text: legalUnit.corporateName, style: "legalUnit", margin: [0, 10] },
      // { text: "Année de fin d'exercice " + year, style: "text" },
      // {
      //   text:
      //     "Edité le : " +
      //     String(today.getDate()).padStart(2, "0") +
      //     "/" +
      //     String(today.getMonth() + 1).padStart(2, "0") +
      //     "/" +
      //     today.getFullYear(),
      //   style: "text",
      // },
      { text: "Vue de vos Soldes Intermédiaires de Gestion", style: "h3" },
      {
        style: "table",
        table: {
          widths: ["*", "auto", "auto", "auto"],
          body: [
            [
              {
                text: "",
                style: "tableHeader",
                border: [false, false, true, false],
              },
              {
                text: "Montant",
                style: "tableHeader",
                border: [false, false, true, false],
              },
              {
                text: "Empreinte",
                style: "tableHeader",
                border: [false, false, true, false],
              },
              {
                text: "Incertitude",
                style: "tableHeader",
                border: [false, false, true, false],
              },
            ],
            [
              { text: "Production", style: "tableBold", margin: [2, 2, 2, 2] },
              {
                text: printValue(production.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              {
                text:
                  printValue(production.footprint.indicators[indic].value, 1) +
                  " " +
                  unit,
                
                margin: [2, 2, 2, 2],
              },
              {
                text:
                  printValue(
                    production.footprint.indicators[indic].uncertainty,
                    1
                  ) + " %",
                
                margin: [2, 2, 2, 2],
              },
            ],
            [
              {
                text: "Chiffre d'affaire",
                style: "tableLeft",
                margin: [15, 0, 0, 0],
              },
              {
                text: printValue(revenue.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              {
                text:
                  printValue(revenue.footprint.indicators[indic].value, 1) +
                  " " +
                  unit,
                
                margin: [2, 2, 2, 2],
              },
              {
                text:
                  printValue(
                    revenue.footprint.indicators[indic].uncertainty,
                    1
                  ) + " %",
                
                margin: [2, 2, 2, 2],
              },
            ],
            [
              {
                text: "Production stockée",
                style: "tableLeft",
                margin: [15, 0, 0, 0],
              },
              {
                text: printValue(storedProduction.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              {
                text:
                  printValue(
                    storedProduction.footprint.indicators[indic].value,
                    1
                  ) +
                  " " +
                  unit,
                
                margin: [2, 2, 2, 2],
              },
              {
                text:
                  printValue(
                    storedProduction.footprint.indicators[indic].uncertainty,
                    1
                  ) + " %",
                
                margin: [2, 2, 2, 2],
              },
            ],
            [
              {
                text: "Consommations intermédiaires",
                style: "tableBold",
                margin: [2, 2, 2, 2],
              },
              {
                text: printValue(intermediateConsumption.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              {
                text:
                  printValue(
                    intermediateConsumption.footprint.indicators[indic].value,
                    1
                  ) +
                  " " +
                  unit,
                
                margin: [2, 2, 2, 2],
              },
              {
                text:
                  printValue(
                    intermediateConsumption.footprint.indicators[indic]
                      .uncertainty,
                    1
                  ) + " %",
                
                margin: [2, 2, 2, 2],
              },
            ],
            [
              {
                text: "Matières premières",
                style: "tableLeft",
                margin: [15, 0, 0, 0],
              },
              {
                text: printValue(production.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              { text: "Text"},
              { text: "Text"},
            ],
            [
              {
                text: "Autres approvisionnements",
                style: "tableLeft",
                margin: [15, 0, 0, 0],
              },
              {
                text: printValue(production.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              { text: "Text"},
              { text: "Text"},
            ],
            [
              {
                text: "Variation de stocks",
                style: "tableLeft",
                margin: [15, 0, 0, 0],
              },
              {
                text: printValue(production.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              { text: "Text"},
              { text: "Text"},
            ],
            [
              {
                text: "autres achats",
                style: "tableLeft",
                margin: [15, 0, 0, 0],
              },
              {
                text: printValue(production.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              { text: "Text"},
              { text: "Text"},
            ],
            [
              {
                text: "Autres charges externes",
                style: "tableLeft",
                margin: [15, 0, 0, 0],
              },
              {
                text: printValue(production.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              { text: "Text"},
              { text: "Text"},
            ],
            [
              {
                text: "Dotations aux Amortissements sur immobilisations",
                style: "tableBold",
                margin: [2, 2, 2, 2],
              },
              {
                text: printValue(capitalConsumption.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              {
                text: printValue(
                  capitalConsumption.footprint.indicators[indic].value,
                  1
                ),
                
                margin: [2, 2, 2, 2],
              },
              {
                text:
                  printValue(
                    capitalConsumption.footprint.indicators[indic].uncertainty,
                    0
                  ) + " %",
                
                margin: [2, 2, 2, 2],
              },
            ],
            [
              {
                text: "Immobilisations incorporelles",
                style: "tableLeft",
                margin: [15, 0, 0, 0],
              },
              {
                text: printValue(production.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              { text: "Text"},
              { text: "Text"},
            ],
            [
              {
                text: "Immobilisations corporelles",
                style: "tableLeft",
                margin: [15, 0, 0, 0],
              },
              {
                text: printValue(production.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              { text: "Text"},
              { text: "Text"},
            ],
            [
              {
                text: "Valeur ajoutée nette",
                style: "tableBold",
                margin: [2, 2, 2, 2],
              },
              {
                text: printValue(netValueAdded.amount, 0) + " €",
                
                margin: [2, 2, 2, 2],
              },
              {
                text: printValue(
                  netValueAdded.footprint.indicators[indic].value,
                  1
                ),
                
                margin: [2, 2, 2, 2],
              },
              {
                text:
                  printValue(
                    netValueAdded.footprint.indicators[indic].uncertainty,
                    0
                  ) + " %",
                
                margin: [2, 2, 2, 2],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: function (i, node) {
            return i === 0 ||
              i === 4 ||
              i === 10 ||
              i === 13 ||
              i === node.table.body.length
              ? 1
              : 0;
          },
          vLineWidth: function (i, node) {
            return 0;
          },
          hLineColor: function (i, node) {
            return i === 0 ? "#191558" : "#f0f0f8";
          },
        },
      },
      { text: "Impacts directs", style: "h3" },
      statementNotes.map((note) => note),


      { text: "Note d'analyse", style: "h3" },
      analysisNotes.map((note) => ({ text: note, style: "text" })),
      { text: "Déclaration des impacts directs", style: "h3" },
      {
        columns: [
          
          {
            stack: [
              { text: "Production ", style: "h5" },
              {
                image: productionChartImg,
                width: 100,
              },
            ],
          },
          {
            stack: [
              {
                text: "Valeur ajoutée",
                style: "h5",
              },
              {
                image: productionChartImg,
                width: 100,
              },
            ],
          },
          {
            stack: [
              {
                text: "Consommations intermédiaires ",
                style: "h5",
              },
              {
                image: productionChartImg,
                width: 100,
              },
            ],
          },
          {
            stack: [
              {
                text: "Consommation de Capital Fixe ",
                style: "h5",
              },
              {
                image: productionChartImg,
                width: 100,
              },
            ],
          },
        ],
      },
      ,
    ],
    images: {
      indicImage: indicImage,
  },
    defaultStyle: {
      fontSize: 9,
      color: "#191558",
    },
    styles: {
      header: {
        fontSize: 20,
        font: "Raleway",
        color: "#fa595f",
        bold: true,
        alignment: "center",
        margin: [0, 5, 0, 0],
      },
      h2: {
        fontSize: 16,
        font: "Raleway",
        color: "#191558",
        bold: true,
        alignment: "center",
        margin: [0, 15, 0, 15],
      },
      h3: {
        fontSize: 13,
        font: "Raleway",
        color: "#fa595f",
        bold: true,
        margin: [0, 10, 0, 10],
      },
      h4: {
        fontSize: 10,
        font: "Raleway",
        color: "#191558",
        margin: [0, 0, 0, 20],
      },
      h5: {
        fontSize: 7,
        font: "Raleway",
        margin: [0, 10, 0, 10],
        bold: true,
      },
      legalUnit: {
        font: "Raleway",
        fontSize: 16,
        color: "#fa595f",
        bold: true,
      },
      text: {
        alignment: "justify",
        lineHeight: 1.5,
      },
      table: {
        alignment: "right",
        fontSize : 8,
        margin: [0, 0, 0, 15],
      },
      tableHeader: {
        fillColor: "#f0f0f8",
        bold: true,
        margin: [0, 5, 0, 5],
        color: "#191558",
        alignment: "center",
      },
      tableBold: {
        bold: true,
        alignment: "left",
      },
      tableLeft: {
        alignment: "left",
      },
    },
  };

  pdfMake.createPdf(docDefinition).open();
};

const getStatementNote = (impactsData, indic) => {
  switch (indic) {
    case "art":
      return writeStatementART(impactsData);
    case "idr":
      return writeStatementIDR(impactsData);
    case "eco":
      return writeStatementECO(impactsData);
    case "geq":
      return writeStatementGEQ(impactsData);
    case "ghg":
      return writeStatementGHG(impactsData);
    case "haz":
      return writeStatementHAZ(impactsData);
    case "knw":
      return writeStatementKNW(impactsData);
    case "mat":
      return writeStatementMAT(impactsData);
    case "nrg":
      return writeStatementNRG(impactsData);
    case "soc":
      return writeStatementSOC(impactsData);
    case "was":
      return writeStatementWAS(impactsData);
    case "wat":
      return writeStatementWAT(impactsData);
  }
};

const getAnalyse = (impactsData, financialData, comparativeData, indic) => {
  const session = {
    impactsData: impactsData,
    financialData: financialData,
    comparativeData: comparativeData,
  };
  switch (indic) {
    case "art":
      return analysisTextWriterART(session);
    case "idr":
      return analysisTextWriterIDR(session);
    case "eco":
      return analysisTextWriterECO(session);
    case "geq":
      return analysisTextWriterGEQ(session);
    case "ghg":
      return analysisTextWriterGHG(session);
    case "haz":
      return analysisTextWriterHAZ(session);
    case "knw":
      return analysisTextWriterKNW(session);
    case "mat":
      return analysisTextWriterMAT(session);
    case "nrg":
      return analysisTextWriterNRG(session);
    case "soc":
      return analysisTextWriterSOC(session);
    case "was":
      return analysisTextWriterWAS(session);
    case "wat":
      return analysisTextWriterWAT(session);
  }
};
