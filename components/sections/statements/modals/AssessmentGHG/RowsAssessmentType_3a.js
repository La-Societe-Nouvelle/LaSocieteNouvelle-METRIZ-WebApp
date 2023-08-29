import { Col, Row } from "react-bootstrap"
import { printValue } from "../../../../../src/utils/Utils"
import { getTotalByAssessmentItem, getUncertaintyByAssessmentItem } from "./utils"

import { InputNumber } from "../../../../input/InputNumber";

// Libraries
import industrialProcesses from "/lib/emissionFactors/industrialProcesses";

export const RowsAssessmentType_3a = ({
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
            onClick={() => addNewLine("3.1")}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </td>
        <td>Emissions directes des procédés industriels</td>
        <td>
          {printValue(getTotalByAssessmentItem(ghgDetails, "3.1"), 0)}
          kgCO2e
        </td>
        <td>
          {printValue(
            getUncertaintyByAssessmentItem(ghgDetails, "3.1"),
            0
          )}
          %
        </td>
      </tr>

      {Object.entries(ghgDetails)
        .filter(([_, itemData]) => itemData.assessmentItem == "3.1")
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
                    value={itemData.factorId}
                    onChange={(event) =>
                      changeFactor(itemId, event.target.value)
                    }
                  >
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
                      industrialProcesses[itemData.factorId].units
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

      {newFactorAssessmentItem == "3.1" && (
        <tr>
          <td />
          <td>
            <select
              className="form-select form-select-sm"
              value="0"
              onChange={(event) =>
                addItem("3.1", event.target.value)
              }
            >
              <option key="none" value="none">
                ---
              </option>
              {Object.entries(industrialProcesses).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.label}
                </option>
              ))}
            </select>
          </td>
        </tr>
      )}
    </>
  )
}