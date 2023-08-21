// La Société Nouvelle

// react
import React, { useEffect, useState } from "react";
import Select from "react-select";

// bootstrap
import {
  Button,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Image,
  Nav,
  Row,
} from "react-bootstrap";

import divisions from "/lib/divisions";

import viewsData from "./views";

import { customSelectStyles } from "../../../config/customStyles";

import { fetchComparativeData } from "../../../src/services/MacrodataService";

import { getPrevDate } from "../../../src/utils/Utils";
import { buildFullFile, generateDownloadableFiles } from "../../../src/utils/deliverables/generateDownloadableFiles";

import DownloadDropdown from "./components/DownloadDropdown";
import { ChartsContainer } from "./components/ChartsContainer";

import { Loader } from "../../popups/Loader";
import { IndicatorView } from "./views/IndicatorView";
import { DefaultView } from "./views/DefaultView";

const divisionsOptions = Object.entries(divisions)
  .sort((a, b) => parseInt(a) - parseInt(b))
  .map(([value, label]) => {
    return { value: value, label: value + " - " + label };
  })

/* ---------- RESULTS SECTION ---------- */

/** View of results
 *  
 *  Props :
 *    - session
 *    - publish (?)
 *    - goBack (?)
 * 
 */

const Results = ({ session, publish, goBack }) => 
{
  const [comparativeDivision, setComparativeDivision] = useState(
    session.comparativeData.activityCode
  );

  const [showedView, setShowedView] = useState("default");
  const [financialPeriod, setFinancialPeriod] = useState(session.financialPeriod.periodKey);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const prevDateEnd = getPrevDate(session.financialPeriod.dateStart);

  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  //
  useEffect(() => 
  {
    if (session.comparativeData.activityCode !== comparativeDivision) {
      let isCancelled = false;
      setIsLoading(true);

      const fetchData = async () => {
        session.comparativeData.activityCode = comparativeDivision;
        await fetchComparativeData(
          session.comparativeData,
          session.validations[session.financialPeriod.periodKey]
        );

        if (!isCancelled) {
          setIsLoading(false);
        }
      };

      fetchData();

      return () => {
        isCancelled = true;
      };
    }
  }, [comparativeDivision]);

  const handleDivisionChange = (selectedOption) => {
    const division = selectedOption.value;
    setIsLoading(true);
    setComparativeDivision(division);
    // change in graphics ? in session ?
  };

  const getViewLabel = (viewCode) =>
  {
    if (viewCode) {
      let labelMenu = (
        <>
          {viewsData.views[viewCode].icon && (
            <Image
              className="me-2"
              src={viewsData.views[viewCode].icon}
              height={25}
            />
          )}
          {viewsData.views[viewCode].label}
        </>);
      return labelMenu;
    } else {
      return null;
    }
  }

  const handleIndicatorChange = (code) => 
  {
    setShowedView(code);
  };

  const handleDownload = async (selectedFiles) => 
  {
    setIsGenerating(true);

    // Download .zip files
    if (selectedFiles.includes("checkbox-all")) {
      let ZIPFile = await buildFullFile({
        session,
        period
      });
      saveAs(ZIPFile, `${documentTitle}.zip`);
      setIsGenerating(false);
    }

    else if (selectedFiles.length>0) {
      // zip
    }

    else if (selectedFiles.includes("indic-report")) {
      //
      let PDFFile = await buildViewReport({
        viewCode: showedView,
        session,
        period,
      });
      let PDFTitle = `${indicLabel}_${legalUnitNameFile}_${year}.pdf`;

      const pdfUrl = URL.createObjectURL(PDFFile);
      const downloadLink = document.createElement("a");
      downloadLink.href = pdfUrl;
      downloadLink.download = PDFTitle;
      downloadLink.click();
      URL.revokeObjectURL(pdfUrl);
    }

    else if (selectedFiles.includes("sig-indic-xlsx")) {
      //
      let PDFFile = await buildViewReport({
        viewCode: showedView,
        session,
        period,
      });
      let PDFTitle = `${indicLabel}_${legalUnitNameFile}_${year}.pdf`;

      const pdfUrl = URL.createObjectURL(PDFFile);
      const downloadLink = document.createElement("a");
      downloadLink.href = pdfUrl;
      downloadLink.download = PDFTitle;
      downloadLink.click();
      URL.revokeObjectURL(pdfUrl);
    }
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
                {session.financialPeriod.periodKey.slice(2)}
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
                    label:
                      comparativeDivision + " - " + divisions[comparativeDivision],
                    value: comparativeDivision,
                  }}
                  placeholder="Choisissez une division"
                  onChange={handleDivisionChange}
                />
              </Col>
            </Form.Group>
          </Form>
        </div>

        <div className="indic-result-menu mt-4">
          <div className="d-flex align-items-center justify-content-between">
            <DropdownButton
              className="flex-grow-1 dropdown-container"
              variant="light-secondary"
              drop={"down-centered"}
              key={"down-centered"}
              id="dropdown-indics-button"
              title={getViewLabel(showedView)}
              disabled={comparativeDivision == "00"}
            >
              {showedView && (
                <Dropdown.Item
                  onClick={() =>
                    handleIndicatorChange(
                      null,
                      " Empreinte Sociale et environnementale"
                    )
                  }
                >
                  Empreinte Sociale et environnementale
                </Dropdown.Item>
              )}

              {Object.entries(viewsData.views)
                .filter(([_,view]) => view.validations.every(indic => session.validations[financialPeriod].includes(indic)))
                .filter(([code,_]) => code!=showedView)
                .map(([code,view]) =>
                  <Dropdown.Item key={code}
                                 onClick={() => handleIndicatorChange(code)}>
                    {view.icon && <Image className="me-2"
                           src={view.icon}
                           alt={code}
                           height={20}/>}
                      {view.label}
                  </Dropdown.Item>
                )
              }
            </DropdownButton>

            {showedView && (
              <Nav variant="underline" defaultActiveKey="/home">
                <Nav.Item>
                  <Nav.Link href="/#rapport">Analyse extra-financière</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="/#comparaisons">Comparaison par activité</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="/#evolution">Courbes d'évolution</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="/#analyse">Note d'analyse</Nav.Link>
                </Nav.Item>
              </Nav>
            )}
          </div>
        </div>
      </div>

      <View 
        viewCode={showedView}
        period={session.financialPeriod}
        session={session}
      />

      {comparativeDivision != "00" && !isLoading && (
        <>
          {session.validations[session.financialPeriod.periodKey].map(
            (indic) => (
              <div key={indic}>
                <ChartsContainer
                  indic={indic}
                  comparativeData={session.comparativeData}
                  mainAggregates={session.financialData.mainAggregates}
                  period={session.financialPeriod}
                  prevPeriod={prevPeriod}
                />
              </div>
            )
          )}
        </>
      )}

      {isGenerating && <Loader title={"Génération du dossier en cours ..."} />}
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
    case "default":   return (<DefaultView   {...props}/>);
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

const buildViewReport = async (props) => 
{
  switch(props.viewCode) 
  {
    case "default":   return (null);
    case "art":       return (await buildIndicReport({...props, indic:"art"}));
    case "eco":       return (await buildIndicReport({...props, indic:"eco"}));
    case "ghg":       return (await buildIndicReport({...props, indic:"ghg"}));
    case "geq":       return (await buildIndicReport({...props, indic:"geq"}));
    case "haz":       return (await buildIndicReport({...props, indic:"haz"}));
    case "idr":       return (await buildIndicReport({...props, indic:"idr"}));
    case "knw":       return (await buildIndicReport({...props, indic:"knw"}));
    case "mat":       return (await buildIndicReport({...props, indic:"mat"}));
    case "nrg":       return (await buildIndicReport({...props, indic:"nrg"}));
    case "was":       return (await buildIndicReport({...props, indic:"was"}));
    case "wat":       return (await buildIndicReport({...props, indic:"wat"}));
    case "soc":       return (await buildIndicReport({...props, indic:"soc"}));
    default:          return (null);
  }
}

const buildViewDataFile = async (props) => 
{
  switch(props.viewCode) 
  {
    case "default":   return (null);
    case "art":       return (await buildIndicReport({...props, indic:"art"}));
    case "eco":       return (await buildIndicReport({...props, indic:"eco"}));
    case "ghg":       return (await buildIndicReport({...props, indic:"ghg"}));
    case "geq":       return (await buildIndicReport({...props, indic:"geq"}));
    case "haz":       return (await buildIndicReport({...props, indic:"haz"}));
    case "idr":       return (await buildIndicReport({...props, indic:"idr"}));
    case "knw":       return (await buildIndicReport({...props, indic:"knw"}));
    case "mat":       return (await buildIndicReport({...props, indic:"mat"}));
    case "nrg":       return (await buildIndicReport({...props, indic:"nrg"}));
    case "was":       return (await buildIndicReport({...props, indic:"was"}));
    case "wat":       return (await buildIndicReport({...props, indic:"wat"}));
    case "soc":       return (await buildIndicReport({...props, indic:"soc"}));
    default:          return (null);
  }
}