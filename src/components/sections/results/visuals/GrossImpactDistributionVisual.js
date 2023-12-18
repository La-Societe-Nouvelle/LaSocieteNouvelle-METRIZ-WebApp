// La Société Nouvelle

import { Col, Row } from "react-bootstrap";
import { getPrevDate } from "../../../../utils/periodsUtils";
import { GrossImpactChart } from "../charts/GrossImpactChart";
import { getMostImpactfulExpensesPart, sortProvidersByImpact } from "../utils";
import { ValueDistributionChart } from "../charts/ValueDistributionChart";

export const GrossImpactDistributionVisual = ({ session, period, indic }) => {
  // Prev period

  const prevDateEnd = getPrevDate(period.dateStart);
  const prevPeriod =
    session.availablePeriods.find((period) => period.dateEnd == prevDateEnd) ||
    false;

  let expensesAccounts = session.financialData.externalExpenses.filter(
    (expense) =>
      /^6(0[^3]|[1-2])/.test(expense.accountNum) &&
      expense.date.slice(0, 4) == period.periodKey.slice(2)
  );

  const mostImpactfulExpenses = sortProvidersByImpact(
    expensesAccounts,
    indic,
    "desc"
  ).slice(0, 5);

  const mostImpactfulExpenseAccountsPart = getMostImpactfulExpensesPart(
    mostImpactfulExpenses,
    session.financialData.mainAggregates.production.periodsData[
      period.periodKey
    ].footprint.indicators[indic].getGrossImpact(
      session.financialData.mainAggregates.production.periodsData[
        period.periodKey
      ].amount
    ),
    indic
  );

  return (
    <div className="box">
      <Row className="align-items-center mx-auto ">
        <Col lg="1"></Col>
        <Col lg="3">
          <h4 className="text-center">Répartition des impacts bruts</h4>

          <GrossImpactChart
            id={"part-" + indic}
            session={session}
            period={period}
            prevPeriod={prevPeriod}
            indic={indic}
            printMode={false}
          />
        </Col>
        <Col lg="4">
          <div className="impactful-expenses mx-5">
            <h5 className="mb-4">Comptes de charges ayant le plus d'impact</h5>
            {mostImpactfulExpenseAccountsPart.map((expense, index) => (
              <div
                key={index}
                className="d-flex align-items-center impactful-expense "
              >
                <div
                  className="percentage-box"
                  style={{
                    background: `linear-gradient(to right, #ededff ${expense.impactPercentage}%, #fff  ${expense.impactPercentage}%)`,
                  }}
                >
                  {expense.impactPercentage}%
                </div>
                <div className="account-lib text-truncate">{expense.accountLib}</div>
              </div>
            ))}
          </div>
        </Col>
        <Col lg="3">
          <h4 className="text-center">Répartition de la valeur</h4>
          <ValueDistributionChart
            id={"part-" + indic}
            session={session}
            period={period}
            prevPeriod={prevPeriod}
            printMode={false}
          />
        </Col>
        <Col lg="1"></Col>
      </Row>
    </div>
  );
};
