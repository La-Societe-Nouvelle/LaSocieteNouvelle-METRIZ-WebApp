import React, { useEffect, useState } from "react";
import Select from "react-select";

import { Button, Col, Container, Row } from "react-bootstrap";

import divisions from "/lib/divisions";
import indicators from "/lib/indics";
import ExtraFinancialReport from "./parts/ExtraFinancialReport";
import FootprintReport from "./parts/FootprintReport";
import { getPrevDate } from "/src/utils/Utils";

const Results = ({ session, publish }) => {
  const [divisionsOptions, setDivisionsOptions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(25);
  const [indicatorsOptions, setIndicatorsOptions] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState();

  const [financialPeriod] = useState(session.financialPeriod.periodKey);

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
      backgroundColor: state.isSelected ? '#191558' : 'transparent',
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

  const handleDivisionChange = (selectedOption) => {
    session.comparativeData.activityCode = selectedOption.value;
    setSelectedDivision(selectedOption.value);
  };

  const handleIndicatorChange = (selectedOption) => {
    setSelectedIndicator(selectedOption.value);
  };

  return (
    <Container fluid className="results">
      <div className="box">
        <div className="d-flex justify-content-between mb-3">
          <h2>Etape 5 - Empreinte Sociétale </h2>

          <Button className=" btn-download">
            <i className="bi bi-download"></i> Rapport
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
        ></ExtraFinancialReport>
      )}
    </Container>
  );
};

export default Results;
