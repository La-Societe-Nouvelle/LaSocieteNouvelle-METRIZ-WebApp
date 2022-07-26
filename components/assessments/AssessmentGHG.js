// La Société Nouvelle

// React
import React from "react";
import { Table, Row, Col } from "react-bootstrap";

// Utils
import { InputNumber } from "../input/InputNumber";
import { getNewId, getSumItems, printValue } from "/src/utils/Utils";

// Libraries
import fuels from "/lib/emissionFactors/fuels.json";
import industrialProcesses from "/lib/emissionFactors/industrialProcesses";
import agriculturalProcesses from "/lib/emissionFactors/agriculturalProcesses";
import coolingSystems from "/lib/emissionFactors/coolingSystems";
import landChanges from "/lib/emissionFactors/landChanges";
import greenhouseGases from "/lib/ghg";

// Formulas (NRG)
import {
  getNrgConsumption,
  getNrgConsumptionUncertainty,
  getTotalNrgConsumption,
  getTotalNrgConsumptionUncertainty,
} from "./AssessmentNRG";

const emissionFactors = {
  ...fuels,
  ...industrialProcesses,
  ...agriculturalProcesses,
  ...coolingSystems,
  ...landChanges,
};

/* -------------------------------------------------------- */
/* -------------------- ASSESSMENT GHG -------------------- */
/* -------------------------------------------------------- */

/* [FR] Liste des postes d'émissions :
    - emissions directes de sources fixes [1]
    - emissions directes de sources mobiles [2]
    - emissions directes de procédés hors énergie - Procédés industriels [3.1]
    - emissions directes de procédés hors énergie - Procédés agricoles [3.2]
    - emissions fugitives [4]
    - emissions de la biomasse (sols et forêts) [5]

   Each item in ghgDetails has the following properties :
    id: id of the item,
    assessmentItem : id of the assessment item (1 -> 5)
    label: name of the source
    factorId: code to the emission factor used (fuel, coolingSystems, etc.)
    gaz: code of gaz (co2e by default)
    consumption: consumption
    consumptionUnit: unit for the consumption value
    consumptionUncertainty: uncertainty for the consumption value
    ghgEmissions: greenhouse gas emissions (in kgCO2e)
    ghgEmissionsUncertainty: uncertainty for the emissions
   for fuels :
    idNRG : id of the item in nrgDetails

   Modifications are saved only when validation button is pressed, otherwise it stay in the state
*/

export class AssessmentGHG extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // total ghg emissions & uncertainty
      greenhousesGazEmissions: props.impactsData.greenhousesGazEmissions,
      greenhousesGazEmissionsUncertainty:
        props.impactsData.greenhousesGazEmissionsUncertainty,

      // details
      ghgDetails: props.impactsData.ghgDetails,
      nrgTotal: props.impactsData.nrgTotal,
      // adding new factor
      newFactorAssessmentItem: "",
      // alert message
      message: false,
    };
  }

  render() {
    const {
      greenhousesGazEmissions,
      greenhousesGazEmissionsUncertainty,
      ghgDetails,
      newFactorAssessmentItem,
      message,
    } = this.state;

    return (
      <div className="assessment">
        <Table>
          <thead>
            <tr>
              <td colSpan="2">Libellé</td>
              <td>Valeur</td>
              <td>Incertitude</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td width="50">
                <button className="btn" onClick={() => this.addNewLine("1")}>
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
                  <td>
                    <button
                      className="btn"
                      onClick={() => this.deleteItem(itemId)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                  <td>
                    <Row>
                      <Col>
                        <select
                          className="form-control mb-3 "
                          value={itemData.factorId}
                          onChange={(event) =>
                            this.changeFactor(itemId, event.target.value)
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
                            .sort((a, b) =>
                              a != "Autres" && b != "Autres"
                                ? a.localeCompare(b)
                                : a == "Autres"
                                ? 1
                                : -1
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
                            this.updateConsumption.bind(this)(itemId, nextValue)
                          }
                        />
                      </Col>
                      <Col lg="1">
                        <select
                          className="form-control mb-3"
                          onChange={(event) =>
                            this.changeConsumptionUnit(
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
                            this.updateConsumptionUncertainty.bind(this)(
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
                    className="form-control"
                    value="0"
                    onChange={(event) => this.addItem("1", event.target.value)}
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
                      .sort((a, b) =>
                        a != "Autres" && b != "Autres"
                          ? a.localeCompare(b)
                          : a == "Autres"
                          ? 1
                          : -1
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

            <tr>
              <td>
                <button className="btn" onClick={() => this.addNewLine("2")}>
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
                  <td>
                    <button
                      className="btn"
                      onClick={() => this.deleteItem(itemId)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                  <td>
                    <Row>
                      <Col>
                        <select
                          className="form-control"
                          value={itemData.factorId}
                          onChange={(event) =>
                            this.changeFactor(itemId, event.target.value)
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
                            .sort((a, b) =>
                              a != "Autres" && b != "Autres"
                                ? a.localeCompare(b)
                                : a == "Autres"
                                ? 1
                                : -1
                            )
                            .map((groupName) => (
                              <optgroup label={groupName}>
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
                            this.updateConsumption.bind(this)(itemId, nextValue)
                          }
                        />
                      </Col>
                      <Col lg="1">
                        <select
                          className="form-control"
                          value={itemData.consumptionUnit}
                          onChange={(event) =>
                            this.changeConsumptionUnit(
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
                            this.updateConsumptionUncertainty.bind(this)(
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
                    className="form-control"
                    value="0"
                    onChange={(event) => this.addItem("2", event.target.value)}
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
                      .sort((a, b) =>
                        a != "Autres" && b != "Autres"
                          ? a.localeCompare(b)
                          : a == "Autres"
                          ? 1
                          : -1
                      )
                      .map((groupName) => (
                        <optgroup label={groupName}>
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

            <tr>
              <td>
                <button className="btn" onClick={() => this.addNewLine("3.1")}>
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
                  <td>
                    <button
                      className="btn"
                      onClick={() => this.deleteItem(itemId)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                  <td>
                    <Row>
                      <Col>
                        <select
                          className="form-control"
                          value={itemData.factorId}
                          onChange={(event) =>
                            this.changeFactor(itemId, event.target.value)
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
                            this.updateConsumption.bind(this)(itemId, nextValue)
                          }
                        />
                      </Col>
                      <Col lg="1">
                        <select
                          className="form-control"
                          value={itemData.consumptionUnit}
                          onChange={(event) =>
                            this.changeConsumptionUnit(
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
                            this.updateConsumptionUncertainty.bind(this)(
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
                    className="form-control"
                    value="0"
                    onChange={(event) =>
                      this.addItem("3.1", event.target.value)
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

            <tr>
              <td>
                <button className="btn" onClick={() => this.addNewLine("3.2")}>
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
                  getUncertaintyByAssessmentItem(ghgDetails, "3.2"),
                  0
                )}
                %
              </td>
            </tr>

            {Object.entries(ghgDetails)
              .filter(([_, itemData]) => itemData.assessmentItem == "3.2")
              .map(([itemId, itemData]) => (
                <tr key={itemId}>
                  <td>
                    <button
                      className="btn"
                      onClick={() => this.deleteItem(itemId)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                  <td>
                    <Row>
                      <Col>
                        <select
                          className="form-control"
                          value={itemData.factorId}
                          onChange={(event) =>
                            this.changeFactor(itemId, event.target.value)
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
                              <optgroup label={groupName}>
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
                            this.updateConsumption.bind(this)(itemId, nextValue)
                          }
                        />
                      </Col>
                      <Col lg="1">
                        <select
                          className="form-control"
                          value={itemData.consumptionUnit}
                          onChange={(event) =>
                            this.changeConsumptionUnit(
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
                            this.updateConsumptionUncertainty.bind(this)(
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
                    className="form-control"
                    value="0"
                    onChange={(event) =>
                      this.addItem("3.2", event.target.value)
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
                        <optgroup label={groupName}>
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

            <tr>
              <td>
                <button className="btn" onClick={() => this.addNewLine("4")}>
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
                  <td>
                    <button
                      className="btn"
                      onClick={() => this.deleteItem(itemId)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                  <td>
                    <Row>
                      <Col>
                        <select
                          className="form-control"
                          value={itemData.factorId}
                          onChange={(event) =>
                            this.changeFactor(itemId, event.target.value)
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
                              <optgroup label={groupName}>
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
                            this.updateConsumption.bind(this)(itemId, nextValue)
                          }
                        />
                      </Col>
                      <Col lg="1">
                        <select
                          className="form-control"
                          value={itemData.consumptionUnit}
                          onChange={(event) =>
                            this.changeConsumptionUnit(
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
                              this.updateConsumptionUncertainty.bind(this)(
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
                              className="form-control mb-3"
                              value={itemData.gaz}
                              onChange={(event) =>
                                this.updateGaz(itemId, event.target.value)
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
                    className="form-control"
                    value="0"
                    onChange={(event) => this.addItem("4", event.target.value)}
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
                        <optgroup label={groupName}>
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

            <tr>
              <td>
                <button className="btn" onClick={() => this.addNewLine("5")}>
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
                  <td>
                    <button
                      className="btn"
                      onClick={() => this.deleteItem(itemId)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                  <td>
                    <Row>
                      <Col>
                        <select
                          className="form-control mb-3"
                          value={itemData.sour}
                          onChange={(event) =>
                            this.changeFactor(itemId, event.target.value)
                          }
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
                            this.updateConsumption.bind(this)(itemId, nextValue)
                          }
                        />
                      </Col>
                      <Col lg="1">
                        <select
                          className="form-control mb-3"
                          value={itemData.consumptionUnit}
                          onChange={(event) =>
                            this.changeConsumptionUnit(
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
                            this.updateConsumptionUncertainty.bind(this)(
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

            {newFactorAssessmentItem == "5" && (
              <tr>
                <td />
                <td>
                  <select
                    className="form-control"
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

            <tr className="total">
              <td colSpan="2">Total</td>
              <td>{printValue(greenhousesGazEmissions, 0)} kgCO2e</td>
              <td>{printValue(greenhousesGazEmissionsUncertainty, 0)} %</td>
            </tr>
          </tbody>
        </Table>
        {message && (
          <p className="small-text p-2 alert-warning">
            Des modifications ayant été apportées sur la consommation de
            produits énergétiques (combustibles), la déclaration de consommation
            directe d'énergie devra être (re)validée.
          </p>
        )}
        <div className="view-header">
          <button
            className="btn btn-sm btn-light me-2"
            onClick={() => this.props.onGoBack()}
          >
            <i className="bi bi-chevron-left"></i> Retour
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => this.onSubmit()}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  /* ---------- NEW ITEM ---------- */

  // New line
  addNewLine = (assessmentItem) =>
    this.setState({ newFactorAssessmentItem: assessmentItem });

  // add new ghg emissions item
  addItem = (assessmentItem, factorId) => {
    let { ghgDetails } = this.state;

    const id = getNewId(Object.entries(ghgDetails).map(([_, item]) => item));
    ghgDetails[id] = {
      id: id,
      assessmentItem: assessmentItem,
      label: emissionFactors[factorId].label,
      factorId: factorId,
      gaz: assessmentItem == "4" ? "R14" : "co2e",
      consumption: 0.0,
      consumptionUnit: Object.keys(emissionFactors[factorId].units)[0],
      consumptionUncertainty: 0.0,
      ghgEmissions: 0.0,
      ghgEmissionsUncertainty: 0.0,
    };

    this.setState({ ghgDetails: ghgDetails, newFactorAssessmentItem: "" });
  };

  /* ---------- UPDATES ---------- */

  // Source
  changeFactor = (itemId, nextFactorId) => {
    let itemData = this.state.ghgDetails[itemId];

    itemData.factorId = nextFactorId;
    itemData.label = emissionFactors[nextFactorId].label;

    // re-init if unit unvailable for new source
    if (
      !["kgCO2e", "tCO2e"].includes(itemData.consumptionUnit) &&
      !Object.keys(emissionFactors[nextFactorId].units).includes(
        itemData.consumptionUnit
      )
    ) {
      itemData.consumption = 0.0;
      itemData.consumptionUnit = Object.keys(
        emissionFactors[nextFactorId].units
      )[0];
      itemData.consumptionUncertainty = 0.0;
      itemData.ghgEmissions = 0.0;
      itemData.ghgEmissionsUncertainty = 0.0;
    }
    // ...or update amount of emission with new unit
    else {
      itemData.ghgEmissions = getGhgEmissions(itemData);
      itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
    }

    // update total
    this.updateGhgEmissions();
  };

  // Consumption
  updateConsumption = (itemId, nextConsumption) => {
    let item = this.state.ghgDetails[itemId];
    if (item.assessmentItem == "1" || item.assessmentItem == "2") {
      this.setState({ message: true });
    }

    item.consumption = nextConsumption;

    // uncertainty to zero if consumption null
    if (!item.consumption) item.consumptionUncertainty = 0.0;
    // and default uncertainty to 25 % if uncertainty null
    else if (!item.consumptionUncertainty) item.consumptionUncertainty = 25.0;

    item.ghgEmissions = getGhgEmissions(item);
    item.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(item);

    // update total
    this.updateGhgEmissions();
  };

  // Consumption unit
  changeConsumptionUnit = (itemId, nextConsumptionUnit) => {
    let itemData = this.state.ghgDetails[itemId];

    itemData.consumptionUnit = nextConsumptionUnit;
    itemData.ghgEmissions = getGhgEmissions(itemData);
    itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);

    // update total
    this.updateGhgEmissions();
  };

  // Consumption uncertainty
  updateConsumptionUncertainty = (itemId, nextConsumptionUncertainty) => {
    let item = this.state.ghgDetails[itemId];

    item.consumptionUncertainty = nextConsumptionUncertainty;
    item.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(item);

    // update total
    this.updateGhgEmissions();
  };

  // Gaz (only used for cooling systems)
  updateGaz = (itemId, nextGaz) => {
    let itemData = this.state.ghgDetails[itemId];

    itemData.gaz = nextGaz;
    itemData.ghgEmissions = getGhgEmissions(itemData);
    itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);

    // update total
    this.updateGhgEmissions();
  };

  // Label
  updateLabel = (itemId, nextLabel) => {
    let item = this.state.ghgDetails[itemId];
    item.label = nextLabel;
  };

  /* ---------- DELETE ---------- */

  deleteItem = (itemId) => {
    delete this.state.ghgDetails[itemId];

    // update total
    this.updateGhgEmissions();
  };

  /* ---------- STATE / PROPS ---------- */

  // update state
  updateGhgEmissions = async () => {
    this.setState({
      greenhousesGazEmissions: getTotalGhgEmissions(this.state.ghgDetails),
      greenhousesGazEmissionsUncertainty: getTotalGhgEmissionsUncertainty(
        this.state.ghgDetails
      ),
    });
  };

  // update props
  onSubmit = async () => {
    let impactsData = this.props.impactsData;

    console.log(impactsData.nrgTotal);
    // update ghg data
    impactsData.ghgDetails = this.state.ghgDetails;
    impactsData.greenhousesGazEmissions = getTotalGhgEmissions(
      impactsData.ghgDetails
    );
    impactsData.greenhousesGazEmissionsUncertainty =
      getTotalGhgEmissionsUncertainty(impactsData.ghgDetails);

    await this.props.onUpdate("ghg");

    if (!impactsData.nrgTotal) {
      // update nrg data
      // ...delete
      Object.entries(impactsData.nrgDetails)
        .filter(
          ([_, itemData]) =>
            itemData.type == "fossil" || itemData.type == "biomass"
        )
        .forEach(([itemId, _]) => {
          let ghgItem = Object.entries(impactsData.ghgDetails)
            .map(([_, ghgItemData]) => ghgItemData)
            .filter((ghgItem) => ghgItem.idNRG == itemId)[0];
          if (ghgItem == undefined) delete impactsData.nrgDetails[itemId];
        });
      // ...add & update
      Object.entries(impactsData.ghgDetails)
        .filter(([_, itemData]) => ["1", "2"].includes(itemData.assessmentItem))
        .forEach(([itemId, itemData]) => {
          let nrgItem = Object.entries(impactsData.nrgDetails)
            .map(([_, nrgItemData]) => nrgItemData)
            .filter((nrgItem) => nrgItem.idGHG == itemId)[0];
          if (nrgItem == undefined) {
            const id = getNewId(
              Object.entries(impactsData.nrgDetails)
                .map(([_, data]) => data)
                .filter((item) => !isNaN(item.id))
            );
            impactsData.nrgDetails[id] = { id: id, idGHG: itemId };
            nrgItem = impactsData.nrgDetails[id];
            itemData.idNRG = id;
          }
          // update values
          nrgItem.fuelCode = itemData.factorId;
          nrgItem.consumption = itemData.consumption;
          nrgItem.consumptionUnit = itemData.consumptionUnit;
          nrgItem.consumptionUncertainty = itemData.consumptionUncertainty;
          nrgItem.nrgConsumption = getNrgConsumption(nrgItem);
          nrgItem.nrgConsumptionUncertainty =
            getNrgConsumptionUncertainty(nrgItem);
          nrgItem.type = fuels[itemData.factorId].type;
        });
      // ...total & uncertainty
      impactsData.energyConsumption = getTotalNrgConsumption(
        impactsData.nrgDetails
      );
      impactsData.energyConsumptionUncertainty =
        getTotalNrgConsumptionUncertainty(impactsData.nrgDetails);
      await this.props.onUpdate("nrg");
    }
    // back to statement
    this.props.onGoBack();
  };
}

/* -------------------- GHG FORMULAS | ITEM -------------------- */

export const getGhgEmissions = ({
  consumption,
  consumptionUnit,
  factorId,
  gaz,
}) => {
  switch (consumptionUnit) {
    case "kgCO2e":
      return consumption;
    case "tCO2e":
      return consumption * 1000;
    default:
      return (
        consumption *
        emissionFactors[factorId].units[consumptionUnit].coefGHG *
        greenhouseGases[gaz].prg
      );
  }
};

const getGhgEmissionsMax = ({
  consumption,
  consumptionUnit,
  consumptionUncertainty,
  factorId,
  gaz,
}) => {
  switch (consumptionUnit) {
    case "kgCO2e":
      return consumption * (1 + consumptionUncertainty / 100);
    case "tCO2e":
      return consumption * (1 + consumptionUncertainty / 100) * 1000;
    default:
      return (
        consumption *
        (1 + consumptionUncertainty / 100) *
        emissionFactors[factorId].units[consumptionUnit].coefGHG *
        (1 +
          emissionFactors[factorId].units[consumptionUnit].coefGHGUncertainty /
            100) *
        greenhouseGases[gaz].prg
      );
  }
};

const getGhgEmissionsMin = ({
  consumption,
  consumptionUnit,
  consumptionUncertainty,
  factorId,
  gaz,
}) => {
  switch (consumptionUnit) {
    case "kgCO2e":
      return consumption * (1 - consumptionUncertainty / 100);
    case "tCO2e":
      return consumption * (1 - consumptionUncertainty / 100) * 1000;
    default:
      return (
        consumption *
        (1 - consumptionUncertainty / 100) *
        emissionFactors[factorId].units[consumptionUnit].coefGHG *
        (1 -
          emissionFactors[factorId].units[consumptionUnit].coefGHGUncertainty /
            100) *
        greenhouseGases[gaz].prg
      );
  }
};

export const getGhgEmissionsUncertainty = (item) => {
  const value = getGhgEmissions(item);
  const valueMax = getGhgEmissionsMax(item);
  const valueMin = getGhgEmissionsMin(item);
  return value != 0
    ? Math.round(
        (Math.max(Math.abs(valueMax - value), Math.abs(value - valueMin)) /
          value) *
          100
      )
    : 0;
};

/* -------------------- GHG FORMULAS | ITEMS -------------------- */

export const getTotalGhgEmissions = (ghgDetails) => {
  const items = Object.entries(ghgDetails).map(([_, itemData]) => itemData);
  const emissions = getGhgEmissionsItems(items);
  return emissions;
};

export const getTotalGhgEmissionsUncertainty = (ghgDetails) => {
  const items = Object.entries(ghgDetails).map(([_, itemData]) => itemData);
  const uncertainty = getGhgEmissionsUncertaintyItems(items);
  return uncertainty;
};

const getTotalByAssessmentItem = (ghgDetails, assessmentItem) => {
  const items = Object.entries(ghgDetails)
    .filter(([_, itemData]) => itemData.assessmentItem == assessmentItem)
    .map(([_, itemData]) => itemData);
  const emissions = getGhgEmissionsItems(items);
  return emissions;
};

const getUncertaintyByAssessmentItem = (ghgDetails, assessmentItem) => {
  const items = Object.entries(ghgDetails)
    .filter(([_, itemData]) => itemData.assessmentItem == assessmentItem)
    .map(([_, itemData]) => itemData);
  const uncertainty = getGhgEmissionsUncertaintyItems(items);
  return uncertainty;
};

const getGhgEmissionsItems = (items) => {
  const sum = getSumItems(items.map((item) => item.ghgEmissions));
  return sum;
};

const getGhgEmissionsUncertaintyItems = (items) => {
  if (items.length > 0) {
    const value = getSumItems(items.map((item) => item.ghgEmissions));
    if (value != 0) {
      const valueMax = getSumItems(
        items.map((item) =>
          Math.max(
            item.ghgEmissions * (1 + item.ghgEmissionsUncertainty / 100),
            item.ghgEmissions * (1 - item.ghgEmissionsUncertainty / 100)
          )
        )
      );
      const valueMin = getSumItems(
        items.map((item) =>
          Math.min(
            item.ghgEmissions *
              Math.max(1 + item.ghgEmissionsUncertainty / 100, 0),
            item.ghgEmissions *
              Math.max(1 - item.ghgEmissionsUncertainty / 100, 0)
          )
        )
      );
      return Math.round(
        (Math.max(Math.abs(valueMax - value), Math.abs(value - valueMin)) /
          value) *
          100
      );
    } else {
      return 0;
    }
  } else return null;
};
