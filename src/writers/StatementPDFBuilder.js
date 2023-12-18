// La Société Nouvelle

// Modules
import { printValue } from "/src/utils/formatters";

// Libraries
import metaIndics from "/lib/indics";

// PDF Make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { getShortCurrentDateString } from "../utils/periodsUtils";
import { loadFonts } from "../utils/exportsUtils";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
loadFonts();

/** STATEMENT PDF GENERATOR
 * 
 * 
 */

export const getStatementPDF = (
  siren,
  denomination,
  year,
  declarant,
  declarantOrganisation,
  price,
  legalUnitFootprint,
  comments
) => {
  // date
  const today = new Date();

  // document definition
  const documentDefinition = {
    content: [
      {
        text: "DECLARATION - EMPREINTE SOCIETALE",
        style: "header",
      },
      {
        text: ["Unité légale : ", { text: siren, bold: true }],
      },
      {
        text: [
          "Dénomination : ",
          { text: (denomination || "").toUpperCase(), bold: true },
        ],
      },
      {
        text: ["Année : ", { text: year, bold: true }],
      },
      {
        text: "Données publiées",
        style: "subheader",
      },
      {
        table: {
          widths: ["*", "auto", "auto", "auto"],
          headerRows: 1,
          body: [
            [
              { text: "Indicateur", style: "tableHeader" },
              { text: "Valeur", style: "tableHeader", colSpan: 2 },
              {},
              {
                text: "Incertitude",
                style: "tableHeader",
                alignment: "center",
              },
            ],
            ...Object.entries(legalUnitFootprint).flatMap(
              ([key, indicator]) => {
                const indicatorRow = [
                  {
                    text: metaIndics[key].libelle,
                    style: "tableCell",
                  },
                  {
                    text: printValue(indicator.value, metaIndics[key].nbDecimals),
                    alignment: "right",
                    style: "tableCell",
                  },
                  {
                    text: metaIndics[key].unit,
                    style: "tableCell",
                  },
                  {
                    text: printValue(indicator.uncertainty, 0) + " %",
                    fontSize: 6,
                    alignment: "right",
                    style: "tableCell",
                  },
                ];

                const commentRow = comments[key]
                  ? [
                      {
                        text: "Commentaire : " + comments[key],
                        colSpan: 4,
                        fontSize: 6,
                        style: "tableCell",
                        fillColor: "#F0F0F8",
                      },
                    ]
                  : [
                      {
                        text: "Commentaire : -",
                        colSpan: 4,
                        fontSize: 6,
                        style: "tableCell",
                        fillColor: "#F0F0F8",
                      },
                    ];

                return [indicatorRow, commentRow];
              }
            ),
          ],
        },
        layout: {
          hLineWidth: function (i, node) {
            return i === 0 || i === node.table.body.length ? 1 : 0;
          },
          vLineWidth: function (i, node) {
            return i === 0 || i === node.table.widths.length ? 1 : 1;
          },
          hLineColor: function (i, node) {
            return i === 0 || i === node.table.body.length
              ? "#191558"
              : "#F0F0F8";
          },
          vLineColor: function (i, node) {
            return i === 0 || i === node.table.widths.length
              ? "#191558"
              : "#F0F0F8";
          },
          paddingLeft: function (i, node) {
            return 4;
          },
          paddingRight: function (i, node) {
            return 4;
          },
          paddingTop: function (i, node) {
            return 3;
          },
          paddingBottom: function (i, node) {
            return 3;
          },
        },
      },

      {
        margin: [0, 10, 0, 0],
        text: ["Edité le : ", { text: getShortCurrentDateString(), bold: true }],
      },
      {
        text: [
          "Déclaration faite par : ",
          { text: declarant || "", bold: true },
        ],
      },
      declarantOrganisation && {
        text: [
          "Structure déclarante : ",
          { text: declarantOrganisation, bold: true },
        ],
      },
      {
        text: "Informations relatives à la publication",
        style: "subheader",
      },
      {
        text: [
          "Le coût de la formalité est de ",
          { text: price || " - ", bold: true },
          " €",
        ],
      },
      {
        text: "Le délai de publication des données est de 7 jours. Un mail de confirmation vous sera envoyé.",
      },
      {
        text: "Les données sont modifiables sur simple demande via l'adresse admin@lasocietenouvelle.org",
      },
      {
        text: "La Société Nouvelle - Société immatriculée au RCS de Lille Métropole - 889 182 770",
        absolutePosition: { x: 40, y: 780 },
        style: "footer",
      },
    ],
    defaultStyle: {
      fontSize: 8,
      color: "#000",
      lineHeight: 1.4,
    },
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 10],
        color: "#fa595f",
      },
      subheader: {
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 5],
        color: "#191558",
      },
      footer: {
        fontSize: 8,
      },
      tableHeader: {
        fillColor: "#191558",
        color: "#ffffff",
        bold: true,
        margin: [0, 5],
      },
    },
  };

  // generator pdf
  const statementPDF = pdfMake.createPdf(documentDefinition);

  return statementPDF;
}