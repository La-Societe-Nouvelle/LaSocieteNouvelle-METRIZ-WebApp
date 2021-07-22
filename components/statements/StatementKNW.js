import React from 'react';
export class StatementKNW extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      statement : props.indicator.getStatement() || "",
    }
  }

  render() {
    const {statement} = this.state;
    return (
      <div className="statement">
        <div className="statement-item">
          <label>Valeur ajoutée nette dédiée à la recherche ou à la formation</label>
          <input className="input-value"
                 value={statement} 
                 onChange={this.onStatementChange}
                 onBlur={this.onStatementBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;€</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onStatementChange = (event) => {
    this.setState({statement: event.target.value});
  }
  onStatementBlur = (event) => {
    let statement = parseFloat(event.target.value);
    this.props.indicator.setStatement(!isNaN(statement) ? statement : null);
    this.props.onUpdate(this.props.indicator);
  }

}