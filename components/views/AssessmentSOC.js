import React from 'react';

export class AssessmentSOC extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("soc"),
    }
  }

  render() {
    const indicator = this.state.indicator;
    return (
      <div>
        <table>
          <thead>
            <tr><td>Libelle</td>
                <td colSpan="2">Valeur</td></tr>
          </thead>
          <tbody>
            <tr className="with-bottom-line">
              <td>Raison d'être défini dans les statuts ? Entreprise de l'ESS ou d'utilité sociale ?</td>
              <td><input type="checkbox"
                          checked={indicator.getHasSocialPurpose()!=null ? indicator.getHasSocialPurpose() : false} 
                          onChange={this.onHasSocialPurposeChange}/></td></tr>
            <tr>
              <td>Valeur ajoutée nette</td>
              <td className="column_value">{printValue(indicator.getNetValueAdded(),0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>
            <tr>
              <td>Contribution directe</td>
              <td className="column_value">{printValue(indicator.getValue(),1)}</td>
              <td className="column_unit">&nbsp;%</td></tr>
          </tbody>
        </table>
        <div>
          <h3>Notes</h3>
          <p>Grandeur mesurée : Valeur nette créée par des acteurs d’intérêt social (en euros)</p>
          <p>L’impact direct à l’échelle d’une unité légale est nul ou équivalent à la valeur ajoutée nette selon l'existence ou non d’un intérêt social.</p>
          <p>Critères :<br/>
            - Structure de l’ESS (Economie Sociale et Solidaire)<br/>
            - Agrément ESUS (Entreprise Solidaire d'Utilité Sociale)<br/>
            - Entreprise à mission / Raison d’être inscrite dans les statuts de l’entreprise</p>
          <p>
            <a href="https://www.economie.gouv.fr/cedef/economie-sociale-et-solidaire" target="_blank">Qu'est-ce que l'économie sociale et solidaire ?</a><br/>
            <a href="https://www.economie.gouv.fr/entreprises/agrement-entreprise-solidaire-utilite-sociale-ess" target="_blank">Qu’est-ce que l’agrément « Entreprise solidaire d’utilité sociale » ?</a><br/>
            <a href="https://www.economie.gouv.fr/cedef/societe-mission" target="_blank">Que sont les sociétés à mission ?</a></p>
        </div>
      </div>
    ) 
  }

  onHasSocialPurposeChange = (event) => {
    this.state.indicator.setHasSocialPurpose(event.target.checked);
    this.props.onUpdate(this.state.indicator);
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}