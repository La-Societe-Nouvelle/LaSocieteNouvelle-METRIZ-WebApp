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
      info : props.impactsData.comments.wat || ""
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
    const {waterConsumption,waterConsumptionUncertainty,info} = this.state;

    let isValid = waterConsumption!=null && netValueAdded!=null;

    return (
      <div className="statement">
          <div className="statement-form">
            <div className="form-group">
              <label>Consommation totale d'eau</label>
              <InputNumber value={roundValue(waterConsumption,0)}
                          onUpdate={this.updateWaterConsumption}
                          placeholder="m³"
                          />
            </div>
            <div className="form-group">
              <label>Incertitude</label>
              <InputNumber value={roundValue(waterConsumptionUncertainty,0)}
                          onUpdate={this.updateWaterConsumptionUncertainty}
                          placeholder="%"
                          />
            </div>

          </div>
        
          <div className="statement-comments">
            <label>Informations complémentaires</label>
            <textarea className="form-input" type="text" spellCheck="false"
                      value={info} 
                      onChange={this.updateInfo}
                      onBlur={this.saveInfo}/>
          </div>
        <div className="statement-validation">
          <button disabled={!isValid} className={"btn btn-secondary"}
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
  
  updateInfo = (event) => this.setState({info: event.target.value});
  saveInfo = () => this.props.impactsData.comments.wat = this.state.info;

  onValidate = () => this.props.onValidate()
}

export const writeStatementWAT = (doc,x,y,impactsData) =>
{
  doc.text("Consommation d'eau déclarée : "+printValue(impactsData.waterConsumption,0)+" m3 +/- "+printValue(impactsData.waterConsumptionUncertainty,0)+ " %",x,y);
  return y;
}