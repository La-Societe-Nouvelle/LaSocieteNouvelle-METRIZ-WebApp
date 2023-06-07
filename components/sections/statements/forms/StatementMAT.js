// La Société Nouvelle

// React
import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Select from "react-select";

//Utils
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { InputNumber } from "../../../input/InputNumber";

/* ---------- DECLARATION - INDIC #MAT ---------- */

export class StatementMAT extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      materialsExtraction: valueOrDefault(
        props.impactsData.materialsExtraction,
        undefined
      ),
      materialsExtractionUnit: props.impactsData.materialsExtractionUnit,
      materialsExtractionUncertainty: valueOrDefault(
        props.impactsData.materialsExtractionUncertainty,
        undefined
      ),
      info: props.impactsData.comments.mat || "",
    };
  }

  componentDidUpdate() {
    if (
      this.state.materialsExtraction !=
      this.props.impactsData.materialsExtraction
    ) {
      this.setState({
        materialsExtraction: this.props.impactsData.materialsExtraction,
      });
    }
    if (
      this.state.materialsExtractionUncertainty !=
      this.props.impactsData.materialsExtractionUncertainty
    ) {
      this.setState({
        materialsExtractionUncertainty:
          this.props.impactsData.materialsExtractionUncertainty,
      });
    }
  }

  render() {
    const { isExtractiveActivities, netValueAdded } = this.props.impactsData;
    const {
      materialsExtraction,
      materialsExtractionUncertainty,
      materialsExtractionUnit,
      info,
    } = this.state;

    const options = [
      { value: "kg", label: "kg" },
      { value: "t", label: "t" },
    ];

    let isValid = materialsExtraction != null && netValueAdded != null;

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>
              L'entreprise réalisent-elles des activités agricoles ou
              extractives ?
            </label>
            <Form>
              <Form.Check
                inline
                type="radio"
                id="isExtractiveActivities"
                label="Oui"
                value="true"
                checked={isExtractiveActivities === true}
                onChange={this.onIsExtractiveActivitiesChange}
              />
              <Form.Check
                inline
                type="radio"
                id="isNotExtractiveActivities"
                label="Non"
                value="false"
                checked={isExtractiveActivities === false}
                onChange={this.onIsExtractiveActivitiesChange}
              />
            </Form>
          </div>
          <div className="form-group">
            <label>Quantité extraite de matières premières</label>
            <Row>
              <Col>
                <InputNumber
                  value={roundValue(materialsExtraction, 0)}
                  disabled={isExtractiveActivities === false}
                  onUpdate={this.updateMaterialsExtraction}
                />
              </Col>
              <Col sm={4}>
                <Select
                  isDisabled={isExtractiveActivities === false}
                  options={options}
                  defaultValue={{
                    label: materialsExtractionUnit,
                    value: materialsExtractionUnit,
                  }}
                  onChange={this.updateUnit}
                />
              </Col>
            </Row>
          </div>
          <div className="form-group">
            <label>Incertitude</label>
            <InputNumber
              value={roundValue(materialsExtractionUncertainty, 0)}
              disabled={isExtractiveActivities === false}
              onUpdate={this.updateMaterialsExtractionUncertainty}
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

  onIsExtractiveActivitiesChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        this.props.impactsData.setIsExtractiveActivities(true);
        break;
      case "false":
        this.props.impactsData.setIsExtractiveActivities(false);
        break;
    }
    this.setState({
      materialsExtraction: valueOrDefault(
        this.props.impactsData.materialsExtraction,
        ""
      ),
      materialsExtractionUncertainty: valueOrDefault(
        this.props.impactsData.materialsExtractionUncertainty,
        ""
      ),
    });
  };

  updateMaterialsExtraction = (input) => {
    this.props.impactsData.setMaterialsExtraction(input);
    this.setState({
      materialsExtractionUncertainty:
        this.props.impactsData.materialsExtractionUncertainty,
    });
    this.props.onUpdate("mat");
  };

  updateUnit = (selected) => {
    const selectedUnit = selected.value;

    let materialsExtraction =
    this.props.impactsData.materialsExtraction;

  if (selectedUnit == "t") {
    materialsExtraction = materialsExtraction / 1000;
  } else {
    materialsExtraction = materialsExtraction * 1000;
  }

    this.setState({
      materialsExtractionUnit: selectedUnit,
    });

    this.updateMaterialsExtraction(materialsExtraction);

    this.props.impactsData.materialsExtractionUnit = selectedUnit;

    this.props.onUpdate("mat");
  };

  updateMaterialsExtractionUncertainty = (input) => {
    this.props.impactsData.materialsExtractionUncertainty = input;
    this.setState({
      materialsExtraction: this.props.impactsData.materialsExtraction,
    });
    this.props.onUpdate("mat");
  };

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => (this.props.impactsData.comments.mat = this.state.info);

  onValidate = () => this.props.onValidate();
}
