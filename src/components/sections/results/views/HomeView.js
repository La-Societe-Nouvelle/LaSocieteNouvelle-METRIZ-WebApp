import React from "react";
import { Col, Row } from "react-bootstrap";
import { ProductionFootprintVisual } from "../visuals/ProductionFootprintVisual";

export const HomeView = ({
  session,
  period
}) => {

  return (
    <>
      <Row>
        <ProductionFootprintVisual
          session={session}
          period={period}
        />
      </Row>
    </>
  );
}