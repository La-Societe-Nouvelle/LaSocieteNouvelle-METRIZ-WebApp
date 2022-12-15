// La Société Nouvelle

// React
import { isValid } from 'js-base64';
import React from 'react';
import { Form } from 'react-bootstrap';

// Utils
import { printValue, roundValue, valueOrDefault } from '../../../../src/utils/Utils';
import { InputNumber } from '../../../input/InputNumber'; 


/* ---------- DECLARATION - INDIC #IDR ---------- */
export class StatementIDR extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      interdecileRange: valueOrDefault(props.impactsData.interdecileRange, ""),
      info: props.impactsData.comments.idr || "",
      isDisabled : true
    }
  }

  componentDidUpdate() {

    if(!this.props.impactsData.hasEmployees && this.state.interdecileRange == 1) {
      this.state.isDisabled = false;
    }
    if(this.props.impactsData.hasEmployees &&  this.state.interdecileRange != ''  && this.props.impactsData.netValueAdded != null)
    {
      this.state.isDisabled = false;
    }

     if(this.props.impactsData.hasEmployees &&  this.state.interdecileRange == '')
    {
      this.state.isDisabled = true;
    }

    if (this.state.interdecileRange != valueOrDefault(this.props.impactsData.interdecileRange, "")) {
      this.setState({ interdecileRange: valueOrDefault(this.props.impactsData.interdecileRange, "") });
    }
  }

  render() {
    const { hasEmployees } = this.props.impactsData;
    const { interdecileRange, info, isDisabled } = this.state;

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
            <label>Rapport interdécile D9/D1 des taux horaires bruts</label>
            <InputNumber value={roundValue(interdecileRange, 1)}
              disabled={hasEmployees === false}
              onUpdate={this.updateInterdecileRange}
              placeholder="/100" 
              isInvalid={interdecileRange>100 ? true : false}/>
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
          <button className="btn btn-primary btn-sm" onClick={this.props.toImportDSN} disabled={hasEmployees ? false : true}>
            <i className="bi bi-calculator"></i>
            &nbsp;Import Fichiers DSN
          </button>
          <button className="btn btn-primary btn-sm" onClick={this.props.toAssessment} disabled={hasEmployees ? false : true}>
            <i className="bi bi-calculator"></i>
            &nbsp;Outil d'évaluation
          </button>
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
    this.setState({ interdecileRange: valueOrDefault(this.props.impactsData.interdecileRange, "") });
    this.props.onUpdate("idr");
    this.props.onUpdate("geq");
  }

  updateInterdecileRange = (input) => {
    this.props.impactsData.interdecileRange = input;
    this.setState({ interdecileRange: this.props.impactsData.interdecileRange , isDisabled : false});
    this.props.onUpdate("idr");
  }

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => this.props.impactsData.comments.idr = this.state.info;

  onValidate = () => this.props.onValidate()
}

export const writeStatementIDR = (doc, x, y, impactsData) => {
  doc.text("Rapport interdécile D9/D1 interne : " + printValue(impactsData.interdecileRange, 2) + " " + (!impactsData.hasEmployees ? "*" : ""), x, y);
  if (!impactsData.hasEmployees) {
    y += 6;
    doc.setFont("Helvetica", "italic");
    doc.text("*L'entreprise est déclarée non-employeur", x, y);
    doc.setFont("Helvetica", "normal");
  }
  return y;
}