import React, { useEffect, useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import StatementForms from "./StatementForms";
import { updateComparativeData } from "../../../src/version/updateVersion";

const DirectImpacts = ({ session, submit }) => {
  const [period, setPeriod] = useState(session.financialPeriod);
  const [validations, setValidations] = useState(
    session.validations[period.periodKey]
  );

  const [invalidIndicators, setInvalidIndicators] = useState(null);

  const handleSubmitStatements = async () => {
    console.log(invalidIndicators);

    if (invalidIndicators.length > 0) {
      window.scroll(0, 0);
      return;
    }

    // Handle submit on for first submit ?
    // fetch comparative data
    //
    //await fetchData();

    submit();
  };

  const fetchData = async () => {
    let updatedComparativeData = session.comparativeData;

    for await (const indic of session.validations[
      session.financialPeriod.periodKey
    ]) {
      const updatedData = await updateComparativeData(
        indic,
        session.comparativeData.activityCode,
        updatedComparativeData
      );

      updatedComparativeData = updatedData;
    }

    session.comparativeData = updatedComparativeData;
  };

  const handleValidations = async (indicators, invalidIndicators) => {
    console.log(invalidIndicators);
    setValidations(indicators);
    setInvalidIndicators(invalidIndicators);
    session.validations[period.periodKey] = indicators;
  };

  return (
    <Container fluid>
      <section className="statement-section step">
        <h2 className="mb-3">Etape 4 - Déclaration des impacts directs </h2>
        <p>
          Identifiez et déclarez les impacts directs et obtenez des éléments
          d'analyse pour chaque indicateur clé.
        </p>
        {invalidIndicators.length > 0 && (
          <Alert variant="danger">
            {`Attention : ${
              invalidIndicators.length > 1
                ? "plusieurs erreurs ont été détectées"
                : "une erreur a été détectée"
            }  ${
              invalidIndicators.length > 1
                ? "dans certains formulaires de déclarations"
                : ""
            }. Veuillez vérifier et corriger ${
              invalidIndicators.length > 1
                ? `les ${invalidIndicators.length} formulaires concernés`
                : "le formulaire concerné"
            } avant de pouvoir passer aux résultats.`}
          </Alert>
        )}

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
