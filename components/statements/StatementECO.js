import React from 'react';

export class StatementECO extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      statement: props.indicator.getStatement() || "",
    }
  }

  render() {
    const {isAllActivitiesInFrance,domesticProduction} = this.props.indicator;
    const {statement} = this.state;
    return (
      <div className="statement">
        <div className="statement-item">
          <label>Les activités de l'entreprise sont-elles localisées en France ?</label>
          <div className="input-radio">
            <input type="radio" id="isAllActivitiesInFrance"
                   value="true"
                   checked={isAllActivitiesInFrance === true}
                   onChange={this.onIsAllActivitiesInFranceChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="isAllActivitiesInFrance"
                   value="null"
                   checked={domesticProduction != null}
                   onChange={this.onIsAllActivitiesInFranceChange}/>
            <label>Partiellement</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="isAllActivitiesInFrance"
                   value="false"
                   checked={isAllActivitiesInFrance === false}
                   onChange={this.onIsAllActivitiesInFranceChange}/>
            <label>Non</label>
          </div>
        </div>
        <div className="statement-item">
          <label>Valeur ajoutée nette produite en France</label>
          <input className="input-value"
                 value={statement}
                 onChange={this.onStatementChange}
                 onBlur={this.onStatementBlur}
                 disabled={isAllActivitiesInFrance!=null}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;€</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onIsAllActivitiesInFranceChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": this.props.indicator.setIsAllActivitiesInFrance(true); break;
      case "null": this.props.indicator.setIsAllActivitiesInFrance(null); break;
      case "false": this.props.indicator.setIsAllActivitiesInFrance(false); break;
    }
    this.setState({statement: this.props.indicator.getStatement() || ""});
    this.props.onUpdate(this.props.indicator);
  }

  onStatementChange = (event) => {
    this.setState({statement: event.target.value});
  }
  onStatementBlur = (event) => {
    let domesticProduction = parseFloat(event.target.value);
    this.props.indicator.setStatement(!isNaN(domesticProduction) ? domesticProduction : null);
    this.props.onUpdate(this.props.indicator);
  }
  
}