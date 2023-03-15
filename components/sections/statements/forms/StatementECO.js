// La Société Nouvelle

// React
import React from "react";
import { Form } from "react-bootstrap";

// Utils
import {
  printValue,
  roundValue,
  valueOrDefault,
} from "../../../../src/utils/Utils";
import { InputNumber } from "../../../input/InputNumber";

/* ---------- DECLARATION - INDIC #ECO ---------- */

export class StatementECO extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      domesticProduction: valueOrDefault(
        props.impactsData.domesticProduction,
        undefined
      ),
      info: props.impactsData.comments.eco || "",
    };
  }

  componentDidUpdate() {
    if (
      this.state.domesticProduction != this.props.impactsData.domesticProduction
    ) {
      this.setState({
        domesticProduction: this.props.impactsData.domesticProduction,
      });
    }
  }

  render() {
    const { isAllActivitiesInFrance, netValueAdded } = this.props.impactsData;
    const { domesticProduction, info } = this.state;

    let isValid =
      netValueAdded != null &&
      domesticProduction >= 0 &&
      domesticProduction <= netValueAdded;

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>
              Les activités de l'entreprise sont-elles localisées en France ?
            </label>
            <Form>
              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Oui"
                value="true"
                checked={isAllActivitiesInFrance === true}
                onChange={this.onIsAllActivitiesInFranceChange}
              />
              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Partiellement"
                value="null"
                checked={
                  isAllActivitiesInFrance === null && domesticProduction !== ""
                }
                onChange={this.onIsAllActivitiesInFranceChange}
              />
              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Non"
                value="false"
                checked={isAllActivitiesInFrance === false}
                onChange={this.onIsAllActivitiesInFranceChange}
              />
            </Form>
          </div>
          <div className="form-group">
            <label>Valeur ajoutée nette produite en France </label>
            <InputNumber
              value={roundValue(domesticProduction, 0)}
              disabled={isAllActivitiesInFrance != null}
              onUpdate={this.updateDomesticProduction}
              placeholder="€"
              isInvalid={!isValid}
            />
          </div>
        </div>
        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <Form.Control
            as="textarea"
            rows={4}
            onChange={this.updateInfo}
            onBlur={this.saveInfo}
            value={info}
          />
        </div>
        <div className="statement-validation">
          <button
            disabled={!isValid}
            className={"btn btn-secondary btn-sm"}
            onClick={this.onValidate}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  onIsAllActivitiesInFranceChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        this.props.impactsData.setIsAllActivitiesInFrance(true);
        this.props.impactsData.domesticProduction =
          this.props.impactsData.netValueAdded;
        break;
      case "null":
        this.props.impactsData.setIsAllActivitiesInFrance(null);
        this.props.impactsData.domesticProduction = 0;
        break;
      case "false":
        this.props.impactsData.setIsAllActivitiesInFrance(false);
        this.props.impactsData.domesticProduction = 0;
        break;
    }
    this.setState({
      domesticProduction: valueOrDefault(
        this.props.impactsData.domesticProduction,
        ""
      ),
      isValid: true,
    });
    this.props.onUpdate("eco");
  };

  updateDomesticProduction = (input) => {
    this.props.impactsData.domesticProduction = input;
    this.setState({
      domesticProduction: this.props.impactsData.domesticProduction,
    });
    this.props.onUpdate("eco");
  };

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => (this.props.impactsData.comments.eco = this.state.info);
  onValidate = () => this.props.onValidate();
}

export const writeStatementECO = (doc, x, y, impactsData) => {
  doc.text(
    "Valeur ajoutée nette produite en France : " +
      printValue(impactsData.domesticProduction, 0) +
      " €" +
      (impactsData.isAllActivitiesInFrance ? "*" : ""),
    x,
    y
  );
  if (impactsData.isAllActivitiesInFrance) {
    y += 6;
    doc.setFont("Helvetica", "italic");
    doc.text(
      "*Les activités de l'entreprise sont déclarées entièrement localisées en France",
      x,
      y
    );
    doc.setFont("Helvetica", "normal");
  }
  return y;
};
