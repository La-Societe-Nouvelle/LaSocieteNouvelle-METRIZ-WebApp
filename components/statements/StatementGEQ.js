import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
export class StatementGEQ extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      wageGap: valueOrDefault(props.impactsData.wageGap, ""),
    }
  }

  render() {
    const {hasEmployees} = this.props.impactsData;
    const {wageGap} = this.state;
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
          <input className="input-value"
                 value={wageGap}
                 onChange={this.onWageGapChange}
                 onBlur={this.onWageGapBlur}
                 disabled={hasEmployees === false}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onHasEmployeesChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.setHasEmployees(true); 
        break;
      case "false": 
        this.props.impactsData.setHasEmployees(false); 
        break;
    }
    this.setState({wageGap: valueOrDefault(this.props.impactsData.wageGap, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  onWageGapChange = (event) => {
    this.setState({wageGap: event.target.value});
  }
  onWageGapBlur = (event) => {
    let wageGap = parseFloat(event.target.value);
    this.props.impactsData.wageGap =!isNaN(wageGap) ? wageGap : null;
    this.props.onUpdate(this.props.impactsData);
  }

}