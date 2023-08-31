// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap"

// Component
import { InputNumber } from "../../../../input/InputNumber";

// Utils
import { isValidNumber, printValue } from "../../../../../src/utils/Utils"
import { getGhgEmissions, getGhgEmissionsUncertainty } from "./utils"

// Lib
import landChanges from "/lib/emissionFactors/landChanges";

const emissionFactors = {
  ...landChanges,
};

// ROW ASSESSMENT TYPE 5 - LAND CHANGES

export const RowAssessmentType_5 = ({
  deleteItem,
  itemId,
  itemData,
  onUpdate
}) => {

  const [factorId, setFactorId] = useState(itemData.factorId);
  const [consumption, setConsumption] = useState(itemData.consumption);
  const [consumptionUnit, setConsumptionUnit] = useState(itemData.consumptionUnit);
  const [consumptionUncertainty, setConsumptionUncertainty] = useState(itemData.consumptionUncertainty);

  const [ghgEmissions, setGhgEmissions] = useState(itemData.ghgEmissions);
  const [ghgEmissionsUncertainty, setGhgEmissionsUncertainty] = useState(itemData.ghgEmissionsUncertainty);

  useEffect(() => 
  {
    // itemData props
    itemData.factorId = factorId;
    itemData.label = factorId ? emissionFactors[factorId].label : null;
    itemData.consumption = consumption;
    itemData.consumptionUnit = consumptionUnit;
    itemData.consumptionUncertainty = consumptionUncertainty;
    // ghg emissions
    const ghgEmissions = getGhgEmissions(itemData);
    const ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
    itemData.ghgEmissions = ghgEmissions;
    itemData.ghgEmissionsUncertainty = ghgEmissionsUncertainty;
    setGhgEmissions(ghgEmissions);
    setGhgEmissionsUncertainty(ghgEmissionsUncertainty);
    // did update
    onUpdate();
  }, [factorId,consumption,consumptionUnit,consumptionUncertainty])

  // Factor
  const updateFactor = (event) => 
  {
    const nextFactorId = event.target.value
    setFactorId(nextFactorId);
    // re-init if unit not defined for new ghg factor
    if (
      !["kgCO2e", "tCO2e"].includes(consumptionUnit) &&
      !Object.keys(emissionFactors[nextFactorId].units).includes(consumptionUnit)
    ) {
      setConsumption(0.0);
      setConsumptionUnit(Object.keys(emissionFactors[nextFactorId].units)[0]);
      setConsumptionUncertainty(25.0);
    }
  };

  // Consumption
  const updateConsumption = (nextConsumption) => 
  {
    setConsumption(nextConsumption);
    if (nextConsumption==0) setConsumptionUncertainty(0.0);
  };

  // Consumption unit
  const updateConsumptionUnit = (event) => {
    const nextConsumptionUnit = event.target.value;
    setConsumptionUnit(nextConsumptionUnit);
  };

  // Consumption uncertainty
  const updateConsumptionUncertainty = (nextConsumptionUncertainty) => {
    setConsumptionUncertainty(nextConsumptionUncertainty);
  };

  return(
    <tr key={itemId}>
      <td width="30px">
        <button 
          className="btn btn-sm btn-light"
          onClick={deleteItem}
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
      <td>
        <Row>
          <Col>
            <select
              className="form-select form-select-sm"
              value={factorId || ""}
              onChange={updateFactor}
            >
              <option key="" value="" disabled hidden>---</option>
              {Object.entries(landChanges)
                .map(([_, data]) => data.from)
                .filter(
                  (value, index, self) =>
                    index ===
                    self.findIndex((item) => item === value)
                )
                .sort()
                .map((from) => (
                  <optgroup label={from}>
                    {Object.entries(landChanges)
                      .filter(([_, data]) => data.from == from)
                      .map(([key, data]) => (
                        <option key={key} value={key}>
                          {data.label}
                        </option>
                      ))}
                  </optgroup>
                ))}
            </select>
          </Col>
          <Col lg="2">
            <InputNumber
              value={consumption}
              isInvalid={!isValidNumber(consumption,0)}
              onUpdate={updateConsumption}
              disabled={!factorId}
            />
          </Col>
          <Col lg="1">
            <select
              className="form-select form-select-sm"
              value={consumptionUnit}
              onChange={updateConsumptionUnit}
              disabled={!factorId}
            >
              <option key={"ha"} value={"ha"}>
                {"ha"}
              </option>
              <option key={"kgCO2e"} value={"kgCO2e"}>
                {"kgCO2e"}
              </option>
              <option key={"tCO2e"} value={"tCO2e"}>
                {"tCO2e"}
              </option>
            </select>
          </Col>
          <Col lg="1">
            <InputNumber
              value={consumptionUncertainty}
              isInvalid={!isValidNumber(consumptionUncertainty,0,100)}
              onUpdate={updateConsumptionUncertainty}
              placeholder="%"
              disabled={!factorId}
            />
          </Col>
        </Row>
      </td>
      <td>{printValue(ghgEmissions, 0)} kgCO2e</td>
      <td>{printValue(ghgEmissionsUncertainty, 0)} %</td>
    </tr>
  )
}