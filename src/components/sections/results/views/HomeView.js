import React from "react";
import { ProductionFootprintVisual } from "../visuals/ProductionFootprintVisual";

export const HomeView = ({
  session,
  period
}) => {

  return <ProductionFootprintVisual session={session} period={period} />;
}