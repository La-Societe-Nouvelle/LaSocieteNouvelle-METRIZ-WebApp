// La Société Nouvelle

// React
import React, { useState } from "react";

// Views
import { FinancialDataForm } from "./views/FinancialDataForm";
import { FinancialDataViews } from "./views/FinancialDataViews";

/* ------------------------------------------------------------------------------------------------------------------------------ */
/* -------------------------------------------------- ACCOUTING IMPORT SECTION -------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------ */

/** Views :
 *    0 -> Financial data form (with dropzone)
 *    1 -> Financial data views
 */

export const AccountingImportSection = ({
  session,
  period,
  onSelectPeriod,
  submit
}) => {

  const [view, setView] = useState(period.periodKey && session.financialData.status[period.periodKey].isLoaded ? 1 : 0);
  
  return (
    <section className="step">
      <h2 className="mb-2">Etape 1 - Importez vos flux comptables</h2>

      {/* Financial data form */}
      {view === 0 && (
        <FinancialDataForm
          session={session}
          onSelectPeriod={onSelectPeriod}
          submit={() => setView(1)}
        />
      )}

      {/* Financial data views */}
      {view === 1 && (
        <FinancialDataViews
          session={session}
          period={period}
          onSubmit={submit}
          onGoBack={() => setView(0)}
        />
      )}
    </section>
  );
}