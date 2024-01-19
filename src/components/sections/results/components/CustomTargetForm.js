import React, { useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";

// Lib
import metaIndics from "/lib/indics";
import {
  getMoreRecentYearlyPeriod,
  getYearPeriod,
} from "../../../../utils/periodsUtils";
import {
  buildGeometricPath,
  buildLinearPath,
} from "../../../../formulas/customComparativeDataBuilder";

const CustomTargetForm = ({ indic, aggregate, target, periods }) => {
  const [targetValue, setTargetValue] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const precision = metaIndics[indic].nbDecimals;
  const defaultPeriod = getMoreRecentYearlyPeriod(periods);
  const periodYear = getYearPeriod(defaultPeriod);

  const currentFootprint =
    aggregate[defaultPeriod.periodKey].footprint.indicators[indic].value;

  const handleCustomTarget = async () => {
    if (!targetValue || !targetYear) {
      return;
    }

    const currentYear = new Date().getFullYear();

    if (
      parseInt(targetYear) <= currentYear &&
      parseInt(targetYear) <= parseInt(periodYear)
    ) {
      return;
    }

    const linearLegalUnitTarget = await buildLinearPath(
      currentFootprint,
      periodYear,
      targetValue,
      targetYear,
      precision
    );

    const geometricLegalUnitTarget = await buildGeometricPath(
      currentFootprint,
      periodYear,
      targetValue,
      targetYear,
      precision
    );
    console.log(linearLegalUnitTarget);
    console.log(geometricLegalUnitTarget);

  };

  return (
    <Form className="border p-3">
      <p className="h6">Définir un objectif</p>

      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={6}>
          Valeur cible
        </Form.Label>
        <Col sm={6}>
          <InputGroup>
            <Form.Control
              type="text"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
            />
            <InputGroup.Text>{metaIndics[indic].unit}</InputGroup.Text>
          </InputGroup>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={6}>
          Année cible
        </Form.Label>
        <Col sm={6}>
          <Form.Control
            type="text"
            value={targetYear}
            onChange={(e) => setTargetYear(e.target.value)}
          />
        </Col>
      </Form.Group>

      <Button onClick={handleCustomTarget} variant="secondary">
        Définir l'objectif
      </Button>
    </Form>
  );
};

export default CustomTargetForm;
