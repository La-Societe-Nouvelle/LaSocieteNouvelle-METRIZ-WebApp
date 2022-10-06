// La Société Nouvelle

// React
import { isValid } from 'js-base64';
import React from 'react';

// Utils
import { printValue, roundValue, valueOrDefault } from '../../../../src/utils/Utils';
import { InputNumber } from '../../../input/InputNumber'; 


/* ---------- DECLARATION - INDIC #DIS ---------- */
export class StatementDIS extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indexGini: valueOrDefault(props.impactsData.indexGini, ""),
      info: props.impactsData.comments.dis || "",
      isDisabled : true
    }
  }

  componentDidUpdate() {

    if(!this.props.impactsData.hasEmployees && this.state.indexGini == 0) {
      this.state.isDisabled = false;
    }
    if(this.props.impactsData.hasEmployees &&  this.state.indexGini != ''  && this.props.impactsData.netValueAdded != null)
    {
      this.state.isDisabled = false;
    }

     if(this.props.impactsData.hasEmployees &&  this.state.indexGini == '')
    {
      this.state.isDisabled = true;
    }

    if (this.state.indexGini != valueOrDefault(this.props.impactsData.indexGini, "")) {
      this.setState({ indexGini: valueOrDefault(this.props.impactsData.indexGini, "") });
    }
  }

  render() {
    const { hasEmployees, netValueAdded } = this.props.impactsData;
    const { indexGini, info, isDisabled } = this.state;

    return (
      <div className="statement">
        <div className="statement-form">

          <div className="form-group">
            <label>L'entreprise est-elle employeur ?</label>
            <div className={"custom-control-inline"}>
              <input type="radio" id="hasEmployees" className="custom-control-input"
                value="true"
                checked={hasEmployees === true}
                onChange={this.onHasEmployeesChange} />
              <label className="custom-control-label">Oui</label>
            </div>
            <div className={"custom-control-inline"}>
              <input type="radio" id="hasEmployees" className="custom-control-input"
                value="false"
                checked={hasEmployees === false}
                onChange={this.onHasEmployeesChange} />
              <label className="custom-control-label">Non</label>
            </div>
            {false && <div className="assessment-button-container">
              <button className="assessment-button" onClick={this.props.toAssessment}>Détails</button>
            </div>}
          </div>
          <div className="form-group">
            <label>Indice de GINI des taux horaires bruts</label>
            <InputNumber value={roundValue(indexGini, 1)}
              disabled={hasEmployees === false}
              onUpdate={this.updateIndexGini}
              placeholder="/100" />
          </div>

        </div>
        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <textarea type="text" spellCheck="false"
            value={info}
            onChange={this.updateInfo}
            onBlur={this.saveInfo} />
        </div>
        <div className="statement-validation">
          <button className="btn btn-primary btn-sm" onClick={this.props.toAssessment} disabled={hasEmployees ? false : true}>
          <i className="bi bi-calculator"></i> Outil d'évaluation</button>
          <button disabled={isDisabled} className="btn btn-secondary btn-sm"
            onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    )
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
    this.setState({ indexGini: valueOrDefault(this.props.impactsData.indexGini, "") });
    this.props.onUpdate("dis");
    this.props.onUpdate("geq");
  }

  updateIndexGini = (input) => {
    this.props.impactsData.indexGini = input;
    this.setState({ indexGini: this.props.impactsData.indexGini });
    this.props.onUpdate("dis");
  }

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => this.props.impactsData.comments.dis = this.state.info;

  onValidate = () => this.props.onValidate()
}

export const writeStatementDIS = (doc, x, y, impactsData) => {
  doc.text("Indice de GINI interne : " + printValue(impactsData.indexGini, 0) + " /100" + (!impactsData.hasEmployees ? "*" : ""), x, y);
  if (!impactsData.hasEmployees) {
    y += 6;
    doc.setFont("Helvetica", "italic");
    doc.text("*L'entreprise est déclarée non-employeur", x, y);
    doc.setFont("Helvetica", "normal");
  }
  return y;
}