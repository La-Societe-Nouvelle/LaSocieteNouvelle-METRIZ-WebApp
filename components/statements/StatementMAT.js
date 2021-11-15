// La Société Nouvelle

// React
import React from 'react';

//Utils
import { printValue, roundValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #MAT ---------- */

export class StatementMAT extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      materialsExtraction: valueOrDefault(props.impactsData.materialsExtraction, ""),
      materialsExtractionUncertainty: valueOrDefault(props.impactsData.materialsExtractionUncertainty, ""),
      info : props.impactsData.comments.mat || ""
    }
  }

  componentDidUpdate() 
  {
    if (this.state.materialsExtraction!=this.props.impactsData.materialsExtraction) {
      this.setState({materialsExtraction: this.props.impactsData.materialsExtraction});
    }
    if (this.state.materialsExtractionUncertainty!=this.props.impactsData.materialsExtractionUncertainty) {
      this.setState({materialsExtractionUncertainty: this.props.impactsData.materialsExtractionUncertainty});
    }
  }

  render() 
  {
    const {isExtractiveActivities,netValueAdded} = this.props.impactsData;
    const {materialsExtraction,materialsExtractionUncertainty} = this.state;

    let isValid = materialsExtraction!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>L'entreprise réalisent-elles des activités agricoles ou extractives ?</label>
          <div className="input-radio">
            <input type="radio" id="isExtractiveActivities"
                   value="true"
                   checked={isExtractiveActivities === true}
                   onChange={this.onIsExtractiveActivitiesChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="isExtractiveActivities"
                   value="false"
                   checked={isExtractiveActivities === false}
                   onChange={this.onIsExtractiveActivitiesChange}/>
            <label>Non</label>
          </div>
        </div>
        <div className="statement-item">
          <label>Quantité extraite de matières premières</label>
          <InputNumber value={roundValue(materialsExtraction,0)}
                       disabled={isExtractiveActivities === false}
                       onUpdate={this.updateMaterialsExtraction}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={roundValue(materialsExtractionUncertainty,0)}
                       disabled={isExtractiveActivities === false}
                       onUpdate={this.updateMaterialsExtractionUncertainty}/>
          <span>&nbsp;%</span>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onIsExtractiveActivitiesChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.setIsExtractiveActivities(true);
        break;
      case "false": 
        this.props.impactsData.setIsExtractiveActivities(false); 
        break;
    }
    this.setState({
      materialsExtraction: valueOrDefault(this.props.impactsData.materialsExtraction, ""),
      materialsExtractionUncertainty: valueOrDefault(this.props.impactsData.materialsExtractionUncertainty, ""),
    })
  }

  updateMaterialsExtraction = (input) => 
  {
    this.props.impactsData.setMaterialsExtraction(input);
    this.setState({materialsExtractionUncertainty: this.props.impactsData.materialsExtractionUncertainty});
    this.props.onUpdate("mat");
  }

  updateMaterialsExtractionUncertainty = (input) => 
  {
    this.props.impactsData.materialsExtractionUncertainty = input;
    this.setState({materialsExtraction: this.props.impactsData.materialsExtraction});
    this.props.onUpdate("mat");
  }
  
  updateInfo = (event) => this.setState({info: event.target.value});
  saveInfo = () => this.props.impactsData.comments.mat = this.state.info;

  onValidate = () => this.props.onValidate()
}

export const writeStatementMAT = (doc,x,y,impactsData) =>
{
  doc.text("Quantité extraite de matières premières : "+printValue(impactsData.materialsExtraction,0)+" kg +/- "+printValue(impactsData.materialsExtractionUncertainty,0)+ " %",x,y);
  return y;
}