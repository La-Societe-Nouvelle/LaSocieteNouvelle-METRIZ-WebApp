// TO DO : OPTIMISATION 

import React, { useEffect, useState } from "react";
import {Container} from "react-bootstrap";

import ResultSection from "./ResultSection";

import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

import IndicatorsList from "./parts/IndicatorsList";
import ExportResults from "./parts/ExportResults";

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

const StatementSection = (props) => {
  const [view, setView] = useState("statement");
  const [indic, setIndic] = useState();

  const [allSectorsProductionAreaFootprint, setAllSectorsProductionFootprint] =
    useState(new SocialFootprint());

  const [
    allSectorsValueAddedAreaFootprint,
    setAllSectorsValueAddedAreaFootprint,
  ] = useState(new SocialFootprint());
  const [allSectorsConsumptionFootprint, setAllSectorsConsumptionFootprint] =
    useState(new SocialFootprint());

  useEffect(() => {
    fetchEconomicAreaData("FRA", "GVA").then((footprint) =>
      setAllSectorsValueAddedAreaFootprint(footprint)
    );
    fetchEconomicAreaData("FRA", "PRD").then((footprint) =>
      setAllSectorsProductionFootprint(footprint)
    );
    fetchEconomicAreaData("FRA", "IC").then((footprint) =>
      setAllSectorsConsumptionFootprint(footprint)
    );
  }, []);

  const fetchEconomicAreaData = async (area, flow) => {
    let endpoint;
    let response;
    let data;

    // comparative data
    let footprint = new SocialFootprint();

    // Available production
    endpoint =
      apiBaseUrl +
      "/default?" +
      "area=" +
      area +
      "&activity=00" +
      "&flow=" +
      flow;
    response = await fetch(endpoint, { method: "get" });
    data = await response.json();
    if (data.header.statut == 200) footprint.updateAll(data.empreinteSocietale);
    return footprint;
  };

  const handleView = (indic) => {
    setIndic(indic);
    setView("result");
  };

  const isPublicationAvailable =
    Object.entries(
      props.session.financialData.aggregates.revenue.footprint.indicators
    ).filter(([_, indicator]) => indicator.value != null).length > 0;

  return (
    <Container fluid className="indicator-section">
      <section className="step">
        {view == "statement" ? (
          <>
            <h2>
              <i className="bi bi-rulers"></i> &Eacute;tape 4 - Déclaration des
              impacts
            </h2>
            <p>
              Pour chaque indicateur, déclarez vos impacts directs et obtenez
              les éléments d'analyse.
            </p>
            <IndicatorsList
            
            impactsData={props.session.impactsData}
              session={props.session}
              viewResult={handleView}
              comparativeFootprints={{
                allSectorsConsumptionFootprint: allSectorsConsumptionFootprint,
                allSectorsProductionAreaFootprint:
                  allSectorsProductionAreaFootprint,
                allSectorsValueAddedAreaFootprint:
                  allSectorsValueAddedAreaFootprint,
              }}
            >

            </IndicatorsList >

            <ExportResults session={props.session} validations={props.session.validations} />

            <hr />

            <div className="align-right">
              <button
                className={"btn btn-secondary"}
                id="validation-button"
                onClick={props.publish}
                disabled={!isPublicationAvailable}
              >
                Publier mes résultats <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </>
        ) : (
          <ResultSection
            session={props.session}
            indic={indic}
            goBack={() => setView("statement")}
            comparativeFootprints={{
              allSectorsConsumptionFootprint: allSectorsConsumptionFootprint,
              allSectorsProductionAreaFootprint:
                allSectorsProductionAreaFootprint,
              allSectorsValueAddedAreaFootprint:
                allSectorsValueAddedAreaFootprint,
            }}
          />
        )}
      </section>
    </Container>
  );
};



export default StatementSection;
