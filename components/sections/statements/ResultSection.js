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
import Select from "react-select";

import PieGraph from "../../graphs/PieGraph";
import { IndicatorExpensesTable } from "../../tables/IndicatorExpensesTable";
import { IndicatorMainAggregatesTable } from "../../tables/IndicatorMainAggregatesTable";

import metaIndics from "/lib/indics";
import divisions from "/lib/divisions";

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

import api from "../../../src/api";
import axios from "axios";
import { ErrorApi } from "../../ErrorAPI";

const ResultSection = (props) => {
  const [indic, setIndic] = useState(props.indic);
  const [session] = useState(props.session);
  const [error, setError] = useState(false);
  const [comparativeDivision, setComparativeDivision] = useState(
    props.session.comparativeDivision || "00"
  );
  const [allSectorFootprint, setAllSectorFootprint] = useState(
    props.session.comparativeAreaFootprints[props.indic.toUpperCase()]
  );
  const [divisionFootprint, setDivisionFootprint] = useState(
    props.session.comparativeDivisionFootprints[props.indic.toUpperCase()]
  );
  
  const [targetSNBC, setTargetSNBC] = useState();

  const [printGrossImpact] = useState([
    "ghg",
    "haz",
    "mat",
    "nrg",
    "was",
    "wat",
  ]);
  const divisionsOptions = [];

  //Divisions select options
  Object.entries(divisions)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(([value, label]) =>
      divisionsOptions.push({ value: value, label: value + " - " + label })
    );

  const { intermediateConsumption, capitalConsumption, netValueAdded } =
    props.session.financialData.aggregates;

  const changeComparativeDivision = async (event) => {
    let division = event.value;
    setComparativeDivision(division);
    // update session
    props.session.comparativeDivision = division;
  };

  useEffect(async () => {

    
    if (comparativeDivision != "00") {
      await getComparativeDivisionFootprint();
    } else {
      props.session.comparativeDivisionFootprints[indic.toUpperCase()] = {
    
        valueAddedDivisionFootprint: { value: null },
        productionDivisionFootprint: { value: null },
        consumptionDivisionFootprint: { value: null },
      };
      setDivisionFootprint({
        valueAddedDivisionFootprint: { value: null },
        productionDivisionFootprint: { value: null },
        consumptionDivisionFootprint: { value: null },
      });
    }

    // GET TARGET SNCB 2030 VALUE
    if(indic == "ghg") {

      await getTargetSNBC();
    }
  }, [comparativeDivision]);

  const getComparativeDivisionFootprint = async () => {
    let valueAddedFootprint;
    let productionFootprint;
    let consumptionFootprint;

    const getValueAdded = api.get(
      "serie/MACRO_" +
        indic.toUpperCase() +
        "_FRA_DIV/?code=" +
        comparativeDivision +
        "&aggregate=GVA&area=FRA"
    );
    const getProduction = api.get(
      "serie/MACRO_" +
        indic.toUpperCase() +
        "_FRA_DIV/?code=" +
        comparativeDivision +
        "&aggregate=PRD&area=FRA"
    );

    const getConsumption = api.get(
      "serie/MACRO_" +
        indic.toUpperCase() +
        "_FRA_DIV/?code=" +
        comparativeDivision +
        "&aggregate=IC&area=FRA"
    );

    await axios
      .all([getValueAdded, getProduction, getConsumption])
      .then(
        axios.spread((...responses) => {
          const valueAdded = responses[0];
          const production = responses[1];
          const consumption = responses[2];
          console.log(production)
          if (valueAdded.data.header.code == 200) {
            valueAddedFootprint =  valueAdded.data.data.at(-1);
           
          }

          if (production.data.header.code == 200) {
            productionFootprint = production.data.data.at(-1);
          }

          if (consumption.data.header.code == 200) {
            consumptionFootprint = consumption.data.data.at(-1);
          }
        })
      )
      .catch((errors) => {
        console.log(errors);
      });

    props.session.comparativeDivisionFootprints[indic.toUpperCase()] = {
      valueAddedDivisionFootprint: valueAddedFootprint,
      productionDivisionFootprint: productionFootprint,
      consumptionDivisionFootprint: consumptionFootprint,
    };
    {
      console.log(productionFootprint)
    }
    setDivisionFootprint({
      valueAddedDivisionFootprint: valueAddedFootprint,
      productionDivisionFootprint: productionFootprint,
      consumptionDivisionFootprint: consumptionFootprint,
    });
  };

  const getTargetSNBC = async () => {
    await api.get("serie/TARGET_GHG_SNBC_FRA_DIV/?code="+comparativeDivision+"&aggregate=PRD&area=FRA").then((res) => {
      console.log(res.data);
    }).catch((err)=>{
      throw err;
    });
  }

  return (
    <>
      <div className="step d-flex  align-items-center justify-content-between">
        <h2>
          <i className="bi bi-clipboard-data"></i> Rapport - Analyse
          extra-financière
        </h2>
        <div className="d-flex">
          <Button variant="light" onClick={props.goBack}>
            <i className="bi bi-chevron-left"></i> Retour
          </Button>

          {session.validations.length > 1 ? (
            <DropdownButton id="indic-button" title="Autres résultats">
              {Object.entries(metaIndics).map(([key, value]) => {
                if (session.validations.includes(key) && key != indic) {
                  return (
                    <Dropdown.Item
                      className="small-text"
                      key={key}
                      onClick={() => setIndic(key)}
                    >
                      {value.libelle}
                    </Dropdown.Item>
                  );
                }
              })}
            </DropdownButton>
          ) : (
            <Button id="indic-button" disabled>
              {metaIndics[indic].libelle}
            </Button>
          )}

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
                printGrossImpact.includes(indic) ? "#PieChart" : ""
              )
            }
          >
            Télécharger le rapport <i className="bi bi-download"></i>
          </Button>
        </div>
      </div>
      <section className="step">
        <Row>
          <Col lg={printGrossImpact.includes(indic) ? "8" : "12"}>
            <div className="d-flex align-items-center mb-4 rapport-indic">
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
          {printGrossImpact.includes(indic) && (
            <Col>
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
            </Col>
          )}
        </Row>
      </section>
      <section className="step">
        <h3>Comparaison par activité</h3>

        <Select
          className="mb-3 small-text"
          defaultValue={{
            label: comparativeDivision + " - " + divisions[comparativeDivision],
            value: comparativeDivision,
          }}
          placeholder={"Choisissez un secteur d'activité"}
          options={divisionsOptions}
          onChange={changeComparativeDivision}
        />
        {error && <ErrorApi />}
        <div className="mt-5">
  
          {allSectorFootprint && (
            <IndicatorGraphs
              financialData={session.financialData}
              indic={indic}
              allSectorFootprint={allSectorFootprint}
              comparativeDivisionFootprint={divisionFootprint}
              
            />
          )}
        </div>
      </section>
      <section className="step">
        <h3>Note d'analyse</h3>
        <div id="analyse">
          <Analyse indic={indic} session={session} />
        </div>
      </section>
      <section className="step">
        <div className="d-flex justify-content-end">
          <Button variant="light" onClick={props.goBack}>
            <i className="bi bi-chevron-left"></i> Retour
          </Button>
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
                printGrossImpact.includes(indic) ? "#PieChart" : ""
              )
            }
          >
            Télécharger le rapport <i className="bi bi-download"></i>
          </Button>
        </div>
      </section>
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
