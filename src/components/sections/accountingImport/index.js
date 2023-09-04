// La Société Nouvelle

// React
import React, { useState } from "react";
import { Container } from "react-bootstrap";

// Views
import { FinancialDataForm } from "./views/FinancialDataForm";
import { FinancialDataViews } from "./views/FinancialDataViews";

/* ------------------------------------------------------------------ */
/* -------------------- ACCOUTING IMPORT SECTION -------------------- */
/* ------------------------------------------------------------------ */

/** Views :
 *    0 -> Financial data form (with dropzone)
 *    1 -> Financial data views
 */

export const AccountingImportSection = ({
  session,
  period,
  selectPeriod,
  submit
}) => {

  const [view, setView] = useState(period.periodKey && session.financialData.status[period.periodKey].isLoaded ? 1 : 0);
  
  return (
    <Container fluid>
      <section className="step">
        <h2 className="mb-2">Etape 1 - Importez vos flux comptables</h2>

        {/* Financial data form */}
        {view === 0 && (
          <FinancialDataForm
            session={session}
            selectPeriod={selectPeriod}
            submit={() => setView(1)}
          />
        )}

        {/* Financial data views */}
        {view === 1 && (
          <FinancialDataViews
            session={session}
            period={period}
            selectPeriod={selectPeriod}
            return={() => setView(0)}
            reset={() => setView(0)}
            submit={submit}
          />
        )}
      </section>
    </Container>
  );
}