import React from 'react';
export class StatementDIS extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      statement: props.indicator.getStatement() || "",
    }
  }

  render() {
    const {hasEmployees} = this.props.indicator;
    const {statement} = this.state;
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
                 value={statement}
                 onChange={this.onStatementChange}
                 onBlur={this.onStatementBlur}
                 disabled={hasEmployees === false}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;/100</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onHasEmployeesChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": this.props.indicator.setHasEmployees(true); break;
      case "false": this.props.indicator.setHasEmployees(false); break;
    }
    this.setState({statement: this.props.indicator.getStatement() || ""})
    this.props.onUpdate(this.props.indicator);
  }

  onStatementChange = (event) => {
    this.setState({statement: event.target.value});
  }

  onStatementBlur = (event) => {
    let indexGini = parseFloat(event.target.value);
    this.props.indicator.setStatement(!isNaN(indexGini) ? indexGini : null);
    this.props.onUpdate(this.props.indicator);
  }

}