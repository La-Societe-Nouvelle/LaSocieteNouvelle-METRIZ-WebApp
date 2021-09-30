import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';
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
          <InputNumber value={greenhousesGazEmissions}
                       onUpdate={this.updateGreenhousesGazEmissions}/>
          <span>&nbsp;kgCO2e</span>
          <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Détails</button>
          </div>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={greenhousesGazEmissionsUncertainty}
                       onUpdate={this.updateGreenhousesGazEmissionsUncertainty}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  updateGreenhousesGazEmissions = (input) => {
    this.props.impactsData.setGreenhousesGazEmissions(input);
    this.setState({greenhousesGazEmissionsUncertainty: this.props.impactsData.greenhousesGazEmissionsUncertainty});
    this.props.onUpdate(this.props.impactsData);
  }

  updateGreenhousesGazEmissionsUncertainty = (input) => {
    this.props.impactsData.greenhousesGazEmissionsUncertainty = input;
    this.props.onUpdate(this.props.impactsData);
  }

}