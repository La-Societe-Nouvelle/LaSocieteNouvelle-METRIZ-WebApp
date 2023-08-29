import { Col, Row } from "react-bootstrap"
import { printValue } from "../../../../../src/utils/Utils"
import { getTotalByAssessmentItem, getUncertaintyByAssessmentItem } from "./utils"

import { InputNumber } from "../../../../input/InputNumber";

// Libraries
import agriculturalProcesses from "/lib/emissionFactors/agriculturalProcesses";

export const RowsAssessmentType_3b = ({
  ghgDetails,
  addNewLine,
  changeFactor,
  updateConsumption,
  changeConsumptionUnit,
  updateConsumptionUncertainty,
  deleteItem,
  newFactorAssessmentItem,
}) => {

  // ...

  return(
    <>
      <tr>
        <td width="30px">
          <button
            className="btn btn-sm btn-light"
            onClick={() => addNewLine("3.2")}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </td>
        <td>Emissions directes des procédés agricoles</td>
        <td>
          {printValue(getTotalByAssessmentItem(ghgDetails, "3.2"), 0)}
          kgCO2e
        </td>
        <td>
          {printValue(
            getUncertaintyByAssessmentItem(ghgDetails, "3.2"), 0)}
          %
        </td>
      </tr>

      {Object.entries(ghgDetails)
        .filter(([_, itemData]) => itemData.assessmentItem == "3.2")
        .map(([itemId, itemData]) => (
          <tr key={itemId}>
            <td width="30px">
              <button
                className="btn btn-sm "
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
                    {Object.entries(
                      agriculturalProcesses[itemData.factorId].units
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

      {newFactorAssessmentItem == "3.2" && (
        <tr>
          <td />
          <td>
            <select
              className="form-select form-select-sm"
              value="0"
              onChange={(event) =>
                addItem("3.2", event.target.value)
              }
            >
              <option key="none" value="none">
                ---
              </option>
              {Object.entries(agriculturalProcesses)
                .map(([_, data]) => data.group)
                .filter(
                  (value, index, self) =>
                    index === self.findIndex((item) => item === value)
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
                      .filter(([_, data]) => data.group == groupName)
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