import React from 'react';

import {NumberInput} from '../NumberInput';

export class AssessmentMAT extends React.Component {

  constructor(props) {
    super(props);
    let indicator = props.session.getValueAddedFootprint("mat");
    this.state = {
      indicator: indicator,
      materialsExtractionInput: indicator.getMaterials()!=null ? indicator.getMaterials() : "",
      versionItems: 0,
    }
  }

  render() {
    const {indicator, materialsExtractionInput, versionItems} = this.state;
    const isExtractiveActivities = indicator.getIsExtractiveActivities()!=null ? indicator.getIsExtractiveActivities() : false;
    return (
      <div>
        <table>
          <thead>
            <tr><td>Libelle</td>
                <td colSpan="2">Valeur</td>
                <td colSpan="2">Incertitude</td></tr>
          </thead>
          <tbody>
            <tr><td>Activités extractrives ou agricoles ?</td>
                <td><input type="checkbox"
                              checked={isExtractiveActivities} 
                              onChange={this.onIsExtractiveActivitiesChange}/></td></tr>
            <tr className="with-bottom-line">
              <td>Quantité extraite de matières premières (en kg)</td>
              <td className="column_value">
                <input 
                  key={versionItems}
                  value={materialsExtractionInput}
                  onChange={this.onMaterialsExtractionChange}
                  onBlur={this.onMaterialsExtractionBlur}
                  onKeyPress={this.onEnterPress}/></td>
              <td className="column_unit">&nbsp;kg</td>
              <td className="column_value"><NumberInput 
                key={versionItems}
                value={indicator.getMaterialsUncertainty()} 
                onBlur={this.updateUncertainty.bind(this)}/></td>
              <td className="column_unit">&nbsp;%</td>
            </tr><tr>
              <td>Valeur ajoutée nette</td>
              <td className="column_value">{printValue(indicator.getNetValueAdded(),0)}</td>
              <td className="column_unit">&nbsp;€</td>
            </tr><tr>
              <td>Intensité d'extraction de matières premières</td>
              <td className="column_value">{printValue(indicator.getValue(),1)}</td>
              <td className="column_unit">&nbsp;g/€</td>
              <td className="column_value">{printValue(indicator.getUncertainty(),0)}</td>
              <td className="column_unit">&nbsp;%</td>
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

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onIsExtractiveActivitiesChange = (event) => {
    this.state.indicator.setIsExtractiveActivities(event.target.checked);
    this.state.materialsExtractionInput = event.target.checked ? "" : 0;
    this.props.onUpdate(this.state.indicator);
  }

  onMaterialsExtractionChange = (event) => {
    this.state.indicator.setIsExtractiveActivities(true);
    this.setState({materialsExtractionInput: event.target.value});
  }
  onMaterialsExtractionBlur = (event) => {
    let materialsExtraction = parseFloat(event.target.value);
    this.state.indicator.setMaterials(!isNaN(materialsExtraction) ? materialsExtraction : null);
    this.props.onUpdate(this.state.indicator);
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