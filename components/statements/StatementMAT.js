import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
export class StatementMAT extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      materialsExtraction: valueOrDefault(props.impactsData.materialsExtraction, ""),
      materialsExtractionUncertainty: valueOrDefault(props.impactsData.materialsExtractionUncertainty, ""),
    }
  }

  render() 
  {
    const {isExtractiveActivities} = this.props.impactsData;
    const {materialsExtraction,materialsExtractionUncertainty} = this.state;

    return (
      <div className="statement">
        <div className="statement-item">
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
        <div className="statement-item">
          <label>Quantité extraite de matières premières</label>
          <input className="input-value"
                 value={materialsExtraction}
                 disabled={isExtractiveActivities === false}
                 onChange={this.onExtractionChange}
                 onBlur={this.onExtractionBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={materialsExtractionUncertainty}
                 disabled={isExtractiveActivities === false}
                 onChange={this.onUncertaintyChange}
                 onBlur={this.onUncertaintyBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onIsExtractiveActivitiesChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.setIsExtractiveActivities(true);
        break;
      case "false": 
        this.props.impactsData.setIsExtractiveActivities(false); 
        break;
    }
    this.setState({
      materialsExtraction: valueOrDefault(this.props.impactsData.materialsExtraction, ""),
      materialsExtractionUncertainty: valueOrDefault(this.props.impactsData.materialsExtractionUncertainty, ""),
    })
  }

  onExtractionChange = (event) => {
    this.setState({materialsExtraction: event.target.value});
  }
  onExtractionBlur = (event) => {
    let materialsExtraction = parseFloat(event.target.value);
    this.props.impactsData.setMaterialsExtraction(!isNaN(materialsExtraction) ? materialsExtraction : null);
    this.setState({materialsExtractionUncertainty: valueOrDefault(this.props.impactsData.materialsExtractionUncertainty, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  onUncertaintyChange = (event) => {
    this.setState({materialsExtractionUncertainty: event.target.value})
  }
  onUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.impactsData.materialsExtractionUncertainty = !isNaN(uncertainty) ? uncertainty : 25;
    this.props.onUpdate(this.props.impactsData);
  }

}