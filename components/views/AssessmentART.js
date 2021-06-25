import React from 'react';
import { NumberInput } from '../NumberInput';


export class AssessmentART extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("art"),
    }
  }

  render() {
    const indicator = this.state.indicator;
    return (
      <div>
        <table>
          <thead>
            <tr><td>Libelle</td><td>Valeur</td></tr>
          </thead>
          <tbody>
            <tr className="with-bottom-line"><td>Valeur ajoutée nette artisanale (en €)</td>
                <td className="column_value"><NumberInput value={indicator.getCraftedProduction()} onBlur={this.updateCraftedProduction.bind(this)}/></td></tr>
            <tr><td>Valeur ajoutée nette (en €)</td>
                <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}/></td></tr>
            <tr><td>Contribution directe (en %)</td>
                <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td></tr>
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

  updateCraftedProduction = (event) => {
    let craftedProduction = parseFloat(event.target.value);
    this.state.indicator.setCraftedProduction(!isNaN(craftedProduction) ? craftedProduction : null);
    this.props.onUpdate(this.state.indicator);
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}