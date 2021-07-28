import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
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
          <input className="input-value" 
                 value={energyConsumption}
                 onChange={this.onConsumptionChange}
                 onBlur={this.onConsumptionBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;MJ</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={energyConsumptionUncertainty}
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
    this.setState({energyConsumption: event.target.value});
  }
  onConsumptionBlur = (event) => {
    let energyConsumption = parseFloat(event.target.value);
    this.props.impactsData.setEnergyConsumption(!isNaN(energyConsumption) ? energyConsumption : null);
    this.setState({energyConsumptionUncertainty: valueOrDefault(this.props.impactsData.energyConsumptionUncertainty, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  onUncertaintyChange = (event) => {
    this.setState({energyConsumptionUncertainty: event.target.value});
  }
  onUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.impactsData.energyConsumptionUncertainty = !isNaN(uncertainty) ? uncertainty : 25;
    this.props.onUpdate(this.props.impactsData);
  }

}