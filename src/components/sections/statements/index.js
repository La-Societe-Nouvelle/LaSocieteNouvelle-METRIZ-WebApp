// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Alert, Button, Image } from "react-bootstrap";

// Components
import StatementFormContainer from "./StatementFormContainer";

// Modals
import { Loader } from "../../modals/Loader";

// Libs
import indicators from "/lib/indics";

const previewIndicators = ["eco", "art", "knw", "geq", "ghg", "nrg", "wat"];

const DirectImpacts = ({ session, sessionDidUpdate, period, submit }) => {
  const [statementsStatus, setStatementsStatus] = useState({
    art: { status: "undefined", errorMessage: null },
    eco: { status: "undefined", errorMessage: null },
    soc: { status: "undefined", errorMessage: null },
    idr: { status: "undefined", errorMessage: null },
    geq: { status: "undefined", errorMessage: null },
    knw: { status: "undefined", errorMessage: null },
    ghg: { status: "undefined", errorMessage: null },
    haz: { status: "undefined", errorMessage: null },
    mat: { status: "undefined", errorMessage: null },
    nrg: { status: "undefined", errorMessage: null },
    was: { status: "undefined", errorMessage: null },
    wat: { status: "undefined", errorMessage: null },
  });

  const [selectedStatements, setSelectedStatements] = useState(
    session.validations[period.periodKey]
  );
  const [invalidStatements, setInvalidStatements] = useState([]);
  const [emptyStatements, setEmptyStatements] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // update states
  useEffect(async () => {
    if (!session.comparativeData.isDataFetched) {
      setIsLoading(true);
      await session.comparativeData.fetchComparativeData(previewIndicators);
      setIsLoading(false);
    }

    console.log("initialisation à partir des données légales");
    console.log(session.legalUnit);

    // init ART
    if (session.legalUnit.hasCraftedActivities 
        && session.impactsData[period.periodKey].isValueAddedCrafted === null) {
      session.impactsData[period.periodKey].isValueAddedCrafted = true;
    }
    // init SOC
    if ((session.legalUnit.isEconomieSocialeSolidaire || session.legalUnit.isSocieteMission)
        && session.impactsData[period.periodKey].hasSocialPurpose === null) {
      session.impactsData[period.periodKey].hasSocialPurpose = true;
    }
    // init IDR & GEQ
    if (!session.legalUnit.isEmployeur
        && session.impactsData[period.periodKey].hasEmployees === null) {
      session.impactsData[period.periodKey].hasEmployees = false;
    }
  }, []);

  useEffect(() => {
    let selectedStatements = Object.entries(statementsStatus)
      .filter(
        ([_, status]) =>
          (status.status != "unselect") & (status.status != "undefined")
      )
      .map(([indic, _]) => indic);
    let invalidStatements = Object.entries(statementsStatus)
      .filter(([_, status]) => status.status == "error")
      .map(([indic, _]) => indic);
    let emptyStatements = Object.entries(statementsStatus)
      .filter(([_, status]) => status.status == "incomplete")
      .map(([indic, _]) => indic);

    // update session (except if state on build)
    if (
      Object.entries(statementsStatus).every(
        ([_, status]) => status.status != "undefined"
      )
    ) {
      session.validations[period.periodKey] = selectedStatements;
    }

    // update state
    setSelectedStatements(selectedStatements);
    setInvalidStatements(invalidStatements);
    setEmptyStatements(emptyStatements);
  }, [statementsStatus]);

  const updateSession = () => {
    let selectedStatements = Object.entries(statementsStatus)
      .filter(([_, status]) => status.status != "unselect")
      .map(([indic, _]) => indic);

    // update session
    session.validations[period.periodKey] = selectedStatements;
    sessionDidUpdate();
  };

  // on submit
  const handleSubmitStatements = async () => {
    setIsLoading(true);

    // update validations array in session
    updateSession();

    // update nva footprints
    await session.updateNetValueAddedFootprint(period);

    // compute footprints
    await session.updateFootprints(period);

    // fetch comparative data
    try {
      //Check if there are any selected indicators that have not been fetched yet
      const indicatorsToFetch = selectedStatements.filter(
        (indicator) =>
          !session.comparativeData.fetchedIndicators.includes(indicator)
      );

      if (indicatorsToFetch.length > 0) {
        await session.comparativeData.fetchComparativeData(indicatorsToFetch);
      }
    } catch (error) {
      setIsLoading(false);
    }

    // fetch analysis
    if (session.useChatGPT) {
      await session.buildAnalysis(period);
    }

    setIsLoading(false);
    submit();
  };

  const onStatementUpdate = (indic, status) => {
    const prevStatus = statementsStatus[indic].status;

    setStatementsStatus((prevStatementsStatus) => {
      return {
        ...prevStatementsStatus,
        [indic]: status,
      };
    });

    if (prevStatus != "undefined") {
      // select
      if (["error", "incomplete", "ok"].includes(status.status)) {
        session.initNetValueAddedIndicator(indic, period);
        updateSession();
      }
      // unselect
      else {
        let validatedIndics = session.validations[period.periodKey];
        session.validations[period.periodKey] = validatedIndics.filter(
          (validatedIndic) => validatedIndic != indic
        );
        session.initNetValueAddedIndicator(indic, period);
      }
    }
  };

  const categories = [
    "Création de la valeur",
    "Empreinte sociale",
    "Empreinte environnementale",
  ];

  const isDisabled = !isNextStepAvailable(
    emptyStatements,
    invalidStatements,
    selectedStatements
  );

  return (
    <section className="statement-section step">
      <h2 className="mb-3">Etape 4 - Déclaration des impacts directs </h2>
      <div className="alert-info ">
        <div className="info-icon">
          <Image src="/info-circle.svg" alt="icon info" />
        </div>
        <div>
          <p>
            Les{" "}
            <b>déclarations d'impacts directs s'effectuent par indicateur</b>.
            Des outils de calcul sont mis à disposition pour certains
            indicateurs (lecture des DSN, outil d'évaluation des émissions
            directes de gaz à effet de serre, etc.).
          </p>
          <p className="mt-1">
            Il est possible de choisir les indicateurs sur lesquels on souhaite
            une évaluation, en les cochant. En cas d'hypothèses faites, merci de
            les renseigner dans les <i>Informations complémentaires</i>.
          </p>
          <p className="mt-1">
            Le périmètre à retenir est le <b>périmètre opérationnel</b> de
            l'entreprise.
          </p>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h3>
            <i className="bi bi-pencil-square"></i> {category}
          </h3>
          {Object.entries(indicators)
            .filter(
              ([_, value]) => value.isAvailable && value.category === category
            )
            .map(([key, _]) => (
              <StatementFormContainer
                key={key}
                session={session}
                period={period}
                indic={key}
                onUpdate={onStatementUpdate}
              />
            ))}
        </div>
      ))}

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
          disabled={isDisabled}
        >
          Valider et accéder aux résultats
          <i className="bi bi-chevron-right"></i>
        </Button>
      </div>
    </section>
  );
};

function isNextStepAvailable(
  emptyStatements,
  invalidStatements,
  selectedStatements
) {
  const isAvailable =
    emptyStatements.length === 0 &&
    invalidStatements.length === 0 &&
    selectedStatements.length > 0;
  return isAvailable;
}

export default DirectImpacts;
