import React from 'react';
import { NumberInput } from '../NumberInput';


export class AssessmentECO extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("eco"),
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
          <tr className="with-bottom-line"><td>Valeur ajoutée nette produite en France (en €)</td>
              <td className="column_value"><NumberInput value={indicator.getDomesticProduction()}
                                onBlur={this.updateDomesticProduction.bind(this)}/></td></tr>
          <tr><td>Valeur ajoutée nette (en €)</td>
              <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}></input></td></tr>
          <tr><td>Contribution directe (en %)</td>
              <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td></tr>
        </tbody>
      </table>
    ) 
  }

  updateDomesticProduction = (event) => {
    let domesticProduction = parseFloat(event.target.value);
    this.state.indicator.setDomesticProduction(!isNaN(domesticProduction) ? domesticProduction : null);
    this.props.onUpdate(this.state.indicator);
  }
  
}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}