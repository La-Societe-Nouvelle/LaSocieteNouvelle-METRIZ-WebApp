// La Société Nouvelle

// React
import React from "react";
import { Col, Row, Nav } from "react-bootstrap";

// Visuals
import { ComparisonsVisual } from "../visuals/ComparisonsVisual";
import { MainAggregatesTableVisual } from "../visuals/MainAggregatesTableVisual";
import { GrossImpactDistributionVisual } from "../visuals/GrossImpactDistributionVisual";
import { AnalysisNoteVisual } from "../visuals/AnalysisNoteVisual";
import { MainAggregatesFootprintsVisual } from "../visuals/MainAggregatesFootprintsVisual";
import { EvolutionCurvesVisual } from "../visuals/EvolutionCurvesVisual";

// Lib
import metaIndics from "/lib/indics";

/* ---------- INDICATOR VIEW ---------- */

/** Standard view for each indicator
 *  
 *  Props :
 *    - session
 *    - period
 * 
 *  Args :
 *    - indic (code)
 * 
 *  Structure :
 *    - SIG/External expenses tables
 *    - SIG Footprints diagramm
 *    - Comparative diagrams & table
 *    - Graphic with historical, trend & target
 *    - Analysis note
 * 
 */

export const IndicatorView = ({
  session,
  period,
  indic
}) => {

  const metaIndic = metaIndics[indic];

  const showAnalysis = session.analysis[period.periodKey][indic]?.isAvailable;

  return (
    <>
      {/* Menu */}
      <div className="box">
        <Nav variant="underline" defaultActiveKey="/home">
          <Nav.Item>
            <Nav.Link href="/#rapport">Analyse extra-financière</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/#comparaisons">Comparaison par activité</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/#evolution">Courbes d'évolution</Nav.Link>
          </Nav.Item>
          {showAnalysis && (
            <Nav.Item>
              <Nav.Link href="/#analyse">Note d'analyse</Nav.Link>
            </Nav.Item>
          )}
        </Nav>
      </div>

      {/* SIG and external expenses table */}
      <Row>
        <Col>
          <MainAggregatesTableVisual
            session={session}
            period={period}
            indic={indic}
          />
        </Col>
      </Row>

      {/* ----------Gross Impact Chart ----------  */}
      {metaIndic.type === "intensité" && (
        <GrossImpactDistributionVisual
          session={session}
          period={period}
          indic={indic}
        />
      )}

      {/* --------- Comparative data charts & Table ----------  */}
      {metaIndic.type === "proportion" && (
        <MainAggregatesFootprintsVisual
          session={session}
          period={period}
          indic={indic}
        />
      )}

      {/* ---------Comparative data charts & Table ----------  */}
      <ComparisonsVisual 
        session={session} 
        period={period} 
        indic={indic}
      />

      {/* ---------- Evolution Curves Chart ----------  */}
      <EvolutionCurvesVisual 
        session={session} 
        period={period} 
        indic={indic} 
      />

      {/* ---------- Analysis Note Text  ----------  */}
      <AnalysisNoteVisual 
        session={session} 
        period={period} 
        indic={indic} 
      />
    </>
  );
}