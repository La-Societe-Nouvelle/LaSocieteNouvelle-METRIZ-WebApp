import React from 'react';

export class AssessmentDIS extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indexGiniInput: props.indicator.getIndexGini()!=null ? props.indicator.getIndexGini() : "",
    }
  }

  render() {
    const hasEmployees = this.props.indicator.getHasEmployees();
    const {indexGiniInput} = this.state;
    return (
      <div className="assessment">
        <div className="assessment-item">
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
        <div className="assessment-item">
          <label>Indice de GINI des taux horaires bruts</label>
          <input className="input-value"
                 value={indexGiniInput}
                 onChange={this.onIndexGiniChange}
                 onBlur={this.onIndexGiniBlur}
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
    this.props.onUpdate(this.props.indicator);
    this.state.indexGiniInput = this.props.indicator.getIndexGini()!=null ? this.props.indicator.getIndexGini() : "";
  }

  onIndexGiniChange = (event) => {
    this.setState({indexGiniInput: event.target.value});
  }

  onIndexGiniBlur = (event) => {
    let indexGini = parseFloat(event.target.value);
    this.props.indicator.setIndexGini(!isNaN(indexGini) ? indexGini : null);
    this.props.onUpdate(this.props.indicator);
  }

}