import React from 'react';
import { NumberInput } from '../NumberInput';


export class AssessmentGEQ extends React.Component {

  constructor(props) {
    super(props);
    let indicator = props.session.getValueAddedFootprint("geq");
    this.state = {
      indicator: indicator,
      wageGapInput: indicator.getWageGap()!=null ? indicator.getWageGap() : "",
    }
  }

  render() {
    const {indicator,wageGapInput} = this.state;
    const hasEmployees = indicator.getHasEmployees()!=null ? indicator.getHasEmployees() : false;
    return (
      <div>
        <table>
          <thead>
            <tr><td>Libelle</td><td>Valeur</td></tr>
          </thead>
          <tbody>
            <tr><td>Entreprise employeur ?</td>
                  <td><input type="checkbox"
                                checked={hasEmployees} 
                                onChange={this.onHasEmployeesChange}/></td></tr>
            <tr className="with-bottom-line"><td>Ecart de rémunarations F/H (en % du taux horaire brut moyen)</td>
                <td className="column_value">
                  <input value={hasEmployees ? wageGapInput : 0}
                         onChange={this.onWageGapChange}
                         onBlur={this.onWageGapBlur}
                         onKeyPress={this.onEnterPress}/></td></tr>
            <tr><td>Valeur ajoutée nette (en €)</td>
                <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}/></td></tr>
            <tr><td>Indice relatif à la valeur ajoutée (en %)</td>
                <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td></tr>
          </tbody>
        </table>
        <div>
          <h3>Notes</h3>
          <p>Grandeur mesurée : Ecart absolu entre le taux horaires moyens bruts des femmes et celui des hommes, en pourcentage du taux horaire brut moyen</p>
          <p>
            <a href="https://lasocietenouvelle.org/Tableur-Indicateurs-RH.xlsx" target="_blank">Tableur de calcul</a><br/></p>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onHasEmployeesChange = (event) => {
    this.state.indicator.setHasEmployees(event.target.checked);
    this.state.wageGapInput = event.target.checked ? "" : 0;
    this.props.onUpdate(this.state.indicator);
  }

  onWageGapChange = (event) => {
    this.state.indicator.setHasEmployees(true);
    this.setState({wageGapInput: event.target.value});
  }

  onWageGapBlur = (event) => {
    let wageGap = parseFloat(event.target.value);
    this.state.indicator.setWageGap(!isNaN(wageGap) ? wageGap : null);
    this.props.onUpdate(this.state.indicator);
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}