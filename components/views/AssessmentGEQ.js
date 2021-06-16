import React from 'react';
import { NumberInput } from '../NumberInput';


export class AssessmentGEQ extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("geq"),
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
          <tr className="with-bottom-line"><td>Ecart de rémunarations F/H (en % du taux horaire brut moyen)</td>
              <td className="column_value"><NumberInput value={indicator.getWageGap()}
                                onBlur={this.updateWageGap.bind(this)}/></td></tr>
          <tr><td>Valeur ajoutée nette (en €)</td>
              <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}/></td></tr>
          <tr><td>Contribution directe (en %)</td>
              <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td></tr>
        </tbody>
      </table>
    ) 
  }

  updateWageGap = (event) => {
    let wageGap = parseFloat(event.target.value);
    this.state.indicator.setWageGap(!isNaN(wageGap) ? wageGap : null);
    this.props.onUpdate(this.state.indicator);
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}