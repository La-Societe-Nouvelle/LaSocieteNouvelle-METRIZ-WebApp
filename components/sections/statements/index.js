import React, { useState } from "react";
import { Button, Col, Container, Form, Image, Row } from "react-bootstrap";
import indicators from "/lib/indics";
import StatementComponent from "./parts/StatementComponent";

const DirectImpacts = ({ session, submit }) => {
  const [period, setPeriod] = useState(session.financialPeriod);
  const [selectedIndicators, setselectedIndicators] = useState([]);
  const [showForms, setShowForms] = useState(false); // True if validations

  const [validations, SetValidations] = useState(
    session.validations[period.periodKey]
  );

  const valueCreationIndics = Object.fromEntries(
    Object.entries(indicators).filter(
      ([key, value]) =>
        value.isAvailable === true &&
        indicators[key].category == "Création de la valeur"
    )
  );

  const socialFootprintIndics = Object.fromEntries(
    Object.entries(indicators).filter(
      ([key, value]) =>
        value.isAvailable === true &&
        indicators[key].category == "Empreinte sociale"
    )
  );

  const EnvFootprintIndics = Object.fromEntries(
    Object.entries(indicators).filter(
      ([key, value]) =>
        value.isAvailable === true &&
        indicators[key].category == "Empreinte environnementale"
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

  const handleselectedIndicators = (event) => {
    const isChecked = event.target.checked;
    const indic = event.target.value;
   
    if (isChecked && !selectedIndicators.includes(indic)) {
      console.log("vrai")
      let indicators = selectedIndicators;
      indicators.push(indic);
      console.log(indicators)
      setselectedIndicators(indicators);
    }

    if (isChecked == false && selectedIndicators.includes(indic)) {
      console.log("faux")

      let indicators = selectedIndicators;
      const index = selectedIndicators.indexOf(indic);
      indicators.splice(index, 1);
      console.log(indicators)

      setselectedIndicators(indicators);
    }
  };
  return (
    <Container fluid>
      {console.log(selectedIndicators)}
      <section className="statement-section step">
        <h2 className="mb-3">Etape 4 - Déclaration des impacts directs </h2>
        <p>
          Identifiez et déclarez les impacts directs et obtenez des éléments
          d'analyse pour chaque indicateur clé.
        </p>
        <div className="text-center p-3 mb-3 bg-light-secondary">
          <h3 className="h4 mb-0 text-secondary text-uppercase">
            {" "}
            Création de la valeur
          </h3>
        </div>
        <Row>
          {Object.entries(valueCreationIndics).map(([key, value]) => (
            <Col key={key} sm={4}>
              <div className="border border-1 rounded p-5 mb-3 shadow-sm">
                <div className="text-center">
                  <Image
                    className="me-2"
                    src={"icons-ese/" + key + ".svg"}
                    alt={key}
                    height={80}
                  />
                  <h4 className="mt-4 w-75 m-auto">
                    {value.libelle}
                    {value.isBeta && <span className="beta ms-1">BETA</span>}
                  </h4>
                </div>
                <Form className="indic-form text-center mt-4">
                  <Form.Check
                    type={"checkbox"}
                    value={key}
                    onChange={handleselectedIndicators}
                  />
                </Form>
                {/* <div className="text-end">
                    {validations.includes(key) && (
                      <span className="display-6">
                        <i className=" text-success ms-3 bi bi-patch-check"></i>
                      </span>
                    )}
                  </div> */}
              </div>
              <div></div>
            </Col>
          ))}
        </Row>
        <div className="text-center p-3 mb-3 bg-light-secondary">
          <h3 className="h4 mb-0 text-secondary text-uppercase">
            {" "}
            Empreinte sociale{" "}
          </h3>
        </div>
        <div className="text-center p-3 mb-3 bg-light-secondary">
          <h3 className="h4 mb-0 text-secondary text-uppercase">
            {" "}
            Empreinte environnementale{" "}
          </h3>
        </div>
        <Row>
          {Object.entries(valueCreationIndics).map(([key, value]) => (
            <Col key={key} sm={12}>
              <div className="border border-1 rounded p-3 mb-3 shadow-sm">
                <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                  <div className="d-flex align-items-center">
                    <Image
                      className="me-2"
                      src={"icons-ese/logo_ese_" + key + "_bleu.svg"}
                      alt={key}
                      height={40}
                    />

                    <h4 className=" fw-light-bold ">
                      {value.libelle}
                      {value.isBeta && <span className="beta ms-1">BETA</span>}
                    </h4>
                  </div>

                  <div className="text-end">
                    {validations.includes(key) && (
                      <span className="display-6">
                        <i className=" text-success ms-3 bi bi-patch-check"></i>
                      </span>
                    )}
                  </div>
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

        <Row>
          {Object.entries(socialFootprintIndics).map(([key, value]) => (
            <Col key={key} sm={12}>
              <div className="border border-1 rounded p-3 mb-3 shadow-sm">
                <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                  <div className="d-flex align-items-center">
                    <Image
                      className="me-2"
                      src={"icons-ese/logo_ese_" + key + "_bleu.svg"}
                      alt={key}
                      height={40}
                    />

                    <h4 className=" fw-light-bold ">
                      {value.libelle}
                      {value.isBeta && <span className="beta ms-1">BETA</span>}
                    </h4>
                  </div>

                  <div className="text-end">
                    {validations.includes(key) && (
                      <span className="display-6">
                        <i className=" text-success ms-3 bi bi-patch-check"></i>
                      </span>
                    )}
                  </div>
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

        <Row>
          {Object.entries(EnvFootprintIndics).map(([key, value]) => (
            <Col key={key} sm={12}>
              <div className="border border-1 rounded p-3 mb-3 shadow-sm">
                <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                  <div className="d-flex align-items-center">
                    <Image
                      className="me-2"
                      src={"icons-ese/logo_ese_" + key + "_bleu.svg"}
                      alt={key}
                      height={40}
                    />

                    <h4 className=" fw-light-bold ">
                      {value.libelle}
                      {value.isBeta && <span className="beta ms-1">BETA</span>}
                    </h4>
                  </div>

                  <div className="text-end">
                    {validations.includes(key) && (
                      <span className="display-6">
                        <i className=" text-success ms-3 bi bi-patch-check"></i>
                      </span>
                    )}
                  </div>
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
        <div className="text-end">
          <Button
            variant="secondary"
            onClick={() => submit()}
            disabled={validations.length == 0 ? true : false}
          >
            Accéder aux résultats
            <i className="bi bi-chevron-right"></i>
          </Button>
        </div>
      </section>
    </Container>
  );
};

export default DirectImpacts;
