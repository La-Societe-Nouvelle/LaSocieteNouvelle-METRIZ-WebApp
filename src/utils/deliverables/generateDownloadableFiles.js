import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import jsZip from "jszip";
import jsPDF from "jspdf";

import metaIndics from "/lib/indics";
import { generateCover } from "./generateCover";
import { generateIndicatorReport } from "./generateIndicatorReport";
import { generateContributionIndicatorSheet } from "./generateContributionIndicatorSheet";
import { generateIntensityIndicatorSheet } from "./generateIntensityIndicatorSheet";
import { generateIndiceIndicatorSheet } from "./generateIndiceIndicatorSheet";
import { generateFootprintPDF } from "../../writers/Export";
import { generateXLSXFile } from "./generateExcelFile";

export async function generateDownloadableFiles(
  selectedFiles,
  session,
  onDownloadComplete,
  period,
  prevPeriod
) {
  const legalUnit = session.legalUnit.corporateName;
  const validations = session.validations[period.periodKey];
  const financialData = session.financialData;
  const impactsData = session.impactsData;
  const comparativeData = session.comparativeData;
  const year = period.periodKey.slice(2);
  const documentTitle = `Empreinte-Societale_${legalUnit.replaceAll(
    /[^a-zA-Z0-9]/g,
    "_"
  )}_${year}`;
  const zip = new jsZip();

  // Generate PDFs for each declared indicator (file ID: full-report)
  if (selectedFiles.includes("full-report")) {
    const fullReport = await generateFullReportPDF(
      legalUnit,
      validations,
      financialData,
      impactsData,
      comparativeData,
      year,
      period,
      prevPeriod
    );

    zip.file(`${documentTitle}.pdf`, fullReport, { binary: true });
  }

  // Generate PDFs for SIG footprint (file ID: sig-pdf)
  if (selectedFiles.includes("sig-pdf")) {
    const sigPDFDoc = await generateSIGFootprintPDF(
      period,
      financialData,
      legalUnit,
      year
    );

    zip.file(
      `Empreinte-Societale_SIG_${legalUnit.replaceAll(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${year}.pdf`,
      sigPDFDoc.output("blob")
    );
  }

  // Add .json file save (file ID: svg)
  if (selectedFiles.includes("svg")) {
    const sessionFile = `session-metriz-${legalUnit.replaceAll(" ", "-")}`;
    const json = JSON.stringify(session);
    const blobSession = new Blob([json], { type: "application/json" });
    zip.file(`${sessionFile}.json`, blobSession);
  }

  // Generate SIG data in XLSX format (file ID: sig-xlsx)
  if (selectedFiles.includes("sig-xlsx")) {
    for (const indic of validations) {
      let file = await generateXLSXFile(indic, session, period);
      let blobXLSX = new Blob([file], { type: "application/octet-stream" });
      zip.file(`sig_${indic}.xlsx`, blobXLSX);
    }
  }

  // Generate ZIP file containing the generated files
  zip.generateAsync({ type: "blob" }).then((content) => {
    // Télécharger le ZIP
    saveAs(content, `${documentTitle}.zip`);
    if (typeof onDownloadComplete === "function") {
      onDownloadComplete();
    }
  });
}

// Fonction pour générer le rapport complet (full-report)
async function generateFullReportPDF(
  legalUnit,
  validations,
  financialData,
  impactsData,
  comparativeData,
  year,
  period,
  prevPeriod
) {
  const coverPage = generateCover(year, legalUnit);
  const basicPDFpromises = [];
  const reportPDFpromises = [];

  for (const indic of validations) {
    const { type, libelle, unit, libelleGrandeur } = metaIndics[indic];

    basicPDFpromises.push(
      generateIndicatorReport(
        legalUnit,
        indic,
        libelle,
        unit,
        financialData,
        impactsData,
        comparativeData,
        false,
        period,
        prevPeriod
      )
    );

    switch (type) {
      case "proportion":
        reportPDFpromises.push(
          generateContributionIndicatorSheet(
            libelle,
            legalUnit,
            indic,
            financialData,
            comparativeData,
            false,
            period
          )
        );
        break;
      case "intensité":
        reportPDFpromises.push(
          generateIntensityIndicatorSheet(
            legalUnit,
            indic,
            libelle,
            unit,
            financialData,
            comparativeData,
            false,
            period
          )
        );
        break;
      case "indice":
        reportPDFpromises.push(
          generateIndiceIndicatorSheet(
            libelle,
            libelleGrandeur,
            legalUnit,
            indic,
            unit,
            financialData,
            comparativeData,
            false,
            period
          )
        );
        break;
      default:
        break;
    }
  }

  try {
    const mergedPromises = [
      coverPage,
      ...reportPDFpromises,
      ...basicPDFpromises,
    ];
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

    const mergedPdfBytes = await mergedPdfDoc.save();
    return mergedPdfBytes;
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la génération du PDF :",
      error
    );
  }
}

// Fonction pour générer le rapport SIG Footprint (sig-pdf)
async function generateSIGFootprintPDF(period, financialData, legalUnit, year) {
  const envIndic = ["ghg", "nrg", "wat", "mat", "was", "haz"];
  const seIndic = ["eco", "art", "soc", "idr", "geq", "knw"];
  const seOdds = ["5", "8", "9", "10", "12"];
  const envOdds = ["6", "7", "12", "13", "14", "15"];

  const docEES = new jsPDF("landscape", "mm", "a4", true);

  await generateFootprintPDF(
    docEES,
    envIndic,
    period,
    financialData,
    legalUnit,
    year,
    "Empreinte environnementale",
    envOdds
  );

  docEES.addPage();

  await generateFootprintPDF(
    docEES,
    seIndic,
    period,
    financialData,
    legalUnit,
    year,
    "Empreinte économique et sociale",
    seOdds
  );

  return docEES;
}
