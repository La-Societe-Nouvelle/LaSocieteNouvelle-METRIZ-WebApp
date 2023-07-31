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

import { customSelectStyles } from "../../../config/customStyles";

import { fetchComparativeData } from "../../../src/services/MacrodataService";

import { getPrevDate } from "../../../src/utils/Utils";
import { generateDownloadableFiles } from "../../../src/utils/deliverables/generateDownloadableFiles";

import ExtraFinancialReport from "./components/ExtraFinancialReport";
import FootprintReport from "./components/FootprintReport";
import DownloadDropdown from "./components/DownloadDropdown";
import { ChartsContainer } from "./components/ChartsContainer";

import { Loader } from "../../popups/Loader";

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
        {code && (
          <Image
            className="me-2"
            src={`icons-ese/logo_ese_${code}_rose.svg`}
            height={25}
          />
        )}
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
      selectedIndicator,
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
            <DownloadDropdown
              onDownload={handleDownload}
              view={selectedIndicator}
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

        <div className="indic-result-menu mt-4">
          <div className="d-flex align-items-center justify-content-between">
            <DropdownButton
              className="flex-grow-1 dropdown-container"
              variant="light-secondary"
              drop={"down-centered"}
              key={"down-centered"}
              id="dropdown-indics-button"
              title={selectedIndicatorLabel}
              disabled={selectedDivision == "00"}
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
                      onClick={() => handleIndicatorChange(code, indic.libelle)}
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
      </div>

      {(!selectedIndicator || !selectedDivision) && (
        <FootprintReport
          comparativeData={session.comparativeData}
          financialData={session.financialData.mainAggregates}
          period={session.financialPeriod}
        />
      )}

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
      <div className=" text-end">
        <Button onClick={goBack} className="mb-4">
          <i className="bi bi-chevron-left"></i> Retour aux déclarations
        </Button>
      </div>

    </Container>
  );
};

export default Results;
