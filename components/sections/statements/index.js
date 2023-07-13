import React, { useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import StatementForms from "./StatementForms";
import { Loader } from "../../popups/Loader";
import { endpoints } from "../../../config/endpoint";
import {
  fetchComparativeDataForArea,
  fetchComparativeDataForDivision,
} from "../../../src/services/MacrodataService";
import { checkIfDataExists } from "./utils";

const DirectImpacts = ({ session, submit }) => {
  const [period, setPeriod] = useState(session.financialPeriod);
  const [validations, setValidations] = useState(
    session.validations[period.periodKey]
  );
  const [isLoading, setIsLoading] = useState(false);

  const [invalidIndicators, setInvalidIndicators] = useState(null);

  const handleSubmitStatements = async () => {
    if (invalidIndicators.length > 0) {
      window.scroll(0, 0);
      return;
    }

    setIsLoading(true);

    for (const validation of validations) {
      const indicatorCode = validation.toUpperCase();
      // fetch comparative data
      //
      const missingIndicators = checkIfDataExists(
        session.comparativeData,
        indicatorCode
      );
      if (missingIndicators.length > 0) {
        for (const missingIndicator of missingIndicators) {
          await fetchComparativeDataForArea(
            session.comparativeData,
            missingIndicator,
            endpoints
          );
          if (session.comparativeData.activityCode != "00") {
            await fetchComparativeDataForDivision(
              session.comparativeData,
              missingIndicator,
              endpoints
            );
          }
        }
      }
    }

    setIsLoading(false);
    submit();
  };

  const handleValidations = async (indicators, invalidIndicators) => {
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
        {invalidIndicators && invalidIndicators.length > 0 && (
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
        {isLoading && <Loader title={"Chargement en cours..."} />}

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
