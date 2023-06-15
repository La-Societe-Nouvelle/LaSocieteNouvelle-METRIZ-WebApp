import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Image, Row } from "react-bootstrap";
import indicators from "/lib/indics";
import StatementForms from "./StatementForms";

const DirectImpacts = ({ session, submit }) => {
  const [period, setPeriod] = useState(session.financialPeriod);
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [showStatementForms, setShowStatementForms] = useState(false);
  const [validations, setValidations] = useState(
    session.validations[period.periodKey]
  );


  useEffect(() => {
    if (validations.length > 0) {
      setSelectedIndicators(validations);
      setShowStatementForms(true);
    }

  }, []);

  const handleSelectedIndicators = (event) => {
    const isChecked = event.target.checked;
    const indic = event.target.value;

    if (isChecked && !selectedIndicators.includes(indic)) {
      setSelectedIndicators([...selectedIndicators, indic]);
    }

    if (!isChecked && selectedIndicators.includes(indic)) {
      setSelectedIndicators(
        selectedIndicators.filter((item) => item !== indic)
      );
    }
  };

  const handleSubmit = () => {
    setShowStatementForms(true);
  };

  const handleValidation = async (indic) => {
    console.log(validations)
    setValidations((validations) => [...validations, indic]);

    // add validation
    if (!session.validations[period.periodKey].includes(indic)) {
      session.validations[period.periodKey].push(indic);
    }
    // update footprint
    await session.updateFootprints(period);
  };

  const renderIndicators = (category) => {
    const filteredIndicators = Object.entries(indicators).filter(
      ([key, value]) => value.isAvailable && value.category === category
    );

    return filteredIndicators.map(([key, value]) => (
      <Col key={key} sm={4}>
        <div className="border border-1 rounded p-4 mb-3 shadow-sm">
          <div className="text-center">
            <Image
              className="me-2"
              src={`icons-ese/${key}.svg`}
              alt={key}
              height={70}
            />
            <h4 className="h5 mt-4 w-75 m-auto">
              {value.libelle}
              {value.isBeta && <span className="beta ms-1">BETA</span>}
            </h4>
          </div>
          <Form className="indic-form text-center mt-4">
            <Form.Check
              type="checkbox"
              value={key}
              onChange={handleSelectedIndicators}
            />
          </Form>
        </div>
        <div></div>
      </Col>
    ));
  };

  return (
    <Container fluid>
      <section className="statement-section step">
        <h2 className="mb-3">Etape 4 - Déclaration des impacts directs </h2>
        <p>
          Identifiez et déclarez les impacts directs et obtenez des éléments
          d'analyse pour chaque indicateur clé.
        </p>

        {!showStatementForms && (
          <>
            <div className="text-center p-3 mb-3 bg-light rounded">
              <h3 className="h4 mb-0 text-uppercase">Création de la valeur</h3>
            </div>
            <Row>{renderIndicators("Création de la valeur")}</Row>
            <div className="text-center p-3 mb-3 bg-light rounded">
              <h3 className="h4 mb-0  text-uppercase">Empreinte sociale</h3>
            </div>
            <Row>{renderIndicators("Empreinte sociale")}</Row>
            <div className="text-center p-3 mb-3 bg-light rounded">
              <h3 className="h4 mb-0  text-uppercase">
                Empreinte environnementale
              </h3>
            </div>
            <Row>{renderIndicators("Empreinte environnementale")}</Row>
            <div className="text-end mt-3">
              <Button
                variant="secondary"
                onClick={handleSubmit}
                disabled={selectedIndicators.length == 0 ? true : false}
              >
                Déclarer les indicateurs <i className="bi bi-chevron-right"></i>
              </Button>
            </div>
          </>
        )}
        {showStatementForms && (
          <>
            <StatementForms
              session={session}
              period={period}
              initialSelectedIndicators={selectedIndicators}
              handleSubmit={() => submit()}
              onValidation={handleValidation} // Passer la fonction de validation à StatementForms
            />

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
          </>
        )}
      </section>
    </Container>
  );
};

export default DirectImpacts;
