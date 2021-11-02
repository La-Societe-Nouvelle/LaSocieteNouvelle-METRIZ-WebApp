// La Société Nouvelle

// React
import React from 'react';

//Utils
import { printValue, roundValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #WAT ---------- */

export class StatementWAT extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      waterConsumption: valueOrDefault(props.impactsData.waterConsumption, ""),
      waterConsumptionUncertainty: valueOrDefault(props.impactsData.waterConsumptionUncertainty, ""),
    }
  }

  componentDidUpdate() 
  {
    if (this.state.waterConsumption!=this.props.impactsData.waterConsumption) {
      this.setState({waterConsumption: this.props.impactsData.waterConsumption});
    }
    if (this.state.waterConsumptionUncertainty!=this.props.impactsData.waterConsumptionUncertainty) {
      this.setState({waterConsumptionUncertainty: this.props.impactsData.waterConsumptionUncertainty});
    }
  }

  render() 
  {
    const {netValueAdded} = this.props.impactsData;
    const {waterConsumption,waterConsumptionUncertainty} = this.state;

    let isValid = waterConsumption!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Consommation totale d'eau</label>
          <InputNumber value={roundValue(waterConsumption,0)}
                       onUpdate={this.updateWaterConsumption}/>
          <span>&nbsp;m3</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={roundValue(waterConsumptionUncertainty,0)}
                       onUpdate={this.updateWaterConsumptionUncertainty}/>
          <span>&nbsp;%</span>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  updateWaterConsumption = (input) => 
  {
    this.props.impactsData.setWaterConsumption(input);
    this.setState({waterConsumptionUncertainty: this.props.impactsData.waterConsumptionUncertainty});
    this.props.onUpdate("wat");
  }

  updateWaterConsumptionUncertainty = (input) => 
  {
    this.props.impactsData.waterConsumptionUncertainty = input;
    this.props.onUpdate("wat");
  }

  onValidate = () => this.props.onValidate()
}

export const writeStatementWAT = (doc,x,y,impactsData) =>
{
  doc.text("Consommation d'eau déclarée : "+printValue(impactsData.waterConsumption,0)+" m3 +/- "+printValue(impactsData.waterConsumptionUncertainty,0)+ " %",x,y);
  return y;
}