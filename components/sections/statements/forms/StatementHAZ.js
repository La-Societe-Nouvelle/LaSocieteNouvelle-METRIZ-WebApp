// La Société Nouvelle

// React
import React from "react";
import { Form } from "react-bootstrap";

// Utils
import {
  roundValue,
  valueOrDefault,
} from "../../../../src/utils/Utils";
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
      hazardousSubstancesConsumptionUncertainty,
      info,
    } = this.state;

    let isValid =
      hazardousSubstancesConsumption != null && netValueAdded != null;

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>
              Utilisation de produits dangereux - santé/environnement
            </label>
            <InputNumber
              value={roundValue(hazardousSubstancesConsumption, 0)}
              onUpdate={this.updateHazardousSubstancesConsumption}
              placeholder="KG"
            />
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

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => (this.props.impactsData.comments.haz = this.state.info);

  onValidate = () => this.props.onValidate();
}

