import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Image, Row } from "react-bootstrap";
import indicators from "/lib/indics";
import StatementForms from "./StatementForms";

const DirectImpacts = ({ session, submit }) => {
  const [period, setPeriod] = useState(session.financialPeriod);
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [validations, setValidations] = useState(
    session.validations[period.periodKey]
  );

  useEffect(() => {
    if (validations.length > 0) {
      setSelectedIndicators(validations);
    }
  }, []);

  const handleValidation = async (indic) => {
    console.log(validations);
    setValidations((validations) => [...validations, indic]);

    // add validation
    if (!session.validations[period.periodKey].includes(indic)) {
      session.validations[period.periodKey].push(indic);
    }
    // update footprint
    await session.updateFootprints(period);
  };

  return (
    <Container fluid>
      <section className="statement-section step">
        <h2 className="mb-3">Etape 4 - Déclaration des impacts directs </h2>
        <p>
          Identifiez et déclarez les impacts directs et obtenez des éléments
          d'analyse pour chaque indicateur clé.
        </p>

        <StatementForms
          session={session}
          period={period}
          initialSelectedIndicators={selectedIndicators}
          handleSubmit={() => submit()}
          onValidation={handleValidation}
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
      </section>
    </Container>
  );
};

export default DirectImpacts;
