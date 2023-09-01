// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap"

// Components
import { InputNumber } from "/src/components/input/InputNumber";

// Utils
import { isValidNumber, printValue } from "/src/utils/Utils"
import { getGhgEmissions, getGhgEmissionsUncertainty } from "./utils"

// Libraries
import coolingSystems from "/lib/emissionFactors/coolingSystems";
import greenhouseGases from "/lib/ghg";

// ROW ASSESSMENT TYPE 4 - COOLING SYSTEMS

const emissionFactors = {
  ...coolingSystems,
};

export const RowAssessmentType_4 = ({
  deleteItem,
  itemId,
  itemData,
  onUpdate
}) => {

  const [factorId, setFactorId] = useState(itemData.factorId);
  const [gas, setGas] = useState(itemData.gas);
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
    itemData.gas = gas;
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
  }, [factorId,consumption,consumptionUnit,consumptionUncertainty,gas])

  // update cooling system
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

  // Gas
  const updateGaz = (event) => {
    const nextGas = event.target.value;
    setGas(nextGas);
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
              {Object.entries(coolingSystems)
                .map(([_, data]) => data.group)
                .filter(
                  (value, index, self) =>
                    index ===
                    self.findIndex((item) => item === value)
                )
                .sort()
                .map((groupName) => (
                  <optgroup label={groupName} key={groupName}>
                    {Object.entries(coolingSystems)
                      .filter(
                        ([_, data]) => data.group == groupName
                      )
                      .sort()
                      .map(([key, data]) => (
                        <option key={key} value={key}>
                          {data.label}
                        </option>
                      ))}
                  </optgroup>
                ))}
            </select>
          </Col>
          <Col>
            <select
              className="form-select form-select-sm"
              value={gas}
              onChange={updateGaz}
              disabled={!factorId}
            >
              {Object.entries(greenhouseGases)
                .filter(([_, data]) => data.label != "")
                .map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.label}
                  </option>
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
              {factorId && <option
                  key={coolingSystems[factorId].unit}
                  value={coolingSystems[factorId].unit}
                >
                  {coolingSystems[factorId].unit}
                </option>}
              <option key={"kgCO2e"} value={"kgCO2e"}>
                {"kgCO2e"}
              </option>
              <option key={"tCO2e"} value={"tCO2e"}>
                {"tCO2e"}
              </option>
            </select>
          </Col>
          <Col>
            <InputNumber
              value={consumptionUncertainty}
              placeholder="%"
              onUpdate={updateConsumptionUncertainty}
              disabled={!(consumptionUnit == "kgCO2e" ||
                consumptionUnit == "tCO2e")}
            />
          </Col>
        </Row>
      </td>
      <td>{printValue(ghgEmissions, 0)} kgCO2e</td>
      <td>{printValue(ghgEmissionsUncertainty, 0)} %</td>
    </tr>
  )
}