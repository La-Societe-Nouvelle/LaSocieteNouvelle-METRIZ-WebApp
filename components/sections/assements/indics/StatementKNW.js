// La Société Nouvelle

// React
import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator } from "@fortawesome/free-solid-svg-icons";

// Utils
import { printValue, roundValue, valueOrDefault } from '../../../../src/utils/Utils';
import { InputNumber } from '../../../input/InputNumber'; 

/* ---------- DECLARATION - INDIC #KNW ---------- */

export class StatementKNW extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      researchAndTrainingContribution : valueOrDefault(props.impactsData.researchAndTrainingContribution, ""),
      info : props.impactsData.comments.knw || ""
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
                       placeholder="&euro;"/>
        </div>
        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <textarea type="text" spellCheck="false"
                    value={info} 
                    onChange={this.updateInfo}
                    onBlur={this.saveInfo}/>
        </div>
        <div className="statement-validation">
        <button className={"btn btn-primary"} onClick={this.props.toAssessment}>
        <FontAwesomeIcon icon={faCalculator} />
          Outil d'évaluation</button>
          <button disabled={!isValid} className={"btn btn-secondary"}
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
  
  updateInfo = (event) => this.setState({info: event.target.value});
  saveInfo = () => this.props.impactsData.comments.knw = this.state.info;

  onValidate = () => this.props.onValidate()
}

export const writeStatementKNW = (doc,x,y,impactsData) =>
{
  doc.text("Contribution directe à l'évolution des compétences et des connaissances : "+printValue(impactsData.researchAndTrainingContribution,0)+" €",x,y);

  return y;
}