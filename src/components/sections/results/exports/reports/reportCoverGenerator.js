import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import { loadFonts } from "../../../../../utils/exportsUtils";
import { loadImageAsDataURL } from "../exportsUtils";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
loadFonts();

export const generateReportCover = async (year, legalUnit) => {
  // Illustration
  const illuPath = "/resources/metriz_illus.png";
  const illustration = await loadImageAsDataURL(illuPath);

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
          alignment : "right",
        },
        {
          text: `Exercice ${year}`,
          alignment : "left",
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
    pageSize: pageSize,
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
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
