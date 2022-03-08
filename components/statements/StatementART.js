// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue, roundValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #ART ---------- */

/** Component in IndicatorMainTab
 *  Props : 
 *    - impactsData
 *    - onUpdate -> update footprints, update table
 *    - onValidate -> update validations
 *    - toAssessment -> open assessment view (if defined)
 *  Behaviour :
 *    Edit directly impactsData (session) on inputs blur
 *    Redirect to assessment tool (if defined)
 *    Update footprints on validation
 *  State :
 *    inputs
 */

export class StatementART extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      craftedProduction: valueOrDefault(props.impactsData.craftedProduction, ""),
      info: props.impactsData.comments.art || ""
    }
  }

  componentDidUpdate() {
    if (this.state.craftedProduction != this.props.impactsData.craftedProduction) {
      this.setState({ craftedProduction: this.props.impactsData.craftedProduction });
    }
  }

  render() {
    const { isValueAddedCrafted, netValueAdded } = this.props.impactsData;
    const { craftedProduction, info } = this.state;

    let isValid = craftedProduction != null && netValueAdded != null;

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>L'entreprise est-elle une entreprise artisanale ?</label>

            <div className={"custom-control-inline"}>
              <input type="radio" id="isValueAddedCrafetd" className="custom-control-input"
                value="true"
                checked={isValueAddedCrafted === true}
                onChange={this.onIsValueAddedCraftedChange} />
              <label className="custom-control-label">Oui</label>
            </div>
            <div className={"custom-control-inline"}>
              <input type="radio" id="isValueAddedCrafetd" className="custom-control-input"
                value="null"
                checked={isValueAddedCrafted === null && craftedProduction !== ""}
                onChange={this.onIsValueAddedCraftedChange} />
              <label className="custom-control-label">Partiellement</label>
            </div>
            <div className={"custom-control-inline"}>
              <input type="radio" id="isValueAddedCrafetd" className="custom-control-input"
                value="false"
                checked={isValueAddedCrafted === false}
                onChange={this.onIsValueAddedCraftedChange} />
              <label className="custom-control-label">Non</label>
            </div>
          </div>
          <div className="form-group">
            <label>Part de la valeur ajoutée artisanale</label>
            <InputNumber value={roundValue(craftedProduction, 0)}
              onUpdate={this.updateCraftedProduction.bind(this)}
              disabled={isValueAddedCrafted != null} placeholder="&euro;" />
          </div>
        </div>
        <div className="form-group">
            <label>Informations complémentaires</label>
            <textarea type="text" spellCheck="false" className='form-input'
              value={info}
              onChange={this.updateInfo}
              onBlur={this.saveInfo} />
          </div>
        <div className="statement-action">
          <button disabled={!isValid} className={"btn btn-secondary"}
            onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    )
  }

  onIsValueAddedCraftedChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        this.props.impactsData.isValueAddedCrafted = true;
        this.props.impactsData.craftedProduction = this.props.impactsData.netValueAdded;
        break;
      case "null":
        this.props.impactsData.isValueAddedCrafted = null;
        this.props.impactsData.craftedProduction = null;
        break;
      case "false":
        this.props.impactsData.isValueAddedCrafted = false;
        this.props.impactsData.craftedProduction = 0;
        break;
    }
    this.setState({ craftedProduction: this.props.impactsData.craftedProduction });
    this.props.onUpdate("art");
  }

  updateCraftedProduction = (input) => {
    this.props.impactsData.craftedProduction = input;
    this.setState({ craftedProduction: this.props.impactsData.craftedProduction });
    this.props.onUpdate("art");
  }

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => this.props.impactsData.comments.art = this.state.info;

  onValidate = () => this.props.onValidate()

}

export const writeStatementART = (doc, x, y, impactsData) => {
  doc.text("Valeur ajoutée artisanale : " + printValue(impactsData.craftedProduction, 0) + " €" + (impactsData.isValueAddedCrafted ? "*" : ""), x, y);
  if (impactsData.isValueAddedCrafted) {
    y += 6;
    doc.setFont("Helvetica", "italic");
    doc.text("*Les activités de l'entreprise sont déclarées artisanales / faisant appel à un savoir-faire reconnu", x, y);
    doc.setFont("Helvetica", "normal");
  }
  return y;
}