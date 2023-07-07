import React, { useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import StatementForms from "./StatementForms";
import { Loader } from "../../popups/Loader";
import { fetchComparativeData } from "../../../src/services/MacrodataService";
import { checkIfDataExists } from "./utils";
import indicators from "/lib/indics";

const DirectImpacts = ({ session, submit }) => {
  const [period] = useState(session.financialPeriod);

  const [validations, setValidations] = useState(
    session.validations[period.periodKey]
  );
  const [isLoading, setIsLoading] = useState(false);

  const [invalidStatements, setInvalidStatements] = useState([]);
  const [emptyStatements, setEmptyStatements] = useState([]);

  const handleSubmitStatements = async () => {
    setIsLoading(true);
    await session.updateFootprints(period);

    const missingIndicators = [];

    for (const validation of validations) {
      const indicatorCode = validation.toUpperCase();
      // fetch comparative data
      //
      const hasData = checkIfDataExists(session.comparativeData, indicatorCode);

      if (!hasData) {
        missingIndicators.push(indicatorCode);
      }
    }
    if (missingIndicators.length > 0) {
      await fetchComparativeData(session.comparativeData, missingIndicators);
    }

    setIsLoading(false);
    submit();
  };

  const handleValidations = async (
    indicators,
    invalidStatements,
    emptyStatements
  ) => {
    setValidations(indicators);
    setInvalidStatements(invalidStatements);
    setEmptyStatements(emptyStatements);

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
        <StatementForms
          session={session}
          period={period}
          initialSelectedIndicators={validations}
          updateValidations={handleValidations}
        />
        {isLoading && <Loader title={"Chargement en cours..."} />}

        {invalidStatements && invalidStatements.length > 0 && (
          <Alert variant="danger" className="flex-column align-items-start">
            {`Attention : ${
              invalidStatements.length > 1
                ? "plusieurs erreurs ont été détectées"
                : "une erreur a été détectée"
            }  ${
              invalidStatements.length > 1
                ? "dans certains formulaires de déclarations"
                : ""
            }. Veuillez vérifier et corriger ${
              invalidStatements.length > 1
                ? `les ${invalidStatements.length} formulaires concernés`
                : "le formulaire concerné"
            } avant de pouvoir passer aux résultats.`}

            <ul className="list-unstyled small mt-3 fw-bold">
              {invalidStatements.map((statement) => (
                <li key={statement}>
                  <a className="alert-link" href={`#${statement}`}>
                    - {indicators[statement].libelle}
                  </a>
                </li>
              ))}
            </ul>
          </Alert>
        )}
        {emptyStatements.length > 0 && (
          <Alert variant="warning" className="flex-column align-items-start">
            <p>
              {`Attention : ${
                emptyStatements.length > 1
                  ? "plusieurs formulaires n'ont pas été remplis"
                  : "un formulaire n'a pas été rempli"
              }  ${
                emptyStatements.length > 1
                  ? "dans certains formulaires de déclarations"
                  : ""
              }. Veuillez remplir ou déselectionner ${
                emptyStatements.length > 1
                  ? `les ${emptyStatements.length} formulaires concernés`
                  : "le formulaire concerné"
              } avant de pouvoir passer aux résultats.`}
            </p>
            <ul className="list-unstyled small mt-3 fw-bold">
              {emptyStatements.map((statement) => (
                <li key={statement}>
                  <a className="alert-link" href={`#${statement}`}>
                    - {indicators[statement].libelle}
                  </a>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        <div className="text-end">
          <Button
            variant="secondary"
            onClick={handleSubmitStatements}
            disabled={
              emptyStatements.length > 0 ||
              invalidStatements.length > 0 ||
              validations.length == 0
                ? true
                : false
            }
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
