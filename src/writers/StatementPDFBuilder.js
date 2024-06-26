// La Société Nouvelle

// Utils
import { getShortCurrentDateString } from "../utils/periodsUtils";


// PDF Make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import { loadFonts } from "../components/sections/results/exports/reports/utils/layout";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

/** STATEMENT PDF GENERATOR
 *  
 *  Description : file with summary of published information (footprint, etc.)
 *  Use : builder triggered in publish statement section
 */

// fonts
loadFonts();

export const buildStatementPDF = (
  siren,
  denomination,
  year,
  declarant,
  declarantOrganisation,
  price,
  legalUnitFootprint,
) => {
  // date
  const today = new Date();
  // document definition

  const tableData = Object.entries(legalUnitFootprint).map(([indicator, details]) => ({
    libelle: details.libelle,
    value: details.value,
    unit: details.unit,
    uncertainty : details.uncertainty,
    comment : details.comment ?? " - "
  }));

  console.log(tableData);

  const documentDefinition = {
    content: [
      {
        text: "DECLARATION - EMPREINTE SOCIETALE",
        style: "header"
      }, {
        text: ["Unité légale : ", { text: siren, bold: true }],
      }, {
        text: ["Dénomination : ", { text: (denomination || "").toUpperCase(), bold: true }],
      }, {
        text: ["Année : ", { text: year, bold: true }],
      }, {
        text: "Données publiées",
        style: "subheader"
      }, {
        table: {
          widths: ["*", "auto", "auto", "auto"],
          headerRows: 1,
          body: [
            [
              { text: "Indicateur", style: "tableHeader" },
              { text: "Valeur", style: "tableHeader" },
              { text: "Unité", style: "tableHeader" },
              { text: "Incertitude", style: "tableHeader" },
            ],
            ...tableData.flatMap(row => [
              [
                { text: row.libelle, style: "tableCell" },
                { text: row.value, style: "tableCell" },
                { text: row.unit, style: "tableCell" },
                { text: row.uncertainty, style: "tableCell" },
              ],
              [
                {
                  text: `Commentaire : ${row.comment}`,
                  colSpan: 4,
                  fontSize: 6,
                  style: "tableCell",
                  fillColor: "#F0F0F8",
                },
              ],
            ]),
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
        layout: getTableLayout(),
      },
      {
        text: ["Edité le : ", { text: getShortCurrentDateString(), bold: true }],
        margin: [0, 10, 0, 0],
      },
      {
        text: ["Déclaration faite par : ", { text: declarant || "", bold: true }],
      },

      // --------------------------------------------------
      // if statement by a third party

      declarantOrganisation && {
        text: [ "Structure déclarante : ", { text: declarantOrganisation, bold: true }],
      },

      // --------------------------------------------------

      {
        text: "Informations relatives à la publication",
        style: "subheader",
      }, {
        text: ["Le coût de la formalité est de ", { text: price || " - ", bold: true }, " €"],
      }, {
        text: "Le délai de publication des données est de 7 jours. Un mail de confirmation vous sera envoyé.",
      }, {
        text: "Les données sont modifiables sur simple demande via l'adresse admin@lasocietenouvelle.org",
      }, {
        text: "La Société Nouvelle - Société immatriculée au RCS de Lille Métropole - 889 182 770",
        absolutePosition: { x: 40, y: 780 },
        style: "footer",
      },
    ],

    // ----------------------------------------------------------------------------------------------------
    // Styles

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
    }

    // ----------------------------------------------------------------------------------------------------
  };
  // generator pdf
  const statementPDF = pdfMake.createPdf(documentDefinition);

  return statementPDF;
}

// ################################################## UTILS ##################################################

// --------------------------------------------------
// Table layout

const getTableLayout = () => 
{
  return({
    hLineWidth:    (i, node) => i === 0 || i === node.table.body.length ? 1 : 0,
    vLineWidth:    (i, node) => i === 0 || i === node.table.widths.length ? 1 : 1,
    hLineColor:    (i, node) => i === 0 || i === node.table.body.length ? "#191558" : "#F0F0F8",
    vLineColor:    (i, node) => i === 0 || i === node.table.widths.length ? "#191558" : "#F0F0F8",
    paddingLeft:   (i, node) => 4,
    paddingRight:  (i, node) => 4,
    paddingTop:    (i, node) => 3,
    paddingBottom: (i, node) => 3,
  })
}