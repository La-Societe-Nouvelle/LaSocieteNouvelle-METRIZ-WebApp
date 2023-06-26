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

const Results = ({ session, goBack, publish }) => {
  const [isEditMode, setIsEditMode] = useState(false);
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

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      border: state.isFocused ? "2px solid #dbdef1" : "2px solid #f0f0f8",
      borderRadius: "0.5rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#dbdef1",
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#dbdef1",
      "&:hover": {
        color: "#dbdef1",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.85rem",
      backgroundColor: state.isSelected ? "#191558" : "transparent",
      background: state.isFocused ? "#f0f0f8" : "",
      "&:hover": {
        color: "#191558",
      },
    }),
  };

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

  const handleEditClick = () => {
    setIsEditMode(true);
  };

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

  const handleSaveChanges = () => {
    // Effectuez ici les actions pour sauvegarder les modifications, par exemple, appeler une fonction de mise à jour des données

    // Après avoir sauvegardé les modifications, désactivez le mode édition
    setIsEditMode(false);
  };

  return (
    <Container fluid className="results">
      <div className="box">
        <div className="d-flex justify-content-between mb-3">
          <h2>Etape 5 - Empreinte Sociétale </h2>

          <Button
            variant="download"
            disabled={
              !selectedDivision || selectedDivision == "00" || isLoading
            }
            onClick={handleDownloadCompleteFile}
          >
            <i className="bi bi-download"></i> Télécharger tous les résultats
          </Button>
        </div>
        <p className="mb-4">
          Découvrez les résultats pour chaque indicateur mesuré et comparez les
          avec votre branche.
        </p>
        {isEditMode ? (
          <Form>
            <Form.Group as={Row} controlId="formLegalUnitName">
              <Form.Label column sm={2}>
                Unité légale :
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={editedLegalUnit.corporateName}
                  onChange={(e) =>
                    setEditedLegalUnit({
                      ...editedLegalUnit,
                      corporateName: e.target.value,
                    })
                  }
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="formSirenSiret">
              <Form.Label column sm={2}>
                SIREN/SIRET :
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={editedLegalUnit.siren}
                  onChange={(e) =>
                    setEditedLegalUnit({
                      ...editedLegalUnit,
                      siren: e.target.value,
                    })
                  }
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="formComparativeDivision">
              <Form.Label column sm={2}>
                Branche de comparaison :
              </Form.Label>
              <Col sm={8}>
                <Select
                  styles={customStyles}
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
        ) : (
          <ul className="list-unstyled legal-unit">
            <li>Unité légale : {session.legalUnit.corporateName}</li>
            <li>SIREN/SIRET : {session.legalUnit.siren}</li>
            <li>Code APE : {session.legalUnit.activityCode}</li>
            <li>
              Branche de comparaison : {divisions[comparativeData.activityCode]}
            </li>
          </ul>
        )}
        <div>
          <Button onClick={handleEditClick} size="sm" disabled={isEditMode}>
            Modifier
          </Button>
          {isEditMode && (
            <Button variant={"secondary"} size="sm" onClick={handleSaveChanges}>
              Enregistrer
            </Button>
          )}
        </div>
      </div>
      {selectedDivision != "00" && (
        <div className="box">
          <div className="d-flex align-items-center">
            <DropdownButton
              variant="light"
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
                <Nav.Item>
                  <Nav.Link eventKey="link-1">Publier mes résultats</Nav.Link>
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
      {console.log(publish)}
      <div className="box text-end">
        <Button onClick={goBack} className="me-1">
          Retour
        </Button>
        <Button variant="secondary" onClick={publish}>
          Publier mes résultats
        </Button>
      </div>
    </Container>
  );
};

export default Results;
