import React from 'react';

export class AssessmentWAT extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      waterConsumptionInput: props.indicator.getTotalWaterConsumption()!=null ? props.indicator.getTotalWaterConsumption() : "",
      uncertaintyInput: props.indicator.getTotalWaterConsumptionUncertainty()!=null ? props.indicator.getTotalWaterConsumptionUncertainty() : "",
    }
  }

  render() {
    const {waterConsumptionInput,uncertaintyInput} = this.state;
    return (
      <div className="assessment">
        <div className="assessment-item">
          <label>Consommation totale d'eau</label>
          <input className="input-value" 
                 value={waterConsumptionInput}
                 onChange={this.onWaterConsumptionChange}
                 onBlur={this.onWaterConsumptionBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;m3</span>
        </div>
        <div className="assessment-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={uncertaintyInput}
                 onChange={this.onUncertaintyChange}
                 onBlur={this.onUncertaintyBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onWaterConsumptionChange = (event) => {
    this.setState({waterConsumptionInput: event.target.value});
  }
  onWaterConsumptionBlur = (event) => {
    let waterConsumption = parseFloat(event.target.value);
    this.props.indicator.setTotalWaterConsumption(!isNaN(waterConsumption) ? waterConsumption : null);
    this.setState({uncertaintyInput: this.props.indicator.getTotalWaterConsumptionUncertainty()!=null ? this.props.indicator.getTotalWaterConsumptionUncertainty() : ""})
    this.props.onUpdate(this.props.indicator);
  }

  onUncertaintyChange = (event) => {
    this.setState({uncertaintyInput: event.target.value});
  }
  onUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.props.indicator);
  }

}