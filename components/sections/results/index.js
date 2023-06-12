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

  const [financialPeriod, setFinancialPeriod] = useState(
    session.financialPeriod.periodKey
  );

  const prevDateEnd = getPrevDate(session.financialPeriod.dateStart);

  const prevPeriod =session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

console.log(session.availablePeriods);

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
    <Container fluid>
      <section className="step">
        <div className="d-flex justify-content-between">
          <h2 className="mb-3">Etape 5 - Empreinte Sociétale </h2>

          <Button className=" btn-download">
            <i className="bi bi-download"></i> Rapport
          </Button>
        </div>
        <p>Découvrez les résultats pour chaque indicateur mesuré</p>
        <Row>
          <Col>
            <div className="p-5">
              <Select
                className="form-select-control"
                options={divisionsOptions}
                value={{
                  label: selectedDivision + " - " + divisions[selectedDivision],
                  value: selectedDivision,
                }}
                placeholder="Choisissez une division"
                onChange={handleDivisionChange}
              />
            </div>
          </Col>
          <Col>
            <div className="p-5">
              <Select
                className="form-select-control"
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
            </div>
          </Col>
        </Row>
      </section>

      {(!selectedIndicator || !selectedDivision) && <FootprintReport />}

      {selectedIndicator && selectedDivision && selectedDivision != "00" && (
        <ExtraFinancialReport
          indic={selectedIndicator}
          metaIndic={indicators[selectedIndicator]}
          financialData={session.financialData}
          period={financialPeriod}
          prevPeriod={prevPeriod}
        ></ExtraFinancialReport>
      )}
    </Container>
  );
};

export default Results;
