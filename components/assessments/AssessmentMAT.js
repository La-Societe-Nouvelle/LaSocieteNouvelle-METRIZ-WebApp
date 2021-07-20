import React from 'react';

export class AssessmentMAT extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      materialsExtractionInput: props.indicator.getMaterials()!=null ? props.indicator.getMaterials() : "",
      uncertaintyInput: props.indicator.getMaterialsUncertainty()!=null ? props.indicator.getMaterialsUncertainty() : "",
    }
  }

  render() {
    const isExtractiveActivities = this.props.indicator.getIsExtractiveActivities();
    const {materialsExtractionInput,uncertaintyInput} = this.state;
    return (
      <div className="assessment">
        <div className="assessment-item">
          <label>L'entreprise réalisent-elles des activités agricoles ou extractives ?</label>
          <div className="input-radio">
            <input type="radio" id="isExtractiveActivities"
                   value="true"
                   checked={isExtractiveActivities === true}
                   onChange={this.onIsExtractiveActivitiesChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="isExtractiveActivities"
                   value="false"
                   checked={isExtractiveActivities === false}
                   onChange={this.onIsExtractiveActivitiesChange}/>
            <label>Non</label>
          </div>
        </div>
        <div className="assessment-item">
          <label>Quantité extraite de matières premières</label>
          <input className="input-value"
                 value={materialsExtractionInput}
                 disabled={isExtractiveActivities === false}
                 onChange={this.onMaterialsExtractionChange}
                 onBlur={this.onMaterialsExtractionBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="assessment-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={uncertaintyInput}
                 disabled={isExtractiveActivities === false}
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

  onIsExtractiveActivitiesChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": this.props.indicator.setIsExtractiveActivities(true); break;
      case "false": this.props.indicator.setIsExtractiveActivities(false); break;
    }
    this.props.onUpdate(this.props.indicator);
    this.state.materialsExtractionInput = this.props.indicator.getMaterials()!=null ? this.props.indicator.getMaterials() : "";
    this.state.materialsExtractionUncertaintyInput = this.props.indicator.getMaterialsUncertainty()!=null ? this.props.indicator.getMaterialsUncertainty() : "";
  }

  onMaterialsExtractionChange = (event) => {
    //this.state.indicator.setIsExtractiveActivities(true);
    this.setState({materialsExtractionInput: event.target.value});
  }
  onMaterialsExtractionBlur = (event) => {
    let materialsExtraction = parseFloat(event.target.value);
    this.props.indicator.setMaterials(!isNaN(materialsExtraction) ? materialsExtraction : null);
    this.setState({uncertaintyInput: this.props.indicator.getMaterialsUncertainty()!=null ? this.props.indicator.getMaterialsUncertainty() : ""})
    this.props.onUpdate(this.props.indicator);
  }

  onUncertaintyChange = (event) => {
    this.setState({uncertaintyInput: event.target.value})
  }
  onUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.props.indicator);
  }

}