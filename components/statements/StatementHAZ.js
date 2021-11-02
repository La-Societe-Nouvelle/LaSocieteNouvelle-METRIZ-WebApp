// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue, roundValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #HAZ ---------- */

export class StatementHAZ extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      hazardousSubstancesConsumption: valueOrDefault(props.impactsData.hazardousSubstancesConsumption, ""),
      hazardousSubstancesConsumptionUncertainty: valueOrDefault(props.impactsData.hazardousSubstancesConsumption, ""),
    }
  }

  componentDidUpdate() 
  {
    if (this.state.hazardousSubstancesConsumption!=this.props.impactsData.hazardousSubstancesConsumption) {
      this.setState({hazardousSubstancesConsumption: this.props.impactsData.hazardousSubstancesConsumption});
    }
    if (this.state.hazardousSubstancesConsumptionUncertainty!=this.props.impactsData.hazardousSubstancesConsumptionUncertainty) {
      this.setState({hazardousSubstancesConsumptionUncertainty: this.props.impactsData.hazardousSubstancesConsumptionUncertainty});
    }
  }

  render() 
  {
    const {netValueAdded} = this.props.impactsData;
    const {hazardousSubstancesConsumption,hazardousSubstancesConsumptionUncertainty} = this.state;

    let isValid = hazardousSubstancesConsumption!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Utilisation de produits dangereux - santé/environnement</label>
          <InputNumber value={roundValue(hazardousSubstancesConsumption,0)}
                       onUpdate={this.updateHazardousSubstancesConsumption}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={roundValue(hazardousSubstancesConsumptionUncertainty,0)}
                       onUpdate={this.updateHazardousSubstancesConsumptionUncertainty}/>
          <span>&nbsp;%</span>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  updateHazardousSubstancesConsumption = (input) => 
  {
    this.props.impactsData.setHazardousSubstancesConsumption(input);
    this.setState({hazardousSubstancesConsumptionUncertainty: this.props.impactsData.hazardousSubstancesConsumptionUncertainty});
    this.props.onUpdate("haz");
  }

  updateHazardousSubstancesConsumptionUncertainty = (input) => 
  {
    this.props.impactsData.hazardousSubstancesConsumptionUncertainty = input;
    this.props.onUpdate("haz");
  }
  
  onValidate = () => this.props.onValidate()
}

export const writeStatementHAZ = (doc,x,y,impactsData) =>
{
  doc.text("Quantité utilisée de produits dangereux : "+printValue(impactsData.hazardousSubstancesConsumption,0)+" kg +/- "+printValue(impactsData.hazardousSubstancesConsumptionUncertainty,0)+ " %",x,y);
  return y;
}