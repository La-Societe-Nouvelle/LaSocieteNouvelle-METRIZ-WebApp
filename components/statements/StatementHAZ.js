import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
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
          <input className="input-value" 
                 value={hazardousSubstancesConsumption}
                 onChange={this.onConsumptionChange}
                 onBlur={this.onConsumptionBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={hazardousSubstancesConsumptionUncertainty}
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
    this.setState({hazardousSubstancesConsumption: event.target.value});
  }
  onConsumptionBlur = (event) => {
    let consumption = parseFloat(event.target.value);
    this.props.impactsData.setHazardousSubstancesConsumption(!isNaN(consumption) ? consumption : null);
    this.setState({hazardousSubstancesConsumptionUncertainty: valueOrDefault(this.props.impactsData.hazardousSubstancesConsumptionUncertainty, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  onUncertaintyChange = (event) => {
    this.setState({hazardousSubstancesConsumptionUncertainty: event.target.value});
  }
  onUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.impactsData.hazardousSubstancesConsumptionUncertainty = !isNaN(uncertainty) ? uncertainty : 25;
    this.props.onUpdate(this.props.impactsData);
  }
  
}