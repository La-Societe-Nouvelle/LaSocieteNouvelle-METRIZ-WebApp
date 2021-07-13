import React from 'react';
import { NumberInput } from '../NumberInput';


export class AssessmentDIS extends React.Component {

  constructor(props) {
    super(props);
    let indicator = props.session.getValueAddedFootprint("dis");
    this.state = {
      indicator: indicator,
      indexGiniInput: indicator.getIndexGini()!=null ? indicator.getIndexGini() : "",
    }
  }

  render() {
    const {indicator,indexGiniInput} = this.state;
    const hasEmployees = indicator.getHasEmployees()!=null ? indicator.getHasEmployees() : false;
    return (
      <div>
        <table>
          <thead>
            <tr><td>Libelle</td>
                <td colSpan="2">Valeur</td></tr>
          </thead>
          <tbody>
            <tr><td>Entreprise employeur ?</td>
                <td><input type="checkbox"
                              checked={hasEmployees} 
                              onChange={this.onHasEmployeesChange}/></td></tr>
            <tr className="with-bottom-line"><td>Indice de GINI des taux horaires bruts</td>
                <td className="column_value">
                  <input value={hasEmployees ? indexGiniInput : 0}
                         onChange={this.onIndexGiniChange}
                         onBlur={this.onIndexGiniBlur}
                         onKeyPress={this.onEnterPress}/></td>
                  <td className="column_unit">&nbsp;/100</td></tr>
            <tr><td>Valeur ajoutée nette</td>
                <td className="column_value">{printValue(indicator.getNetValueAdded(),0)}</td>
                <td className="column_unit">&nbsp;€</td></tr>
            <tr><td>Indice relatif à la valeur ajoutée</td>
                <td className="column_value">{printValue(indicator.getValue(),1)}</td>
                <td className="column_unit">&nbsp;/100</td></tr>
          </tbody>
        </table>
        <div>
          <h3>Notes</h3>
          <p>Grandeur mesurée : Indice de GINI des taux horaires bruts</p>
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
    this.state.indexGiniInput = event.target.checked ? "" : 0;
    this.props.onUpdate(this.state.indicator);
  }

  onIndexGiniChange = (event) => {
    this.state.indicator.setHasEmployees(true);
    this.setState({indexGiniInput: event.target.value});
  }

  onIndexGiniBlur = (event) => {
    let indexGini = parseFloat(event.target.value);
    this.state.indicator.setIndexGini(!isNaN(indexGini) ? indexGini : null);
    this.props.onUpdate(this.state.indicator);
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}