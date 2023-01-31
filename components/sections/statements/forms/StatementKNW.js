// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue, roundValue, valueOrDefault } from '../../../../src/utils/Utils';
import { InputNumber } from '../../../input/InputNumber'; 

/* ---------- DECLARATION - INDIC #KNW ---------- */

export class StatementKNW extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      researchAndTrainingContribution : valueOrDefault(props.impactsData.researchAndTrainingContribution, undefined),
      info : props.impactsData.comments.knw || " "
    }
  }

  componentDidUpdate() 
  {
    if (this.state.researchAndTrainingContribution!=this.props.impactsData.researchAndTrainingContribution) {
      this.setState({researchAndTrainingContribution: this.props.impactsData.researchAndTrainingContribution});
    }
  }

  render() 
  {
    const {netValueAdded} = this.props.impactsData;
    const {researchAndTrainingContribution,info} = this.state;

    let isValid = researchAndTrainingContribution!=null && netValueAdded!=null;
    return (
      <div className="statement">
        <div className={"form-group small-input"}>
          <label>Valeur ajoutée nette dédiée à la recherche ou à la formation</label>
          <InputNumber value={roundValue(researchAndTrainingContribution,1)} 
                       onUpdate={this.updateResearchAndTrainingContribution}
                       placeholder="&euro;"
                       />
        </div>
        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <textarea type="text" spellCheck="false"
                    value={info} 
                    onChange={this.updateInfo}
                    onBlur={this.saveInfo}/>
        </div>
        <div className="statement-validation">
        <button className="btn btn-primary btn-sm" onClick={this.props.toAssessment}><i className="bi bi-calculator"></i> Outil d'évaluation</button>
         <button disabled={!isValid} className="btn btn-secondary btn-sm" onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  updateResearchAndTrainingContribution = (input) => 
  {
    this.props.impactsData.researchAndTrainingContribution = input;
    this.props.onUpdate("knw");
  }
  
  updateInfo = (event) => this.setState({info: event.target.value});
  saveInfo = () => this.props.impactsData.comments.knw = this.state.info;

  onValidate = () => this.props.onValidate()
}

