// La Société Nouvelle

// React
import React, { useState } from "react";
import Select from "react-select";
import {
  Button,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Image,
  Row,
} from "react-bootstrap";

// Views
import viewsData from "./views";
import { IndicatorView } from "./views/IndicatorView";
import { HomeView } from "./views/HomeView";

// Components            
import DownloadDropdown from "./components/DownloadDropdown";
import { ChartsContainer } from "./components/ChartsContainer";                                                                                                            
import { Loader } from "../../modals/Loader";

// Utils
import { getDivisionsOptions } from "/src/utils/metaUtils";

import { buildSummaryReportContributionIndic } from "./exports/reports/summaryReportGeneratorContribution";
import { buildSummaryReportIntensityIndic } from "./exports/reports/summaryReportGeneratorIntensity";
import { buildSummaryReportIndexIndic } from "./exports/reports/summaryReportGeneratorIndex";
import { buildDataFile } from "./exports/dataFiles/dataFileGenerator";
import { buildCompleteFile } from "./exports/completeFileGenerator";

// Styles
import { customSelectStyles } from "/config/customStyles";

// Lib
import divisions from "/lib/divisions";




// Division options
const divisionsOptions = getDivisionsOptions(divisions);

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

const Results = ({ 
  session, 
  period, 
  publish, 
  goBack}) => {

  // Selections
  const [comparativeDivision, setComparativeDivision] = useState(session.comparativeData.comparativeDivision);
  //const [period, setPeriod] = useState(session.financialPeriod);
  const [showedView, setShowedView] = useState("default");
  
  // temp state
  const [isGenerating, setIsGenerating] = useState(false); // building files
  const [isLoading, setIsLoading] = useState(false); // fetching data

  const handleDivisionChange = async (selectedOption) => {
  
      const division = selectedOption.value;
 
      // update state
      setComparativeDivision(division);
      
      // fetch data
      setIsLoading(true);
      session.comparativeData.comparativeDivision = division;
      await session.comparativeData.fetchComparativeData(session.validations[period.periodKey]);
      
      setIsLoading(false);
    
  };

  // const handlePeriodChange = (selectedPeriod) => {
  //   const period = selectedPeriod.value;
  //   //setPeriod(period);
  // };

  const handleViewChange = (viewCode) => {
    setShowedView(viewCode);
  };

  const handleDownload = async (selectedFiles) => {
    setIsGenerating(true);

    // Download .zip files
    if (selectedFiles.includes("checkbox-all")) {


      const showAnalyses = selectedFiles.includes("with-analyses");
      let ZIPFile = await buildCompleteFile({
        session,
        period,
        showAnalyses
      });
      saveAs(ZIPFile, `test.zip`);
    }

    else if (selectedFiles.length>1) {
      // zip
    }

    // Plaquettes
    else if (selectedFiles.includes("summary-report")) {
      //
      let PDFFile = await buildSummaryReport({
        viewCode: showedView,
        session,
        period,
      });
      let PDFTitle = `${showedView}_${session.legalUnit.corporateName}_${period.periodKey}.pdf`; // possible to set title inside function
      PDFFile.download(PDFTitle);
    }

    else if (selectedFiles.includes("sig-indic-xlsx")) {
      //
      let XLSXFile = await buildViewDataFile({
        viewCode: showedView,
        session,
        period,
      });
      const fileName = `${showedView}_${session.legalUnit.corporateName}_${period.periodKey}.xlsx`;

      const url = window.URL.createObjectURL(XLSXFile);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);

    }

    setIsGenerating(false);
  };

  return (
    <Container fluid className="results">
      <div className="box">
        <div className="d-flex justify-content-between mb-3">
          <h2>Etape 5 - Empreinte Sociétale </h2>
          <div className="d-flex">
            <DownloadDropdown
              onDownload={handleDownload}
              view={showedView}
            />
            <Button variant="secondary" onClick={publish}>
              Publier mes résultats
            </Button>
          </div>
        </div>
        <p className="mb-4">
          Découvrez les résultats pour chaque indicateur mesuré et comparez les
          avec votre branche.
        </p>
        <Row>
          <Col lg={6}>
            <div className="legal-unit-info d-flex justify-content-between pe-2">
              <p className="fw-bold col-form-label">
                Unité légale : {session.legalUnit.corporateName}
              </p>
              <p className="fw-bold col-form-label">
                Année de l'exercice :{" "}
                {period.periodKey.slice(2)}
              </p>
              {session.legalUnit.siren && (
                <p className="fw-bold col-form-label">
                  SIREN/SIRET : {session.legalUnit.siren}
                </p>
              )}

              {session.legalUnit.activityCode && (
                <p className="fw-bold col-form-label">
                  Code APE : {session.legalUnit.activityCode}
                </p>
              )}
            </div>
          </Col>
        </Row>

        <div className="d-flex align-items-center ">
          <p className="fw-bold col-form-label me-2 mb-0 ">
            Branche de comparaison :
          </p>
          <Form className="flex-grow-1">
            <Form.Group
              as={Row}
              controlId="formComparativeDivision"
              className="my-2"
            >
              <Col sm={8}>
                <Select
                  styles={customSelectStyles}
                  options={divisionsOptions}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  value={{
                    label: comparativeDivision + " - " + divisions[comparativeDivision],
                    value: comparativeDivision,
                  }}
                  placeholder="Choisissez une division"
                  onChange={handleDivisionChange}
                />
              </Col>
            </Form.Group>
          </Form>
        </div>
        {/* <div className="d-flex align-items-center ">
          <p className="fw-bold col-form-label me-2 mb-0 ">
            Période :
          </p>
          <Form className="flex-grow-1">
            <Form.Group
              as={Row}
              controlId="formComparativeDivision"
              className="my-2"
            >
              <Col sm={8}>
                <Select
                  styles={customSelectStyles}
                  options={session.availablePeriods.map((period) => {return({
                      label: period.periodKey,
                      value: period.periodKey,
                    })})
                  }
                  // components={{
                  //   IndicatorSeparator: () => null,
                  // }}
                  value={{
                    label: period.periodKey,
                    value: period.periodKey,
                  }}
                  placeholder="Choisissez une division"
                  onChange={handlePeriodChange}
                  isDisabled={session.availablePeriods.length<=1}
                />
              </Col>
            </Form.Group>
          </Form>
        </div> */}

        <div className="indic-result-menu mt-4">
          <div className="d-flex align-items-center justify-content-between">
            <DropdownButton
              className="flex-grow-1 dropdown-container"
              variant="light-secondary"
              drop={"down-centered"}
              key={"down-centered"}
              id="dropdown-indics-button"
              title={getViewLabel(showedView)}
              // disabled={comparativeDivision == "00"}
            >              
              {Object.entries(viewsData.views)
                .filter(([_,view]) => view.validations.every(indic => session.validations[period.periodKey].includes(indic)))
                //.filter(([code,_]) => code!=showedView)
                .map(([code,view]) =>
                  <Dropdown.Item key={code}
                                 onClick={() => handleViewChange(code)}>
                    {view.icon && <Image className="me-2"
                           src={view.icon}
                           alt={code}
                           height={20}/>}
                      {view.label}
                  </Dropdown.Item>
                )
              }
            </DropdownButton>
          </div>
        </div>
      </div>

      <View 
        viewCode={showedView}
        period={period}
        session={session}
      />

      {(!isLoading) && (
        <ChartsContainer
          session={session}
          period={period}
        />
      )}

      {isGenerating && (
        <Loader title={"Génération du dossier en cours ..."} />
      )}
      {isLoading && (
        <Loader title={"Récupération des données de comparaison ..."} />
      )}


      <div className=" text-end">
        <Button onClick={goBack} className="mb-4">
          <i className="bi bi-chevron-left"></i> Retour aux déclarations
        </Button>
      </div>

    </Container>
  );
}

export default Results;

const View = (props) => 
{
  switch(props.viewCode) 
  {
    case "default":   return (<HomeView   {...props}/>);
    case "art":       return (<IndicatorView {...props} indic={"art"}/>);
    case "eco":       return (<IndicatorView {...props} indic={"eco"}/>);
    case "ghg":       return (<IndicatorView {...props} indic={"ghg"}/>);
    case "geq":       return (<IndicatorView {...props} indic={"geq"}/>);
    case "haz":       return (<IndicatorView {...props} indic={"haz"}/>);
    case "idr":       return (<IndicatorView {...props} indic={"idr"}/>);
    case "knw":       return (<IndicatorView {...props} indic={"knw"}/>);
    case "mat":       return (<IndicatorView {...props} indic={"mat"}/>);
    case "nrg":       return (<IndicatorView {...props} indic={"nrg"}/>);
    case "was":       return (<IndicatorView {...props} indic={"was"}/>);
    case "wat":       return (<IndicatorView {...props} indic={"wat"}/>);
    case "soc":       return (<IndicatorView {...props} indic={"soc"}/>);
    default:          return (<></>);
  }
}

const buildSummaryReport = async (props) => 
{
  switch(props.viewCode) 
  {
    case "default":   return (null);
    case "art":       return (await buildSummaryReportContributionIndic({...props, indic:"art"}));
    case "eco":       return (await buildSummaryReportContributionIndic({...props, indic:"eco"}));
    case "ghg":       return (await buildSummaryReportIntensityIndic({...props, indic:"ghg"}));
    case "geq":       return (await buildSummaryReportIndexIndic({...props, indic:"geq"}));
    case "haz":       return (await buildSummaryReportIntensityIndic({...props, indic:"haz"}));
    case "idr":       return (await buildSummaryReportIndexIndic({...props, indic:"idr"}));
    case "knw":       return (await buildSummaryReportContributionIndic({...props, indic:"knw"}));
    case "mat":       return (await buildSummaryReportIntensityIndic({...props, indic:"mat"}));
    case "nrg":       return (await buildSummaryReportIntensityIndic({...props, indic:"nrg"}));
    case "was":       return (await buildSummaryReportIntensityIndic({...props, indic:"was"}));
    case "wat":       return (await buildSummaryReportIntensityIndic({...props, indic:"wat"}));
    case "soc":       return (await buildSummaryReportContributionIndic({...props, indic:"soc"}));
    default:          return (null);
  }
}

const buildViewDataFile = async (props) => 
{
  switch(props.viewCode) 
  {
    case "default":   return (null);
    case "art":       return (await buildDataFile({...props, indic:"art"}));
    case "eco":       return (await buildDataFile({...props, indic:"eco"}));
    case "ghg":       return (await buildDataFile({...props, indic:"ghg"}));
    case "geq":       return (await buildDataFile({...props, indic:"geq"}));
    case "haz":       return (await buildDataFile({...props, indic:"haz"}));
    case "idr":       return (await buildDataFile({...props, indic:"idr"}));
    case "knw":       return (await buildDataFile({...props, indic:"knw"}));
    case "mat":       return (await buildDataFile({...props, indic:"mat"}));
    case "nrg":       return (await buildDataFile({...props, indic:"nrg"}));
    case "was":       return (await buildDataFile({...props, indic:"was"}));
    case "wat":       return (await buildDataFile({...props, indic:"wat"}));
    case "soc":       return (await buildDataFile({...props, indic:"soc"}));
    default:          return (null);
  }
}

const getViewLabel = (viewCode) =>
{
  if (viewCode) {
    let labelMenu = (
      <>
        {viewsData.views[viewCode].icon && (
          <Image
            className="me-2"
            src={"/icons-ese/logo_ese_"+viewCode+"_rose.svg"}
            height={20}
          />
        )}
        {viewsData.views[viewCode].label}
      </>);
    return labelMenu;
  } else {
    return null;
  }
}