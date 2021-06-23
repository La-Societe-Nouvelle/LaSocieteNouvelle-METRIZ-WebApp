import React from 'react';

import {NumberInput} from '../NumberInput';

export class AssessmentWAT extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator : props.session.getValueAddedFootprint("wat"),
      versionItems: 0,
    }
  }

  render() {
    const {indicator,versionItems} = this.state;
    return (
      <table>
        <thead>
          <tr><td>Libelle</td><td>Valeur</td><td>Incertitude</td></tr>
        </thead>
        <tbody>
          <tr className="with-bottom-line">
              <td>Consommation totale d'eau (en m3)</td>
              <td className="column_value"><NumberInput key={versionItems} 
                               value={indicator.getTotalWaterConsumption()} 
                               onBlur={this.updateTotalWaterConsumtpion.bind(this)}/></td>
              <td className="column_value"><NumberInput key={versionItems}
                               value={indicator.getTotalWaterConsumptionUncertainty()} 
                               onBlur={this.updateUncertainty.bind(this)}/></td>
          </tr><tr>
               <td>Valeur ajoutée nette (en €)</td>
               <td className="column_value"><input value={printValue(indicator.getNetValueAdded())} disabled={true}/></td>
          </tr><tr>
               <td>Intensité (en L/€)</td>
               <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td>
               <td className="column_value"><input value={printValue(indicator.getUncertainty(),0)} disabled={true}/></td>
          </tr>
        </tbody>
      </table>
    ) 
  }

  updateTotalWaterConsumtpion = (event) => {
    let inputValue = parseFloat(event.target.value);
    let waterConsumption = !isNaN(inputValue) ? inputValue : null;
    this.state.indicator.setTotalWaterConsumption(waterConsumption);
    this.props.onUpdate(this.state.indicator);
    this.setState({versionItems: this.state.versionItems+1});
  }
  updateUncertainty = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.state.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.state.indicator);
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}