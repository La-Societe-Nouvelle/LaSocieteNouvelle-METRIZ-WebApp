import React, { useEffect, useState } from "react";
import Select from "react-select";

import { Button, Col, Container, Modal, Row } from "react-bootstrap";

import divisions from "/lib/divisions";
import indicators from "/lib/indics";

import { getPrevDate } from "/src/utils/Utils";

import ExtraFinancialReport from "./parts/ExtraFinancialReport";
import FootprintReport from "./parts/FootprintReport";

// Fetch API data
import getMacroSerieData from "/src/services/responses/MacroSerieData";
import getHistoricalSerieData from "/src/services/responses/HistoricalSerieData";
import getSerieData from "/src/services/responses/SerieData";
import { getTargetSerieId } from "/src/utils/Utils";
import { generateFullReport } from "/src/utils/deliverables/generateFullReport";
import { ChartsContainer } from "./charts/ChartsContainer";
// import DonwloadComponent from "./parts/DonwloadComponent";

const Results = ({ session, publish }) => {
  const [divisionsOptions, setDivisionsOptions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(
    session.comparativeData.activityCode
  );
  const [indicatorsOptions, setIndicatorsOptions] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState();
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

    const indicatorsOptions = Object.entries(indicators)
      .filter(([indic]) => session.validations[financialPeriod].includes(indic))
      .map(([code, indic]) => {
        return { value: code, label: indic.libelle };
      });

    setIndicatorsOptions(indicatorsOptions);
  }, []);

  useEffect(() => {
    console.log(session.comparativeData.activityCode);
    console.log(selectedDivision);

    let isCancelled = false; // Variable pour vérifier si le composant est toujours monté

    const fetchData = async () => {
      if (session.comparativeData.activityCode !== selectedDivision) {
        console.log("Mise à jour des données comparatives");
        session.comparativeData.activityCode = selectedDivision;

        let updatedComparativeData = comparativeData;

        for await (const indic of session.validations[
          session.financialPeriod.periodKey
        ]) {
          const updatedData = await getComparativeData(
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

    // Clean-up function pour marquer l'annulation lorsque le composant est démonté
    return () => {
      isCancelled = true;
    };
  }, [selectedDivision]);

  const handleDivisionChange = (selectedOption) => {
    const division = selectedOption.value;
    setIsLoading(true);
    setSelectedDivision(division);
  };

  const getComparativeData = async (indic, code, comparativeData) => {
    console.log("Get comparative Data");
    let updatedComparativeData = comparativeData;
    let idTarget = getTargetSerieId(indic);

    updatedComparativeData = await getMacroSerieData(
      indic,
      code,
      updatedComparativeData,
      "divisionFootprint"
    );

    updatedComparativeData = await getHistoricalSerieData(
      code,
      indic,
      updatedComparativeData,
      "trendsFootprint"
    );

    updatedComparativeData = await getHistoricalSerieData(
      code,
      indic,
      updatedComparativeData,
      "targetDivisionFootprint"
    );
    updatedComparativeData = await getMacroSerieData(
      indic,
      "00",
      updatedComparativeData,
      "areaFootprint"
    );

    // Target Area Footprint

    if (idTarget) {
      updatedComparativeData = await getSerieData(
        idTarget,
        "00",
        indic,
        updatedComparativeData,
        "targetAreaFootprint"
      );
    }

    return updatedComparativeData;
  };

  const handleIndicatorChange = (selectedOption) => {
    setSelectedIndicator(selectedOption.value);
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

          <Button
            variant="download"
            disabled={!selectedDivision || isLoading}
            onClick={handleDownloadCompleteFile}
          >
            <i className="bi bi-download"></i> Télécharger tous les résultats
          </Button>
        </div>
        <p className="mb-4">
          Découvrez les résultats pour chaque indicateur mesuré et comparez les
          avec votre branche.
        </p>
        <Row>
          <Col>
            <Select
              styles={customStyles}
              components={{
                IndicatorSeparator: () => null,
              }}
              options={indicatorsOptions}
              value={
                selectedIndicator
                  ? {
                      label: indicators[selectedIndicator].libelle,
                      value: selectedIndicator,
                    }
                  : null
              }
              placeholder="Choisissez un indicateur"
              onChange={handleIndicatorChange}
            />
          </Col>
          <Col>
            <Select
              styles={customStyles}
              options={divisionsOptions}
              components={{
                IndicatorSeparator: () => null,
              }}
              value={{
                label: selectedDivision + " - " + divisions[selectedDivision],
                value: selectedDivision,
              }}
              placeholder="Choisissez une division"
              onChange={handleDivisionChange}
            />
          </Col>
        </Row>
      </div>

      {(!selectedIndicator || !selectedDivision) && <FootprintReport />}

      {selectedIndicator &&
        selectedDivision &&
        selectedDivision != "00" &&
        !isLoading && (
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

      {isLoading && selectedIndicator && (
        <div className="box">
          <div className="loader-container my-4">
            <div className="dot-pulse m-auto"></div>
          </div>
        </div>
      )}

      {/* <DonwloadComponent></DonwloadComponent> */}
      <Modal show={isGenerating}>
        <Modal.Header>Génération du dossier en cours ... </Modal.Header>
        <Modal.Body>
          <div className="loader-container my-4">
            <div className="dot-pulse m-auto"></div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Results;
