import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Utils
import { getShortCurrentDateString } from "/src/utils/periodsUtils";
import { loadFonts } from "./utils/layout";

import styles from "/lib/styles"
import { pdfMargins, pdfPageSize } from "../../../../../constants/pdfConfig";


pdfMake.vfs = pdfFonts.pdfMake.vfs;
loadFonts();

export const generateReportDividerPage = (title) => {


  // ---------------------------------------------------------------
  // Colors

  const { colors } = styles["default"];

  const footer = {
    columns: [
      {
        text: "Edité le " + getShortCurrentDateString(),
        margin: [20, 25, 0, 0],
        fontSize: 7,
      },
    ],
  };

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
      stack: [
        { text: "\n\n\n\n\n\n\n\n\n\n" },
        {
          text: title,
          alignment: "center",
          fontSize: 24,
        },
      ],
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
    footer: footer,
    background: background,
    info: {
      title: "",
      author: "La Société Nouvelle",
      subject: "Rapport des impacts de votre entreprise",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content: content,
    defaultStyle: {
      color: colors.primary,
      font: "Raleway",
    },
    styles: {},
  };

  return new Promise((resolve) => {
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBlob((blob) => {
      resolve(blob);
    });
  });
}