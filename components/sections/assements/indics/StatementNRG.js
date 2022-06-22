// La Société Nouvelle

// React
import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator } from "@fortawesome/free-solid-svg-icons";
// Utils
import { printValue, roundValue, valueOrDefault } from '../../../../src/utils/Utils';
import { InputNumber } from '../../../input/InputNumber'; 

/* ---------- DECLARATION - INDIC #NRG ---------- */

export class StatementNRG extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      energyConsumption: valueOrDefault(props.impactsData.energyConsumption, ""),
      energyConsumptionUncertainty: valueOrDefault(props.impactsData.energyConsumptionUncertainty, ""),
      info : props.impactsData.comments.nrg || ""
    }
  }

  componentDidUpdate() 
  {
    if (this.state.energyConsumption!=this.props.impactsData.energyConsumption) {
      this.setState({energyConsumption: this.props.impactsData.energyConsumption});
    }
    if (this.state.energyConsumptionUncertainty!=this.props.impactsData.energyConsumptionUncertainty) {
      this.setState({energyConsumptionUncertainty: this.props.impactsData.energyConsumptionUncertainty});
    }
  }

  render() 
  {
    const {netValueAdded} = this.props.impactsData;
    const {energyConsumption,energyConsumptionUncertainty,info} = this.state;

    let isValid = energyConsumption!=null && netValueAdded!=null;

    return (
      <div className="statement">
                        <div className="statement-form">

        <div className="form-group">
          <label>Consommation totale d'énergie</label>
          <InputNumber value={roundValue(energyConsumption,0)}
                       onUpdate={this.updateEnergyConsumption} 
                       placeholder="MJ" />
 
        </div>
        <div className="form-group">
          <label>Incertitude</label>
          <InputNumber value={roundValue(energyConsumptionUncertainty,0)}
                       onUpdate={this.updateEnergyConsumptionUncertainty}
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
        <button className={"btn btn-primary"} onClick={this.props.toAssessment}>
          <FontAwesomeIcon icon={faCalculator} /> Outil d'évaluation</button>

          <button disabled={!isValid} className={"btn btn-secondary"}
                  onClick={this.onValidate}>Valider</button>
        </div>
       </div> 
    ) 
  }

  updateEnergyConsumption = (input) => 
  {
    this.props.impactsData.setEnergyConsumption(input);
    this.setState({energyConsumptionUncertainty: this.props.impactsData.energyConsumptionUncertainty});
    this.props.onUpdate("nrg");
  }

  updateEnergyConsumptionUncertainty = (input) => 
  {
    this.props.impactsData.energyConsumptionUncertainty = input;
    this.props.onUpdate("nrg");
  }
  
  updateInfo = (event) => this.setState({info: event.target.value});
  saveInfo = () => this.props.impactsData.comments.nrg = this.state.info;

  onValidate = () => this.props.onValidate()
}

export const writeStatementNRG = (doc,x,y,impactsData) =>
{
  doc.text("Consommation d'eau déclarée : "+printValue(impactsData.energyConsumption,0)+" MJ +/- "+printValue(impactsData.energyConsumptionUncertainty,0)+ " %",x,y);

  return y;
}