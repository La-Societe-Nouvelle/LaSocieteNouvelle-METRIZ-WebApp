// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue, roundValue, valueOrDefault }  from '../../../../src/utils/Utils';
import { InputNumber } from '../../../input/InputNumber'; 


/* ---------- DECLARATION - INDIC #HAZ ---------- */

export class StatementHAZ extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      hazardousSubstancesConsumption: valueOrDefault(props.impactsData.hazardousSubstancesConsumption, ""),
      hazardousSubstancesConsumptionUncertainty: valueOrDefault(props.impactsData.hazardousSubstancesConsumption, ""),
      info : props.impactsData.comments.haz || ""
    }
  }

  componentDidUpdate() 
  {
    if (this.state.hazardousSubstancesConsumption!=this.props.impactsData.hazardousSubstancesConsumption) {
      this.setState({hazardousSubstancesConsumption: this.props.impactsData.hazardousSubstancesConsumption});
    }
    if (this.state.hazardousSubstancesConsumptionUncertainty!=this.props.impactsData.hazardousSubstancesConsumptionUncertainty) {
      this.setState({hazardousSubstancesConsumptionUncertainty: this.props.impactsData.hazardousSubstancesConsumptionUncertainty});
    }
  }

  render() 
  {
    const {netValueAdded} = this.props.impactsData;
    const {hazardousSubstancesConsumption,hazardousSubstancesConsumptionUncertainty,info} = this.state;

    let isValid = hazardousSubstancesConsumption!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className={"form-group small-input"}>
          <label>Utilisation de produits dangereux - santé/environnement</label>
          <InputNumber value={roundValue(hazardousSubstancesConsumption,0)}
                       onUpdate={this.updateHazardousSubstancesConsumption}
                       placeholder="KG"/>
        </div>
        <div className={"form-group small-input"}>
          <label>Incertitude</label>
          <InputNumber value={roundValue(hazardousSubstancesConsumptionUncertainty,0)}
                       onUpdate={this.updateHazardousSubstancesConsumptionUncertainty}
                       placeholder="%"/>
      </div>
        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <textarea type="text" spellCheck="false"
                    value={info} 
                    onChange={this.updateInfo}
                    onBlur={this.saveInfo}/>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid} className={"btn btn-secondary"}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  updateHazardousSubstancesConsumption = (input) => 
  {
    this.props.impactsData.setHazardousSubstancesConsumption(input);
    this.setState({hazardousSubstancesConsumptionUncertainty: this.props.impactsData.hazardousSubstancesConsumptionUncertainty});
    this.props.onUpdate("haz");
  }

  updateHazardousSubstancesConsumptionUncertainty = (input) => 
  {
    this.props.impactsData.hazardousSubstancesConsumptionUncertainty = input;
    this.props.onUpdate("haz");
  }
  
  updateInfo = (event) => this.setState({info: event.target.value});
  saveInfo = () => this.props.impactsData.comments.haz = this.state.info;
  
  onValidate = () => this.props.onValidate()
}

export const writeStatementHAZ = (doc,x,y,impactsData) =>
{
  doc.text("Quantité utilisée de produits dangereux : "+printValue(impactsData.hazardousSubstancesConsumption,0)+" kg +/- "+printValue(impactsData.hazardousSubstancesConsumptionUncertainty,0)+ " %",x,y);
  return y;
}