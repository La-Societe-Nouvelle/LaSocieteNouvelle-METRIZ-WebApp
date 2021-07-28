import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
export class StatementDIS extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indexGini: valueOrDefault(props.impactsData.indexGini, ""),
    }
  }

  render() 
  {
    const {hasEmployees} = this.props.impactsData;
    const {indexGini} = this.state;

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
          <label>Indice de GINI des taux horaires bruts</label>
          <input className="input-value"
                 value={indexGini}
                 onChange={this.onIndexGiniChange}
                 onBlur={this.onIndexGiniBlur}
                 disabled={hasEmployees === false}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;/100</span>
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
    this.setState({indexGini: valueOrDefault(this.props.impactsData.indexGini, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  onIndexGiniChange = (event) => {
    this.setState({indexGini: event.target.value});
  }

  onIndexGiniBlur = (event) => {
    let indexGini = parseFloat(event.target.value);
    this.props.impactsData.indexGini = !isNaN(indexGini) ? indexGini : null;
    this.props.onUpdate(this.props.impactsData);
  }

}