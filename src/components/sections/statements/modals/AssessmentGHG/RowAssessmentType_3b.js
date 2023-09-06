// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap"

// Components
import { InputNumber } from "/src/components/input/InputNumber";

// Utils
import { printValue } from "/src/utils/Utils"
import { isValidInput } from "../../../../../utils/Utils";
import { getGhgEmissions, getGhgEmissionsUncertainty } from "./utils";

// Libraries
import agriculturalProcesses from "/lib/emissionFactors/agriculturalProcesses";

const emissionFactors = {
  ...agriculturalProcesses,
};

// ROW ASSESSMENT TYPE 3b - AGRICULTURAL PROCESSES

export const RowAssessmentType_3b = ({
  deleteItem,
  itemId,
  itemData,
  onUpdate
}) => {

  // variables
  const [factorId, setFactorId] = useState(itemData.factorId);
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
  }, [factorId,consumption,consumptionUnit,consumptionUncertainty])

  // ----------------------------------------------------------------------------------------------------

  // Agricultural process
  const updateFactor = (event) => 
  {
    const nextFactorId = event.target.value
    setFactorId(nextFactorId);
    // re-init if unit not defined for new ghg factor
    if (
      !["kgCO2e", "tCO2e"].includes(consumptionUnit) &&
      !Object.keys(emissionFactors[nextFactorId].units).includes(consumptionUnit)
    ) {
      setConsumptionUnit(Object.keys(emissionFactors[nextFactorId].units)[0]);
      setConsumptionUncertainty(25.0);
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
  };

  // Consumption uncertainty
  const updateConsumptionUncertainty = (nextConsumptionUncertainty) => {
    setConsumptionUncertainty(nextConsumptionUncertainty);
  };

  // ----------------------------------------------------------------------------------------------------

  return(
    <tr key={itemId}>
      <td width="30px">
        <button
          className="btn btn-sm "
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
              {Object.entries(agriculturalProcesses)
                .map(([_, data]) => data.group)
                .filter(
                  (value, index, self) =>
                    index ===
                    self.findIndex((item) => item === value)
                )
                .sort((a, b) =>
                  a != "Autres" && b != "Autres"
                    ? a.localeCompare(b)
                    : a == "Autres"
                    ? 1
                    : -1
                )
                .map((groupName) => (
                  <optgroup label={groupName} key={groupName}>
                    {Object.entries(agriculturalProcesses)
                      .filter(
                        ([_, data]) => data.group == groupName
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
              {factorId && Object.entries(
                agriculturalProcesses[factorId].units
              ).map(([unit, _]) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
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
              isInvalid={!isValidInput(consumptionUncertainty,0,100)}
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