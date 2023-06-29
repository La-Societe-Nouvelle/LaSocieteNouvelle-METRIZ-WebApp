import React, { useState } from "react";
import { Button, Container } from "react-bootstrap";
import StatementForms from "./StatementForms";

const DirectImpacts = ({ session, submit }) => {
  const [period, setPeriod] = useState(session.financialPeriod);
  const [validations, setValidations] = useState(
    session.validations[period.periodKey]
  );
 
  const handleSubmitStatements = () => {
    console.log(validations)
    // fetch comparative data
    // Submit and go to results
    submit();
  }
  const handleValidations = async (indicators) => {
    console.log(indicators)
    setValidations(indicators);
    session.validations[period.periodKey] = indicators;
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
          initialSelectedIndicators={validations}
          updateValidations={handleValidations}
        />

        <div className="text-end">
          <Button
            variant="secondary"
            onClick={handleSubmitStatements}
            disabled={validations.length == 0 ? true : false}
          >
           Valider et accéder aux résultats
            <i className="bi bi-chevron-right"></i>
          </Button>
        </div>
      </section>
    </Container>
  );
};

export default DirectImpacts;
