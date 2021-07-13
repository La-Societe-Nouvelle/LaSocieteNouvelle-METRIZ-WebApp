import React from 'react';

import {NumberInput} from '../NumberInput';

export class AssessmentWAS extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("was"),
      versionItems: 0,
    }
  }

  render() {
    const {indicator,versionItems} = this.state;
    return (
      <div>
        <table>
          <thead>
            <tr><td>Libelle</td>
                <td colSpan="2">Valeur</td>
                <td colSpan="2">Incertitude</td></tr>
          </thead>
          <tbody>
            <tr className="with-bottom-line">
              <td>Productiont totale de déchets (en kg)</td>
              <td className="column_value"><NumberInput 
                key={this.state.versionItems}
                value={indicator.getTotalWasteProduction()} 
                onBlur={this.updateTotalWasteProduction.bind(this)}/></td>
              <td className="column_unit">&nbsp;kg</td>
              <td className="column_value"><NumberInput 
                key={this.state.versionItems}
                value={indicator.getTotalWasteProductionUncertainty()} 
                onBlur={this.updateUncertainty.bind(this)}/></td>
              <td className="column_unit">&nbsp;%</td>
            </tr><tr>
              <td>Valeur ajoutée nette</td>
              <td className="column_value">{printValue(indicator.getNetValueAdded(),0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>
            <tr>
              <td>Intensité de production de déchets</td>
              <td className="column_value">{printValue(indicator.getValue(),1)}</td>
              <td className="column_unit">&nbsp;g/€</td>
              <td className="column_value">{printValue(indicator.getUncertainty(),0)}</td>
              <td className="column_unit">&nbsp;%</td>
            </tr>
          </tbody>
        </table>
        <div>
          <h3>Notes</h3>
          <p>Grandeur mesurée : Quantité produite de déchets (en kg)</p>
          <p>Catégories de déchets :<br/>
            - Déchets dangereux<br/>
            - Déchets non-dangereux valorisés (recyclage, etc.)<br/>
            - Déchets non-dangereux non-valorisés</p>
          <p>Les co-produits ne sont pas comptabilisés. Un co-produit correspond à un produit / résidu de production non vendu et transmis à une autre société en vue d’être transformé, sans destruction, en un produit vendu.</p>
        </div>
      </div>
    ) 
  }

  updateTotalWasteProduction = (event) => {
    let wasteProduction = parseFloat(event.target.value);
    this.state.indicator.setWaste(!isNaN(wasteProduction) ? wasteProduction : null);
    this.props.onUpdate(this.state.indicator);
    this.setState({versionItems: this.state.versionItems+1})
  }
  updateUncertainty = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.state.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.state.indicator);
    this.setState({versionItems: this.state.versionItems+1})
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}