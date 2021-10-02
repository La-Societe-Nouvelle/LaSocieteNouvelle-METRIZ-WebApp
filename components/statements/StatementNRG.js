// La Société Nouvelle

// React
import React from 'react';

// Utils
import { valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #NRG ---------- */

export class StatementNRG extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      energyConsumption: valueOrDefault(props.impactsData.energyConsumption, ""),
      energyConsumptionUncertainty: valueOrDefault(props.impactsData.energyConsumptionUncertainty, ""),
    }
  }

  componentDidUpdate() 
  {
    if (this.state.energyConsumption!=this.props.impactsData.energyConsumption) {
      this.setState({energyConsumption: this.props.impactsData.energyConsumption});
    }
    if (this.state.energyConsumptionUncertainty!=this.props.impactsData.energyConsumptionUncertainty) {
      this.setState({energyConsumptionUncertainty: this.props.impactsData.energyConsumptionUncertainty});
    }
  }

  render() 
  {
    const {netValueAdded} = this.props.impactsData;
    const {energyConsumption,energyConsumptionUncertainty} = this.state;

    let isValid = energyConsumption!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Consommation totale d'énergie</label>
          <InputNumber value={energyConsumption}
                       onUpdate={this.updateEnergyConsumption}/>
          <span>&nbsp;MJ</span>
          <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Outil de Mesure</button>
          </div>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={energyConsumptionUncertainty}
                       onUpdate={this.updateEnergyConsumptionUncertainty}/>
          <span>&nbsp;%</span>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  updateEnergyConsumption = (input) => 
  {
    this.props.impactsData.setEnergyConsumption(input);
    this.setState({energyConsumptionUncertainty: this.props.impactsData.energyConsumptionUncertainty});
    this.props.onUpdate("nrg");
  }

  updateEnergyConsumptionUncertainty = (input) => 
  {
    this.props.impactsData.energyConsumptionUncertainty = input;
    this.props.onUpdate("nrg");
  }

  onValidate = () => this.props.onValidate()
}