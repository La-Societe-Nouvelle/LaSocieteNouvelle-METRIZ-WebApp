// La Société Nouvelle

// React
import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Select from "react-select";

//Utils
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { InputNumber } from "../../../input/InputNumber";

/* ---------- DECLARATION - INDIC #WAT ---------- */

export class StatementWAT extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waterConsumption: valueOrDefault(
        props.impactsData.waterConsumption,
        undefined
      ),
      waterConsumptionUnit: props.impactsData.waterConsumptionUnit,
      waterConsumptionUncertainty: valueOrDefault(
        props.impactsData.waterConsumptionUncertainty,
        undefined
      ),
      info: props.impactsData.comments.wat || "",
    };
  }

  componentDidUpdate() {
    if (
      this.state.waterConsumption != this.props.impactsData.waterConsumption
    ) {
      this.setState({
        waterConsumption: this.props.impactsData.waterConsumption,
      });
    }
    if (
      this.state.waterConsumptionUncertainty !=
      this.props.impactsData.waterConsumptionUncertainty
    ) {
      this.setState({
        waterConsumptionUncertainty:
          this.props.impactsData.waterConsumptionUncertainty,
      });
    }
  }

  render() {
    const { netValueAdded } = this.props.impactsData;
    const {
      waterConsumption,
      waterConsumptionUnit,
      waterConsumptionUncertainty,
      info,
    } = this.state;

    const options = [
      { value: "m³", label: "m³" },
      { value: "L", label: "L" },
    ];

    let isValid = waterConsumption != null && netValueAdded != null;

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>Consommation totale d'eau</label>
            <Row>
              <Col>
                <InputNumber
                  value={roundValue(waterConsumption, 0)}
                  onUpdate={this.updateWaterConsumption}
                />
              </Col>
              <Col sm={4}>
                <Select
                  options={options}
                  defaultValue={{
                    label: waterConsumptionUnit,
                    value: waterConsumptionUnit,
                  }}
                  onChange={this.updateWaterConsumptionUnit}
                />
              </Col>
            </Row>
          </div>
          <div className="form-group">
            <label>Incertitude</label>
            <InputNumber
              value={roundValue(waterConsumptionUncertainty, 0)}
              onUpdate={this.updateWaterConsumptionUncertainty}
              placeholder="%"
            />
          </div>
        </div>

        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <Form.Control
            as="textarea"
            rows={4}
            onChange={this.updateInfo}
            value={info}
            onBlur={this.saveInfo}
          />
        </div>
        <div className="statement-validation">
          <button
            disabled={!isValid}
            className="btn btn-secondary btn-sm"
            onClick={this.onValidate}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  updateWaterConsumption = (input) => {
    this.props.impactsData.setWaterConsumption(input);
    this.setState({
      waterConsumptionUncertainty:
        this.props.impactsData.waterConsumptionUncertainty,
    });
    this.props.onUpdate("wat");
  };

  updateWaterConsumptionUncertainty = (input) => {
    this.props.impactsData.waterConsumptionUncertainty = input;
    this.props.onUpdate("wat");
  };

  updateWaterConsumptionUnit = (selected) => {
    const selectedUnit = selected.value; 

    const {
      waterConsumption,
      waterConsumptionUnit,
    } = this.props.impactsData;

    if (selectedUnit !== waterConsumptionUnit) {
      let updatedWaterConsumption =
        waterConsumption;

      if (selectedUnit === "m³") {
        updatedWaterConsumption =
          waterConsumption / 1000;
      } else if (selectedUnit === "L") {
        updatedWaterConsumption =
          waterConsumption * 1000;
      }

      this.updateWaterConsumption(
        updatedWaterConsumption
      );
    }


    this.setState({
      waterConsumptionUnit: selectedUnit,
    });

    this.props.impactsData.waterConsumptionUnit = selectedUnit;

    this.props.onUpdate("wat");
  };

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => (this.props.impactsData.comments.wat = this.state.info);

  onValidate = () => this.props.onValidate();
}
