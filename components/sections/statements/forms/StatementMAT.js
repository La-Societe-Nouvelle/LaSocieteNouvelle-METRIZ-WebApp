// La Société Nouvelle

// React
import React from 'react';

//Utils
import { printValue, roundValue, valueOrDefault } from '../../../../src/utils/Utils';
import { InputNumber } from '../../../input/InputNumber'; 

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
    const {materialsExtraction,materialsExtractionUncertainty,info} = this.state;

    let isValid = materialsExtraction!=null && netValueAdded!=null;

    return (
      <div className="statement">
                <div className="statement-form">

        <div className="form-group">
          <label>L'entreprise réalisent-elles des activités agricoles ou extractives ?</label>
          <div className={"custom-control-inline"}>
            <input type="radio" id="isExtractiveActivities" className="custom-control-input"
                   value="true"
                   checked={isExtractiveActivities === true}
                   onChange={this.onIsExtractiveActivitiesChange}/>
            <label className="custom-control-label">Oui</label>
          </div>
          <div className={"custom-control-inline"}>
            <input type="radio" id="isExtractiveActivities" className="custom-control-input"
                   value="false"
                   checked={isExtractiveActivities === false}
                   onChange={this.onIsExtractiveActivitiesChange}/>
            <label className="custom-control-label">Non</label>
          </div>
        </div>
        <div className="form-group">
          <label>Quantité extraite de matières premières</label>
          <InputNumber value={roundValue(materialsExtraction,0)}
                       disabled={isExtractiveActivities === false}
                       onUpdate={this.updateMaterialsExtraction}
                       placeholder="KG"
                       />
        </div>
        <div className="form-group">
          <label>Incertitude</label>
          <InputNumber value={roundValue(materialsExtractionUncertainty,0)}
                       disabled={isExtractiveActivities === false}
                       onUpdate={this.updateMaterialsExtractionUncertainty}
                       placeholder="%"
                       />
        </div>


        </div>
        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <textarea type="text" spellCheck="false"
                    value={info} 
                    onChange={this.updateInfo}
                    onBlur={this.saveInfo}/>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid} className="btn btn-secondary btn-sm"
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