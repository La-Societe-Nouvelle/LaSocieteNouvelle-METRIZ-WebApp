import React, { useEffect, useState } from "react";
import Select from "react-select";

import {
  Button,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Nav,
  Row,
} from "react-bootstrap";

import divisions from "/lib/divisions";
import indicators from "/lib/indics";

import { getPrevDate } from "/src/utils/Utils";

import ExtraFinancialReport from "./components/ExtraFinancialReport";
import FootprintReport from "./components/FootprintReport";

import { generateFullReport } from "/src/utils/deliverables/generateFullReport";
import { ChartsContainer } from "./charts/ChartsContainer";
import { updateComparativeData } from "./utils";
import { Loader } from "../../popups/Loader";
import { customSelectStyles } from "../../../src/utils/customStyles";

const Results = ({ session, publish, goBack }) => {
  const [editedLegalUnit, setEditedLegalUnit] = useState({
    ...session.legalUnit,
  });

  const [divisionsOptions, setDivisionsOptions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(
    session.comparativeData.activityCode
  );
  const [selectedIndicator, setSelectedIndicator] = useState();
  const [selectedIndicatorLabel, setSelectedIndicatorLabel] = useState(
    "Sélectionner un indicateur..."
  );

  const [comparativeData, setComparativeData] = useState(
    session.comparativeData
  );
  const [financialPeriod] = useState(session.financialPeriod.periodKey);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const prevDateEnd = getPrevDate(session.financialPeriod.dateStart);

  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  useEffect(() => {
    const divisionsOptions = Object.entries(divisions)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(([value, label]) => {
        return { value: value, label: value + " - " + label };
      });

    setDivisionsOptions(divisionsOptions);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      if (session.comparativeData.activityCode !== selectedDivision) {
        session.comparativeData.activityCode = selectedDivision;

        let updatedComparativeData = comparativeData;

        for await (const indic of session.validations[
          session.financialPeriod.periodKey
        ]) {
          const updatedData = await updateComparativeData(
            indic,
            selectedDivision,
            updatedComparativeData
          );

          updatedComparativeData = updatedData;
        }

        if (!isCancelled) {
          session.comparativeData = updatedComparativeData;
          setComparativeData(updatedComparativeData);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [selectedDivision]);

  const handleDivisionChange = (selectedOption) => {
    const division = selectedOption.value;
    setIsLoading(true);
    setSelectedDivision(division);
  };

  const handleIndicatorChange = (code, label) => {
    setSelectedIndicator(code);
    setSelectedIndicatorLabel(label);
  };

  const handleDownloadCompleteFile = async () => {
    const period = session.financialPeriod;
    const prevPeriod = session.availablePeriods.find(
      (period) => period.dateEnd == prevDateEnd
    );

    setIsGenerating(true);

    await generateFullReport(
      session.legalUnit.corporateName,
      session.validations[period.periodKey],
      session.financialData,
      session.impactsData,
      session.comparativeData,
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
          <div>
            <Button
              variant="primary"
              disabled={
                !selectedDivision || selectedDivision == "00" || isLoading
              }
              onClick={handleDownloadCompleteFile}
            >
              <i className="bi bi-download"></i> Télécharger
            </Button>
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
          <div>
            <p className="fw-bold col-form-label">Branche de comparaison :</p>

            <Form>
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
        <div className="box">
          <div className="d-flex align-items-center">
            <DropdownButton
              variant="light-secondary"
              drop={"down-centered"}
              key={"down-centered"}
              id="dropdown-indics-button"
              title={selectedIndicatorLabel}
            >
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
        <ChartsContainer
          validations={session.validations[financialPeriod]}
          comparativeData={session.comparativeData}
          aggregates={session.financialData.mainAggregates}
          period={session.financialPeriod}
          prevPeriod={prevPeriod}
        />
      )}

      {isGenerating && <Loader title={"Génération du dossier en cours ..."} />}

      <div className="box text-end">
        <Button onClick={goBack} className="me-1">
          Retour
        </Button>
      </div>
    </Container>
  );
};

export default Results;
