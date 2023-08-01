import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import jsZip from "jszip";
import jsPDF from "jspdf";

import metaIndics from "../../../lib/indics.json";
import { generateCover } from "./generateCover";
import { generateReport } from "./generateIndicatorReport";
import { generateContributionIndicatorSheet } from "./generateContributionIndicatorSheet";
import { generateIntensityIndicatorSheet } from "./generateIntensityIndicatorSheet";
import { generateIndiceIndicatorSheet } from "./generateIndiceIndicatorSheet";
import { generateFootprintPDF } from "../../writers/Export";
import { generateXLSXFile } from "./generateExcelFile";

export async function generateDownloadableFiles(
  selectedFiles,
  selectedIndicator,
  session,
  onDownloadComplete,
  period,
  prevPeriod
) {
  // Extract necessary data from the session object
  const legalUnit = session.legalUnit.corporateName;
  const validations = session.validations[period.periodKey];
  const financialData = session.financialData;
  const impactsData = session.impactsData;
  const comparativeData = session.comparativeData;
  const year = period.periodKey.slice(2);
  const legalUnitNameFile = legalUnit.replaceAll(/[^a-zA-Z0-9]/g, "_");
  const documentTitle = `Empreinte-Societale_${legalUnitNameFile}_${year}`;
  let indicLabel;
  if (selectedIndicator) {
    indicLabel = metaIndics[selectedIndicator].libelle.replaceAll(/[' ]/g, "-");
  }

  const zip = new jsZip();

  const includeAllFiles = selectedFiles.includes("checkbox-all");
  const includeSigXLSX = selectedFiles.includes("sig-indic-xlsx");
  const includeIndicReport = selectedFiles.includes("indic-report");

  // Function to download the PDF directly
  const downloadFile = async (blob, title) => {
    const pdfUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = pdfUrl;
    downloadLink.download = title;
    downloadLink.click();

    URL.revokeObjectURL(pdfUrl);
    onDownloadComplete();
  };

  // Generate PDFs for each declared indicator
  if (includeAllFiles) {
    const fullReport = await generateCompleteReportPDF(
      legalUnit,
      validations,
      financialData,
      impactsData,
      comparativeData,
      year,
      period,
      prevPeriod
    );

    // Add the full report to the ZIP file

    zip.file(`${documentTitle}.pdf`, fullReport, { binary: true });

    // Generate PDFs for SIG footprint
    const sigPDFDoc = await generateSIGFootprintPDF(
      period,
      financialData,
      legalUnit,
      year
    );
    // Add the SIG footprint PDF to the ZIP file
    zip.file(
      `Empreinte-Societale_SIG_${legalUnit.replaceAll(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${year}.pdf`,
      sigPDFDoc.output("blob")
    );

    // Generate Excel (XLSX) files for each indicator and add them to the ZIP file
    for (const indic of validations) {
      let file = await generateXLSXFile(indic, session, period);
      let blobXLSX = new Blob([file], { type: "application/octet-stream" });
      zip.file(`sig_${indic}.xlsx`, blobXLSX);
    }

    // Add session data as a JSON file to the ZIP file

    const sessionFile = `session-metriz-${legalUnit.replaceAll(" ", "-")}`;
    const json = JSON.stringify(session);
    const blobSession = new Blob([json], { type: "application/json" });
    zip.file(`${sessionFile}.json`, blobSession);
  }

  // Generate PDF for the selected indicator (file ID: indic-report)
  if (includeIndicReport) {
    const indicReport = await generateIndicReportPDF(
      legalUnit,
      selectedIndicator,
      financialData,
      impactsData,
      comparativeData,
      period,
      prevPeriod
    );

    const reportTitle = `${indicLabel}_${legalUnitNameFile}_${year}.pdf`;

    if (!includeSigXLSX) {
      const pdfBlob = new Blob([indicReport], { type: "application/pdf" });

      await downloadFile(pdfBlob, reportTitle);
      return;
    } else {
      zip.file(`${reportTitle}.pdf`, indicReport, { binary: true });
    }
  }

  // Generate Excel (XLSX) file for the selected indicator
  if (includeSigXLSX) {
    let xlsxFile = await generateXLSXFile(selectedIndicator, session, period);
    let blobXLSX = new Blob([xlsxFile], { type: "application/octet-stream" });

    if (!includeIndicReport) {
      const xlsxTitle = `SIG_${indicLabel}.xlsx`;
      await downloadFile(blobXLSX, xlsxTitle);
      return;
    }

    zip.file(`sig_${indicLabel}.xlsx`, blobXLSX);
  }

  // Generate ZIP file containing the generated files and download the ZIP file
  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `${documentTitle}.zip`);
    if (typeof onDownloadComplete === "function") {
      onDownloadComplete();
    }
  });
}

async function generateCompleteReportPDF(
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
      generateReport(
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

async function generateIndicReportPDF(
  legalUnit,
  indic,
  financialData,
  impactsData,
  comparativeData,
  period,
  prevPeriod
) {
  const pdfPromises = [];

  const { type, libelle, unit, libelleGrandeur } = metaIndics[indic];

  pdfPromises.push(
    generateReport(
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
      pdfPromises.push(
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
      pdfPromises.push(
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
      pdfPromises.push(
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

  try {
    const pdfs = await Promise.all(pdfPromises);

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
