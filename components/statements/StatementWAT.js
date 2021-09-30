import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';
export class StatementWAT extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      waterConsumption: valueOrDefault(props.impactsData.waterConsumption, ""),
      waterConsumptionUncertainty: valueOrDefault(props.impactsData.waterConsumptionUncertainty, ""),
    }
  }

  render() 
  {
    const {waterConsumption,waterConsumptionUncertainty} = this.state;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Consommation totale d'eau</label>
          <InputNumber value={waterConsumption}
                       onUpdate={this.updateWaterConsumption}/>
          <span>&nbsp;m3</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={waterConsumptionUncertainty}
                       onUpdate={this.updateWaterConsumptionUncertainty}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  updateWaterConsumption = (input) => {
    this.props.impactsData.setWaterConsumption(input);
    this.setState({waterConsumptionUncertainty: this.props.impactsData.waterConsumptionUncertainty});
    this.props.onUpdate(this.props.impactsData);
  }

  updateWaterConsumptionUncertainty = (input) => {
    this.props.impactsData.waterConsumptionUncertainty = input;
    this.props.onUpdate(this.props.impactsData);
  }

}