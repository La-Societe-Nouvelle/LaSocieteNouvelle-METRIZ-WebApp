// La Société Nouvelle

import { getAnalyse } from "../../../../src/utils/Writers";

export const AnalysisNoteVisual = ({
  session,
  period,
  indic
}) => {

  const {
    impactsData,
    financialData,
    comparativeData
  } = session;

  let analyse = getAnalyse(
    impactsData,
    financialData,
    comparativeData,
    indic,
    period
  );

  return (
    <div className="box" id="analyse">
      <h4>Note d'analyse</h4>
      {analyse.map((paragraph, index) => (
        <p key={index}>
          {paragraph.reduce((a, b) => a + " " + b)}
        </p>
      ))}
    </div>
  );
};