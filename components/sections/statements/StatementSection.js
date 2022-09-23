import api from "../../../src/api";
import axios from "axios";

import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

import ResultSection from "./ResultSection";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

import IndicatorsList from "./parts/IndicatorsList";
import ExportResults from "./parts/ExportResults";

const StatementSection = (props) => {

  const [view, setView] = useState("statement");
  const [indic, setIndic] = useState();
  const [isPublicationAvailable, setPublicationAvailable] = useState(false);

  const [allSectorsProductionAreaFootprint, setAllSectorsProductionFootprint] = useState(new SocialFootprint());
  const [allSectorsValueAddedAreaFootprint,setAllSectorsValueAddedAreaFootprint] = useState(new SocialFootprint());
  const [allSectorsConsumptionFootprint, setAllSectorsConsumptionFootprint] = useState(new SocialFootprint());

  useEffect(async() => {
    
    const getAllValueAdded =  api.get("defaultfootprint/?code=00&aggregate=GVA&area=FRA");
    const getAllProduction = api.get("defaultfootprint/?code=00&aggregate=PRD&area=FRA");
    const getAllConsumption = api.get("defaultfootprint/?code=00&aggregate=IC&area=FRA"); 


   await axios.all([getAllValueAdded, getAllProduction, getAllConsumption]).then(axios.spread((...responses) => {
     
      const valueAdded = responses[0]
      const production = responses[1]
      const consumption = responses[2]

      if(valueAdded.data.header.code == 200) 
      {
        let valueAddedFootprint = new SocialFootprint();

        valueAddedFootprint.updateAll(valueAdded.data.footprint);

        setAllSectorsValueAddedAreaFootprint(valueAddedFootprint);

      }

      if( production.data.header.code == 200){
        let productionFootprint = new SocialFootprint();
        productionFootprint.updateAll(production.data.footprint);
        setAllSectorsProductionFootprint(productionFootprint);

      }

      if( consumption.data.header.code == 200){

        let consumptionFootprint = new SocialFootprint();

        consumptionFootprint.updateAll(consumption.data.footprint);

        setAllSectorsConsumptionFootprint(consumptionFootprint);
      }

    })).catch(errors => {
      console.log(errors);
    })

    //
  }, []);


  const handleView = (indic) => {
    setIndic(indic);
    setView("result");
  };

  return (
    <Container fluid className="indicator-section">
  
      {view == "statement" ? (
        <>
          <section className="step">
            <h2>
              <i className="bi bi-rulers"></i> &Eacute;tape 4 - Déclaration des impacts directs
            </h2>
            <p>
              Pour chaque indicateur, déclarez vos impacts directs et obtenez
              les éléments d'analyse.
            </p>
  
            <IndicatorsList
              impactsData={props.session.impactsData}
              session={props.session}
              viewResult={handleView}
              publish={()=> setPublicationAvailable(true)}
              allSectorsFootprints={{
                allSectorsConsumptionFootprint: allSectorsConsumptionFootprint,
                allSectorsProductionAreaFootprint:
                  allSectorsProductionAreaFootprint,
                allSectorsValueAddedAreaFootprint:
                  allSectorsValueAddedAreaFootprint,
              }}
            />
          </section>
          <section className="step">
            <h2>
              <i className="bi bi-box-arrow-in-right"></i> Export des résultats
            </h2>
    
            <ExportResults
              session={props.session}
              validations={props.session.validations}
              comparativeFootprints={{
                allSectorsConsumptionFootprint: allSectorsConsumptionFootprint,
                allSectorsProductionAreaFootprint:
                  allSectorsProductionAreaFootprint,
                allSectorsValueAddedAreaFootprint:
                  allSectorsValueAddedAreaFootprint,
              }}
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
            allSectorsFootprints={{
              allSectorsConsumptionFootprint: allSectorsConsumptionFootprint,
              allSectorsProductionAreaFootprint:
                allSectorsProductionAreaFootprint,
              allSectorsValueAddedAreaFootprint:
                allSectorsValueAddedAreaFootprint,
            }}
          />
      )}
    </Container>
  );
};

export default StatementSection;
