// La Société Nouvelle

// React
import React, { useState,useEffect } from "react";
import { Alert, Button, Image } from "react-bootstrap";

// Components
import StatementFormContainer from "./StatementFormContainer";

// Modals
import { Loader } from "../../modals/Loader";

// Libs
import indicators from "/lib/indics";

const DirectImpacts = ({ 
  session,
  sessionDidUpdate,
  period,
  submit 
}) => {

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
    let selectedStatements = Object.entries(statementsStatus)
      .filter(([_,status]) => status.status!="unselect")
      .map(([indic,_]) => indic);
    let invalidStatements = Object.entries(statementsStatus)
      .filter(([_,status]) => status.status=="error")
      .map(([indic,_]) => indic);
    let emptyStatements = Object.entries(statementsStatus)
      .filter(([_,status]) => status.status=="incomplete")
      .map(([indic,_]) => indic);
    
    // update session
    session.validations[period.periodKey] = selectedStatements;

    // update state
    setSelectedStatements(selectedStatements);
    setInvalidStatements(invalidStatements);
    setEmptyStatements(emptyStatements);

    sessionDidUpdate();

  }, [statementsStatus])

  // on submit
  const handleSubmitStatements = async () => 
  {
    setIsLoading(true);

    // compute footprints
    await session.updateFootprints(period);

    // fetch comparative data
    await session.comparativeData.fetchComparativeData(selectedStatements);

    // fetch analysis
    await session.buildAnalysis(period);

    setIsLoading(false);
    submit();
  };

  const onStatementUpdate = (indic, status) => {
    setStatementsStatus(prevStatementsStatus => {return({
      ...prevStatementsStatus,
      [indic]: status
    })});

    if (["error","incomplete"].includes(status.status) // re-init if unselect, error or incomplete
     || (status.status=="ok" && statementsStatus[indic].status=="ok")) { // re-init if changes
      session.initNetValueAddedIndicator(indic,period);
    }
  };

  const categories = [
    "Création de la valeur",
    "Empreinte sociale",
    "Empreinte environnementale"
  ];

  return (
      <section className="statement-section step">
        <h2 className="mb-3">Etape 4 - Déclaration des impacts directs </h2>
        <div className="alert-info ">
          <div className="info-icon">
            <Image src="/info-circle.svg" alt="icon info" />
          </div>
          <div>
            <p>
              Les <b>déclarations d'impacts directs s'effectuent par indicateur</b>.
              Des outils de calcul sont mis à disposition pour certains indicateurs
              (lecture des DSN, outil d'évaluation des émissions directes de gaz à 
              effet de serre, etc.).
            </p>
            <p className="mt-1">
              Il est possible de choisir les indicateurs sur lesquels on souhaite une
              évaluation, en les cochant. En cas d'hypothèses faites, merci de les 
              renseigner dans les <i>Informations complémentaires</i>.
            </p>
            <p className="mt-1">
              Le périmètre à retenir est le <b>périmètre opérationnel</b> de l'entreprise.
            </p>
          </div>
        </div>

   

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
  );
};

export default DirectImpacts;
