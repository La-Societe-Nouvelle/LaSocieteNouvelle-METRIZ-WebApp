// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap"

// Components
import { InputNumber } from "/src/components/input/InputNumber";

// Utils
import { isValidInput } from "/src/utils/Utils";
import { printValue } from "/src/utils/formatters";
import { getGhgEmissions, getGhgEmissionsUncertainty } from "./utils";

// Libraries
import coolingSystems from "/lib/emissionFactors/coolingSystems";
import greenhouseGases from "/lib/ghg";

const emissionFactors = {
  ...coolingSystems,
};

// ROW ASSESSMENT TYPE 4 - COOLING SYSTEMS

export const RowAssessmentType_4 = ({
  deleteItem,
  itemId,
  itemData,
  onUpdate
}) => {

  // variables
  const [factorId, setFactorId] = useState(itemData.factorId);
  const [gas, setGas] = useState(itemData.gas);
  const [consumption, setConsumption] = useState(itemData.consumption || "");
  const [consumptionUnit, setConsumptionUnit] = useState(itemData.consumptionUnit);
  const [consumptionUncertainty, setConsumptionUncertainty] = useState(itemData.consumptionUncertainty || "");

  // results
  const [ghgEmissions, setGhgEmissions] = useState(itemData.ghgEmissions);
  const [ghgEmissionsUncertainty, setGhgEmissionsUncertainty] = useState(itemData.ghgEmissionsUncertainty);

  // ----------------------------------------------------------------------------------------------------

  useEffect(() => 
  {
    if (factorId)
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
    }

    // did update
    onUpdate();
  }, [factorId,consumption,consumptionUnit,consumptionUncertainty,gas])

  // ----------------------------------------------------------------------------------------------------

  // update cooling system
  const updateFactor = (event) => 
  {
    const nextFactorId = event.target.value
    setFactorId(nextFactorId);
    // re-init if unit not defined for new ghg factor
    if (!["kgCO2e", "tCO2e", 
          ...Object.keys(emissionFactors[nextFactorId].units)].includes(consumptionUnit)) {
      const nextUnit = Object.keys(emissionFactors[nextFactorId].units)[0];
      setConsumptionUnit(nextUnit);
      if (!(nextUnit == "kgCO2e" || nextUnit == "tCO2e")) {
        setConsumptionUncertainty(0);
      } else {
        setConsumptionUncertainty(25);
      }
      if (factorId) {
        setConsumption(0.0);
      }
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
    if (!(nextConsumptionUnit == "kgCO2e" || nextConsumptionUnit == "tCO2e")) {
      setConsumptionUncertainty(0);
    }
  };

  // Consumption uncertainty
  const updateConsumptionUncertainty = (nextConsumptionUncertainty) => {
    setConsumptionUncertainty(nextConsumptionUncertainty);
  };

  // Gas
  const updateGas = (event) => {
    const nextGas = event.target.value;
    setGas(nextGas);
  };

  // ----------------------------------------------------------------------------------------------------

  return(
    <tr key={itemId}>
      <td width="30px">
        <button
          className="btn btn-sm px-2 py-1"
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
          <Col lg="2">
            <select
              className="form-select form-select-sm"
              value={gas}
              onChange={updateGas}
              disabled={!factorId}
            >
              {factorId && Object.entries(greenhouseGases)
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
              isInvalid={!isValidInput(consumption,0)}
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
              {factorId &&<option key={"kgCO2e"} value={"kgCO2e"}>
                {"kgCO2e"}
              </option>}
              {factorId && <option key={"tCO2e"} value={"tCO2e"}>
                {"tCO2e"}
              </option>}
            </select>
          </Col>
          <Col lg="1">
            <InputNumber
              value={consumptionUncertainty}
              placeholder="%"
              onUpdate={updateConsumptionUncertainty}
              disabled={!(consumptionUnit == "kgCO2e" || consumptionUnit == "tCO2e")}
              isInvalid={!isValidInput(consumptionUncertainty)}
            />
          </Col>
        </Row>
      </td>
      <td>{printValue(ghgEmissions, 0)} kgCO2e</td>
      <td>{printValue(ghgEmissionsUncertainty, 0)} %</td>
    </tr>
  )
}