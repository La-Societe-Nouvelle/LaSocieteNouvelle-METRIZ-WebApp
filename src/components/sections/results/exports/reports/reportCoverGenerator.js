import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Utils
import { loadFonts } from "./utils/layout";
import { loadImageAsDataURL } from "./utils";

import styles from "/lib/styles"
import { pdfMargins, pdfPageSize } from "../../../../../constants/pdfConfig";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
loadFonts();

export const generateReportCover = async (year, legalUnit) => {
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
          text: `Exercice ${year}`,
          alignment: "left",
        },
      ],
    },
    {
      image: illustration,
      width: 350,
      alignment: "center",
      margin: [0, 50, 0, 0],
    },
  ];

  const docDefinition = {
    pdfPageSize: pdfPageSize,
    pageMargins: [
      pdfMargins.left,
      pdfMargins.top,
      pdfMargins.right,
      pdfMargins.bottom,
    ],
    background: background,
    info: {
      title: "",
      author: legalUnit,
      subject: "Rapport des impacts de votre entreprise",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content: content,
    defaultStyle: {
      color: "#191558",
      font: "Raleway",
    },
  };

  return new Promise((resolve) => {
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBlob((blob) => {
      resolve(blob);
    });
  });
};
