// La Société Nouvelle

// React
import React, { useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import StatementForms from "./StatementForms";
import { Loader } from "../../modals/Loader";
import { fetchComparativeData } from "../../../src/services/MacrodataService";
import { checkIfDataExists } from "./utils";
import indicators from "/lib/indics";
import StatementFormContainer from "./StatementFormContainer";
import { useEffect } from "react";

const DirectImpacts = ({ session, submit }) => 
{
  const [period] = useState(session.financialPeriod);
  console.log(session.validations[period.periodKey]);

  const [statementsStatus, setStatementsStatus] = useState({
    art: { status: "unselect", errorMessage: null },
    eco: { status: "unselect", errorMessage: null },
    soc: { status: "unselect", errorMessage: null },
    idr: { status: "unselect", errorMessage: null },
    geq: { status: "unselect", errorMessage: null },
    knw: { status: "unselect", errorMessage: null },
    ghg: { status: "unselect", errorMessage: null },
    haz: { status: "unselect", errorMessage: null },
    mat: { status: "unselect", errorMessage: null },
    nrg: { status: "unselect", errorMessage: null },
    was: { status: "unselect", errorMessage: null },
    wat: { status: "unselect", errorMessage: null },
  })

  const [selectedStatements, setSelectedStatements] = useState([]); // session.validations[period.periodKey]
  const [invalidStatements, setInvalidStatements] = useState([]);
  const [emptyStatements, setEmptyStatements] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("use effect");
  },[]);

  useEffect(() => {
    console.log("triggered");
    console.log(statementsStatus);
    let selectedStatements = Object.entries(statementsStatus)
      .filter(([_,status]) => status.status!="unselect")
      .map(([indic,_]) => indic);
    let invalidStatements = Object.entries(statementsStatus)
      .filter(([_,status]) => status.status=="error")
      .map(([indic,_]) => indic);
    let emptyStatements = Object.entries(statementsStatus)
      .filter(([_,status]) => status.status=="incomplete")
      .map(([indic,_]) => indic);
    //
    session.validations[period.periodKey] = selectedStatements;
    //
    setSelectedStatements(selectedStatements);
    setInvalidStatements(invalidStatements);
    setEmptyStatements(emptyStatements);
  }, [statementsStatus])

  const handleSubmitStatements = async () => {
    console.log(session.validations);
    console.log(session.impactsData[period.periodKey]);
    setIsLoading(true);
    await session.updateFootprints(period);

    const missingIndicators = [];

    for (const validation of selectedStatements) {
      const indicatorCode = validation.toUpperCase();
      // fetch comparative data
      //
      const hasData = checkIfDataExists(session.comparativeData, indicatorCode);

      if (!hasData) {
        missingIndicators.push(indicatorCode);
      }
    }
    if (missingIndicators.length > 0) {
      await fetchComparativeData(session.comparativeData);
    }

    setIsLoading(false);
    submit();
  };

  const onStatementUpdate = (indic, status) => {
    setStatementsStatus(prevStatementsStatus => {return({
      ...prevStatementsStatus,
      [indic]: status
    })});
  };

  const categories = [
    "Création de la valeur",
    "Empreinte sociale",
    "Empreinte environnementale"
  ];

  return (
    <Container fluid>
      <section className="statement-section step">
        <h2 className="mb-3">Etape 4 - Déclaration des impacts directs </h2>
        <p>
          Identifiez et déclarez les impacts directs et obtenez des éléments
          d'analyse pour chaque indicateur clé.
        </p>

        {categories.map((category) => 
          <div key={category}>
            <h3>
              <i className="bi bi-pencil-square"></i> {category}
            </h3>
            {Object.entries(indicators)
              .filter(([_, value]) => value.isAvailable && value.category === category)
              .map(([key,_]) => 
                <StatementFormContainer 
                  key={key}
                  session={session}
                  period={period}
                  indic={key}
                  onUpdate={onStatementUpdate}
                />
              )}
          </div>
        )}

        {/* <StatementForms
          session={session}
          period={period}
          initialSelectedIndicators={validations}
          updateValidations={handleValidations}
        /> */}
        {isLoading && <Loader title={"Chargement en cours..."} />}

        {invalidStatements.length > 0 && (
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
              selectedStatements.length == 0
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
