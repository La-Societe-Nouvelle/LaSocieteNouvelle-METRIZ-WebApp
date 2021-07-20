import React from 'react';

export class AssessmentGEQ extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      wageGapInput: props.indicator.getWageGap()!=null ? props.indicator.getWageGap() : "",
    }
  }

  render() {
    const hasEmployees = this.props.indicator.getHasEmployees();
    const {wageGapInput} = this.state;
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
          <label>Ecart de rémunarations F/H (en % du taux horaire brut moyen)</label>
          <input className="input-value"
                 value={wageGapInput}
                 onChange={this.onWageGapChange}
                 onBlur={this.onWageGapBlur}
                 disabled={hasEmployees === false}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;%</span>
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
    this.state.wageGapInput = this.props.indicator.getWageGap()!=null ? this.props.indicator.getWageGap() : "";
  }

  onWageGapChange = (event) => {
    this.setState({wageGapInput: event.target.value});
  }

  onWageGapBlur = (event) => {
    let wageGap = parseFloat(event.target.value);
    this.props.indicator.setWageGap(!isNaN(wageGap) ? wageGap : null);
    this.props.onUpdate(this.props.indicator);
  }

}