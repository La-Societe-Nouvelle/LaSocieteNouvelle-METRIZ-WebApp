import React from "react";
import { Col, Row, Tab, Tabs } from "react-bootstrap";
import { MainAggregatesTable } from "../tables/MainAggregatesTable";
import { ExpensesTable } from "../tables/ExpensesTable";

const ExtraFinancialReport = ({ indic, metaIndic, financialData, period, prevPeriod }) => {
  return (
    <section className="step">
      <h3 className="text-secondary">{metaIndic.libelle}</h3>
      <h4>Rapport - Analyse extra-financière</h4>

      <Row>
        <Col>
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
              <MainAggregatesTable
                financialData={financialData}
                indic={indic}
                metaIndic={metaIndic}
                period={period}
                prevPeriod={prevPeriod}
              />
            </Tab>
            <Tab
              eventKey="expensesAccounts"
              title=" Détails - Comptes de charges"
            >
              <ExpensesTable
                externalExpensesAccounts={financialData.externalExpensesAccounts}
                indic={indic}
                metaIndic={metaIndic}
                period={period}
                prevPeriod={prevPeriod}
              />
            </Tab>
          </Tabs>
        </Col>
    
      </Row>
    </section>
  );
};

export default ExtraFinancialReport;
