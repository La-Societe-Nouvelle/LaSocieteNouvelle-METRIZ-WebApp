import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';
export class StatementNRG extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      energyConsumption: valueOrDefault(props.impactsData.energyConsumption, ""),
      energyConsumptionUncertainty: valueOrDefault(props.impactsData.energyConsumptionUncertainty, ""),
    }
  }

  render() 
  {
    const {energyConsumption,energyConsumptionUncertainty} = this.state;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Consommation totale d'énergie</label>
          <InputNumber value={energyConsumption}
                       onUpdate={this.updateEnergyConsumption}/>
          <span>&nbsp;MJ</span>
          <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Outil de Mesure</button>
          </div>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={energyConsumptionUncertainty}
                       onUpdate={this.updateEnergyConsumptionUncertainty}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  updateEnergyConsumption = (input) => {
    this.props.impactsData.setEnergyConsumption(input);
    this.setState({energyConsumptionUncertainty: this.props.impactsData.energyConsumptionUncertainty});
    this.props.onUpdate(this.props.impactsData);
  }

  updateEnergyConsumptionUncertainty = (input) => {
    this.props.impactsData.energyConsumptionUncertainty = input;
    this.props.onUpdate(this.props.impactsData);
  }

}