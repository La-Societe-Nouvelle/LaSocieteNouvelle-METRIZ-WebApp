import React from 'react';
import { NumberInput } from '../NumberInput';


export class AssessmentGHG extends React.Component {

  refTotal = React.createRef();

  constructor(props) {
    super(props);
    let indicator = props.session.getValueAddedFootprint("ghg");
    this.state = {
      indicator: indicator,
      versionItems: 0,
    }
  }


  render() {
    const indicator = this.state.indicator;
    return (
      <table>
        <thead>
          <tr><td>Emissions directes de gaz à effet de serre</td><td>Valeur</td><td>Incertitude</td></tr>
        </thead>
        <tbody>
          <tr>
            <td>Emissions directes des sources fixes de combustion (en kgCO2e)</td>
            <td className="column_value"><NumberInput value={indicator.getItem(0)}
                              onBlur={(event) => this.updateItem(0,event.target.value)}
                              key={this.state.versionItems}/></td>
            <td className="column_value"><NumberInput value={indicator.getItemUncertainty(0)} 
                              onBlur={(event) => this.updateItemUncertainty(0,event.target.value)}
                              key={this.state.versionItems}/></td></tr>
          <tr>
            <td>Emissions directes des sources mobiles à moteur thermique (en kgCO2e)</td>
            <td className="column_value"><NumberInput value={indicator.getItem(1)}
                              onBlur={(event) => this.updateItem(1,event.target.value)}
                              key={this.state.versionItems}/></td>
            <td className="column_value"><NumberInput value={indicator.getItemUncertainty(1)} 
                              onBlur={(event) => this.updateItemUncertainty(1,event.target.value)}
                              key={this.state.versionItems}/></td></tr>
          <tr>
            <td>Emissions directes des procédés hors énergie (en kgCO2e)</td>
            <td className="column_value"><NumberInput value={indicator.getItem(2)}
                              onBlur={(event) => this.updateItem(2,event.target.value)}
                              key={this.state.versionItems}/></td>
            <td className="column_value"><NumberInput value={indicator.getItemUncertainty(2)} 
                              onBlur={(event) => this.updateItemUncertainty(2,event.target.value)}
                              key={this.state.versionItems}/></td></tr>
          <tr>
            <td>Emissions directes fugitives (en kgCO2e)</td>
            <td className="column_value"><NumberInput value={indicator.getItem(3)}
                              onBlur={(event) => this.updateItem(3,event.target.value)}
                              key={this.state.versionItems}/></td>
            <td className="column_value"><NumberInput value={indicator.getItemUncertainty(3)} 
                              onBlur={(event) => this.updateItemUncertainty(3,event.target.value)}
                              key={this.state.versionItems}/></td></tr>
          <tr>
            <td>Emissions issues de la biomasse - sol et forêt (en kgCO2e)</td>
            <td className="column_value"><NumberInput value={indicator.getItem(4)}
                              onBlur={(event) => this.updateItem(4,event.target.value)}
                              key={this.state.versionItems}/></td>
            <td className="column_value"><NumberInput value={indicator.getItemUncertainty(4)} 
                              onBlur={(event) => this.updateItemUncertainty(4,event.target.value)}
                              key={this.state.versionItems}/></td></tr>
          <tr className="with-bottom-line">
            <td>Total des émissions directes - SCOPE 1 (en kgCO2e)</td>
            <td className="column_value"><NumberInput value={indicator.getTotalEmissions()}
                              onBlur={this.updateTotalEmissions.bind(this)}
                              ref={this.refTotal}
                              key={this.state.versionItems}/></td>
            <td className="column_value"><NumberInput value={printValue(indicator.getTotalEmissionsUncertainty(),0)} 
                              onBlur={(event) => this.updateUncertainty(event.target.value)}
                              key={this.state.versionItems}/></td></tr>
          <tr>
            <td>Valeur ajoutée nette (en €)</td>
            <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}/></td></tr>
          <tr>
            <td>Intensité (en %)</td>
            <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td>
            <td className="column_value"><input value={printValue(indicator.getUncertainty(),0)} disabled={true}/></td></tr>
        </tbody>
      </table>
    ) 
  }

  updateItem(item,value) {
    let emissions = parseFloat(value);
    this.state.indicator.setEmissionsItem(item,!isNaN(emissions) ? emissions : null);
    this.props.onUpdate(this.state.indicator);
    this.update();
  }
  updateItemUncertainty(item,value) {
    let uncertainty = parseFloat(value);
    this.state.indicator.setEmissionsUncertaintyItem(item,!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.state.indicator);
    this.update();
  }

  updateTotalEmissions = (event) => {
    let emissions = parseFloat(event.target.value);
    this.state.indicator.setTotalEmissions(!isNaN(emissions) ?  emissions : null);
    this.props.onUpdate(this.state.indicator);
    this.update();
  }
  updateUncertainty(value) {
    let uncertainty = parseFloat(value);
    this.state.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.state.indicator);
    this.update();
  }

  update() {
    this.setState({versionItems: this.state.versionItems+1})
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}