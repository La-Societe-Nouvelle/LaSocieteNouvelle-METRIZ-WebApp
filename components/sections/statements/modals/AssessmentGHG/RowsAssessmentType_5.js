import { Col, Row } from "react-bootstrap"
import { printValue } from "../../../../../src/utils/Utils"
import { getTotalByAssessmentItem, getUncertaintyByAssessmentItem } from "./utils"

import landChanges from "/lib/emissionFactors/landChanges";
import { InputNumber } from "../../../../input/InputNumber";

export const RowsAssessmentType_5 = ({
  ghgDetails,
  addNewLine,
  changeFactor,
  updateConsumption,
  changeConsumptionUnit,
  updateConsumptionUncertainty,
  deleteItem,
  newFactorAssessmentItem
}) => {

  // ...

  return(
    <>
      <tr>
        <td width="30px">
          <button
            className="btn btn-sm btn-light"
            onClick={() => addNewLine("5")}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </td>
        <td>Emissions issues de la biomasse (sols et forêts)</td>
        <td>
          {printValue(getTotalByAssessmentItem(ghgDetails, "5"), 0)}
          kgCO2e
        </td>
        <td>
          {printValue(getUncertaintyByAssessmentItem(ghgDetails, "5"), 0)}
          %
        </td>
      </tr>

      {Object.entries(ghgDetails)
        .filter(([_, itemData]) => itemData.assessmentItem == "5")
        .map(([itemId, itemData]) => (
          <tr key={itemId}>
            <td width="30px">
              <button 
                className="btn btn-sm btn-light"
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
                    value={itemData.sour}
                    onChange={(event) => changeFactor(itemId, event.target.value)}
                  >
                    {Object.entries(landChanges)
                      .map(([_, data]) => data.from)
                      .filter(
                        (value, index, self) =>
                          index ===
                          self.findIndex((item) => item === value)
                      )
                      .sort()
                      .map((from) => (
                        <optgroup label={from}>
                          {Object.entries(landChanges)
                            .filter(([_, data]) => data.from == from)
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
                    <option key={"ha"} value={"ha"}>
                      {"ha"}
                    </option>
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
        ))
      }

      {newFactorAssessmentItem == "5" && (
        <tr>
          <td />
          <td>
            <select
              className="form-select form-select-sm"
              value="0"
              onChange={(event) => this.addItem("5", event.target.value)}
            >
              <option key="none" value="none">
                ---
              </option>
              {Object.entries(landChanges)
                .map(([_, data]) => data.from)
                .filter(
                  (value, index, self) =>
                    index === self.findIndex((item) => item === value)
                )
                .sort()
                .map((from) => (
                  <optgroup label={from}>
                    {Object.entries(landChanges)
                      .filter(([_, data]) => data.from == from)
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