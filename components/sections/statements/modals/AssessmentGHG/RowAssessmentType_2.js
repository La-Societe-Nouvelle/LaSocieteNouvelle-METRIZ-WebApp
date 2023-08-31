// La Société Nouvelle

// React
import { Col, Row } from "react-bootstrap";
import { useEffect, useState } from "react";

// Components
import { InputNumber } from "../../../../input/InputNumber";

// Utils
import { isValidNumber, printValue } from "../../../../../src/utils/Utils";
import { getGhgEmissions, getGhgEmissionsUncertainty } from "./utils";

// Libraries
import fuels from "/lib/emissionFactors/fuels.json";

const emissionFactors = {
  ...fuels
};

const orderGroupsAssessmentItem_2 = [
  "Carburant - usage routier",
  "Bio-carburants",
  "Gaz",
  "Carburant - usage maritime et fluvial",
  "Carburant - usage aérien",
  "Autres",
];

// ROW ASSESSMENT TYPE 2 - FUELS (MOVING SOURCES)

export const RowAssessmentType_2 = ({
  deleteItem,
  itemId,
  itemData,
  onUpdate,
  nrgItem
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

    // nrg item
    //...

    // did update
    onUpdate();
  }, [factorId,consumption,consumptionUnit,consumptionUncertainty])

  // Fuel
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
  const updateConsumption = (nextConsumption) => {
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
          className="btn btn-sm"
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
              {Object.entries(fuels)
                .filter(([_, data]) => data.usageSourcesMobiles)
                .map(([_, data]) => data.group)
                .filter(
                  (value, index, self) =>
                    index ===
                    self.findIndex((item) => item === value)
                )
                .sort(
                  (a, b) =>
                    orderGroupsAssessmentItem_2.indexOf(a) -
                    orderGroupsAssessmentItem_2.indexOf(b)
                )
                .map((groupName) => (
                  <optgroup label={groupName} key={groupName}>
                    {Object.entries(fuels)
                      .filter(
                        ([_, data]) =>
                          data.usageSourcesMobiles &&
                          data.group == groupName
                      )
                      .map(([key, data]) => (
                        <option
                          key={itemId + "_" + key}
                          value={key}
                        >
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
              onUpdate={updateConsumption}
              disabled={!factorId}
              isInvalid={!isValidNumber(consumption,0)}
            />
          </Col>
          <Col lg="1">
            <select
              className="form-select form-select-sm"
              value={consumptionUnit}
              onChange={updateConsumptionUnit}
              disabled={!factorId}
            >
              {factorId && Object.entries(fuels[factorId].units).map(
                ([unit, _]) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                )
              )}
            </select>
          </Col>
          <Col lg="1">
            <InputNumber
              value={consumptionUncertainty}
              onUpdate={updateConsumptionUncertainty}
              placeholder="%"
              disabled={!factorId}
              isInvalid={!isValidNumber(consumptionUncertainty,0,100)}
            />
          </Col>
        </Row>
      </td>
      <td>{printValue(ghgEmissions, 0)} kgCO2e</td>
      <td>{printValue(ghgEmissionsUncertainty, 0)} %</td>
    </tr>
  )
}