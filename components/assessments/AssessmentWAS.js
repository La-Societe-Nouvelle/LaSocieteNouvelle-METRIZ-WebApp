import React from 'react';

export class AssessmentWAS extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      wasteProductionInput: props.indicator.getTotalWasteProduction() || "",
      uncertaintyInput: props.indicator.getTotalWasteProductionUncertainty() || "",
    }
  }

  render() {
    const {wasteProductionInput,uncertaintyInput} = this.state;
    return (
      <div className="assessment">
        <div className="assessment-item">
          <label>Productiont totale de déchets (y compris DAOM)</label>
          <input className="input-value" 
                 value={wasteProductionInput} 
                 onChange={this.onWasteProductionChange}
                 onBlur={this.onWasteProductionBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;kg</span>
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

  onWasteProductionChange = (event) => {
    this.setState({wasteProductionInput: event.target.value});
  }
  onWasteProductionBlur = (event) => {
    let wasteProduction = parseFloat(event.target.value);
    this.props.indicator.setWaste(!isNaN(wasteProduction) ? wasteProduction : null);
    this.setState({uncertaintyInput: this.props.indicator.getTotalWasteProductionUncertainty() || ""})
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