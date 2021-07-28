import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
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
          <input className="input-value" 
                 value={waterConsumption}
                 onChange={this.onConsumptionChange}
                 onBlur={this.onConsumptionBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;m3</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={waterConsumptionUncertainty}
                 onChange={this.onUncertaintyChange}
                 onBlur={this.onUncertaintyBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onConsumptionChange = (event) => {
    this.setState({waterConsumption: event.target.value});
  }
  onConsumptionBlur = (event) => {
    let waterConsumption = parseFloat(event.target.value);
    this.props.impactsData.setWaterConsumption(!isNaN(waterConsumption) ? waterConsumption : null);
    this.setState({waterConsumptionUncertainty: valueOrDefault(this.props.impactsData.waterConsumptionUncertainty, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  onUncertaintyChange = (event) => {
    this.setState({waterConsumptionUncertainty: event.target.value});
  }
  onUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.impactsData.waterConsumptionUncertainty = !isNaN(uncertainty) ? uncertainty : null;
    this.props.onUpdate(this.props.impactsData);
  }

}