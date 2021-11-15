// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue, roundValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

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
        <div className="statement-item">
          <label>Consommation totale d'énergie</label>
          <InputNumber value={roundValue(energyConsumption,0)}
                       onUpdate={this.updateEnergyConsumption}/>
          <span>&nbsp;MJ</span>
          <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Outil d'évaluation</button>
          </div>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={roundValue(energyConsumptionUncertainty,0)}
                       onUpdate={this.updateEnergyConsumptionUncertainty}/>
          <span>&nbsp;%</span>
        </div>
        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <textarea type="text" spellCheck="false"
                    value={info} 
                    onChange={this.updateInfo}
                    onBlur={this.saveInfo}/>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
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