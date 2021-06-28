import React from 'react';

import {NumberInput} from '../NumberInput';

export class AssessmentKNW extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("knw"),
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
            <tr className="with-bottom-line">
              <td>Rémunérations brutes de recherche et formation (en €)</td>
              <td className="column_value"><NumberInput 
                value={indicator.getSpendings()} 
                onBlur={this.updateTotalContribution.bind(this)}/></td>
            </tr><tr>
              <td>Valeur ajoutée nette (en €)</td>
              <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}/></td></tr>
            <tr>
              <td>Contribution directe (en %)</td>
              <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td></tr>
          </tbody>
        </table>
        <div>
          <h3>Notes</h3>
          <p>Grandeur mesurée : Montant total des charges (hors charges externes) liées à la formation, l’éducation ou la recherche (en euros)</p>
          <p>L’impact direct à l’échelle d’une unité légale est nul ou équivalent à la valeur ajoutée nette selon l'existence ou non d’un intérêt social.</p>
          <p>Les postes de charges sont les suivants :<br/>
            - Rémunérations de contrat de formation : stage, alternance, contrat d’apprentissage<br/>
            - Rémunérations liées à l’encadrement de formation<br/>
            - Rémunérations liées à des travaux de recherche<br/>
            - Rémunérations liées à des partenariats avec des établissements de formation</p>
        </div>
      </div>
    ) 
  }

  updateTotalContribution = (event) => {
    let contribution = parseFloat(event.target.value);
    this.state.indicator.setSpendings(!isNaN(contribution) ? (Math.round(contribution*10)/10).toFixed(1) : null);
    this.props.onUpdate(this.state.indicator);
    this.forceUpdate();
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}