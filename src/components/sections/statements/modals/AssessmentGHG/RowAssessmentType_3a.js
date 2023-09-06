// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

// Components
import { InputNumber } from "/src/components/input/InputNumber";

// Utils
import { printValue } from "/src/utils/Utils";
import { isValidInput } from "../../../../../utils/Utils";
import { getGhgEmissions, getGhgEmissionsUncertainty } from "./utils";

// Libraries
import industrialProcesses from "/lib/emissionFactors/industrialProcesses";

const emissionFactors = {
  ...industrialProcesses
};

// ROW ASSESSMENT TYPE 3a - INDUSTRIAL PROCESSES

export const RowAssessmentType_3a = ({
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

  // Industrial process
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
    // uncertainty to zero if consumption null
    if (!nextConsumption) setConsumptionUncertainty(0.0);
    // and default uncertainty to 25 % if uncertainty null
    else if (!consumptionUncertainty) setConsumptionUncertainty(25.0);
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
              {Object.entries(industrialProcesses).map(
                ([key, data]) => (
                  <option key={key} value={key}>
                    {data.label}
                  </option>
                )
              )}
            </select>
          </Col>
          <Col lg="2">
            <InputNumber
              value={consumption}
              onUpdate={updateConsumption}
              disabled={!factorId}
              isInvalid={!isValidInput(consumption,0)}
            />
          </Col>
          <Col lg="1">
            <select
              className="form-select form-select-sm"
              value={consumptionUnit}
              onChange={updateConsumptionUnit}
              disabled={!factorId}
            >
              {factorId && Object.entries(industrialProcesses[factorId].units)
                .map(([unit, _]) => (
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
              onUpdate={updateConsumptionUncertainty}
              placeholder="%"
              disabled={!factorId}
              isInvalid={!isValidInput(consumptionUncertainty,0,100)}
            />
          </Col>
        </Row>
      </td>
      <td>{printValue(ghgEmissions, 0)} kgCO2e</td>
      <td>{printValue(ghgEmissionsUncertainty, 0)} %</td>
    </tr>
  )
}