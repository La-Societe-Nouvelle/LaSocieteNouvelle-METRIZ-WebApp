// La Société Nouvelle

// React
import React from 'react';

// Utils
import { roundValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #GEQ ---------- */

export class StatementGEQ extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      wageGap: valueOrDefault(props.impactsData.wageGap, ""),
    }
  }

  componentDidUpdate() 
  {
    if (this.state.wageGap!=this.props.impactsData.wageGap) {
      this.setState({wageGap: this.props.impactsData.wageGap});
    }
  }

  render() 
  {
    const {hasEmployees,netValueAdded} = this.props.impactsData;
    const {wageGap} = this.state;

    let isValid = wageGap!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>L'entreprise est-elle employeur ?</label>
          <div className="input-radio">
            <input type="radio" id="hasEmployees"
                   value="true"
                   checked={hasEmployees === true}
                   onChange={this.onHasEmployeesChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="hasEmployees"
                   value="false"
                   checked={hasEmployees === false}
                   onChange={this.onHasEmployeesChange}/>
            <label>Non</label>
          </div>
        </div>
        <div className="statement-item">
          <label>Ecart de rémunarations F/H (en % du taux horaire brut moyen)</label>
          <InputNumber value={roundValue(wageGap,1)}
                       disabled={hasEmployees === false}
                       onUpdate={this.updateWageGap}/>
          <span>&nbsp;%</span>
          <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Outil d'évaluation</button>
          </div>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  onHasEmployeesChange = (event) => 
  {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.setHasEmployees(true);
        this.props.impactsData.wageGap = null;
        break;
      case "false": 
        this.props.impactsData.setHasEmployees(false); 
        this.props.impactsData.wageGap = 0;
        break;
    }
    this.setState({wageGap: valueOrDefault(this.props.impactsData.wageGap, "")});
    this.props.onUpdate("geq");
    this.props.onUpdate("dis");
  }

  updateWageGap = (input) => 
  {
    this.props.impactsData.wageGap = input;
    this.setState({wageGap: this.props.impactsData.wageGap});
    this.props.onUpdate("geq");
  }

  onValidate = () => this.props.onValidate()
}