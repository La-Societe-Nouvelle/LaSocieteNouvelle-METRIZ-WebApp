// La Société Nouvelle

// React
import React from "react";
import { Form } from "react-bootstrap";

//Utils
import {
  printValue,
  roundValue,
  valueOrDefault,
} from "../../../../src/utils/Utils";
import { InputNumber } from "../../../input/InputNumber";

/* ---------- DECLARATION - INDIC #WAS ---------- */

export class StatementWAS extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wasteProduction: valueOrDefault(
        props.impactsData.wasteProduction,
        undefined
      ),
      wasteProductionUncertainty: valueOrDefault(
        props.impactsData.wasteProductionUncertainty,
        undefined
      ),
      info: props.impactsData.comments.was || "",
    };
  }

  componentDidUpdate() {
    if (this.state.wasteProduction != this.props.impactsData.wasteProduction) {
      this.setState({
        wasteProduction: this.props.impactsData.wasteProduction,
      });
    }
    if (
      this.state.wasteProductionUncertainty !=
      this.props.impactsData.wasteProductionUncertainty
    ) {
      this.setState({
        wasteProductionUncertainty:
          this.props.impactsData.wasteProductionUncertainty,
      });
    }
  }

  render() {
    const { netValueAdded } = this.props.impactsData;
    const { wasteProduction, wasteProductionUncertainty, info } = this.state;

    let isValid = wasteProduction != null && netValueAdded != null;

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>
              Productiont totale de déchets (y compris DAOM<sup>1</sup>)
            </label>
            <InputNumber
              value={roundValue(wasteProduction, 0)}
              onUpdate={this.updateWasteProduction}
              placeholder="KG"
            />
            <div className="notes">
              <p className="small">
                <sup>1</sup> Déchets assimilés aux ordures ménagères
              </p>
            </div>
          </div>
          <div className="form-group">
            <label>Incertitude</label>
            <InputNumber
              value={roundValue(wasteProductionUncertainty, 0)}
              onUpdate={this.updateWasteProductionUncertainty}
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

  updateWasteProduction = (input) => {
    this.props.impactsData.setWasteProduction(input);
    this.setState({
      wasteProductionUncertainty:
        this.props.impactsData.wasteProductionUncertainty,
    });
    this.props.onUpdate("was");
  };

  updateWasteProductionUncertainty = (input) => {
    this.props.impactsData.wasteProductionUncertainty = input;
    this.props.onUpdate("was");
  };

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => (this.props.impactsData.comments.was = this.state.info);

  onValidate = () => this.props.onValidate();
}
