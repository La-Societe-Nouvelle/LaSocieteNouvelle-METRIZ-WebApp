import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';

export class StatementECO extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      domesticProduction: valueOrDefault(props.impactsData.domesticProduction, ""),
    }
  }

  render() 
  {
    const {isAllActivitiesInFrance} = this.props.impactsData;
    const {domesticProduction} = this.state;
    
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
                   checked={isAllActivitiesInFrance === null && domesticProduction !== ""}
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
                 value={domesticProduction}
                 onChange={this.onDomesticProductionChange}
                 onBlur={this.onDomesticProductionBlur}
                 disabled={isAllActivitiesInFrance!=null}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;€</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onIsAllActivitiesInFranceChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.setIsAllActivitiesInFrance(true);
        break;
      case "null": 
        this.props.impactsData.setIsAllActivitiesInFrance(null); 
        break;
      case "false": 
        this.props.impactsData.setIsAllActivitiesInFrance(false); 
        break;
    }
    this.setState({domesticProduction: valueOrDefault(this.props.impactsData.domesticProduction, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  onDomesticProductionChange = (event) => {
    this.setState({domesticProduction: event.target.value});
  }
  onDomesticProductionBlur = (event) => {
    let domesticProduction = parseFloat(event.target.value);
    this.props.impactsData.domesticProduction = !isNaN(domesticProduction) ? domesticProduction : null;
    this.props.onUpdate(this.props.impactsData);
  }
  
}