// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

// Components
import { InputNumber } from "/src/components/input/InputNumber";

// Utils
import { isValidNumber } from "/src/utils/Utils";
import { printValue } from "/src/utils/formatters";
import { getNrgConsumption, getNrgConsumptionUncertainty } from "./utils";

// ROW ASSESSMENT ELECTRICITY

export const SimpleRowAssessment = ({
  label,
  itemData,
  onUpdate
}) => {

  const [consumption, setConsumption] = useState(itemData.consumption);
  const [consumptionUnit, setConsumptionUnit] = useState(itemData.consumptionUnit);
  const [consumptionUncertainty, setConsumptionUncertainty] = useState(itemData.consumptionUncertainty);

  const [nrgConsumption, setNrgConsumption] = useState(itemData.nrgConsumption);
  const [nrgConsumptionUncertainty, setNrgConsumptionUncertainty] = useState(itemData.nrgConsumptionUncertainty);

  useEffect(() => 
  {
    // itemData props
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

    // did update
    //onUpdate();
  }, [consumption,consumptionUnit,consumptionUncertainty])

  // Consumption
  const updateConsumption = (nextConsumption) => {
    setConsumption(nextConsumption);
    if (nextConsumption==0) setConsumptionUncertainty(0.0);
    else if (nextConsumption>0 & consumptionUncertainty==0) setConsumptionUncertainty(5.0)
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
    <tr>
      <td />
      <td>{label}</td>
      <td>
        <Row>
          <Col lg="6">
            <InputNumber
              value={consumption}
              onUpdate={updateConsumption}
              isInvalid={!isValidNumber(consumption,0)}
            />
          </Col>
          <Col lg="3">
            <select
              className="form-select form-select-sm"
              value={consumptionUnit}
              onChange={updateConsumptionUnit}
            >
              <option key="MJ" value="MJ">
                MJ
              </option>
              <option key="kWh" value="kWh">
                kWh
              </option>
            </select>
          </Col>
          <Col lg="3">
            <InputNumber
              value={consumptionUncertainty}
              onUpdate={updateConsumptionUncertainty}
              placeholder="%"
              isInvalid={!isValidNumber(consumptionUncertainty,0,100)}
            />
          </Col>
        </Row>
      </td>
      <td>
        {printValue(nrgConsumption, 0)} 
        MJ
      </td>
      <td>
        {printValue(nrgConsumptionUncertainty, 0)}
        %
      </td>
    </tr>
  )
}