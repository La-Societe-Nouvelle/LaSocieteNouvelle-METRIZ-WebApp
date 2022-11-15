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

/* ---------- DECLARATION - INDIC #GEQ ---------- */

export class StatementGEQ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wageGap: valueOrDefault(props.impactsData.wageGap, ""),
      info: props.impactsData.comments.geq || "",
    };
  }



  componentDidUpdate() {
    if (!this.props.impactsData.hasEmployees && this.state.wageGap == 0) {
      this.state.isDisabled = false;
    }
    if (
      this.props.impactsData.hasEmployees &&
      this.state.wageGap != "" &&
      this.props.impactsData.netValueAdded != null
    ) {
      this.state.isDisabled = false;
    }

    if (this.props.impactsData.hasEmployees && this.state.wageGap == "") {
      this.state.isDisabled = true;
    }

    if (
      this.state.wageGap != valueOrDefault(this.props.impactsData.wageGap, "")
    ) {
      this.setState({
        wageGap: valueOrDefault(this.props.impactsData.wageGap, ""),
      });
    }
  }

  render() {
    const { hasEmployees } = this.props.impactsData;
    const { wageGap, info, isDisabled } = this.state;

    console.log(this.props.impactsData.hasEmployees);

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>L'entreprise est-elle employeur ?</label>

            <Form>
              <Form.Check
                inline
                type="radio"
                id="hasEmployees"
                label="Oui"
                value="true"
                checked={hasEmployees === true}
                onChange={this.onHasEmployeesChange}
              />
              <Form.Check
                inline
                type="radio"
                id="hasEmployees"
                label="Non"
                value="false"
                checked={hasEmployees === false}
                onChange={this.onHasEmployeesChange}
              />
            </Form>
          </div>

          <div className="form-group">
            <label>
              Ecart de rémunérations F/H (en % du taux horaire brut moyen)
            </label>
            <InputNumber
              value={roundValue(wageGap, 1)}
              disabled={hasEmployees === false}
              onUpdate={this.updateWageGap}
              placeholder="%"
              isInvalid={isDisabled}
            />
          </div>
        </div>
        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <textarea
            type="text"
            spellCheck="false"
            value={info}
            onChange={this.updateInfo}
            onBlur={this.saveInfo}
          />
        </div>
        <div className="statement-validation">
          <button
            className="btn btn-primary btn-sm"
            onClick={this.props.toAssessment}
            disabled={hasEmployees ? false : true}
          >
            <i className="bi bi-calculator"></i> Outil d'évaluation
          </button>
          <button
            disabled={isDisabled}
            className="btn btn-secondary btn-sm"
            onClick={this.onValidate}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  onHasEmployeesChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        this.props.impactsData.setHasEmployees(true);
        this.props.impactsData.wageGap = null;
        break;
      case "false":
        this.props.impactsData.setHasEmployees(false);
        this.props.impactsData.wageGap = 0;
        this.state.isDisabled = false;
        break;
    }
    this.setState({
      wageGap: valueOrDefault(this.props.impactsData.wageGap, ""),
    });
    this.props.onUpdate("geq");
    this.props.onUpdate("dis");
  };

  updateWageGap = (input) => {
    this.props.impactsData.wageGap = input;
    this.setState({
      wageGap: this.props.impactsData.wageGap,
      isDisabled: false,
    });
    this.props.onUpdate("geq");
  };

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => (this.props.impactsData.comments.geq = this.state.info);

  onValidate = () => this.props.onValidate();
}

export const writeStatementGEQ = (doc, x, y, impactsData) => {
  doc.text(
    "Ecart interne de rémunérations F/H : " +
      printValue(impactsData.wageGap, 0) +
      " %" +
      (!impactsData.hasEmployees ? "*" : ""),
    x,
    y
  );
  if (!impactsData.hasEmployees) {
    y += 6;
    doc.setFont("Helvetica", "italic");
    doc.text("*L'entreprise est déclarée non-employeur", x, y);
    doc.setFont("Helvetica", "normal");
  }
  return y;
};
