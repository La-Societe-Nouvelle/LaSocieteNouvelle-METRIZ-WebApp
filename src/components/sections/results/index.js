// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Button, Dropdown, DropdownButton, Image } from "react-bootstrap";

// Views
import viewsData from "./views";
import { IndicatorView } from "./views/IndicatorView";
import { HomeView } from "./views/HomeView";

// Components
import DownloadDropdown from "./components/DownloadDropdown";
import ReportGeneratorModal from "./components/ReportGeneratorModal";
import { ChartsContainer } from "./components/ChartsContainer";
import { LegalUnitInfo } from "./components/LegalUnitInfo";

// Loader
import { Loader } from "../../modals/Loader";

// Reports Builders

import { buildSummaryReportContributionIndic } from "./exports/reports/summaryReportGeneratorContribution";
import { buildSummaryReportIntensityIndic } from "./exports/reports/summaryReportGeneratorIntensity";
import { buildSummaryReportIndexIndic } from "./exports/reports/summaryReportGeneratorIndex";
import { buildStandardReport } from "./exports/reports/standardReportGenerator";
import { buildDataFile } from "./exports/dataFiles/dataFileGenerator";
import { buildCompleteReport, buildCompleteZipFile} from "./exports/completeFileGenerator";

// Utils
import { getYearPeriod } from "../../../utils/periodsUtils";
import { triggerFileDownload } from "../../../utils/Utils";

/* ---------- RESULTS SECTION ---------- */

/** View of results
 *
 *  Props :
 *    - session
 *    - publish (?)
 *    - goBack (?)
 *
 *  Params :
 *    - comparative division
 *    - period
 *    - view
 *
 */

const Results = ({ session, period, publish, goBack }) => {
  const [showedView, setShowedView] = useState("default");
  const [showReportGeneratorModal, setShowReportGeneratorModal] = useState(false);

  // temp state
  const [isGenerating, setIsGenerating] = useState(false); // building files
  const [isLoading, setIsLoading] = useState(false);

  const handleViewChange = (viewCode) => {
    setShowedView(viewCode);
  };

  const handleDownload = async (selectedFiles) => {
    setIsGenerating(true);

    try {
      await buildDownloadableFiles(session, period, showedView, selectedFiles);

    } catch (error) {
      console.error(error);
    }
    finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async ({ selectedIndicators, selectedFiles }) => {
    setIsGenerating(true);

    try {
      await buildCustomizedReport(
        session,
        period,
        selectedIndicators,
        selectedFiles
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const validations = session.validations[period.periodKey];
    if (validations.length == 1) {
      setShowedView(validations[0]);
    }
  }, []);

  return (
    <div className="results">
      <div className="box">
        <div className="d-flex justify-content-between mb-4">
          <h2>Etape 5 - Empreinte Sociétale </h2>
          <div className="d-flex">
            <ReportGeneratorModal
              showModal={showReportGeneratorModal}
              onClose={() => setShowReportGeneratorModal(false)}
              onDownload={handleGenerate}
              indicators={session.validations[period.periodKey]}
            />

            <DownloadDropdown onDownload={handleDownload} view={showedView} />
            <Button
              variant="download"
              className="me-2"
              onClick={() => setShowReportGeneratorModal(true)}
            >
              <i className="bi bi-gear"></i> Générer un rapport
            </Button>
            <Button variant="secondary" onClick={publish}>
              Publier mes résultats <i className="bi bi-chevron-right"></i>
            </Button>
          </div>
        </div>
        <LegalUnitInfo
          session={session}
          period={period}
          setIsLoading={(isLoading) => setIsLoading(isLoading)}
        />

        <div className="indic-result-menu mt-4">
          <h4 className="mb-4 h5">Vues disponibles :</h4>
          <div className="d-flex align-items-center justify-content-between">
            <DropdownButton
              className="flex-grow-1 dropdown-container"
              variant="light-secondary"
              drop={"down-centered"}
              key={"down-centered"}
              id="dropdown-indics-button"
              title={getViewLabel(showedView)}
            >
              {Object.entries(viewsData.views)
                .filter(([_, view]) =>
                  view.validations.every(
                    (indic) =>
                      session.validations[period.periodKey].includes(indic) &&
                      indic !== showedView
                  )
                )
                .map(([code, view]) => (
                  <Dropdown.Item
                    key={code}
                    onClick={() => handleViewChange(code)}
                    className={!view.icon ? "global-view-item" : ""}
                  >
                    {view.icon && (
                      <Image
                        className="me-2"
                        src={view.icon}
                        alt={code}
                        height={20}
                      />
                    )}
                    {view.label}
                  </Dropdown.Item>
                ))}
            </DropdownButton>
          </div>
        </div>
      </div>

      <View viewCode={showedView} period={period} session={session} />

      {!isLoading && <ChartsContainer session={session} period={period} />}

      {isGenerating && <Loader title={"Génération du dossier en cours ..."} />}
      {isLoading && (
        <Loader title={"Récupération des données de comparaison ..."} />
      )}
      <div className=" text-end">
        <Button onClick={goBack} className="mb-4">
          <i className="bi bi-chevron-left"></i> Retour aux déclarations
        </Button>
      </div>
    </div>
  );
};

export default Results;

const View = (props) => {
  switch (props.viewCode) {
    case "default":
      return <HomeView {...props} />;
    case "art":
      return <IndicatorView {...props} indic={"art"} />;
    case "eco":
      return <IndicatorView {...props} indic={"eco"} />;
    case "ghg":
      return <IndicatorView {...props} indic={"ghg"} />;
    case "geq":
      return <IndicatorView {...props} indic={"geq"} />;
    case "haz":
      return <IndicatorView {...props} indic={"haz"} />;
    case "idr":
      return <IndicatorView {...props} indic={"idr"} />;
    case "knw":
      return <IndicatorView {...props} indic={"knw"} />;
    case "mat":
      return <IndicatorView {...props} indic={"mat"} />;
    case "nrg":
      return <IndicatorView {...props} indic={"nrg"} />;
    case "was":
      return <IndicatorView {...props} indic={"was"} />;
    case "wat":
      return <IndicatorView {...props} indic={"wat"} />;
    case "soc":
      return <IndicatorView {...props} indic={"soc"} />;
    default:
      return <></>;
  }
};

const buildSummaryReport = async (props) => {
  switch (props.viewCode) {
    case "default":
      return null;
    case "art":
      return await buildSummaryReportContributionIndic({
        ...props,
        indic: "art",
      });
    case "eco":
      return await buildSummaryReportContributionIndic({
        ...props,
        indic: "eco",
      });
    case "ghg":
      return await buildSummaryReportIntensityIndic({ ...props, indic: "ghg" });
    case "geq":
      return await buildSummaryReportIndexIndic({ ...props, indic: "geq" });
    case "haz":
      return await buildSummaryReportIntensityIndic({ ...props, indic: "haz" });
    case "idr":
      return await buildSummaryReportIndexIndic({ ...props, indic: "idr" });
    case "knw":
      return await buildSummaryReportContributionIndic({
        ...props,
        indic: "knw",
      });
    case "mat":
      return await buildSummaryReportIntensityIndic({ ...props, indic: "mat" });
    case "nrg":
      return await buildSummaryReportIntensityIndic({ ...props, indic: "nrg" });
    case "was":
      return await buildSummaryReportIntensityIndic({ ...props, indic: "was" });
    case "wat":
      return await buildSummaryReportIntensityIndic({ ...props, indic: "wat" });
    case "soc":
      return await buildSummaryReportContributionIndic({
        ...props,
        indic: "soc",
      });
    default:
      return null;
  }
};

const buildViewDataFile = async (props) => {
  switch (props.viewCode) {
    case "default":
      return null;
    case "art":
      return await buildDataFile({ ...props, indic: "art" });
    case "eco":
      return await buildDataFile({ ...props, indic: "eco" });
    case "ghg":
      return await buildDataFile({ ...props, indic: "ghg" });
    case "geq":
      return await buildDataFile({ ...props, indic: "geq" });
    case "haz":
      return await buildDataFile({ ...props, indic: "haz" });
    case "idr":
      return await buildDataFile({ ...props, indic: "idr" });
    case "knw":
      return await buildDataFile({ ...props, indic: "knw" });
    case "mat":
      return await buildDataFile({ ...props, indic: "mat" });
    case "nrg":
      return await buildDataFile({ ...props, indic: "nrg" });
    case "was":
      return await buildDataFile({ ...props, indic: "was" });
    case "wat":
      return await buildDataFile({ ...props, indic: "wat" });
    case "soc":
      return await buildDataFile({ ...props, indic: "soc" });
    default:
      return null;
  }
};

const buildDownloadableFiles = async (
  session,
  period,
  showedView,
  selectedFiles
) => {
  const legalUnit = session.legalUnit.corporateName;

  const year = getYearPeriod(period);
  const legalUnitNameFile = legalUnit.replaceAll(/[^a-zA-Z0-9]/g, "_");

  const showAnalyses = selectedFiles.includes("with-analyses");
  const PDFTitle = `${showedView}_${legalUnitNameFile}_${year}.pdf`;

  if (selectedFiles.includes("checkbox-all")) {
    let ZIPFile = await buildCompleteZipFile({
      session,
      period,
      showAnalyses,
    });

    const zipFileName = `Empreinte-Societale_${legalUnitNameFile}_${year}`;

    saveAs(ZIPFile, zipFileName);
  }

  if (selectedFiles.includes("standard-report")) {
    const PDFFile = await buildStandardReport({
      session,
      indic: showedView,
      period,
      showAnalyses,
    });
    PDFFile.download(PDFTitle);
  }

  if (selectedFiles.includes("summary-report")) {
    const PDFFile = await buildSummaryReport({
      viewCode: showedView,
      session,
      period,
    });
    PDFFile.download(PDFTitle);
  }

  if (selectedFiles.includes("sig-indic-xlsx")) {
    let XLSXFile = await buildViewDataFile({
      viewCode: showedView,
      session,
      period,
    });
    const fileName = `${showedView}_${legalUnitNameFile}_${year}.xlsx`;

    await triggerFileDownload(XLSXFile, fileName);
  }
};

const buildCustomizedReport = async (
  session,
  period,
  selectedIndicators,
  selectedFiles
) => {

  const legalUnit = session.legalUnit.corporateName;
  const year = getYearPeriod(period);
  const legalUnitNameFile = legalUnit.replaceAll(/[^a-zA-Z0-9]/g, "_");

  const PDFTitle = `Rapport-Empreinte-Sociétale_${legalUnitNameFile}_${year}.pdf`;

  const showStandardReports = selectedFiles.includes("standardReports");
  const showAnalyses = selectedFiles.includes("with-analyses");
  
  const PDFFile = await buildCompleteReport({
    session,
    period,
    year,
    indicators: selectedIndicators,
    showStandardReports,
    showAnalyses,
  });

  const PDFBlob = new Blob([PDFFile], { type: "application/pdf" });

  // Directly Download Report
  await triggerFileDownload(PDFBlob, PDFTitle);
};

const getViewLabel = (viewCode) => {
  if (viewCode) {
    let labelMenu = (
      <>
        {viewsData.views[viewCode].icon && (
          <Image
            className="me-2"
            src={"/icons-ese/logo_ese_" + viewCode + "_rose.svg"}
            height={20}
          />
        )}
        {viewsData.views[viewCode].label}
      </>
    );
    return labelMenu;
  } else {
    return null;
  }
};
