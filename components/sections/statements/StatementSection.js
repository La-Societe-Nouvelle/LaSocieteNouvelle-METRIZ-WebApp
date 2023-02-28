import React, { useState } from "react";
import { Container } from "react-bootstrap";

import ResultSection from "./ResultSection";

import IndicatorsList from "./parts/IndicatorsList";
import ExportResults from "./parts/ExportResults";

const StatementSection = (props) => {
  const [visibleGraphs, setVisibleGraphs] = useState(false);
  const [view, setView] = useState("statement");
  const [indic, setIndic] = useState();
  const [isPublicationAvailable, setPublicationAvailable] = useState(false);
  const [validationsState, setValidationsState] = useState(
    props.session.validations
  );

  const [comparativeDivision, setComparativeDivision] = useState(
    props.session.comparativeData.activityCode
  );

  const handleView = (indic) => {
    setIndic(indic);
    setView("result");
  };

  const handleValidation = (newValidation) => {
    if (!validationsState.includes(newValidation)) {
      setValidationsState([...validationsState, newValidation]);
    }
  };

  const handleDivision = (code) => {

    setComparativeDivision(code);
    props.session.comparativeData.activityCode = code;
  };
  const updateVisibleGraphs = (newValue) => {
    setVisibleGraphs(newValue);
  };

  return (
    <Container fluid className="indicator-section">
      {view == "statement" ? (
        <>
          <section className="step">
            <h2 className="mb-3">Etape 4 - Déclaration des impacts directs </h2>
            <p>
              Pour chaque indicateur, déclarez vos impacts directs et obtenez
              les éléments d'analyse.
            </p>
            <IndicatorsList
              updateVisibleGraphs={updateVisibleGraphs}
              visibleGraphs={visibleGraphs}
              onValidation={handleValidation}
              impactsData={props.session.impactsData}
              session={props.session}
              viewResult={handleView}
              publish={() => setPublicationAvailable(true)}
            />
          </section>
          <section className="step">
            <h2>
              <i className="bi bi-box-arrow-in-right"></i> Export des résultats
            </h2>

            <ExportResults
              updateVisibleGraphs={updateVisibleGraphs}
              handleDivision={handleDivision}
              session={props.session}
              validations={validationsState}
            />

            <hr />

            <div className="text-end">
              <button
                className={"btn btn-secondary"}
                id="validation-button"
                onClick={props.publish}
                disabled={!isPublicationAvailable}
              >
                Publier mes résultats <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </section>
        </>
      ) : (
        <ResultSection
          session={props.session}
          indic={indic}
          goBack={() => setView("statement")}
        />
      )}
    </Container>
  );
};

export default StatementSection;
