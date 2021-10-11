// La Société Nouvelle

// React
import React from 'react';

// Utils
import { roundValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #GHG ---------- */

export class StatementGHG extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      greenhousesGazEmissions: valueOrDefault(props.impactsData.greenhousesGazEmissions, ""),
      greenhousesGazEmissionsUncertainty: valueOrDefault(props.impactsData.greenhousesGazEmissionsUncertainty, ""),
    }
  }

  componentDidUpdate() 
  {
    if (this.state.greenhousesGazEmissions!=this.props.impactsData.greenhousesGazEmissions) {
      this.setState({greenhousesGazEmissions: this.props.impactsData.greenhousesGazEmissions});
    }
    if (this.state.greenhousesGazEmissionsUncertainty!=this.props.impactsData.greenhousesGazEmissionsUncertainty) {
      this.setState({greenhousesGazEmissionsUncertainty: this.props.impactsData.greenhousesGazEmissionsUncertainty});
    }
  }

  render() 
  {
    const {netValueAdded} = this.props.impactsData;
    const {greenhousesGazEmissions,greenhousesGazEmissionsUncertainty} = this.state;

    let isValid = greenhousesGazEmissions!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Emissions directes de Gaz à effet de serre - SCOPE 1</label>
          <InputNumber value={roundValue(greenhousesGazEmissions,0)}
                       onUpdate={this.updateGreenhousesGazEmissions}/>
          <span>&nbsp;kgCO2e</span>
          <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Outil d'évaluation</button>
          </div>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={roundValue(greenhousesGazEmissionsUncertainty,0)}
                       onUpdate={this.updateGreenhousesGazEmissionsUncertainty}/>
          <span>&nbsp;%</span>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  updateGreenhousesGazEmissions = (input) => 
  {
    this.props.impactsData.setGreenhousesGazEmissions(input);
    this.setState({greenhousesGazEmissionsUncertainty: this.props.impactsData.greenhousesGazEmissionsUncertainty});
    this.props.onUpdate("ghg");
  }

  updateGreenhousesGazEmissionsUncertainty = (input) => 
  {
    this.props.impactsData.greenhousesGazEmissionsUncertainty = input;
    this.props.onUpdate("ghg");
  }

  onValidate = () => this.props.onValidate()
}