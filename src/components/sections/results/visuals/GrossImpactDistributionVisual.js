// La Société Nouvelle

// React
import { Col, Row } from "react-bootstrap";

// Chart
import { GrossImpactChart } from "../charts/GrossImpactChart";
import { ValueDistributionChart } from "../charts/ValueDistributionChart";

// Utils
import { getPrevDate } from "../../../../utils/periodsUtils";
import { getMostImpactfulAccountsPart, sortAccountByImpact } from "../utils";

/* ---------- GROSS IMPACT DISTRIBUTION VISUAL ---------- */

/** Component to visualize the distribution of the gross impact
 *
 *  Props :
 *    - session
 *    - indic
 *    - period
 *
 *  Params (in component) :
 *    -
 *
 */

export const GrossImpactDistributionVisual = ({ session, period, indic }) => {
  const { financialData } = session;

  const prevDateEnd = getPrevDate(period.dateStart);
  const prevPeriod =
    session.availablePeriods.find((period) => period.dateEnd == prevDateEnd) ||
    false;

  // --------------------------------------------------

  const productionOnPeriod =
    financialData.mainAggregates.production.periodsData[period.periodKey];
  const productionOnPeriodGrossImpact = productionOnPeriod.footprint.indicators[
    indic
  ].getGrossImpact(productionOnPeriod.amount);

  const mostImpactfulExpensesAccounts = sortAccountByImpact(
    financialData.externalExpensesAccounts,
    period.periodKey,
    indic,
    "desc"
  ).slice(0, 5);

  const mostImpactfulExpenseAccountsPart = getMostImpactfulAccountsPart(
    mostImpactfulExpensesAccounts,
    productionOnPeriodGrossImpact,
    period.periodKey,
    indic
  );

  return (
    <div className="box">
      <Row>
        <Col className="border-right">
          <Row className="align-items-center">
            <h4>Répartition des impacts bruts de la production</h4>
            <Col lg={4} >
              <GrossImpactChart
                id={"part-" + indic}
                session={session}
                datasetOptions={{
                  period,
                  indic,
                }}
                printOptions={{
                  printMode: false,
                  showPrevPeriod: true,
                }}
              />
            </Col>
            <Col>
              <div className="impactful-expenses px-5 ">
                <h5 className="mb-4">
                  Comptes de charges ayant le plus d'impact
                </h5>
                {mostImpactfulExpenseAccountsPart.map((account, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center impactful-expense "
                  >
                    <div
                      className="percentage-box"
                      style={{
                        background: `linear-gradient(to right, #ededff ${account.impactPercentage}%, #fff  ${account.impactPercentage}%)`,
                      }}
                    >
                      {account.impactPercentage} %
                    </div>
                    <div className="account-lib text-truncate">
                      {account.accountLib}
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Col>
        <Col lg={3} >
          <h4 className="text-center">Répartition de la valeur</h4>
          <ValueDistributionChart
            id={"part-" + indic}
            session={session}
            datasetOptions={{
              period,
            }}
            printOptions={{
              showPreviousData: true,
              printMode: false,
            }}
          />
        </Col>
      </Row>
    </div>
  );
};
