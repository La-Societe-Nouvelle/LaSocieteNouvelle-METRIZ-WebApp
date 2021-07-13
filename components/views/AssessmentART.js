import React from 'react';
import { NumberInput } from '../NumberInput';


export class AssessmentART extends React.Component {

  constructor(props) {
    super(props);
    let indicator = props.session.getValueAddedFootprint("art");
    this.state = {
      indicator: indicator,
      craftedProductionInput: indicator.getCraftedProduction()!=null ? indicator.getCraftedProduction() : "",
    }
  }

  render() {
    const {indicator,craftedProductionInput} = this.state;
    const isValueAddedCrafted = indicator.getIsValueAddedCrafted()!=null ? indicator.getIsValueAddedCrafted() : false;
    return (
      <div>
        <table>
          <thead>
            <tr><td>Libelle</td>
                <td colSpan="2">Valeur</td></tr>
          </thead>
          <tbody>
            <tr><td>Entreprise artisanale ?</td>
                <td><input type="checkbox"
                           checked={isValueAddedCrafted} 
                           onChange={this.onIsValueAddedCraftedChange}/></td></tr>
            <tr className="with-bottom-line"><td>Valeur ajoutée nette artisanale (en €)</td>
                <td className="column_value">
                  <input value={isValueAddedCrafted ? printValue(indicator.getNetValueAdded(),0) : craftedProductionInput} 
                         onChange={this.onCraftedProductionChange}
                         onBlur={this.onCraftedProductionBlur}
                         onKeyPress={this.onEnterPress}/></td>
                  <td className="column_unit">&nbsp;€</td></tr>
            <tr><td>Valeur ajoutée nette</td>
                <td className="column_value">{printValue(indicator.getNetValueAdded(),0)}</td>
                <td className="column_unit">&nbsp;€</td></tr>
            <tr><td>Contribution directe</td>
                <td className="column_value">{printValue(indicator.getValue(),1)}</td>
                <td className="column_unit">&nbsp;%</td></tr>
          </tbody>
        </table>
        <div>
          <h3>Notes</h3>
          <p>Grandeur mesurée : Valeur nette créée issue de l’artisanat ou d’un savoir-faire reconnu (en euros)</p>
          <p>Critères :<br/>
            - Activité principale répertoriée au registre des métiers / au sein de la Nomenclature d’Activités Française de secteur des métiers de l’Artisanat<br/>
            - Labellisation Entreprise du Patrimoine Vivant (EPV)</p>
          <p>
            <a href="https://www.entreprises.gouv.fr/fr/commerce-et-artisanat/la-nomenclature-d-activites-francaise-de-l-artisanat" target="_blank">La Nomenclature d'Activités Française de l'Artisanat</a><br/>
            <a href="https://www.entreprises.gouv.fr/fr/commerce-et-artisanat/dispositifs-et-labels/label-entreprise-du-patrimoine-vivant" target="_blank">Le label Entreprise du Patrimoine Vivant</a></p>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onIsValueAddedCraftedChange = (event) => {
    this.state.indicator.setIsValueAddedCrafted(event.target.checked);
    this.state.craftedProductionInput = this.state.indicator.getCraftedProduction();
    this.props.onUpdate(this.state.indicator);
  }

  onCraftedProductionChange = (event) => {
    this.state.indicator.setIsValueAddedCrafted(false);
    this.setState({craftedProductionInput: event.target.value});
  }
  onCraftedProductionBlur = (event) => {
    let craftedProduction = parseFloat(event.target.value);
    this.state.indicator.setCraftedProduction(!isNaN(craftedProduction) ? craftedProduction : null);
    this.props.onUpdate(this.state.indicator);
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}