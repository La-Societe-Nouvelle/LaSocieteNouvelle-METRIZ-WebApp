// La Société Nouvelle

// React
import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Select from "react-select";

// Utils
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { InputNumber } from "../../../input/InputNumber";

/* ---------- DECLARATION - INDIC #NRG ---------- */

export class StatementNRG extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      energyConsumption: valueOrDefault(
        props.impactsData.energyConsumption,
        undefined
      ),
      energyConsumptionUnit: props.impactsData.energyConsumptionUnit,
      energyConsumptionUncertainty: valueOrDefault(
        props.impactsData.energyConsumptionUncertainty,
        undefined
      ),
      info: props.impactsData.comments.nrg || "",
    };
  }

  componentDidUpdate() {
    if (
      this.state.energyConsumption != this.props.impactsData.energyConsumption
    ) {
      this.setState({
        energyConsumption: this.props.impactsData.energyConsumption,
      });
    }
    if (
      this.state.energyConsumptionUncertainty !=
      this.props.impactsData.energyConsumptionUncertainty
    ) {
      this.setState({
        energyConsumptionUncertainty:
          this.props.impactsData.energyConsumptionUncertainty,
      });
    }
  }

  render() {
    const { netValueAdded } = this.props.impactsData;
    const {
      energyConsumption,
      energyConsumptionUnit,
      energyConsumptionUncertainty,
      info,
    } = this.state;
    const options = [
      { value: "MJ", label: "MJ" },
      { value: "GJ", label: "GJ" },
      { value: "kWh", label: "kWh" },
      { value: "MWh", label: "MWh" },
    ];

    let isValid = energyConsumption != null && netValueAdded != null;

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>Consommation totale d'énergie</label>
            <Row>
              <Col>
                <InputNumber
                  value={roundValue(energyConsumption, 0)}
                  onUpdate={this.updateEnergyConsumption}
                />
              </Col>
              <Col sm={4}>
                <Select
                  options={options}
                  defaultValue={{
                    label: energyConsumptionUnit,
                    value: energyConsumptionUnit,
                  }}
                  onChange={this.updateEnergyConsumptionUnit}
                />
              </Col>
            </Row>
          </div>
          <div className="form-group">
            <label>Incertitude</label>
            <InputNumber
              value={roundValue(energyConsumptionUncertainty, 0)}
              onUpdate={this.updateEnergyConsumptionUncertainty}
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
            className="btn btn-primary btn-sm"
            onClick={this.props.toAssessment}
          >
            <i className="bi bi-calculator"></i> Outil d'évaluation
          </button>

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

  updateEnergyConsumption = (input) => {
    this.props.impactsData.nrgTotal = true;
    this.props.impactsData.setEnergyConsumption(input);
    this.setState({
      energyConsumptionUncertainty:
        this.props.impactsData.energyConsumptionUncertainty,
    });
    this.props.onUpdate("nrg");
  };

  updateEnergyConsumptionUncertainty = (input) => {
    this.props.impactsData.energyConsumptionUncertainty = input;
    this.props.onUpdate("nrg");
  };

  updateEnergyConsumptionUnit = (selected) => {
    const selectedUnit = selected.value;

    const { energyConsumption, energyConsumptionUnit } = this.props.impactsData;

    if (selectedUnit !== energyConsumptionUnit) {
      const convertedValue = this.convertEnergyConsumption(
        energyConsumption,
        energyConsumptionUnit,
        selectedUnit
      );

      this.updateEnergyConsumption(convertedValue);
    }

    this.setState({
      energyConsumptionUnit: selectedUnit,
    });

    this.props.impactsData.energyConsumptionUnit = selectedUnit;

    this.props.onUpdate("nrg");
  };

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => (this.props.impactsData.comments.nrg = this.state.info);

  onValidate = () => this.props.onValidate();

  convertEnergyConsumption = (value, fromUnit, toUnit) => {
    const conversionFactors = {
      GJ: {
        MJ: 1000,
        kWh: 3.6,
        MWh: 3600,
      },
      MJ: {
        GJ: 1 / 1000,
        kWh: 1 / 3.6,
        MWh: 1 / 3600,
      },
      kWh: {
        GJ: 1 / 3.6,
        MJ: 3.6,
        MWh: 1 / 1000,
      },
      MWh: {
        GJ: 1 / 3600,
        MJ: 3600,
        kWh: 1000,
      },
    };
    const conversionFactor = conversionFactors[fromUnit][toUnit];
    const convertedValue = value * conversionFactor;
    return convertedValue;
  };
}
