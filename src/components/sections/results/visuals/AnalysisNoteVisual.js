// La Société Nouvelle

/* ---------- ANALYSIS NOTE VISUAL ---------- */

/** Visualisation de la note d'analyse
 *  
 */

export const AnalysisNoteVisual = ({
  session,
  period,
  indic
}) => {

  const {
    analysis
  } = session;

  let analyse = analysis[period.periodKey][indic].analysis;

  return (
    <div className="box" id="analyse">
      <h4>Note d'analyse</h4>
      {analyse.split('\n').map((paragraph, index) => (
        <p key={index}>
          {paragraph}
        </p>
      ))}
    </div>
  );
};