import React from 'react';

export class AssessmentKNW extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      RDProductionInput : props.indicator.getSpendings()!=null ? props.indicator.getSpendings() : "",
    }
  }

  render() {
    const {RDProductionInput} = this.state;
    return (
      <div className="assessment">
        <div className="assessment-item">
          <label>Valeur ajoutée nette dédiée à la recherche ou à la formation</label>
          <input className="input-value"
                 value={RDProductionInput} 
                 onChange={this.onRDProductionInputChange}
                 onBlur={this.onRDProductionInputBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;€</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onRDProductionInputChange = (event) => {
    this.setState({RDProductionInput: event.target.value});
  }
  onRDProductionInputBlur = (event) => {
    let RDProduction = parseFloat(event.target.value);
    this.props.indicator.setSpendings(!isNaN(RDProduction) ? RDProduction : null);
    this.props.onUpdate(this.props.indicator);
  }

}