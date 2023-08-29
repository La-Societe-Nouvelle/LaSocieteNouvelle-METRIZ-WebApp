import { Col, Row } from "react-bootstrap"
import { printValue } from "../../../../../src/utils/Utils"
import { getTotalByAssessmentItem, getUncertaintyByAssessmentItem } from "./utils"

import { InputNumber } from "../../../../input/InputNumber";

// Libraries
import fuels from "/lib/emissionFactors/fuels.json";

const orderGroupsAssessmentItem_1 = [
  "Gaz",
  "Fioul",
  "Bio-gaz",
  "Biomasse",
  "Charbon",
  "Autres",
];

export const RowsAssessmentType_1 = ({
  ghgDetails,
  addNewLine,
  changeFactor,
  updateConsumption,
  changeConsumptionUnit,
  updateConsumptionUncertainty,
  deleteItem,
  newFactorAssessmentItem,
  updateGaz,
  addItem
}) => {

  // ...

  return(
    <>
      <tr>
        <td width="30px">
          <button className="btn btn-sm btn-light"
                  onClick={() => addNewLine("1")}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </td>
        <td>Emissions directes des sources fixes de combustion</td>
        <td>
          {printValue(getTotalByAssessmentItem(ghgDetails, "1"), 0)}
          kgCO2e
        </td>
        <td>
          {printValue(getUncertaintyByAssessmentItem(ghgDetails, "1"), 0)}
          %
        </td>
      </tr>

      {Object.entries(ghgDetails)
        .filter(([_, itemData]) => itemData.assessmentItem == "1")
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
                      .filter(([_, data]) => data.usageSourcesFixes)
                      .map(([_, data]) => data.group)
                      .filter(
                        (value, index, self) =>
                          index ===
                          self.findIndex((item) => item === value)
                      )
                      .sort(
                        (a, b) =>
                          orderGroupsAssessmentItem_1.indexOf(a) -
                          orderGroupsAssessmentItem_1.indexOf(b)
                      )
                      .map((groupName) => (
                        <optgroup label={groupName} key={groupName}>
                          {Object.entries(fuels)
                            .filter(
                              ([_, data]) =>
                                data.usageSourcesFixes &&
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
                    onChange={(event) =>
                      changeConsumptionUnit(
                        itemId,
                        event.target.value
                      )
                    }
                    value={itemData.consumptionUnit}
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
                    placeholder={"%"}
                  />
                </Col>
              </Row>
            </td>
            <td>{printValue(itemData.ghgEmissions, 0)} kgCO2e</td>
            <td>{printValue(itemData.ghgEmissionsUncertainty, 0)} %</td>
          </tr>
        ))}

      {newFactorAssessmentItem == "1" && (
        <tr>
          <td />
          <td>
            <select
              className="form-select form-select-sm"
              value="0"
              onChange={(event) => addItem("1", event.target.value)}
            >
              <option key="none" value="none">
                ---
              </option>
              {Object.entries(fuels)
                .filter(([_, data]) => data.usageSourcesFixes)
                .map(([_, data]) => data.group)
                .filter(
                  (value, index, self) =>
                    index === self.findIndex((item) => item === value)
                )
                .sort(
                  (a, b) =>
                    orderGroupsAssessmentItem_1.indexOf(a) -
                    orderGroupsAssessmentItem_1.indexOf(b)
                )
                .map((groupName) => (
                  <optgroup label={groupName} key={groupName}>
                    {Object.entries(fuels)
                      .filter(
                        ([_, data]) =>
                          data.usageSourcesFixes &&
                          data.group == groupName
                      )
                      .sort()
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