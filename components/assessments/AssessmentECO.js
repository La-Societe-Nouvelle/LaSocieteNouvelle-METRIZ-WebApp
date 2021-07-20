import React from 'react';

export class AssessmentECO extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      domesticProductionInput: props.indicator.getDomesticProduction()!=null ? props.indicator.getDomesticProduction() : "",
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.indicator.getDomesticProduction()!=prevProps.indicator.getDomesticProduction()) {
      this.setState({
        domesticProductionInput: props.indicator.getDomesticProduction()!=null ? indicator.getDomesticProduction() : "",
      })
    }
  }

  render() {
    const isAllActivitiesInFrance = this.props.indicator.getIsAllActivitiesInFrance();
    const {domesticProductionInput} = this.state;
    return (
      <div className="assessment">
        <div className="assessment-item">
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
                   checked={isAllActivitiesInFrance === null}
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
        <div className="assessment-item">
          <label>Valeur ajoutée nette produite en France</label>
          <input className="input-value"
                 value={domesticProductionInput}
                 onChange={this.onDomesticProductionChange}
                 onBlur={this.onDomesticProductionBlur}
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
    this.props.onUpdate(this.props.indicator);
    this.state.domesticProductionInput = this.props.indicator.getDomesticProduction()!=null ? this.props.indicator.getDomesticProduction() : "";
  }

  onDomesticProductionChange = (event) => {
    this.props.indicator.setIsAllActivitiesInFrance(false);
    this.setState({domesticProductionInput: event.target.value});
  }
  onDomesticProductionBlur = (event) => {
    let domesticProduction = parseFloat(event.target.value);
    this.props.indicator.setDomesticProduction(!isNaN(domesticProduction) ? domesticProduction : null);
    this.props.onUpdate(this.state.indicator);
  }
  
}