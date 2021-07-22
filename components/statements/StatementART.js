import React from 'react';
export class StatementART extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      statement: props.indicator.getStatement() || "",
    }
  }

  render() {
    const {isValueAddedCrafted,craftedProduction} = this.props.indicator;
    const {statement} = this.state;
    return (
      <div className="statement">
        <div className="statement-item">
          <label>L'entreprise est-elle une entreprise artisanale ?</label>
          <div className="input-radio">
            <input type="radio" id="isValueAddedCrafetd"
                   value="true"
                   checked={isValueAddedCrafted === true}
                   onChange={this.onIsValueAddedCraftedChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="isValueAddedCrafetd"
                   value="null"
                   checked={craftedProduction != null}
                   onChange={this.onIsValueAddedCraftedChange}/>
            <label>Partiellement</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="isValueAddedCrafetd"
                   value="false"
                   checked={isValueAddedCrafted === false}
                   onChange={this.onIsValueAddedCraftedChange}/>
            <label>Non</label>
          </div>
        </div>
        <div className="statement-item">
          <label>Part de la valeur ajoutée artisanale</label>
          <input className="input-value"
                 value={statement} 
                 onChange={this.onStatementChange}
                 onBlur={this.onStatementBlur}
                 disabled={isValueAddedCrafted!=null}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;€</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onIsValueAddedCraftedChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": this.props.indicator.setIsValueAddedCrafted(true); break;
      case "null": this.props.indicator.setIsValueAddedCrafted(null); break;
      case "false": this.props.indicator.setIsValueAddedCrafted(false); break;
    }
    this.setState({statement: this.props.indicator.getStatement() || ""});
    this.props.onUpdate(this.props.indicator);
  }

  onStatementChange = (event) => {
    this.setState({statement: event.target.value});
  }
  onStatementBlur = (event) => {
    let craftedProduction = parseFloat(event.target.value);
    this.props.indicator.setStatement(!isNaN(craftedProduction) ? craftedProduction : null);
    this.props.onUpdate(this.props.indicator);
  }

}