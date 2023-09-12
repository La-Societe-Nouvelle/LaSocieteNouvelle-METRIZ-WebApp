// La Société Nouvelle

// React
import React from "react";
import { ProductionFootprintVisual } from "../visuals/ProductionFootprintVisual";

/* ---------- HOME VIEW ---------- */

/** Standard view for each indicator
 *  
 *  Props :
 *    - session
 *    - period
 * 
 *  Structure :
 *    - ProductionFootprintVisual -> one graph for each indic
 * 
 */

export const HomeView = ({
  session,
  period
}) => {

  return <ProductionFootprintVisual session={session} period={period} />;
}