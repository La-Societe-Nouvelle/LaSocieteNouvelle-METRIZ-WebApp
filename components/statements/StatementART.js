import React from 'react';
import { printValue, valueOrDefault } from '../../src/utils/Utils';
export class StatementART extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      craftedProduction: valueOrDefault(props.impactsData.craftedProduction, ""),
    }
  }

  render() 
  {
    const {isValueAddedCrafted} = this.props.impactsData;
    const {craftedProduction} = this.state;

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
                   checked={isValueAddedCrafted === null && craftedProduction !== ""}
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
                 value={printValue(craftedProduction,0)} 
                 onChange={this.oncraftedProductionChange}
                 onBlur={this.oncraftedProductionBlur}
                 disabled={isValueAddedCrafted!=null}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;€</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onIsValueAddedCraftedChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.isValueAddedCrafted = true;
        this.props.impactsData.craftedProduction = this.props.impactsData.netValueAdded;
        break;
      case "null": 
        this.props.impactsData.isValueAddedCrafted = null;
        this.props.impactsData.craftedProduction = 0;
        break;
      case "false": 
        this.props.impactsData.isValueAddedCrafted = false;
        this.props.impactsData.craftedProduction = 0; 
        break;
    }
    this.setState({craftedProduction: valueOrDefault(this.props.impactsData.craftedProduction, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  oncraftedProductionChange = (event) => {
    this.setState({craftedProduction: event.target.value});
  }
  oncraftedProductionBlur = (event) => {
    let craftedProduction = parseFloat(event.target.value);
    this.props.impactsData.craftedProduction = !isNaN(craftedProduction) ? craftedProduction : null;
    this.props.onUpdate(this.props.impactsData);
  }

}