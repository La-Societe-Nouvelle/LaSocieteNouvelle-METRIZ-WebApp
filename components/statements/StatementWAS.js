import React from 'react';
export class StatementWAS extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      statement: props.indicator.getStatement() || "",
      uncertainty: props.indicator.getStatementUncertainty() || "",
    }
  }

  render() {
    const {statement,uncertainty} = this.state;
    return (
      <div className="statement">
        <div className="statement-item">
          <label>Productiont totale de déchets (y compris DAOM<sup>1</sup>)</label>
          <input className="input-value" 
                 value={statement} 
                 onChange={this.onStatementChange}
                 onBlur={this.onStatementBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={uncertainty} 
                 onChange={this.onUncertaintyChange}
                 onBlur={this.onUncertaintyBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;%</span>
        </div>
        <div className="notes">
          <p><sup>1</sup> Déchets assimilés aux ordures ménagères</p>
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
    this.setState({uncertainty: this.props.indicator.getStatementUncertainty() || ""})
    this.props.onUpdate(this.props.indicator);
  }

  onUncertaintyChange = (event) => {
    this.setState({uncertainty: event.target.value});
  }
  onUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.props.indicator);
  }

}