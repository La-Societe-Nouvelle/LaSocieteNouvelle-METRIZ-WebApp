// La Société Nouvelle

// React
import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Select from "react-select";

//Utils
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
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
      wasteProductionUnit: props.impactsData.wasteProductionUnit,
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
    const {
      wasteProduction,
      wasteProductionUnit,
      wasteProductionUncertainty,
      info,
    } = this.state;

    const options = [
      { value: "kg", label: "kg" },
      { value: "t", label: "t" },
    ];

    let isValid = wasteProduction != null && netValueAdded != null;

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>
              Productiont totale de déchets (y compris DAOM<sup>1</sup>)
            </label>
            <Row>
              <Col>
                <InputNumber
                  value={roundValue(wasteProduction, 0)}
                  onUpdate={this.updateWasteProduction}
                />
                <div className="notes">
                  <p className="small">
                    <sup>1</sup> Déchets assimilés aux ordures ménagères
                  </p>
                </div>
              </Col>
              <Col sm={4}>
                <Select
                  options={options}
                  defaultValue={{
                    label: wasteProductionUnit,
                    value: wasteProductionUnit,
                  }}
                  onChange={this.updateWasteProductionUnit}
                />
              </Col>
            </Row>
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

  updateWasteProductionUnit = (selected) => {
    const selectedUnit = selected.value;
    this.setState({
      wasteProductionUnit: selectedUnit,
    });

    this.props.impactsData.wasteProductionUnit = selectedUnit;

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
