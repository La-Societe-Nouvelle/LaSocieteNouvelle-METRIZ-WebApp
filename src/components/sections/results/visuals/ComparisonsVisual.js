// La Société Nouvelle

import { ComparativeDataContainer } from "../components/ComparativeDataContainer";
import { ComparativeTable } from "../tables/ComparativeTable";

export const ComparisonsVisual = ({
  session,
  period,
  indic
}) => {
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
        showTarget={true}
        showPreviousData={true}
        showDivisionData={true}
      />
    </div>
  );
}