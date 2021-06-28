import React from 'react';

import {NumberInput} from '../NumberInput';

export class AssessmentMAT extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("mat"),
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
              <td>Quantité extraite de matières premières (en kg)</td>
              <td className="column_value"><NumberInput 
                key={versionItems}
                value={indicator.getMaterials()} 
                onBlur={this.updateTotalMaterialsExtraction.bind(this)}/></td>
              <td className="column_value"><NumberInput 
                key={versionItems}
                value={indicator.getMaterialsUncertainty()} 
                onBlur={this.updateUncertainty.bind(this)}/></td>
            </tr><tr>
              <td>Valeur ajoutée nette (en €)</td>
              <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}/></td>
            </tr><tr>
              <td>Intensité (en g/€)</td>
              <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td>
              <td className="column_value"><input value={printValue(indicator.getUncertainty(),0)} disabled={true}/></td>
            </tr>
          </tbody>
        </table>
        <div>
          <h3>Notes</h3>
          <p>Grandeur mesurée : Quantité extraite de matières premières (en kg)</p>
          <p>Familles de matières premières :<br/>
            - Biomasse<br/>
            - Minerais métalliques<br/>
            - Minerais non métalliques<br/>
            - Matières fossiles</p>
          </div>
      </div>
    ) 
  }

  updateTotalMaterialsExtraction = (event) => {
    let materialsExtraction = parseFloat(event.target.value);
    this.state.indicator.setMaterials(!isNaN(materialsExtraction) ? Math.round(materialsExtraction) : null);
    this.props.onUpdate(this.state.indicator);
    this.setState({versionItems: this.state.versionItems+1});
  }
  updateUncertainty = (event) => {
    let uncertainty = parseFloat(value);
    this.state.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.state.indicator);
    this.setState({versionItems: this.state.versionItems+1});
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}