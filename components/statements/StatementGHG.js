import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
export class StatementGHG extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      greenhousesGazEmissions: valueOrDefault(props.impactsData.greenhousesGazEmissions, ""),
      greenhousesGazEmissionsUncertainty: valueOrDefault(props.impactsData.greenhousesGazEmissionsUncertainty, ""),
    }
  }

  render() {
    const {greenhousesGazEmissions,greenhousesGazEmissionsUncertainty} = this.state;
    return (
      <div className="statement">
        <div className="statement-item">
          <label>Emissions directes de Gaz à effet de serre - SCOPE 1</label>
          <input className="input-value" 
                 value={greenhousesGazEmissions}
                 onChange={this.onEmissionsChange}
                 onBlur={this.onEmissionsBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;kgCO2e</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={greenhousesGazEmissionsUncertainty}
                 onChange={this.onEmissionsUncertaintyChange}
                 onBlur={this.onEmissionsUncertaintyBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onEmissionsChange = (event) => {
    this.setState({greenhousesGazEmissions: event.target.value})
  }
  onEmissionsBlur = (event) => {
    let emissions = parseFloat(event.target.value);
    this.props.impactsData.setGreenhousesGazEmissions(!isNaN(emissions) ? emissions : null);
    this.setState({greenhousesGazEmissionsUncertainty: valueOrDefault(this.props.impactsData.greenhousesGazEmissionsUncertainty, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  onEmissionsUncertaintyChange = (event) => {
    this.setState({greenhousesGazEmissionsUncertainty: event.target.value})
  }
  onEmissionsUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.impactsData.greenhousesGazEmissionsUncertainty = !isNaN(uncertainty) ? uncertainty : 25;
    this.props.onUpdate(this.props.impactsData);
  }

}