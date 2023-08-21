// La Société Nouvelle

import GrossImpactChart from "../charts/GrossImpactChart";

export const GrossImpactDistributionVisual = ({
  session,
  period,
  indic
}) => {

  const {
    financialData,
  } = session;

  const {
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;

  return (
    <div className="box">
      <h4>Répartition des impacts bruts</h4>
      <div className="px-5">
        <GrossImpactChart
          id={"part-" + indic}
          intermediateConsumptions={intermediateConsumptions.periodsData[
            period.periodKey
          ].footprint.indicators[indic].getGrossImpact(
            intermediateConsumptions.periodsData[period.periodKey]
              .amount
          )}
          fixedCapitalConsumptions={fixedCapitalConsumptions.periodsData[
            period.periodKey
          ].footprint.indicators[indic].getGrossImpact(
            fixedCapitalConsumptions.periodsData[period.periodKey]
              .amount
          )}
          netValueAdded={netValueAdded.periodsData[
            period.periodKey
          ].footprint.indicators[indic].getGrossImpact(
            netValueAdded.periodsData[period.periodKey].amount
          )}
          isPrinting={false}
        />
      </div>
    </div>
  );
};