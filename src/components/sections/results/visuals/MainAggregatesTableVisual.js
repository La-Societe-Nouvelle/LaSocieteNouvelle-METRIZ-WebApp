// La Société Nouvelle

import { Accordion, Col, Row, Tab, Tabs } from "react-bootstrap";
import { IndicatorMainAggregatesTable } from "../tables/IndicatorMainAggregatesTable";
import { ExpensesTable } from "../tables/ExpensesTable";
import { ProvidersTable } from "../tables/ProvidersTable";
import { getPrevDate } from "../../../../utils/periodsUtils";
import { StackedHorizontalBarChart } from "../charts/StackedHorizontalBarChart";

export const MainAggregatesTableVisual = ({ session, period, indic }) => {
  // Prev period

  const prevDateEnd = getPrevDate(period.dateStart);
  const prevPeriod =
    session.availablePeriods.find((period) => period.dateEnd == prevDateEnd) ||
    false;

  return (
    <div id="rapport" className="box">
      <h4>Rapport - Analyse extra-financière</h4>
      <Tabs
        defaultActiveKey="mainAggregates"
        transition={false}
        id="noanim-tab-example"
      >
        <Tab
          eventKey="mainAggregates"
          title=" Soldes intermédiaires de gestion"
        >
          <IndicatorMainAggregatesTable
            session={session}
            period={period}
            prevPeriod={prevPeriod}
            indic={indic}
          />
        </Tab>
        <Tab eventKey="expensesAccounts" title=" Détails - Comptes de charges">
          <ExpensesTable
            session={session}
            period={period}
            prevPeriod={prevPeriod}
            indic={indic}
          />
        </Tab>
        <Tab
          eventKey="providers"
          title=" Détails - Fournisseurs (charges externes)"
        >
          <ProvidersTable session={session} period={period} indic={indic} />
        </Tab>
      </Tabs>

      {/*
      //Pending--------------------------------------------
      <Accordion className="mt-3 chart-accordion" >
        <Accordion.Item eventKey="0">
          <Accordion.Header as="h5">
            <i className="bi bi-bar-chart-steps me-2"></i>
            Visualisation 
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col sm="6">
                <StackedHorizontalBarChart
                  id={""}
                  session={session}
                  datasetOptions={{
                    period,
                    indic
                  }}
                  printOptions={{
                    showPreviousPeriod: true
                  }}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
 */}


    </div>
  );
};
