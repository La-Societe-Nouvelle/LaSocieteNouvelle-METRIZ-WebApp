import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';
export class StatementHAZ extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hazardousSubstancesConsumption: valueOrDefault(props.impactsData.hazardousSubstancesConsumption, ""),
      hazardousSubstancesConsumptionUncertainty: valueOrDefault(props.impactsData.hazardousSubstancesConsumption, ""),
    }
  }

  render() 
  {
    const {hazardousSubstancesConsumption,hazardousSubstancesConsumptionUncertainty} = this.state;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Utilisation de produits dangereux - santé/environnement</label>
          <InputNumber value={hazardousSubstancesConsumption}
                       onUpdate={this.updateHazardousSubstancesConsumption}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={hazardousSubstancesConsumptionUncertainty}
                       onUpdate={this.updateHazardousSubstancesConsumptionUncertainty}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  updateHazardousSubstancesConsumption = (input) => {
    this.props.impactsData.setHazardousSubstancesConsumption(input);
    this.setState({hazardousSubstancesConsumptionUncertainty: this.props.impactsData.hazardousSubstancesConsumptionUncertainty});
    this.props.onUpdate(this.props.impactsData);
  }

  updateHazardousSubstancesConsumptionUncertainty = (input) => {
    this.props.impactsData.hazardousSubstancesConsumptionUncertainty = input;
    this.props.onUpdate(this.props.impactsData);
  }
  
}