import React, { useEffect, useState } from "react";
import { Col, Image, Row, Tab, Tabs } from "react-bootstrap";
import PieGraph from "../../graphs/PieGraph";
import { IndicatorExpensesTable } from "../../tables/IndicatorExpensesTable";
import { IndicatorMainAggregatesTable } from "../../tables/IndicatorMainAggregatesTable";
import metaIndics from "/lib/indics";
import divisions from "/lib/divisions";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";
import { IndicatorGraphs } from "../../graphs/IndicatorGraphs";

const ResultSection = (props) => {

  const [indic, setIndic] = useState(props.indic);
  const [session, setSession] = useState(props.session);

  const [comparativeDivision, setComparativeDivision] = useState("00");
  const [productionSectorFootprint, setProductionSectorFootprint] = useState(new SocialFootprint());
  const [valueAddedSectorFootprint, setValueAddedSectorFootPrint] = useState(new SocialFootprint());
  const [consumptionSectorFootprint, setConsumptionSectorFootPrint] = useState(new SocialFootprint());
  
  const [allSectorsProductionAreaFootprint, setAllSectorsProductionFootprint] = useState( new SocialFootprint());
  const [allSectorsValueAddedAreaFootprint, setAllSectorsValueAddedAreaFootprint] = useState( new SocialFootprint());
  const [allSectorsConsumptionFootprint, setAllSectorsConsumptionFootprint] = useState( new SocialFootprint());


  const [printGrossImpact] = useState([
    "ghg",
    "haz",
    "mat",
    "nrg",
    "was",
    "wat",
  ]);

  const { intermediateConsumption, capitalConsumption, netValueAdded } = props.session.financialData.aggregates;
  const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

  const fetchDivisionData = async (division, flow) => {
    let endpoint;
    let response;
    let data;
  
    // comparative data
    let footprint = new SocialFootprint();
  
    endpoint =
      apiBaseUrl +
      "/default?" +
      "area=FRA" +
      "&activity=" +
      division +
      "&flow=" +
      flow;
    response = await fetch(endpoint, { method: "get" });
    data = await response.json();
    if (data.header.statut == 200) footprint.updateAll(data.empreinteSocietale);
  
    return footprint;
  };

  const fetchEconomicAreaData = async (area, flow) => {
    let endpoint;
    let response;
    let data;
  
    // comparative data
    let footprint = new SocialFootprint();
    console.log(footprint)

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

    const changeComparativeDivision = async(event) => {
        let division = event.target.value;

        setComparativeDivision(division);

        if (division != "00") {
            let productionSectorFootprint = await fetchDivisionData(division, "PRD");
            let valueAddedSectorFootprint = await fetchDivisionData(division, "GVA");
            let consumptionSectorFootprint = await fetchDivisionData(division, "IC");

            setProductionSectorFootprint(productionSectorFootprint);
            setValueAddedSectorFootPrint(valueAddedSectorFootprint);
            setConsumptionSectorFootPrint(consumptionSectorFootprint);
          } else {

            setProductionSectorFootprint(new SocialFootprint());
            setValueAddedSectorFootPrint(new SocialFootprint());
            setConsumptionSectorFootPrint(new SocialFootprint());


          }
   
      } 


      useEffect(() => {
        console.log("changed") 
        fetchEconomicAreaData("FRA", "GVA").then((footprint) =>
        console.log(footprint)
        //setAllSectorsValueAddedAreaFootprint(footprint)
      );
      fetchEconomicAreaData("FRA", "PRD").then((footprint) =>
      setAllSectorsProductionFootprint(footprint)
      );
  
      fetchEconomicAreaData("FRA", "IC").then((footprint) =>
      setAllSectorsConsumptionFootprint(footprint)
      );
      }, [])
  return (
    <>
      <div className="d-flex align-items-center ">
        <Image
          src={"/resources/icon-ese-fb/" + indic + ".svg"}
          className="icon-ese me-2"
        />
        <h2>{metaIndics[props.indic].libelle}</h2>
      </div>

      <h3>Impact</h3>
      <Tabs
        defaultActiveKey="mainAggregates"
        transition={false}
        id="noanim-tab-example"
        className="mb-3"
      >
        <Tab
          eventKey="mainAggregates"
          title=" Soldes intermédiaires de gestion"
        >
          <IndicatorMainAggregatesTable session={session} indic={indic} />
        </Tab>
        <Tab eventKey="expensesAccounts" title=" Détails - Comptes de charges">
          <IndicatorExpensesTable session={session} indic={indic} />
        </Tab>
      </Tabs>
      <Row>
        <Col lg={3}>
          <h3>Répartition des impacts bruts (en %)</h3>
          {printGrossImpact.includes(indic) && (
            <PieGraph
              intermediateConsumption={intermediateConsumption.footprint.indicators[
                indic
              ].getGrossImpact(intermediateConsumption.amount)}
              capitalConsumption={capitalConsumption.footprint.indicators[
                indic
              ].getGrossImpact(capitalConsumption.amount)}
              netValueAdded={netValueAdded.footprint.indicators[
                indic
              ].getGrossImpact(netValueAdded.amount)}
            />
          )}
        </Col>
        <Col lg={8}>
          <h3>Comparaison par activité</h3>
          <select
                      className={"form-input small-input"}
                      value={comparativeDivision}
                      onChange={changeComparativeDivision}
                    >
                      {Object.entries(divisions)
                        .sort((a, b) => parseInt(a) - parseInt(b))
                        .map(([code, libelle]) => (
                          <option key={code} value={code}>
                            {code + " - " + libelle}
                          </option>
                        ))}
                    </select>

                    <div className="graph-section">
               
                    {/* <IndicatorGraphs
                      session={session}
                      indic={indic}
                      comparativeFootprints={[allSectorsConsumptionFootprint, allSectorsProductionAreaFootprint, allSectorsValueAddedAreaFootprint,productionSectorFootprint, consumptionSectorFootprint, valueAddedSectorFootprint]}
                    />  */}
                  </div>
        </Col>
      </Row>
    </>
  );
};

export default ResultSection;
