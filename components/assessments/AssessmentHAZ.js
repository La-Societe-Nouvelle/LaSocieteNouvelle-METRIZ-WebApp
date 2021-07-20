import React from 'react';

export class AssessmentHAZ extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      assessmentValue: props.indicator.getProductsUse() || "",
      uncertainty: props.indicator.getProductsUseUncertainty() || "",
    }
  }

  render() {
    const {assessmentValue,uncertainty} = this.state;
    return (
      <div className="assessment">
        <div className="assessment-item">
          <label>Utilisation de produits dangereux - santé/environnement</label>
          <input className="input-value" 
                 value={assessmentValue}
                 onChange={this.onAssessmentValueChange}
                 onBlur={this.onAssessmentValueBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="assessment-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={uncertainty}
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

  onAssessmentValueChange = (event) => {
    this.setState({assessmentValue: event.target.value});
  }
  onAssessmentValueBlur = (event) => {
    let assessmentValue = parseFloat(event.target.value);
    this.props.indicator.setHazard(!isNaN(assessmentValue) ? assessmentValue : null);
    this.props.onUpdate(this.props.indicator);
  }

  onUncertaintyChange = (event) => {
    this.setState({uncertainty: event.target.value});
  }
  onUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.props.indicator);
  }
  
}