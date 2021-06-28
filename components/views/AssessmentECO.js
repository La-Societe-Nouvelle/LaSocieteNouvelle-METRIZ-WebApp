import React from 'react';
import { NumberInput } from '../NumberInput';


export class AssessmentECO extends React.Component {

  constructor(props) {
    super(props);
    let indicator = props.session.getValueAddedFootprint("eco"); 
    this.state = {
      indicator: indicator,
      domesticProductionInput: indicator.getDomesticProduction()!=null ? indicator.getDomesticProduction() : "",
    }
  }

  render() {
    const {indicator,domesticProductionInput} = this.state;
    const isAllActivitiesInFrance = indicator.getIsAllActivitiesInFrance()!=null ? indicator.getIsAllActivitiesInFrance() : false;
    return (
      <div>
        <table>
          <thead>
            <tr><td>Libelle</td><td>Valeur</td></tr>
          </thead>
          <tbody>
            <tr><td>Activités localisées en France (uniquement) ?</td>
                <td><input type="checkbox"
                              checked={isAllActivitiesInFrance} 
                              onChange={this.onIsAllActivitiesInFranceChange}/></td></tr>
            <tr className="with-bottom-line"><td>Valeur ajoutée nette produite en France (en €)</td>
                <td className="column_value">
                  <input value={isAllActivitiesInFrance ? printValue(indicator.getNetValueAdded(),0) : domesticProductionInput}
                        onChange={this.onDomesticProductionChange}
                        onBlur={this.onDomesticProductionBlur}
                        onKeyPress={this.onEnterPress}/></td></tr>
            <tr><td>Valeur ajoutée nette (en €)</td>
                <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}></input></td></tr>
            <tr><td>Contribution directe (en %)</td>
                <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td></tr>
          </tbody>
        </table>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onIsAllActivitiesInFranceChange = (event) => {
    this.state.indicator.setIsAllActivitiesInFrance(event.target.checked);
    this.state.domesticProductionInput = this.state.indicator.getDomesticProduction();
    this.props.onUpdate(this.state.indicator);
  }

  onDomesticProductionChange = (event) => {
    this.state.indicator.setIsAllActivitiesInFrance(false);
    this.setState({domesticProductionInput: event.target.value});
  }
  onDomesticProductionBlur = (event) => {
    let domesticProduction = parseFloat(event.target.value);
    this.state.indicator.setDomesticProduction(!isNaN(domesticProduction) ? domesticProduction : null);
    this.props.onUpdate(this.state.indicator);
  }
  
}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}