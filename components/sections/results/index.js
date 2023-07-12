import React, { useEffect, useState } from "react";
import Select from "react-select";

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
import indicators from "/lib/indics";
import { endpoints } from "../../../config/endpoint";

import { getPrevDate } from "/src/utils/Utils";

import ExtraFinancialReport from "./components/ExtraFinancialReport";
import FootprintReport from "./components/FootprintReport";

import { ChartsContainer } from "./charts/ChartsContainer";
import { Loader } from "../../popups/Loader";
import { customSelectStyles } from "../../../config/customStyles";
import DownloadDropdown from "./components/DownloadDropdown";
import { generateDownloadableFiles } from "../../../src/utils/deliverables/generateDownloadableFiles";
import { fetchComparativeDataForDivision } from "../../../src/services/MacrodataService";

const Results = ({ session, publish, goBack }) => {
  const [divisionsOptions, setDivisionsOptions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(
    session.comparativeData.activityCode
  );
  const [selectedIndicator, setSelectedIndicator] = useState();
  const [selectedIndicatorLabel, setSelectedIndicatorLabel] = useState(
    "Sélectionner un indicateur..."
  );


  const [financialPeriod] = useState(session.financialPeriod.periodKey);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const prevDateEnd = getPrevDate(session.financialPeriod.dateStart);

  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  useEffect(() => {
    window.scroll(0, 0);

    const divisionsOptions = Object.entries(divisions)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(([value, label]) => {
        return { value: value, label: value + " - " + label };
      });

    setDivisionsOptions(divisionsOptions);
  }, []);

  useEffect(() => {
    if (session.comparativeData.activityCode !== selectedDivision) {
      let isCancelled = false;
      setIsLoading(true);

      const fetchData = async () => {
        session.comparativeData.activityCode = selectedDivision;

        for await (const validation of session.validations[
          session.financialPeriod.periodKey
        ]) {

          const indicatorCode = validation.toUpperCase();

          await fetchComparativeDataForDivision(
            session.comparativeData,
            indicatorCode,
            endpoints
          );
        }

        if (!isCancelled) {
          setIsLoading(false);
        }
      };

      fetchData();

      return () => {
        isCancelled = true;
      };
    }
  }, [selectedDivision]);

  const handleDivisionChange = (selectedOption) => {
    const division = selectedOption.value;
    setIsLoading(true);
    setSelectedDivision(division);
  };

  const handleIndicatorChange = (code, label) => {
    setSelectedIndicator(code);
    let labelMenu = (
      <>
        <Image className="me-2" src={`icons-ese/${code}.svg`} height={40} />
        {label}
      </>
    );

    setSelectedIndicatorLabel(labelMenu);
  };

  const handleDownload = async (selectedFiles) => {
    const period = session.financialPeriod;
    const prevPeriod = session.availablePeriods.find(
      (period) => period.dateEnd == prevDateEnd
    );

    setIsGenerating(true);

    await generateDownloadableFiles(
      selectedFiles,
      session,
      () => {
        setIsGenerating(false);
      },
      period,
      prevPeriod
    );
  };

  return (
    <Container fluid className="results">
      <div className="box">
        <div className="d-flex justify-content-between mb-3">
          <h2>Etape 5 - Empreinte Sociétale </h2>
          <div className="d-flex">
            <DownloadDropdown onDownload={handleDownload} />

            <Button variant="secondary" onClick={publish}>
              Publier mes résultats
            </Button>
          </div>
        </div>
        <p className="mb-4">
          Découvrez les résultats pour chaque indicateur mesuré et comparez les
          avec votre branche.
        </p>

        <div className="legal-unit-info">
          <Row>
            <Col>
              <p className="fw-bold col-form-label">SIREN/SIRET :</p>

              <p className="py-2">{session.legalUnit.siren}</p>
            </Col>

            <Col>
              <p className="fw-bold col-form-label">Unité légale :</p>

              <p className="py-2">{session.legalUnit.corporateName}</p>
            </Col>

            <Col>
              <p className="fw-bold col-form-label">Code APE :</p>

              <p className="py-2">{session.legalUnit.activityCode}</p>
            </Col>
          </Row>
          <div className="d-flex align-items-center">
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
                        selectedDivision + " - " + divisions[selectedDivision],
                      value: selectedDivision,
                    }}
                    placeholder="Choisissez une division"
                    onChange={handleDivisionChange}
                  />
                </Col>
              </Form.Group>
            </Form>
          </div>
        </div>
      </div>

      {selectedDivision != "00" && (
        <div className="box indic-result-menu">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <DropdownButton
                variant="light-secondary"
                drop={"down-centered"}
                key={"down-centered"}
                id="dropdown-indics-button"
                title={selectedIndicatorLabel}
              >
                {selectedIndicator && (
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

                {Object.entries(indicators)
                  .filter(([indic]) =>
                    session.validations[financialPeriod].includes(indic)
                  )
                  .map(([code, indic]) => {
                    if (code === selectedIndicator) return null;
                    return (
                      <Dropdown.Item
                        key={code}
                        onClick={() =>
                          handleIndicatorChange(code, indic.libelle)
                        }
                      >
                        <Image
                          className="me-2"
                          src={`icons-ese/logo_ese_${code}_bleu.svg`}
                          alt={code}
                          height={20}
                        />
                        {indic.libelle}
                      </Dropdown.Item>
                    );
                  })}
              </DropdownButton>
            </div>
            {selectedIndicator && (
              <Nav variant="underline" defaultActiveKey="/home">
                <Nav.Item>
                  <Nav.Link href="/#rapport">Analyse extra-financière</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="/#comparaisons">
                    Comparaison par activité
                  </Nav.Link>
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
      )}

      {(!selectedIndicator || !selectedDivision) && <FootprintReport />}

      {selectedIndicator && selectedDivision && selectedDivision != "00" && (
        <ExtraFinancialReport
          indic={selectedIndicator}
          division={selectedDivision}
          metaIndic={indicators[selectedIndicator]}
          financialData={session.financialData}
          impactsData={session.impactsData}
          comparativeData={session.comparativeData}
          period={session.financialPeriod}
          prevPeriod={prevPeriod}
          legalUnit={session.legalUnit}
          isLoading={isLoading}
        ></ExtraFinancialReport>
      )}

      {selectedDivision != "00" && !isLoading && (
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
      <div className="box text-end">
        <Button onClick={goBack} className="me-1">
          Retour
        </Button>
      </div>
    </Container>
  );
};

export default Results;
