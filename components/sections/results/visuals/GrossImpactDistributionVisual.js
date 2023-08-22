// La Société Nouvelle

import { GrossImpactChart } from "../charts/GrossImpactChart";

export const GrossImpactDistributionVisual = ({
  session,
  period,
  indic
}) => {

  return (
    <div className="box">
      <h4>Répartition des impacts bruts</h4>
      <div className="px-5">
        <GrossImpactChart
          id={"part-" + indic}
          session={session}
          period={period}
          indic={indic}
          isPrinting={false}
        />
      </div>
    </div>
  );
}