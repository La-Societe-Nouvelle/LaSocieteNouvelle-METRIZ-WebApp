import React from 'react';

export class AssessmentNRG extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      energyConsumptionInput: props.indicator.getEnergy() || "",
      uncertaintyInput: props.indicator.getEnergyUncertainty() || "",
    }
  }

  render() {
    const {energyConsumptionInput,uncertaintyInput} = this.state;
    return (
      <div className="assessment">
        <div className="assessment-item">
          <label>Consommation totale d'énergie</label>
          <input className="input-value" 
                 value={energyConsumptionInput}
                 onChange={this.onEnergyConsumptionChange}
                 onBlur={this.onEnergyConsumptionBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;MJ</span>
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

  onEnergyConsumptionChange = (event) => {
    this.setState({energyConsumptionInput: event.target.value});
  }
  onEnergyConsumptionBlur = (event) => {
    let energyConsumption = parseFloat(event.target.value);
    this.props.indicator.setEnergy(!isNaN(energyConsumption) ? energyConsumption : null);
    this.setState({uncertaintyInput: this.props.indicator.getEnergyUncertainty() || ""})
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