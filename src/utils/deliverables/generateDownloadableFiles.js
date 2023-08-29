// La Société Nouvelle

import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import jsZip from "jszip";
import jsPDF from "jspdf";

import metaIndics from "../../../lib/indics.json";
import { generateCover } from "./generateCover";
import { buildStandardReport } from "./standardReportGenerator";
import { buildSummaryReportContributionIndic } from "./summaryReportGeneratorContribution";
import { generateIntensityIndicatorSheet } from "./summaryReportGeneratorIntensity";
import { generateIndiceIndicatorSheet } from "./summaryReportGeneratorIndex";
import { generateFootprintPDF } from "../../writers/Export";
import { generateXLSXFile } from "./generateExcelFile";
import { resolve } from "styled-jsx/css";

/* ---------- DOWNLOADABLES FILES ---------- */

/** Function to build files
 *  
 *  -> buildFullFiles (with all elements) :
 *      - backup
 *      - ...
 * 
 */

export async function buildFullFile({
  session,
  period
}) {
  // Extract necessary data from the session object
  const legalUnit = session.legalUnit.corporateName;
  const validations = session.validations[period.periodKey];
  
  const year = period.periodKey.slice(2); // dangerous
  const legalUnitNameFile = legalUnit.replaceAll(/[^a-zA-Z0-9]/g, "_");
  
  // Build zip ----------------------------------------
  
  const zip = new jsZip();
  
  // PDF report (for all validated indicators)
  const pdfFile = await generateCompleteReportPDF({
    session,
    period
  });
  // Add the full report to the ZIP file
  zip.file(`Empreinte-Societale_${legalUnitNameFile}_${year}.pdf`, pdfFile, {binary: true});

  // PDF Report - Main aggregates footprints
  const sigPDFDoc = await generateSIGFootprintPDF({
    session,
    period
  });
  // Add the SIG footprint PDF to the ZIP file
  zip.file(`Empreinte-Societale_SIG_${legalUnitNameFile}_${year}.pdf`, sigPDFDoc.output("blob"));

  // Generate Excel (XLSX) files for each indicator and add them to the ZIP file
  const dataFolder = zip.folder("Data");
  for (const indic of validations)
  {
    let indicDataSheet = await generateXLSXFile({
      session, 
      period,
      indic
    });
    // add to the ZIP file
    dataFolder.file(`sig_${indic}.xlsx`, indicDataSheet);
  }

  // Add session data as a JSON file to the ZIP file
  const sessionJSON = JSON.stringify(session);
  const sessionBlob = new Blob([sessionJSON], { type: "application/json" });
  zip.file(`session-metriz-${legalUnit.replaceAll(" ", "-")}.json`, sessionBlob);

  // Add charts canvas -> merge function here
  const imagesFolder = zip.folder("Graphics");
  await addChartToZip(
    imagesFolder,
    "proportionalChart",
    "graphique-empreinte-economique.png"
  );
  await addChartToZip(
    imagesFolder,
    "socialChart",
    "graphique-empreinte-sociale.png"
  );
  await addChartToZip(
    imagesFolder,
    "environmentalChart",
    "graphique-empreinte-environnementale.png"
  );

  // Generate ZIP file containing the generated files and download the ZIP file
  let zipBlob = await zip.generateAsync({ type: "blob" });

  return zipBlob;
}


export async function buildIndicReport({
  session,
  period,
  indic
}) {

  // Session data -------------------------------------

  const {
    legalUnit,
    financialData,
    impactsData,
    comparativeData
  } = session;

  const corporateName = legalUnit.corporateName;

  // Meta data ----------------------------------------
  
  // --------------------------------------------------

  // Generate PDF for the selected indicator (file ID: indic-report)
  const indicReport = await generateIndicReportPDF({
    session,
    indic,
    period
  });

  const pdfBlob = new Blob([indicReport], { type: "application/pdf" });
  return pdfBlob;
}

export async function buildDataFile({
  session,
  period,
  indic
}) {

  // Generate Excel (XLSX) file for the selected indicator
  let xlsxFile = await generateXLSXFile({indic, session, period});

  let blobXLSX = new Blob([xlsxFile], { type: "application/octet-stream" });
  return blobXLSX;
}

export async function generateDownloadableFiles({
  session,
  period,
  selectedView,
}) {
  // Extract necessary data from the session object
  const legalUnit = session.legalUnit.corporateName;
  const year = period.periodKey.slice(2);
  const legalUnitNameFile = legalUnit.replaceAll(/[^a-zA-Z0-9]/g, "_");
  let indicLabel = metaIndics[selectedView].libelle.replaceAll(/[' ]/g, "-");

  const zip = new jsZip();

  // Generate PDF for the selected indicator (file ID: indic-report)
  let PDFFile = await buildIndicReport({
    session,
    period,
    indic: selectedView
  })
  let PDFTitle = `${indicLabel}_${legalUnitNameFile}_${year}.pdf`;
   
  const pdfBlob = new Blob([PDFFile], { type: "application/pdf" });
  zip.file(`${PDFTitle}.pdf`, pdfBlob, { binary: true });

  // Generate Excel (XLSX) file for the selected indicator
  let xlsxFile = await generateXLSXFile({
    session, 
    period,
    indic: selectedView
  });
  let XLSXTitle = `${indicLabel}_${legalUnitNameFile}_${year}.pdf`;
  let blobXLSX = new Blob([xlsxFile], { type: "application/octet-stream" });
  zip.file(`sig_${XLSXTitle}.xlsx`, blobXLSX);

  // Generate ZIP file containing the generated files and download the ZIP file
  let zipFile = await zip.generateAsync({ type: "blob" });
  return zipFile;
}

/* ---------- RESULTS SECTION ---------- */

/** View of results
 *  
 *  Props :
 *    - session
 *    - publish (?)
 *    - goBack (?)
 * 
 */

async function generateCompleteReportPDF({
  session,
  year,
  period
}) {
  const coverPage = generateCover(year, session.legalUnit);
  const basicPDFpromises = [];
  const reportPDFpromises = [];

  for (const indic of session.validations[period.periodKey]) 
  {
    const { type } = metaIndics[indic];

    basicPDFpromises.push(
      buildStandardReport({
        session,
        indic,
        download: false,
        period
      })
    );

    switch (type) {
      case "proportion":
        reportPDFpromises.push(
          buildSummaryReportContributionIndic({
            session,
            period,
            indic
          }).getBlob()
        );
        break;
      case "intensité":
        reportPDFpromises.push(
          generateIntensityIndicatorSheet({
            session,
            indic,
            period
          }).getBlob()
        );
        break;
      case "indice":
        reportPDFpromises.push(
          generateIndiceIndicatorSheet({
            session,
            indic,
            period
          }).getBlob()
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
    mergedPdfDoc.setTitle("title");

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

// Indic report

async function generateIndicReportPDF({
  session,
  indic,
  period
}) {
  const pdfPromises = [];

  const { type } = metaIndics[indic];

  const standardReport = buildStandardReport({
    session,
    indic,
    period
  })
  pdfPromises.push(new Promise((resolve) => standardReport.getBlob((blob) => resolve(blob))));

  switch (type) 
  {
    case "proportion": {
      const summaryReport = buildSummaryReportContributionIndic({
        session,
        indic,
        period
      });
      pdfPromises.push(new Promise((resolve) => summaryReport.getBlob((blob) => resolve(blob))));
    }
      break;
    case "intensité":
      pdfPromises.push(
        generateIntensityIndicatorSheet({
          session,
          indic,
          period
        }).getBlob()
      );
      break;
    case "indice":
      pdfPromises.push(
        generateIndiceIndicatorSheet({
          session,
          indic,
          period
        }).getBlob()
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

async function generateSIGFootprintPDF({ session, period }) 
{
  const {
    legalUnit,
    financialData
  } = session
  const year = period.periodKey.slice(2);

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

async function addChartToZip(folder, chartId, fileName) {
  const chartCanvas = document.getElementById(chartId);

  if (!chartCanvas) {
    return;
  }

  const chartData = chartCanvas.toDataURL("image/png");
  folder.file(fileName, chartData.split("base64,")[1], { base64: true });
}
