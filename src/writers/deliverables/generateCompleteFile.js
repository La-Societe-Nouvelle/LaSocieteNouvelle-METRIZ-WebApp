// Meta
import metaIndics from "/lib/indics";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import { createContribIndicatorPDF } from "./contribIndicPDF";
import { createCoverPage } from "./coverPage";
import { createIndiceIndicatorPDF } from "./indiceIndicPDF";
import { createIndicReport } from "./indicReportPDF";
import { createIntensIndicatorPDF } from "./intensIndicPDF";

export async function generateCompleteFile(
  year,
  legalUnit,
  validations,
  financialData,
  impactsData,
  comparativeData,
  onDownloadComplete
) {
  const documentTitle =
    "Empreinte-Societale_" + legalUnit.replaceAll(" ", "") + "_" + year;

  const coverPage = createCoverPage(year, legalUnit.corporateName);
  const basicPDFpromises = [];
  const reportPDFpromises = [];

  validations.forEach((indic) => {
    let type = metaIndics[indic].type;

    basicPDFpromises.push(
      createIndicReport(
        year,
        legalUnit,
        indic,
        metaIndics[indic].libelle,
        metaIndics[indic].unit,
        financialData,
        impactsData,
        comparativeData,
        false
      )
    );

    switch (type) {
      case "proportion":
        reportPDFpromises.push(
          createContribIndicatorPDF(
            metaIndics[indic].libelle,
            year,
            legalUnit,
            indic,
            financialData,
            comparativeData,
            false
          )
        );
        break;
      case "intensité":
        reportPDFpromises.push(
          createIntensIndicatorPDF(
            year,
            legalUnit,
            indic,
            metaIndics[indic].libelle,
            metaIndics[indic].unit,
            financialData,
            comparativeData,
            false
          )
        );
        break;
      case "indice":
        reportPDFpromises.push(
          createIndiceIndicatorPDF(
            metaIndics[indic].libelle,
            metaIndics[indic].libelleGrandeur,
            year,
            legalUnit,
            indic,
            metaIndics[indic].unit,
            financialData,
            comparativeData,
            false
          )
        );
      default:
        break;
    }
  });
  const mergedPromises = [coverPage, ...reportPDFpromises, ...basicPDFpromises];

  Promise.all(mergedPromises).then(async (pdfs) => {
    // Create a new empty PDF document to merge PDFs together
    let mergedPdfDoc = await PDFDocument.create();
    const fontBytes = await fetch(
      "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Regular.ttf"
    ).then((res) => res.arrayBuffer());

    // Register the `fontkit` instance
    mergedPdfDoc.registerFontkit(fontkit);

    // Add each PDF to the final PDF document
    for (const pdf of pdfs) {
      const pdfBytes = await pdf.arrayBuffer();

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdfDoc.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
    }
    // Get the number of pages in the merged PDF
    const pageCount = mergedPdfDoc.getPageCount();

    const ralewayFont = await mergedPdfDoc.embedFont(
      fontBytes,
      { subset: true, custom: true },
      fontkit
    );

    // Loop through each page and add the page number
    for (let i = 0; i < pageCount; i++) {
      const page = mergedPdfDoc.getPage(i);

      if (i > 0) {
        // Get the width and height of the page
        const { width, height } = page.getSize();

        // Add the page number as text in the bottom right corner
        const pageNumberText = `Page ${i + 1} sur ${pageCount}`;
        const fontSize = 7;
        const textWidth = ralewayFont.widthOfTextAtSize(
          pageNumberText,
          fontSize
        );
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

    // Save the merged PDF document with page numbers

    const mergedPdfData = new Blob([await mergedPdfDoc.save()], {
      type: "application/pdf",
    });

    // Create a link to download the merged PDF
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(mergedPdfData);

    downloadLink.download = documentTitle + ".pdf";
    document.body.appendChild(downloadLink);

    // Simulate a click on the link to start the download
    downloadLink.click();

    // Remove the link after the download
    document.body.removeChild(downloadLink);

    // Appel de la fonction de rappel
    if (typeof onDownloadComplete === "function") {
      onDownloadComplete();
    }
  });
}
