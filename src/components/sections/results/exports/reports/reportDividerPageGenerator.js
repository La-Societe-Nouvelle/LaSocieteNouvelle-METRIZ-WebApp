import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Utils
import { getShortCurrentDateString } from "/src/utils/periodsUtils";
import { loadFonts } from "./utils/layout";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
loadFonts();

export const generateReportDividerPage = (title) => 
{
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
        w: pageSize.width,
        h: pageSize.height,
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
    pageSize: pageSize,
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
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
      color: "#191558",
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