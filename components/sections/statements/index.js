import React, { useState } from "react";
import { div, Col, Container, Image, Row } from "react-bootstrap";
import indicators from "/lib/indics";
import StatementComponent from "./parts/StatementComponent";

const DirectImpacts = ({ session }) => {
  console.log(session);
  const [period, setPeriod] = useState(session.financialPeriod);
  const [validations, SetValidations] = useState(
    session.validations[period.periodKey]
  );

  const valueCreationIndics = Object.fromEntries(
    Object.entries(indicators).filter(
      ([key, value]) =>
        value.isAvailable === true &&
        indicators[key].category == "valueCreation"
    )
  );

  const socialFootprintIndic = Object.fromEntries(
    Object.entries(indicators).filter(
      ([key, value]) =>
        value.isAvailable === true &&
        indicators[key].category == "socialFootprint"
    )
  );

  const EnvFootprintIndic = Object.fromEntries(
    Object.entries(indicators).filter(
      ([key, value]) =>
        value.isAvailable === true &&
        indicators[key].category == "environmentalFootprint"
    )
  );

  // check if net value indicator will change with new value & cancel value if necessary
  const handleNetValueChange = async (indic) => {
    console.log(indic);
    // get new value
    let nextIndicator = session.getNetValueAddedIndicator(
      indic,
      period.periodKey
    );

    if (
      nextIndicator !==
      session.financialData.mainAggregates.netValueAdded.periodsData[
        period.periodKey
      ].footprint.indicators[indic]
    ) {
      // remove validation
      session.validations[period.periodKey] = session.validations[
        period.periodKey
      ].filter((item) => item != indic);
      SetValidations(validations.filter((item) => item != indic));

      // update footprint
      await session.updateFootprints(period);
    }
  };

  const handleValidation = async (indic) => {
    SetValidations((validations) => [...validations, indic]);

    // add validation
    if (!session.validations[period.periodKey].includes(indic)) {
      session.validations[period.periodKey].push(indic);
    }
    // update footprint
    await session.updateFootprints(period);
  };

  return (
    <Container fluid>
      <section className="step">
        <h2 className="mb-3">Etape 4 - Déclaration des impacts directs </h2>
        <p>
          Identifiez et déclarez les impacts directs et obtenez des éléments
          d'analyse pour chaque indicateur clé.
        </p>
        <div className="text-center p-2 mb-3 bg-light-secondary">
          <h3 className="mb-0"> Création de la valeur</h3>
        </div>
        <Row>
          {Object.entries(valueCreationIndics).map(([key, value]) => (
            <Col key={key} sm={12}>
              <div className="border rounded border-1 p-3 mb-3">
                <div className="d-flex align-items-center mb-3 border-bottom pb-3">
                  <Image
                    className="me-2"
                    src={"icons-ese/" + key + ".svg"}
                    alt={key}
                    height={40}
                  />
                  <h4 className="h5 fw-light-bold ">
                    {value.libelle}
                    {value.isBeta && <span className="beta ms-1">BETA</span>}
                  </h4>
                  {/* <div>
                    <i className="bi bi-question-circle"></i>
                  </div> */}
                </div>
                <div>
                  <StatementComponent
                    indic={key}
                    impactsData={session.impactsData[period.periodKey]}
                    handleNetValueChange={handleNetValueChange}
                    handleValidation={handleValidation}
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
        <div className="text-center p-2 mb-3 bg-light-secondary">
          <h3 className="mb-0"> Empreinte sociale </h3>
        </div>
        <Row>
          {Object.entries(socialFootprintIndic).map(([key, value]) => (
            <Col key={key} sm={12}>
              <div className="border rounded border-1 p-4 mb-3 ">
                <div className="d-flex align-items-center">
                  <Image
                    className="me-2"
                    src={"icons-ese/" + key + ".svg"}
                    alt={key}
                    height={50}
                  />
                  <h4 className="h5 fw-light-bold mt-3">
                    {value.libelle}
                    {value.isBeta && <span className="beta ms-1">BETA</span>}
                  </h4>
                </div>
                <div>
                  <StatementComponent
                    indic={key}
                    impactsData={session.impactsData[period.periodKey]}
                    handleNetValueChange={handleNetValueChange}
                    handleValidation={handleValidation}
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
        <div className="text-center p-2 mb-3 bg-light-secondary">
          <h3 className="mb-0"> Empreinte environnementale </h3>
        </div>
        <Row>
          {Object.entries(EnvFootprintIndic).map(([key, value]) => (
            <Col key={key} sm={12}>
              <div className="border rounded border-1 p-4 mb-3">
                <div className="d-flex align-items-center ">
                  <Image
                    className="me-2"
                    src={"icons-ese/" + key + ".svg"}
                    alt={key}
                    height={50}
                  />
                  <h4 className="h5 fw-light-bold mt-3">
                    {value.libelle}
                    {value.isBeta && <span className="beta ms-1">BETA</span>}
                  </h4>
                </div>
                <div>
                  <StatementComponent
                    indic={key}
                    impactsData={session.impactsData[period.periodKey]}
                    handleNetValueChange={handleNetValueChange}
                    handleValidation={handleValidation}
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>
    </Container>
  );
};

export default DirectImpacts;
