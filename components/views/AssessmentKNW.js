import React from 'react';

import {NumberInput} from '../NumberInput';

export class AssessmentKNW extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("knw"),
    }
  }

  render() {
    const indicator = this.state.indicator;
    return (
      <table>
        <thead>
          <tr><td>Libelle</td><td>Valeur</td></tr>
        </thead>
        <tbody>
          <tr className="with-bottom-line">
            <td>Rémunérations brutes de recherche et formation (en €)</td>
            <td className="column_value"><NumberInput 
              value={indicator.getSpendings()} 
              onBlur={this.updateTotalContribution.bind(this)}/></td>
          </tr><tr>
            <td>Valeur ajoutée nette (en €)</td>
            <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}/></td></tr>
          <tr>
            <td>Contribution directe (en %)</td>
            <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td></tr>
        </tbody>
      </table>
    ) 
  }

  updateTotalContribution = (event) => {
    let contribution = parseFloat(event.target.value);
    this.state.indicator.setSpendings(!isNaN(contribution) ? (Math.round(contribution*10)/10).toFixed(1) : null);
    this.props.onUpdate(this.state.indicator);
    this.forceUpdate();
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}