// La Société Nouvelle

/* ---------- ANALYSIS NOTE VISUAL ---------- */

/** Visualisation de la note d'analyse
 *
 */

export const AnalysisNoteVisual = ({ session, period, indic }) => {
  const { analysis } = session;

  const analyse = analysis[period.periodKey][indic]?.isAvailable
    ? analysis[period.periodKey][indic].analysis
    : null;

  return (
    analyse && (
      <div className="box" id="analyse">
        <h4>Note d'analyse</h4>
        {analyse.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}

        <p className="small mt-5">
          <i className="bi bi-exclamation-circle me-2"></i>
          Ce texte a été créé à l'aide d'une intelligence artificielle. Bien
          qu'il ait été généré en fonction des données disponibles, il peut
          contenir des inexactitudes ou des erreurs. Il ne doit pas être utilisé
          comme source d'information fiable et doit être pris avec réserve.
        </p>
      </div>
    )
  );
};
