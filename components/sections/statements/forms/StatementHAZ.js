// La Société Nouvelle

// React
import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Select from "react-select";

// Utils
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { InputNumber } from "../../../input/InputNumber";

/* ---------- DECLARATION - INDIC #HAZ ---------- */

export class StatementHAZ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hazardousSubstancesConsumption: valueOrDefault(
        props.impactsData.hazardousSubstancesConsumption,
        undefined
      ),
      hazardousSubstancesConsumptionUnit:
        props.impactsData.hazardousSubstancesConsumptionUnit,
      hazardousSubstancesConsumptionUncertainty: valueOrDefault(
        props.impactsData.hazardousSubstancesConsumptionUncertainty,
        undefined
      ),
      info: props.impactsData.comments.haz || "",
    };
  }

  componentDidUpdate() {
    if (
      this.state.hazardousSubstancesConsumption !=
      this.props.impactsData.hazardousSubstancesConsumption
    ) {
      this.setState({
        hazardousSubstancesConsumption:
          this.props.impactsData.hazardousSubstancesConsumption,
      });
    }
    if (
      this.state.hazardousSubstancesConsumptionUncertainty !=
      this.props.impactsData.hazardousSubstancesConsumptionUncertainty
    ) {
      this.setState({
        hazardousSubstancesConsumptionUncertainty:
          this.props.impactsData.hazardousSubstancesConsumptionUncertainty,
      });
    }
  }

  render() {
    const { netValueAdded } = this.props.impactsData;
    const {
      hazardousSubstancesConsumption,
      hazardousSubstancesConsumptionUnit,
      hazardousSubstancesConsumptionUncertainty,
      info,
    } = this.state;

    const options = [
      { value: "kg", label: "kg" },
      { value: "t", label: "t" },
    ];

    let isValid =
      hazardousSubstancesConsumption != null && netValueAdded != null;

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>
              Utilisation de produits dangereux - santé/environnement
            </label>
            <Row>
              <Col>
                <InputNumber
                  value={roundValue(hazardousSubstancesConsumption, 0)}
                  onUpdate={this.updateHazardousSubstancesConsumption}
                />
              </Col>
              <Col sm={4}>
                <Select
                  options={options}
                  defaultValue={{
                    label: hazardousSubstancesConsumptionUnit,
                    value: hazardousSubstancesConsumptionUnit,
                  }}
                  onChange={this.updatehazardousSubstancesConsumptionUnit}
                />
              </Col>{" "}
            </Row>
          </div>
          <div className="form-group">
            <label>Incertitude</label>
            <InputNumber
              value={roundValue(hazardousSubstancesConsumptionUncertainty, 0)}
              onUpdate={this.updateHazardousSubstancesConsumptionUncertainty}
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

  updateHazardousSubstancesConsumption = (input) => {
    this.props.impactsData.setHazardousSubstancesConsumption(input);
    this.setState({
      hazardousSubstancesConsumptionUncertainty:
        this.props.impactsData.hazardousSubstancesConsumptionUncertainty,
    });
    this.props.onUpdate("haz");
  };

  updateHazardousSubstancesConsumptionUncertainty = (input) => {
    this.props.impactsData.hazardousSubstancesConsumptionUncertainty = input;
    this.props.onUpdate("haz");
  };

  updatehazardousSubstancesConsumptionUnit = (selected) => {
    const selectedUnit = selected.value;

    const {
      hazardousSubstancesConsumption,
      hazardousSubstancesConsumptionUnit,
    } = this.props.impactsData;

    if (selectedUnit !== hazardousSubstancesConsumptionUnit) {
      let updatedHazardousSubstancesConsumption =
        hazardousSubstancesConsumption;

      if (selectedUnit === "t") {
        updatedHazardousSubstancesConsumption =
          hazardousSubstancesConsumption / 1000;
      } else if (selectedUnit === "kg") {
        updatedHazardousSubstancesConsumption =
          hazardousSubstancesConsumption * 1000;
      }

      this.updateHazardousSubstancesConsumption(
        updatedHazardousSubstancesConsumption
      );
    }

    this.setState({
      hazardousSubstancesConsumptionUnit: selectedUnit,
    });

    this.props.impactsData.hazardousSubstancesConsumptionUnit = selectedUnit;

    this.props.onUpdate("haz");
  };

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => (this.props.impactsData.comments.haz = this.state.info);

  onValidate = () => this.props.onValidate();
}
