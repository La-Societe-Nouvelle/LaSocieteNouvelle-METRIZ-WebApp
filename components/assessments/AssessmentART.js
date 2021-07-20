import React from 'react';

export class AssessmentART extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      craftedProductionInput: props.indicator.getCraftedProduction()!=null ? props.indicator.getCraftedProduction() : "",
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.indicator.getCraftedProduction()!=prevProps.indicator.getCraftedProduction()) {
      this.setState({
        craftedProductionInput: props.indicator.getDeclaredValue()!=null ? indicator.getDeclaredValue() : "",
      })
    }
  }

  render() {
    const isValueAddedCrafted = this.props.indicator.getIsValueAddedCrafted();
    const {craftedProductionInput} = this.state;
    return (
      <div className="assessment">
        <div className="assessment-item">
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
                   checked={isValueAddedCrafted === null}
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
        <div className="assessment-item">
          <label>Part de la valeur ajoutée artisanale</label>
          <input className="input-value"
                 value={craftedProductionInput} 
                 onChange={this.onCraftedProductionChange}
                 onBlur={this.onCraftedProductionBlur}
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
    this.props.onUpdate(this.props.indicator);
    this.state.craftedProductionInput = this.props.indicator.getCraftedProduction()!=null ? this.props.indicator.getCraftedProduction() : "";
  }

  onCraftedProductionChange = (event) => {
    this.props.indicator.setIsValueAddedCrafted(false);
    this.setState({craftedProductionInput: event.target.value});
  }
  onCraftedProductionBlur = (event) => {
    let craftedProduction = parseFloat(event.target.value);
    this.props.indicator.setCraftedProduction(!isNaN(craftedProduction) ? craftedProduction : null);
    this.props.onUpdate(this.props.indicator);
  }

}