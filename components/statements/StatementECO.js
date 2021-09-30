import React from 'react';
import { printValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

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
          <InputNumber value={domesticProduction}
                       disabled={isAllActivitiesInFrance!=null}
                       onUpdate={this.updateDomesticProduction}/>
          <span>&nbsp;€</span>
        </div>
      </div>
    ) 
  }

  onIsAllActivitiesInFranceChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.setIsAllActivitiesInFrance(true);
        this.props.impactsData.domesticProduction = this.props.impactsData.netValueAdded;
        break;
      case "null": 
        this.props.impactsData.setIsAllActivitiesInFrance(null);
        this.props.impactsData.domesticProduction = 0;
        break;
      case "false": 
        this.props.impactsData.setIsAllActivitiesInFrance(false);
        this.props.impactsData.domesticProduction = 0;
        break;
    }
    this.setState({domesticProduction: valueOrDefault(this.props.impactsData.domesticProduction, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  updateDomesticProduction = (input) => {
    this.props.impactsData.domesticProduction = input;
    this.setState({domesticProduction: this.props.impactsData.domesticProduction});
    this.props.onUpdate(this.props.impactsData);
  }
  
}