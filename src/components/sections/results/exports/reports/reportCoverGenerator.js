import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Utils
import { loadFonts } from "./utils/layout";
import { loadImageAsDataURL } from "./utils";

import styles from "/lib/styles"
import { pdfMargins, pdfPageSize } from "../../../../../constants/pdfConfig";
import { getYearPeriod } from "../../../../../utils/periodsUtils";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
loadFonts();

export const generateReportCover = async (period, legalUnit) => 
{
  // Illustration
  const illuPath = "/resources/metriz_illus.png";
  const illustration = await loadImageAsDataURL(illuPath);

  // ---------------------------------------------------------------
  // Colors

  const { colors } = styles["default"];

  const background = {
    canvas: [
      {
        type: "rect",
        x: 0,
        y: 0,
        w: pdfPageSize.width,
        h: pdfPageSize.height,
        color: colors.light,
      },
      {
        type: "rect",
        x: pdfMargins.left - 20,
        y: pdfMargins.top - 15,
        w: pdfPageSize.width - pdfMargins.left - pdfMargins.right + 40,
        h: pdfPageSize.height - pdfMargins.top - 15,
        color: "#FFFFFF",
        r: 10,
      },
    ],
  };

  const content = [
    {
      text: "Empreinte sociétale de l'entreprise",
      alignment: "center",
      fontSize: 24,
      bold: true,
      margin: [0, 100, 0, 0],
    },
    {
      text: legalUnit.corporateName,
      alignment: "center",
      fontSize: 18,
      bold: true,
      color: "#fa595f",
      margin: [0, 20, 0, 10],
    },
    {
      fontSize: 12,
      margin: [0, 10, 0, 10],
      columnGap: 40,
      columns: [
        {
          text: `SIREN : ${legalUnit.siren}`,
          alignment: "right",
        },
        {
          text: `Exercice ${getYearPeriod(period)}`,
          alignment: "left",
        },
      ],
    },
    {
      image: illustration,
      width: 350,
      alignment: "center",
      margin: [0, 50, 0, 150],
    },
    createPublicationBloc(),
  ];

  return content;  
}


const createPublicationBloc = () => 
{
  const tableBody = [
    [{
      text: "L'empreinte de la production de l'entreprise n'est pas publiée au sein de la base de données ouverte SINESE.",
      color: "#dc3545",
      bold: true,
      alignment: "left",
      margin: [0, 0, 0, 0.5],
      fontSize: 10
    }],[{
      text: "La publication de votre empreinte sociétale correspond à la mise en ligne de votre performance extra-financière au sein de la base de données SINESE "+
            "ouverte. Elle permet de valoriser vos résultats, d’être identifié comme acteur de la transition et de permettre à vos clients de fiabiliser la mesure de "+
            "leur propre empreinte sociétale. Seule l’empreinte de votre chiffre d’affaires est rendue publique, le détail des résultats reste à votre discretion.",
      color: "#dc3545",
      alignment: "left",
      fontSize: 10
    }],[{
      text: "Vous pouvez directement publier votre empreinte via l'application Metriz.",
      color: "#dc3545",
      alignment: "left",
      fontSize: 10
    }]
  ];

  return {
    table: {
      headerRows: 0,
      widths: ["*"],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === node.table.body.length) ? 0.5 : 0
      },
      hLineColor: function (i, node) {
        return "#fa595f";
      },
      vLineWidth: function (i, node) {
        return 0.5;
      },
      vLineColor: function (i, node) {
        return "#fa595f";
      },
      paddingTop: function (i, node) { return 4 },
      paddingBottom: function (i, node) { return 4 },
      paddingLeft: function (i, node) { return 4 },
      paddingRight: function (i, node) { return 4 },
    },
    fillColor: "#f8d7da",
    margin: [0, 0, 0, 20],
  };
};