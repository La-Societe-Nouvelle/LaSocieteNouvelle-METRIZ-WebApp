import React from 'react';
export class StatementMAT extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      statement: props.indicator.getStatement() || "",
      uncertainty: props.indicator.getStatementUncertainty() || "",
    }
  }

  render() {
    const {isExtractiveActivities} = this.props.indicator;
    const {statement,uncertainty} = this.state;
    return (
      <div className="statement">
        <div className="statement-item">
          <label>L'entreprise réalisent-elles des activités agricoles ou extractives ?</label>
          <div className="input-radio">
            <input type="radio" id="isExtractiveActivities"
                   value="true"
                   checked={isExtractiveActivities === true}
                   onChange={this.onIsExtractiveActivitiesChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="isExtractiveActivities"
                   value="false"
                   checked={isExtractiveActivities === false}
                   onChange={this.onIsExtractiveActivitiesChange}/>
            <label>Non</label>
          </div>
        </div>
        <div className="statement-item">
          <label>Quantité extraite de matières premières</label>
          <input className="input-value"
                 value={statement}
                 disabled={isExtractiveActivities === false}
                 onChange={this.onStatementChange}
                 onBlur={this.onStatementBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={uncertainty}
                 disabled={isExtractiveActivities === false}
                 onChange={this.onUncertaintyChange}
                 onBlur={this.onUncertaintyBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onIsExtractiveActivitiesChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": this.props.indicator.setIsExtractiveActivities(true); break;
      case "false": this.props.indicator.setIsExtractiveActivities(false); break;
    }
    this.setState({
      statement: this.props.indicator.getStatement() || "",
      uncertainty: this.props.indicator.getStatementUncertainty() || "",
    })
    this.props.onUpdate(this.props.indicator);
  }

  onStatementChange = (event) => {
    this.setState({statement: event.target.value});
  }
  onStatementBlur = (event) => {
    let materialsExtraction = parseFloat(event.target.value);
    this.props.indicator.setStatement(!isNaN(materialsExtraction) ? materialsExtraction : null);
    this.setState({uncertainty: this.props.indicator.getStatementUncertainty() || ""})
    this.props.onUpdate(this.props.indicator);
  }

  onUncertaintyChange = (event) => {
    this.setState({uncertainty: event.target.value})
  }
  onUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.props.indicator);
  }

}