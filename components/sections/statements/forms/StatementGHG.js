// La Société Nouvelle

// React
import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Select from "react-select";

// Utils
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { InputNumber } from "../../../input/InputNumber";

/* ---------- DECLARATION - INDIC #GHG ---------- */

export class StatementGHG extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      greenhousesGazEmissions: valueOrDefault(
        props.impactsData.greenhousesGazEmissions,
        undefined
      ),
      greenhousesGazEmissionsUnit:
        props.impactsData.greenhousesGazEmissionsUnit,
      greenhousesGazEmissionsUncertainty: valueOrDefault(
        props.impactsData.greenhousesGazEmissionsUncertainty,
        undefined
      ),
      info: props.impactsData.comments.ghg || "",
    };
  }

  componentDidUpdate() {
    if (
      this.state.greenhousesGazEmissions !=
      this.props.impactsData.greenhousesGazEmissions
    ) {
      this.setState({
        greenhousesGazEmissions: this.props.impactsData.greenhousesGazEmissions,
      });
    }
    if (
      this.state.greenhousesGazEmissionsUncertainty !=
      this.props.impactsData.greenhousesGazEmissionsUncertainty
    ) {
      this.setState({
        greenhousesGazEmissionsUncertainty:
          this.props.impactsData.greenhousesGazEmissionsUncertainty,
      });

      if (
        this.state.greenhousesGazEmissionsUnit !==
        this.props.impactsData.greenhousesGazEmissionsUnit
      ) {
      }
      this.setState({
        greenhousesGazEmissionsUnit:
          this.props.impactsData.greenhousesGazEmissionsUnit,
      });
    }
  }

  render() {
    const { netValueAdded } = this.props.impactsData;
    const {
      greenhousesGazEmissions,
      greenhousesGazEmissionsUncertainty,
      greenhousesGazEmissionsUnit,
      info,
    } = this.state;

    let isValid = greenhousesGazEmissions != null && netValueAdded != null;

    const options = [
      { value: "kgCO2e", label: "kgCO2e" },
      { value: "tCO2e", label: "tCO2e" },
    ];
    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>Emissions directes de Gaz à effet de serre - SCOPE 1</label>
            <Row>
              <Col>
                <InputNumber
                  value={roundValue(greenhousesGazEmissions, 0)}
                  onUpdate={this.updateGreenhousesGazEmissions}
                />
              </Col>
              <Col sm={4}>
                <Select
                  options={options}
                  value={{
                    label: greenhousesGazEmissionsUnit,
                    value: greenhousesGazEmissionsUnit,
                  }}
                  onChange={this.updateUnit}
                />
              </Col>
            </Row>
          </div>

          <div className="form-group">
            <label>Incertitude</label>
            <InputNumber
              value={roundValue(greenhousesGazEmissionsUncertainty, 0)}
              onUpdate={this.updateGreenhousesGazEmissionsUncertainty}
              placeholder={"%"}
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
          <a
            className="btn btn-tertiary btn-sm"
            href="https://www.bilans-climat-simplifies.ademe.fr/"
            target="_blank"
          >
            <i className="bi bi-box-arrow-up-right"></i> Outil de l'Ademe
          </a>
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

  updateGreenhousesGazEmissions = (input) => {
    this.props.impactsData.ghgTotal = true;

    this.props.impactsData.setGreenhousesGazEmissions(input);
    this.setState({
      greenhousesGazEmissionsUncertainty:
        this.props.impactsData.greenhousesGazEmissionsUncertainty,
    });
    this.props.onUpdate("ghg");
  };

  updateGreenhousesGazEmissionsUncertainty = (input) => {
    this.props.impactsData.greenhousesGazEmissionsUncertainty = input;
    this.props.onUpdate("ghg");
  };
  updateUnit = (selected) => {
    const selectedUnit = selected.value;

    const {
      greenhousesGazEmissions,
      greenhousesGazEmissionsUnit,
    } = this.props.impactsData;

    if (selectedUnit !== greenhousesGazEmissionsUnit) {
      let updatedGreenhousesGazEmissions =
        greenhousesGazEmissions;

      if (selectedUnit === "tCO2e") {
        updatedGreenhousesGazEmissions =
          greenhousesGazEmissions / 1000;
      } else if (selectedUnit === "kgCO2e") {
        updatedGreenhousesGazEmissions =
          greenhousesGazEmissions * 1000;
      }

      this.updateGreenhousesGazEmissions(
        updatedGreenhousesGazEmissions
      );
    }


    this.setState({
      greenhousesGazEmissionsUnit: selectedUnit,
    });

    this.props.impactsData.greenhousesGazEmissionsUnit = selectedUnit;

    this.props.onUpdate("ghg");
  };

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => (this.props.impactsData.comments.ghg = this.state.info);

  onValidate = () => {
    this.setState({ isUpdated: true });
    this.props.onValidate();
  };
}
