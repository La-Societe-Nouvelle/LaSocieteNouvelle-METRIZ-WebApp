// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue, roundValue, valueOrDefault } from '../../src/utils/Utils';
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

  componentDidUpdate() 
  {
    if (this.state.researchAndTrainingContribution!=this.props.impactsData.researchAndTrainingContribution) {
      this.setState({researchAndTrainingContribution: this.props.impactsData.researchAndTrainingContribution});
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
          <InputNumber value={roundValue(researchAndTrainingContribution,1)} 
                       onUpdate={this.updateResearchAndTrainingContribution}/>
          <span>&nbsp;€</span>
          <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Outil d'évaluation</button>
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

export const writeStatementKNW = (doc,x,y,impactsData) =>
{
  doc.text("Valeur ajoutée artisanale : "+printValue(impactsData.craftedProduction,0)+" €"+(impactsData.isValueAddedCrafted ? "*" : ""),x,y);
  if (impactsData.isValueAddedCrafted)
  {
    y+=6;
    doc.setFont("Calibri","italic");
    doc.text("*Les activités de l'entreprise sont déclarées artisanales / faisant appel à un savoir-faire reconnu",x,y);
    doc.setFont("Calibri","normal");
  }
  return y;
}