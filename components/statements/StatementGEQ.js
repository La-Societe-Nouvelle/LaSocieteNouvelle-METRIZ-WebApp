// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue, roundValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #GEQ ---------- */

export class StatementGEQ extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      wageGap: valueOrDefault(props.impactsData.wageGap, ""),
      info : props.impactsData.comments.geq || ""
    }
  }

  componentDidUpdate() 
  {
    if (this.state.wageGap!=valueOrDefault(this.props.impactsData.wageGap, "")) {
      this.setState({wageGap: valueOrDefault(this.props.impactsData.wageGap, "")});
    }
  }

  render() 
  {
    const {hasEmployees,netValueAdded} = this.props.impactsData;
    const {wageGap,info} = this.state;

    let isValid = wageGap!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>L'entreprise est-elle employeur ?</label>
          <div className="input-radio">
            <input type="radio" id="hasEmployees"
                   value="true"
                   checked={hasEmployees === true}
                   onChange={this.onHasEmployeesChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="hasEmployees"
                   value="false"
                   checked={hasEmployees === false}
                   onChange={this.onHasEmployeesChange}/>
            <label>Non</label>
          </div>
        </div>
        <div className="statement-item">
          <label>Ecart de rémunarations F/H (en % du taux horaire brut moyen)</label>
          <InputNumber value={roundValue(wageGap,1)}
                       disabled={hasEmployees === false}
                       onUpdate={this.updateWageGap}/>
          <span>&nbsp;%</span>
          <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Outil d'évaluation</button>
          </div>
        </div>
        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <textarea type="text" spellCheck="false"
                    value={info} 
                    onChange={this.updateInfo}
                    onBlur={this.saveInfo}/>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  onHasEmployeesChange = (event) => 
  {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.setHasEmployees(true);
        this.props.impactsData.wageGap = null;
        break;
      case "false": 
        this.props.impactsData.setHasEmployees(false); 
        this.props.impactsData.wageGap = 0;
        break;
    }
    this.setState({wageGap: valueOrDefault(this.props.impactsData.wageGap, "")});
    this.props.onUpdate("geq");
    this.props.onUpdate("dis");
  }

  updateWageGap = (input) => 
  {
    this.props.impactsData.wageGap = input;
    this.setState({wageGap: this.props.impactsData.wageGap});
    this.props.onUpdate("geq");
  }
  
  updateInfo = (event) => this.setState({info: event.target.value});
  saveInfo = () => this.props.impactsData.comments.geq = this.state.info;

  onValidate = () => this.props.onValidate()
}

export const writeStatementGEQ = (doc,x,y,impactsData) =>
{
  doc.text("Ecart interne de rémunérations F/H : "+printValue(impactsData.wageGap,0)+" %"+(!impactsData.hasEmployees ? "*" : ""),x,y);
  if (!impactsData.hasEmployees)
  {
    y+=6;
    doc.setFont("Calibri","italic");
    doc.text("*L'entreprise est déclarée non-employeur",x,y);
    doc.setFont("Calibri","normal");
  }
  return y;
}