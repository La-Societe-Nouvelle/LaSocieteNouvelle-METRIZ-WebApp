import { Col, Row } from "react-bootstrap"
import { printValue } from "../../../../../src/utils/Utils"
import { getTotalByAssessmentItem, getUncertaintyByAssessmentItem } from "./utils"

import { InputNumber } from "../../../../input/InputNumber";

// Libraries
import fuels from "/lib/emissionFactors/fuels.json";

const orderGroupsAssessmentItem_2 = [
  "Carburant - usage routier",
  "Bio-carburants",
  "Gaz",
  "Carburant - usage maritime et fluvial",
  "Carburant - usage aérien",
  "Autres",
];

export const RowsAssessmentType_2 = ({
  ghgDetails,
  addNewLine,
  changeFactor,
  updateConsumption,
  changeConsumptionUnit,
  updateConsumptionUncertainty,
  deleteItem,
  newFactorAssessmentItem,
  addItem
}) => {

  // ...

  return(
    <>
      <tr>
        <td width="30px">
          <button
            className="btn btn-sm btn-light"
            onClick={() => addNewLine("2")}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </td>
        <td>Emissions directes des sources mobiles de combustion</td>
        <td>
          {printValue(getTotalByAssessmentItem(ghgDetails, "2"), 0)}
          kgCO2e
        </td>
        <td>
          {printValue(getUncertaintyByAssessmentItem(ghgDetails, "2"), 0)}
          %
        </td>
      </tr>

      {Object.entries(ghgDetails)
        .filter(([_, itemData]) => itemData.assessmentItem == "2")
        .map(([itemId, itemData]) => (
          <tr key={itemId}>
            <td width="30px">
              <button
                className="btn btn-sm"
                onClick={() => deleteItem(itemId)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </td>
            <td>
              <Row>
                <Col>
                  <select
                    className="form-select form-select-sm"
                    value={itemData.factorId}
                    onChange={(event) =>
                      changeFactor(itemId, event.target.value)
                    }
                  >
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
                    value={itemData.consumption}
                    onUpdate={(nextValue) =>
                      updateConsumption(itemId, nextValue)
                    }
                  />
                </Col>
                <Col lg="1">
                  <select
                    className="form-select form-select-sm"
                    value={itemData.consumptionUnit}
                    onChange={(event) =>
                      changeConsumptionUnit(
                        itemId,
                        event.target.value
                      )
                    }
                  >
                    {Object.entries(fuels[itemData.factorId].units).map(
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
                    value={itemData.consumptionUncertainty}
                    onUpdate={(nextValue) =>
                      updateConsumptionUncertainty(
                        itemId,
                        nextValue
                      )
                    }
                    placeholder="%"
                  />
                </Col>
              </Row>
            </td>
            <td>{printValue(itemData.ghgEmissions, 0)} kgCO2e</td>
            <td>{printValue(itemData.ghgEmissionsUncertainty, 0)} %</td>
          </tr>
        ))}

      {newFactorAssessmentItem == "2" && (
        <tr>
          <td />
          <td>
            <select
              className="form-select form-select-sm"
              value="0"
              onChange={(event) => addItem("2", event.target.value)}
            >
              <option key="none" value="none">
                ---
              </option>
              {Object.entries(fuels)
                .filter(([_, data]) => data.usageSourcesMobiles)
                .map(([_, data]) => data.group)
                .filter(
                  (value, index, self) =>
                    index === self.findIndex((item) => item === value)
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
                        <option key={"new_" + key} value={key}>
                          {data.label}
                        </option>
                      ))}
                  </optgroup>
                ))}
            </select>
          </td>
        </tr>
      )}
    </>
  )
}