// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

// Components
import { InputNumber } from "/src/components/input/InputNumber";

// Utils
import { isValidNumber, printValue } from "/src/utils/Utils"

// Libs
import fuels from "/lib/emissionFactors/fuels.json";
import { getNrgConsumption, getNrgConsumptionUncertainty } from "./utils";

const orderGroupsBiomassFuels = [
  "Biomasse", 
  "Bio-gaz", 
  "Bio-carburants"
];

// ROW ASSESSMENT - BIOMASS ENERGY PRODUCT

export const RowAssessmentTypeBiomass = ({
  deleteItem,
  itemId,
  itemData,
  onUpdate,
  ghgItem
}) => {

  const [fuelCode, setFuelCode] = useState(itemData.fuelCode);
  const [consumption, setConsumption] = useState(itemData.consumption);
  const [consumptionUnit, setConsumptionUnit] = useState(itemData.consumptionUnit);
  const [consumptionUncertainty, setConsumptionUncertainty] = useState(itemData.consumptionUncertainty);

  const [nrgConsumption, setNrgConsumption] = useState(itemData.nrgConsumption);
  const [nrgConsumptionUncertainty, setNrgConsumptionUncertainty] = useState(itemData.nrgConsumptionUncertainty);

  useEffect(() => 
  {
    // itemData props
    itemData.fuelCode = fuelCode;
    itemData.consumption = consumption;
    itemData.consumptionUnit = consumptionUnit;
    itemData.consumptionUncertainty = consumptionUncertainty;
    // nrg consumption
    const nrgConsumption = getNrgConsumption(itemData);
    const nrgConsumptionUncertainty = getNrgConsumptionUncertainty(itemData);
    itemData.nrgConsumption = nrgConsumption;
    itemData.nrgConsumptionUncertainty = nrgConsumptionUncertainty;
    setNrgConsumption(nrgConsumption);
    setNrgConsumptionUncertainty(nrgConsumptionUncertainty);

    // ghg item
    //...

    // did update
    //onUpdate();
  }, [fuelCode,consumption,consumptionUnit,consumptionUncertainty])

  // Energy product
  const updateFuel = (event) => {
    const nextFuelCode = event.target.value;
    if (!fuelCode 
      || !Object.keys(fuels[nextFuelCode].units).includes(consumptionUnit)) 
    {
      setConsumption(0.0);
      setConsumptionUnit(Object.keys(fuels[nextFuelCode].units)[0]);
      setConsumptionUncertainty(25.0);
    }
    setFuelCode(nextFuelCode);
  }

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
      <td width="50">
        <button
          className="btn btn-sm"
          onClick={deleteItem}
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
      <td>
        <select
          className="form-select form-select-sm"
          value={fuelCode || ""}
          onChange={updateFuel}
        >
          <option key="" value="" disabled hidden>---</option>
          {Object.entries(fuels)
            .filter(([_, data]) => data.type == "biomass")
            .map(([_, data]) => data.group)
            .filter(
              (value, index, self) =>
                index ===
                self.findIndex((item) => item === value)
            )
            .sort(
              (a, b) =>
                orderGroupsBiomassFuels.indexOf(a) -
                orderGroupsBiomassFuels.indexOf(b)
            )
            .map((groupName) => (
              <optgroup label={groupName} key={groupName}>
                {Object.entries(fuels)
                  .filter(
                    ([_, data]) =>
                      data.type == "biomass" &&
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
      </td>
      <td>
        <Row>
          <Col lg="6">
            <InputNumber
              value={consumption}
              onUpdate={updateConsumption}
              disabled={!fuelCode}
              isInvalid={!isValidNumber(consumption,0)}
            />
          </Col>
          <Col lg="3">
            <select
              className="form-select form-select-sm"
              value={consumptionUnit}
              onChange={updateConsumptionUnit}
              disabled={!fuelCode}
            >
              <option key="MJ" value="MJ">
                MJ
              </option>
              <option key="kWh" value="kWh">
                kWh
              </option>
              {fuelCode && Object.entries(fuels[fuelCode].units).map(
                ([unit, _]) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                )
              )}
            </select>
          </Col>
          <Col lg="3">
            <InputNumber
              value={consumptionUncertainty}
              onUpdate={updateConsumptionUncertainty}
              placeholder="%"
              disabled={!fuelCode}
              isInvalid={!isValidNumber(consumptionUncertainty,0,100)}
            />
          </Col>
        </Row>
      </td>
      <td>{printValue(nrgConsumption, 0)} MJ</td>
      <td>{printValue(nrgConsumptionUncertainty, 0)} %</td>
    </tr>
  )
}