// La Société Nouvelle

import { ComparativeDataContainer } from "../components/ComparativeDataContainer";
import { ComparativeTable } from "../tables/ComparativeTable";
import { hasComparativeData } from "../utils";

export const ComparisonsVisual = ({
  session,
  period,
  indic
}) => {

  const isTargetDataAvailable  = hasComparativeData(session,'division','target',indic);

  return (
    <div id="comparaisons" className="box">
      <ComparativeDataContainer
        session={session}
        indic={indic}
        period={period}
      />
      <ComparativeTable
        session={session}
        indic={indic}
        period={period}
        showAreaFootprint={true}
        showTarget={isTargetDataAvailable}
        showDivisionData={true}
      />
    </div>
  );
}