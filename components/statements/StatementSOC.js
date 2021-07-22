import React from 'react';

export class StatementSOC extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const statement = this.props.indicator.getStatement();
    return (
      <div className="statement">
        <div className="statement-item">
          <label>L'entreprise est-elle d'utilité sociale ou dotée d'une raison d'être ?</label>
          <div className="input-radio">
            <input type="radio" id="hasSocialPurpose"
                   value="true"
                   checked={statement === true}
                   onChange={this.onStatementChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="hasSocialPurpose"
                   value="false"
                   checked={statement === false}
                   onChange={this.onStatementChange}/>
            <label>Non</label>
          </div>
        </div>
      </div>
    ) 
  }

  onStatementChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": this.props.indicator.setStatement(true); break;
      case "false": this.props.indicator.setStatement(false); break;
    }
    this.props.onUpdate(this.props.indicator);
  }

}