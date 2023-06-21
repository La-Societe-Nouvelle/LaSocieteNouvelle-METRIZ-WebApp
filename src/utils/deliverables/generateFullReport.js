import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import metaIndics from "/lib/indics";
import { generateCover } from "./generateCover";
import { generateIndicReport } from "./generateIndicReport";

export async function generateFullReport(
  legalUnit,
  validations,
  financialData,
  impactsData,
  comparativeData,
  onDownloadComplete,
  period,
  prevPeriod
) {
  const year = period.periodKey.slice(2);
  const documentTitle = `Empreinte-Societale_${legalUnit.replaceAll(
    /[^a-zA-Z0-9]/g,
    "_"
  )}_${year}`;

  const coverPage = generateCover(year, legalUnit);
  const basicPDFpromises = [];
  const reportPDFpromises = [];

  for (const indic of validations) {
    const { type, libelle, unit, libelleGrandeur } = metaIndics[indic];

    basicPDFpromises.push(
      generateIndicReport(
        legalUnit,
        indic,
        libelle,
        unit,
        financialData,
        impactsData,
        comparativeData,
        false,
        period,
        prevPeriod,
      )
    );

    // switch (type) {
    //   case "proportion":
    //     reportPDFpromises.push(
    //       createContribIndicatorPDF(
    //         libelle,
    //         legalUnit,
    //         indic,
    //         financialData,
    //         comparativeData,
    //         false,
    //         period
    //       )
    //     );
    //     break;
    //   case "intensité":
    //     reportPDFpromises.push(
    //       createIntensIndicatorPDF(
    //         legalUnit,
    //         indic,
    //         libelle,
    //         unit,
    //         financialData,
    //         comparativeData,
    //         false,
    //         period
    //       )
    //     );
    //     break;
    //   case "indice":
    //     reportPDFpromises.push(
    //       createIndiceIndicatorPDF(
    //         libelle,
    //         libelleGrandeur,
    //         legalUnit,
    //         indic,
    //         unit,
    //         financialData,
    //         comparativeData,
    //         false,
    //         period
    //       )
    //     );
    //     break;
    //   default:
    //     break;
    // }
  }

  try {
    const mergedPromises = [coverPage, ...reportPDFpromises, ...basicPDFpromises];
    const pdfs = await Promise.all(mergedPromises);

    const mergedPdfDoc = await PDFDocument.create();
    const fontBytes = await fetch(
      "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Regular.ttf"
    ).then((res) => res.arrayBuffer());

    mergedPdfDoc.registerFontkit(fontkit);

    for (const pdf of pdfs) {
      const pdfBytes = await pdf.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdfDoc.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
    }

    const pageCount = mergedPdfDoc.getPageCount();
    const ralewayFont = await mergedPdfDoc.embedFont(
      fontBytes,
      { subset: true, custom: true },
      fontkit
    );

    for (const [pageNumber, page] of mergedPdfDoc.getPages().entries()) {
      if (pageNumber > 0) {
        const { width, height } = page.getSize();
        const pageNumberText = `Page ${pageNumber + 1} sur ${pageCount}`;
        const fontSize = 7;
        const textWidth = ralewayFont.widthOfTextAtSize(pageNumberText, fontSize);
        const textHeight = ralewayFont.heightAtSize(fontSize);

        page.drawText(pageNumberText, {
          x: width - textWidth - 20,
          y: textHeight + 12,
          size: fontSize,
          font: ralewayFont,
          color: rgb(25 / 255, 21 / 255, 88 / 255),
        });
      }
    }

    const mergedPdfData = new Blob([await mergedPdfDoc.save()], {
      type: "application/pdf",
    });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(mergedPdfData);
    downloadLink.download = `${documentTitle}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    if (typeof onDownloadComplete === "function") {
      onDownloadComplete();
    }
  } catch (error) {
    // Gérer l'erreur ici
    if (typeof onDownloadComplete === "function") {
        onDownloadComplete();
      }
    console.error("Une erreur s'est produite lors de la génération du PDF :", error);
  }
}
