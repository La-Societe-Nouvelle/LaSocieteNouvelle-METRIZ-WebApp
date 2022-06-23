import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Dropdown,
  DropdownButton,
  Image,
  Row,
  Tab,
  Tabs,
} from "react-bootstrap";

import PieGraph from "../../graphs/PieGraph";
import { IndicatorExpensesTable } from "../../tables/IndicatorExpensesTable";
import { IndicatorMainAggregatesTable } from "../../tables/IndicatorMainAggregatesTable";
import metaIndics from "/lib/indics";
import divisions from "/lib/divisions";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";
import { IndicatorGraphs } from "../../graphs/IndicatorGraphs";
import { analysisTextWriterART } from "../../../src/writers/analysis/analysisTextWriterART";
import { analysisTextWriterDIS } from "../../../src/writers/analysis/analysisTextWriterDIS";
import { analysisTextWriterECO } from "../../../src/writers/analysis/analysisTextWriterECO";
import { analysisTextWriterGEQ } from "../../../src/writers/analysis/analysisTextWriterGEQ";
import { analysisTextWriterGHG } from "../../../src/writers/analysis/analysisTextWriterGHG";
import { analysisTextWriterHAZ } from "../../../src/writers/analysis/analysisTextWriterHAZ";
import { analysisTextWriterKNW } from "../../../src/writers/analysis/analysisTextWriterKNW";
import { analysisTextWriterMAT } from "../../../src/writers/analysis/analysisTextWriterMAT";
import { analysisTextWriterNRG } from "../../../src/writers/analysis/analysisTextWriterNRG";
import { analysisTextWriterSOC } from "../../../src/writers/analysis/analysisTextWriterSOC";
import { analysisTextWriterWAS } from "../../../src/writers/analysis/analysisTextWriterWAS";
import { analysisTextWriterWAT } from "../../../src/writers/analysis/analysisTextWriterWAT";
import { exportIndicPDF } from "../../../src/writers/Export";

const ResultSection = (props) => {
  const [indic, setIndic] = useState(props.indic);
  const [session, setSession] = useState(props.session);

  const [comparativeDivision, setComparativeDivision] = useState("00");
  const [productionSectorFootprint, setProductionSectorFootprint] = useState(
    new SocialFootprint()
  );
  const [valueAddedSectorFootprint, setValueAddedSectorFootPrint] = useState(
    new SocialFootprint()
  );
  const [consumptionSectorFootprint, setConsumptionSectorFootPrint] = useState(
    new SocialFootprint()
  );

  const [allSectorsProductionAreaFootprint, setAllSectorsProductionFootprint] =
    useState(new SocialFootprint());
  const [
    allSectorsValueAddedAreaFootprint,
    setAllSectorsValueAddedAreaFootprint,
  ] = useState(new SocialFootprint());
  const [allSectorsConsumptionFootprint, setAllSectorsConsumptionFootprint] =
    useState(new SocialFootprint());

  const [printGrossImpact] = useState([
    "ghg",
    "haz",
    "mat",
    "nrg",
    "was",
    "wat",
  ]);

  const { intermediateConsumption, capitalConsumption, netValueAdded } =
    props.session.financialData.aggregates;

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
    console.log(footprint);

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

  const changeComparativeDivision = async (event) => {
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
  };

  useEffect(() => {
    console.log("changed");
    console.log(session);

    fetchEconomicAreaData("FRA", "GVA").then((footprint) =>
      setAllSectorsValueAddedAreaFootprint(footprint)
    );
    fetchEconomicAreaData("FRA", "PRD").then((footprint) =>
      setAllSectorsProductionFootprint(footprint)
    );

    fetchEconomicAreaData("FRA", "IC").then((footprint) =>
      setAllSectorsConsumptionFootprint(footprint)
    );
  }, [indic]);
  return (
    <>
      <div className="d-flex  align-items-center justify-content-between">
        <h2>
          <i className="bi bi-clipboard-data"></i> Rapport - Analyse
          extra-financière
        </h2>
        <div className="d-flex">
          <Button variant="light" onClick={props.goBack}>
            <i className="bi bi-chevron-left"></i> Retour
          </Button>
          <DropdownButton id="indic-button" title="Autres résultats">
            {Object.entries(metaIndics).map(([key, value]) => {
              if (session.validations.includes(key) && key != indic) {
                return (
                  <Dropdown.Item onClick={() => setIndic(key)}>
                    {value.libelle}
                  </Dropdown.Item>
                );
              }
            })}
          </DropdownButton>
          <Button
            variant="secondary"
            onClick={() =>
              exportIndicPDF(
                indic,
                session,
                comparativeDivision,
                "#Production",
                "#Consumption",
                "#Value",
                "#PieChart"
              )
            }
          >
            Télécharger le rapport <i className="bi bi-download"></i>
          </Button>
        </div>
      </div>

      <Row>
        <Col lg="8">
          <div className="d-flex align-items-center">
            <Image
              src={"/resources/icon-ese-bleues/" + indic + ".png"}
              className="icon-ese me-2"
            />
            <h3>{metaIndics[indic].libelle}</h3>
          </div>

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
            <Tab
              eventKey="expensesAccounts"
              title=" Détails - Comptes de charges"
            >
              <IndicatorExpensesTable session={session} indic={indic} />
            </Tab>
          </Tabs>
        </Col>
        <Col>
          {printGrossImpact.includes(indic) && (
            <>
              <h3 className="text-center">
                Répartition des impacts bruts (en %)
              </h3>
              <div className="p-4">
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
              </div>
            </>
          )}
        </Col>
      </Row>
      <hr></hr>
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
      <div className="mt-5">
        <IndicatorGraphs
          session={session}
          indic={indic}
          comparativeFootprints={{
            allSectorsConsumptionFootprint: allSectorsConsumptionFootprint,
            allSectorsProductionAreaFootprint:
              allSectorsProductionAreaFootprint,
            allSectorsValueAddedAreaFootprint:
              allSectorsValueAddedAreaFootprint,
            productionSectorFootprint: productionSectorFootprint,
            consumptionSectorFootprint: consumptionSectorFootprint,
            valueAddedSectorFootprint: valueAddedSectorFootprint,
          }}
        />
      </div>
      <hr />
      <h3>Note d'analyse</h3>
      <div id="analyse">
        <Analyse indic={indic} session={session} />
      </div>

      <hr></hr>

      <div className="d-flex justify-content-end">
        <Button variant="light" onClick={props.goBack}>
          <i className="bi bi-chevron-left"></i> Retour
        </Button>
        <DropdownButton id="indic-button" title="Autres résultats">
          {Object.entries(metaIndics).map(([key, value]) => {
            if (session.validations.includes(key) && key != indic) {
              return (
                <Dropdown.Item onClick={() => setIndic(key)}>
                  {value.libelle}
                </Dropdown.Item>
              );
            }
          })}
        </DropdownButton>
        <Button
          variant="secondary"
          onClick={() =>
            exportIndicPDF(
              indic,
              session,
              comparativeDivision,
              "#Production",
              "#Consumption",
              "#Value",
              "#PieChart"
            )
          }
        >
          Télécharger le rapport <i className="bi bi-download"></i>
        </Button>
      </div>
    </>
  );
};

/* ----- STATEMENTS / ASSESSMENTS COMPONENTS ----- */

const Analyse = (indic, session) => {
  let analyse = getAnalyse(indic, session);

  return (
    <>
      {analyse.map((paragraph, index) => (
        <p key={index}>{paragraph.reduce((a, b) => a + " " + b)}</p>
      ))}
    </>
  );
};

// Display the correct statement view according to the indicator
function getAnalyse(props) {
  switch (props.indic) {
    case "art":
      return analysisTextWriterART(props.session);
    case "dis":
      return analysisTextWriterDIS(props.session);
    case "eco":
      return analysisTextWriterECO(props.session);
    case "geq":
      return analysisTextWriterGEQ(props.session);
    case "ghg":
      return analysisTextWriterGHG(props.session);
    case "haz":
      return analysisTextWriterHAZ(props.session);
    case "knw":
      return analysisTextWriterKNW(props.session);
    case "mat":
      return analysisTextWriterMAT(props.session);
    case "nrg":
      return analysisTextWriterNRG(props.session);
    case "soc":
      return analysisTextWriterSOC(props.session);
    case "was":
      return analysisTextWriterWAS(props.session);
    case "wat":
      return analysisTextWriterWAT(props.session);
  }
}

export default ResultSection;
