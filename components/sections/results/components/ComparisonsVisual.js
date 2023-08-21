// La Société Nouvelle

import { ComparativeTable } from "../tables/ComparativeTable";
import ComparativeDataContainer from "./ComparativeDataContainer";

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
      />
    </div>
  );
}