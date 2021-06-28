import React from 'react';
import { NumberInput } from '../NumberInput';


export class AssessmentHAZ extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("haz"),
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
              <td>Utilisation de produits dangereux - santé/environnement (en kg)</td>
              <td className="column_value"><NumberInput 
                key={versionItems}
                value={indicator.getProductsUse()}
                onBlur={this.updateProductsUse.bind(this)}/></td>
              <td className="column_value"><NumberInput
                key={versionItems}
                value={indicator.getProductsUseUncertainty()} 
                onBlur={this.updateUncertainty.bind(this)}/></td>
            </tr>
            <tr>
              <td>Valeur ajoutée nette (en €)</td>
              <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}/></td></tr>
            <tr>
              <td>Intensité (en g/€)</td>
              <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td>
              <td className="column_value"><input value={printValue(indicator.getUncertainty(),0)} disabled={true}/></td>
            </tr>
          </tbody>
        </table>
        <div>
          <h3>Notes</h3>
          <p>Grandeur mesurée : Quantité utilisée de produits dangereux pour la santé et/ou l’environnement (en kg)</p>
          <p>Liste des dangers considérés :<br/>
            - Dangereux, nocif et irritant<br/>
            - Polluant pour l’environnement<br/>
            - Produit dangereux pour la santé<br/>
            - Toxique</p>
        </div>
      </div>
    ) 
  }

  updateProductsUse = (event) => {
    let productsUse = parseFloat(event.target.value);
    this.state.indicator.setHazard(!isNaN(productsUse) ? productsUse : null);
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