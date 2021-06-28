import React from 'react';

import {NumberInput} from '../NumberInput';

export class AssessmentNRG extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("nrg"),
      versionItems: 0,
    }
  }

  render() {
    const {indicator,versionItems} = this.state;
    return (
      <div>
        <table>
          <thead>
            <tr><td>Libelle</td><td>Valeur</td><td>Incertitude</td></tr>
          </thead>
          <tbody>
            <tr className="with-bottom-line">
              <td>Consommation totale d'énergie (en MJ)</td>
              <td className="column_value"><NumberInput 
                key={versionItems}
                value={indicator.getEnergy()} 
                onBlur={this.updateTotalEnergyConsumption.bind(this)}/></td>
              <td className="column_value"><NumberInput
                key={versionItems}
                value={indicator.getEnergyUncertainty()} 
                onBlur={this.updateUncertainty.bind(this)}/></td>
            </tr>
            <tr>
              <td>Valeur ajoutée nette (en €)</td>
              <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}/></td>
            </tr><tr>
              <td>Intensité (en kJ/€)</td>
              <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td>
              <td className="column_value"><input value={printValue(indicator.getUncertainty(),0)} disabled={true}/></td>
            </tr>
          </tbody>
        </table>
        <div>
          <h3>Notes</h3>
          <p>Grandeur mesurée : Quantité d’énergie consommée (en MJ)</p>
          <p>Produits énergétiques comptabilisés :<br/>
            - Electricité<br/>
            - Energies fossiles (carburant, gaz, etc.)<br/>
            - Biomasse<br/>
            - Chaleur<br/>
            - Energies renouvelables transformées (éolien, photovoltaïque, etc.)</p>
        </div>
      </div>
    ) 
  }

  updateTotalEnergyConsumption = (event) => {
    let energyConsumption = parseFloat(event.target.value);
    this.state.indicator.setEnergy(!isNaN(energyConsumption) ? energyConsumption : null);
    this.props.onUpdate(this.state.indicator);
    this.setState({versionItems: this.state.versionItems+1});
  }
  updateUncertainty = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.state.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.state.indicator);
    this.setState({versionItems: this.state.versionItems+1});
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}