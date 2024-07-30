// La Société Nouvelle

// React
import React from "react";
import { Row } from "react-bootstrap";

// Lib
import indicators from "/lib/indics";

// Charts
import { TrendChart } from "../charts/TrendChart";
import { SigPieChart } from "../charts/SigPieChart";
import { HorizontalBarChart } from "../charts/HorizontalBarChart";

import { GrossImpactChart } from "../charts/GrossImpactChart";
import { VerticalBarChart } from "../charts/VerticalBarChart";
import { getMaxFootprintValue } from "../charts/chartsUtils";
import { RingChart } from "../charts/RingChart";

/* ---------- CHARTS CONTAINER ---------- */

/** Container for charts
 *
 *  Props :
 *    - session
 *    - period
 *
 *  Build charts for all indicators (to use in report)
 */

export const PrintChartsContainer = ({ session, period }) => {
  return (
    <>
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {session.validations[period.periodKey].map((indic) => (
          <Row key={indic}>
            <IndicatorCharts session={session} period={period} indic={indic} />
          </Row>
        ))}
      </div>
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {session.validations[period.periodKey].map((indic) => (
           <Row key={indic}>
              <div>
                {buildIndicatorChart({
                  id: "socialfootprintvisual_" + indic + "-print",
                  session,
                  datasetOptions: {
                    period,
                    aggregate: "production",
                    indic
                  },
                  printOptions: {
                    printMode: true,
                    showDivisionData: true,
                    showAreaData: false,
                    showTargetData: false,
                    useIndicColors: true,
                    showLegend: true,
                    showXlabels: false,
                    aspectRatio: 1,
                    label: "Empreinte de la production"
                  }
                })}
              </div>

            </Row>
        ))}
      </div>
    </>
  );
};

const IndicatorCharts = ({ session, period, indic }) => {
  const { financialData } = session;

  // Define the aggregates and their corresponding titles
  const mainAggregates = financialData.mainAggregates;
  const aggregates = {};

  Object.keys(mainAggregates).forEach((key) => {
    aggregates[key] = mainAggregates[key].label;
  });

  return (
    <>
      {Object.keys(aggregates).map((aggregate) => (
        <React.Fragment key={aggregate}>
          {renderComparativeCharts({
            chartId: `comparative-chart-${aggregate}-${indic}-print`,
            session,
            period,
            aggregate,
            indic,
          })}

          {renderSigCharts(
            session,
            aggregate,
            indic,
            period,
            `sig-chart-${aggregate}-${indic}-print`
          )}
        </React.Fragment>
      ))}

      <div className="trend-chart-container ">
        {/* Check If legal unit has target  */}
        <TrendChart
          id={`trend-chart-${indic}-print`}
          session={session}
          datasetOptions={{
            aggregate: "production",
            indic,
          }}
          printOptions={{
            printMode: true,
          }}
        />
      </div>

      {(indicators[indic].type == "intensité" ||
        indicators[indic].type == "indice") && (
          <div className="deviation-chart-container ">
            <HorizontalBarChart
              id={`deviation-chart-${indic}-print`}
              session={session}
              datasetOptions={{
                period,
                indic,
              }}
              printOptions={{
                printMode: true,
              }}
            />
          </div>
        )}

      {/* ----------Gross Impact Chart ----------  */}
      {indicators[indic].type == "intensité" && (
        <div className="impact-chart-container">
          <GrossImpactChart
            id={`gross-impact-chart-${indic}-print`}
            session={session}
            datasetOptions={{
              period,
              indic,
            }}
            printOptions={{
              printMode: true,
              showPrevPeriod: true,
            }}
          />
        </div>
      )}
    </>
  );
};

const renderComparativeCharts = ({
  chartId,
  session,
  period,
  aggregate,
  indic,
}) => {
  const maxFootprintValue = getMaxFootprintValue(session, period, indic);

  return (
  <>
    <div key={chartId} className={"comparative-chart-container "}>
      <VerticalBarChart
        id={chartId}
        session={session}
        datasetOptions={{
          period,
          aggregate,
          indic,
        }}
        printOptions={{
          printMode: true,
          showDivisionData: true,
          showAreaData: false,
          showTargetData: aggregate == "production" ? true : false,
          useIndicColors: true,
          showLegend: false,
          showXlabels: true,
          aspectRatio: 1,
          maxYAxis: maxFootprintValue,
          label: "Production",
        }}
      />
      
    </div>
    <div key={chartId} className={"comparative-chart-container "}>
      <VerticalBarChart
        id={`target-${chartId}`}
        session={session}
        datasetOptions={{
          period,
          aggregate,
          indic,
        }}
        printOptions={{
          printMode: true,
          showDivisionData: false,
          showAreaData: false,
          showTargetData: true,
          useIndicColors: true,
          showLegend: false,
          showXlabels: true,
          aspectRatio: 1,
          maxYAxis: maxFootprintValue,
          label: "Production",
        }}
      />
      
    </div>
  </>
  );
};
{
  /* --------- SIG Footprints charts ----------  */
}

const renderSigCharts = (session, aggregate, indic, period, id) => {
  return (
    <>
      {indicators[indic].type == "proportion" && (
        <div key={id} className="doughnut-chart-container ">
          <SigPieChart
            id={id}
            session={session}
            datasetOptions={{
              aggregate,
              indic,
              period,
            }}
            printOptions={{
              showPreviousData: true,
              printMode: true,
            }}
          />
        </div>
      )}
    </>
  );
};

/* --------- Production Footprint charts ----------  */

const buildIndicatorChart = (props) => {
  switch (props.datasetOptions.indic) {
    case "art": return (<RingChart {...props} />);
    case "eco": return (<RingChart {...props} />);
    case "geq": return (<VerticalBarChart {...props} />);
    case "ghg": return (<VerticalBarChart {...props} />);
    case "haz": return (<VerticalBarChart {...props} />);
    case "idr": return (<VerticalBarChart {...props} />);
    case "knw": return (<RingChart {...props} />);
    case "mat": return (<VerticalBarChart {...props} />);
    case "nrg": return (<VerticalBarChart {...props} />);
    case "soc": return (<RingChart {...props} />);
    case "was": return (<VerticalBarChart {...props} />);
    case "wat": return (<VerticalBarChart {...props} />);
    default: return (<></>)
  }
}