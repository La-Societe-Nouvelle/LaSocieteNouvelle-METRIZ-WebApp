import React from 'react';
import { printValueInput, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';
export class StatementKNW extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      researchAndTrainingContribution : valueOrDefault(props.impactsData.researchAndTrainingContribution, ""),
    }
  }

  render() 
  {
    const {researchAndTrainingContribution} = this.state;

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
      </div>
    ) 
  }

  updateResearchAndTrainingContribution = (input) => {
    this.props.impactsData.researchAndTrainingContribution = input;
    this.props.onUpdate(this.props.impactsData);
  }

}