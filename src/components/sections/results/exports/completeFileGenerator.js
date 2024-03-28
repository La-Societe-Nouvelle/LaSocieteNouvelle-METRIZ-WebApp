// La Société Nouvelle

import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import jsZip from "jszip";
import jsPDF from "jspdf";

// Lib
import metaIndics from "/lib/indics.json";

// Reports and dataFiles builders
import { generateReportCover } from "./reports/reportCoverGenerator";
import { generateReportDividerPage } from "./reports/reportDividerPageGenerator";
import { buildStandardReport } from "./reports/standardReportGenerator";
import { buildSummaryReportContributionIndic } from "./reports/summaryReportGeneratorContribution";
import { buildSummaryReportIntensityIndic } from "./reports/summaryReportGeneratorIntensity";
import { buildSummaryReportIndexIndic } from "./reports/summaryReportGeneratorIndex";

import { generateFootprintPDF } from "../../../../writers/Export";
import { buildDataFile } from "./dataFiles/dataFileGenerator";
import { getYearPeriod } from "../../../../utils/periodsUtils";

/* ---------- DOWNLOADABLES FILES ---------- */

/** Function to build files
 *  
 *  -> buildCompleteZipFiles (with all elements) :
 *      - backup
 *      - ...
 * 
 */

export async function buildCompleteZipFile({ session, period, showAnalyses }) {
  // Extract necessary data from the session object
  const legalUnit = session.legalUnit.corporateName;
  const validations = session.validations[period.periodKey];
  const siren = session.legalUnit.siren;
  const year = getYearPeriod(period);
  const legalUnitNameFile = legalUnit.replaceAll(/[^a-zA-Z0-9]/g, "_");

  const indicators = session.validations[period.periodKey];

  // Build zip ----------------------------------------

  const zip = new jsZip();

  // PDF report (for all validated indicators)
  const pdfFile = await buildCompleteReport({
    session,
    period,
    year,
    indicators,
    showStandardReports: true,
    showAnalyses,
  });

  // Add the full report to the ZIP file
  zip.file(`Rapport_Empreinte-Societale_${legalUnitNameFile}_${year}.pdf`, pdfFile, {
    binary: true,
  });

  // PDF Report - Main aggregates footprints
  const sigPDFDoc = await buildSIGFootprintReport({
    session,
    period,
  });
  // Add the SIG footprint PDF to the ZIP file
  zip.file(
    `Empreinte-Societale_SIG_${legalUnitNameFile}_${year}.pdf`,
    sigPDFDoc.output("blob")
  );

  // Generate Excel (XLSX) files for each indicator and add them to the ZIP file
  const dataFolder = zip.folder("Data");
  for (const indic of validations) {
    let indicDataSheet = await buildDataFile({
      session,
      period,
      indic,
    });
    // add to the ZIP file
    dataFolder.file(`sig_${indic}.xlsx`, indicDataSheet);
  }

  // Add session data as a JSON file to the ZIP file
  const sessionJSON = JSON.stringify(session);
  const sessionBlob = new Blob([sessionJSON], { type: "application/json" });
  zip.file(`${siren}_ESE_${year}.json`, sessionBlob);

  // Generate ZIP file containing the generated files and download the ZIP file
  let zipBlob = await zip.generateAsync({ type: "blob" });

  return zipBlob;
}

export async function buildCompleteReport({
  session,
  period,
  year,
  indicators,
  showStandardReports,
  showAnalyses
}) {
  try {


    // Report Cover
    const coverPage = generateReportCover(year, session.legalUnit.corporateName);

    // Generate standard reports and their blobs
    let standardPDFs = [];
    if (showStandardReports) {
      const appendixesCoverPage = generateReportDividerPage(indicators.length > 1 ? "Annexes" : "Annexe");
      standardPDFs = [
        appendixesCoverPage,
        ...await generateStandardReports(session, period,indicators,showAnalyses)
      ];
    }
    
    // Generate summary reports and their blobs
    const summaryPDFs = await generateSummaryReports(session, period, indicators);

    // Merge all PDFs
    const completeReport = await generateMergedPDF([coverPage,...summaryPDFs, ...standardPDFs]);

    return completeReport;
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la génération du PDF :",
      error
    );
    throw error;
 
  }
}


async function generateStandardReports(session, period,indicators,showAnalyses) {
  const standardPDFs = await Promise.all(
    indicators.map(async (indic) => {
      const standardReport = await buildStandardReport({
        session,
        indic,
        period,
        showAnalyses
      });

      return new Promise((resolve) => {
        standardReport.getBlob((blob) => {
          resolve(blob);
        });
      });
    })
  );

  return standardPDFs;
}

async function generateSummaryReports(session, period, indicators) {
  const reportGenerators = {
    proportion: buildSummaryReportContributionIndic,
    intensité: buildSummaryReportIntensityIndic,
    indice: buildSummaryReportIndexIndic,
  };

  const reportPDFpromises = await Promise.all(
    indicators.map(async (indic) => {
      const { type } = metaIndics[indic];
      const reportFunction = reportGenerators[type];

      if (reportFunction) {
        const report = await reportFunction({
          session,
          period,
          indic,
        });

        return new Promise((resolve) => {
          report.getBlob((blob) => {
            resolve(blob);
          });
        });
      }
    })
  );

  return reportPDFpromises.filter(Boolean); // Filter out undefined values
}

async function generateMergedPDF(mergedPromises) {
  try {
    const pdfBuffers  = await Promise.all(mergedPromises);

    const mergedPdfDoc = await PDFDocument.create();

    const fontBytes = await fetch(
      "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Regular.ttf"
    ).then((res) => res.arrayBuffer());

    mergedPdfDoc.registerFontkit(fontkit);

    for (const pdf of pdfBuffers) {
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

    return await mergedPdfDoc.save();
  } catch (error) {
    console.error("Une erreur s'est produite lors de la fusion des PDFs :", error);
    throw error; 
  }
}
async function buildSIGFootprintReport({ session, period }) 
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

//  Get canvas id and add it to folder zip
async function addChartToZip(folder, chartId, fileName) {
  const chartCanvas = document.getElementById(chartId);

  if (!chartCanvas) {
    return;
  }

  const chartData = chartCanvas.toDataURL("image/png");
  folder.file(fileName, chartData.split("base64,")[1], { base64: true });
}



