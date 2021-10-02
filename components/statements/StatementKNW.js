// La Société Nouvelle

// React
import React from 'react';

// Utils
import { valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #KNW ---------- */

export class StatementKNW extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      researchAndTrainingContribution : valueOrDefault(props.impactsData.researchAndTrainingContribution, ""),
    }
  }

  render() 
  {
    const {netValueAdded} = this.props.impactsData;
    const {researchAndTrainingContribution} = this.state;

    let isValid = researchAndTrainingContribution!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Valeur ajoutée nette dédiée à la recherche ou à la formation</label>
          <InputNumber value={researchAndTrainingContribution} 
                       onUpdate={this.updateResearchAndTrainingContribution}/>
          <span>&nbsp;€</span>
          <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Détails</button>
          </div>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  updateResearchAndTrainingContribution = (input) => 
  {
    this.props.impactsData.researchAndTrainingContribution = input;
    this.props.onUpdate("knw");
  }

  onValidate = () => this.props.onValidate()
}