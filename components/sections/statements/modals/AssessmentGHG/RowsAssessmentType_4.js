import { Col, Row } from "react-bootstrap"
import { printValue } from "../../../../../src/utils/Utils"
import { getTotalByAssessmentItem, getUncertaintyByAssessmentItem } from "./utils"

import { InputNumber } from "../../../../input/InputNumber";

// Libraries
import coolingSystems from "/lib/emissionFactors/coolingSystems";
import greenhouseGases from "/lib/ghg";

export const RowsAssessmentType_4 = ({
  ghgDetails,
  addNewLine,
  changeFactor,
  updateConsumption,
  changeConsumptionUnit,
  updateConsumptionUncertainty,
  deleteItem,
  newFactorAssessmentItem,
  updateGaz
}) => {

  // ...

  return(
    <>
      <tr>
        <td width="30px">
          <button
            className="btn btn-sm btn-light"
            onClick={() => addNewLine("4")}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </td>
        <td>Emissions directes fugitives</td>
        <td>
          {printValue(getTotalByAssessmentItem(ghgDetails, "4"), 0)}
          kgCO2e
        </td>
        <td>
          {printValue(getUncertaintyByAssessmentItem(ghgDetails, "4"), 0)}
          %
        </td>
      </tr>

      {Object.entries(ghgDetails)
        .filter(([_, itemData]) => itemData.assessmentItem == "4")
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
                    <option
                      key={coolingSystems[itemData.factorId].unit}
                      value={coolingSystems[itemData.factorId].unit}
                    >
                      {coolingSystems[itemData.factorId].unit}
                    </option>
                    <option key={"kgCO2e"} value={"kgCO2e"}>
                      {"kgCO2e"}
                    </option>
                    <option key={"tCO2e"} value={"tCO2e"}>
                      {"tCO2e"}
                    </option>
                  </select>
                </Col>
                {(itemData.consumptionUnit == "kgCO2e" ||
                  itemData.consumptionUnit == "tCO2e") && (
                  <Col>
                    <InputNumber
                      value={itemData.consumptionUncertainty}
                      placeholder="%"
                      onUpdate={(nextValue) =>
                        updateConsumptionUncertainty(
                          itemId,
                          nextValue
                        )
                      }
                    />
                  </Col>
                )}

                {itemData.consumptionUnit != "kgCO2e" &&
                  itemData.consumptionUnit != "tCO2e" && (
                    <Col>
                      <select
                        className="form-select form-select-sm"
                        value={itemData.gaz}
                        onChange={(event) =>
                          updateGaz(itemId, event.target.value)
                        }
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
                  )}
              </Row>
            </td>
            <td>{printValue(itemData.ghgEmissions, 0)} kgCO2e</td>
            <td>{printValue(itemData.ghgEmissionsUncertainty, 0)} %</td>
          </tr>
        ))}

      {newFactorAssessmentItem == "4" && (
        <tr>
          <td />
          <td>
            <select
              className="form-select form-select-sm"
              value="0"
              onChange={(event) => addItem("4", event.target.value)}
            >
              <option key="none" value="none">
                ---
              </option>
              {Object.entries(coolingSystems)
                .map(([_, data]) => data.group)
                .filter(
                  (value, index, self) =>
                    index === self.findIndex((item) => item === value)
                )
                .sort()
                .map((groupName) => (
                  <optgroup label={groupName} key={groupName}>
                    {Object.entries(coolingSystems)
                      .filter(([_, data]) => data.group == groupName)
                      .sort()
                      .map(([key, data]) => (
                        <option key={key} value={key}>
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