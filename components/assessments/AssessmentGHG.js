import React from 'react';

export class AssessmentGHG extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      emissionsInput: props.indicator.getTotalEmissions()!=null ? props.indicator.getTotalEmissions() : "",
      emissionsUncertaintyInput: props.indicator.getTotalEmissionsUncertainty()!=null ? props.indicator.getTotalEmissionsUncertainty() : "",
    }
  }

  render() {
    const {emissionsInput,emissionsUncertaintyInput} = this.state;
    return (
      <div className="assessment">
        <div className="assessment-item">
          <label>Emissions directes de Gaz à effet de serre - SCOPE 1</label>
          <input className="input-value" 
                 value={emissionsInput}
                 onChange={this.onEmissionsChange}
                 onBlur={this.onEmissionsBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;kgCO2e</span>
        </div>
        <div className="assessment-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={emissionsUncertaintyInput}
                 onChange={this.onEmissionsUncertaintyChange}
                 onBlur={this.onEmissionsUncertaintyBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;%</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onEmissionsChange = (event) => {
    this.setState({emissionsInput: event.target.value})
  }
  onEmissionsBlur = (event) => {
    let emissions = parseFloat(event.target.value);
    this.props.indicator.setTotalEmissions(!isNaN(emissions) ? emissions : null);
    this.setState({emissionsUncertaintyInput: this.props.indicator.getTotalEmissionsUncertainty()!=null ? this.props.indicator.getTotalEmissionsUncertainty() : ""})
    this.props.onUpdate(this.props.indicator);
  }

  onEmissionsUncertaintyChange = (event) => {
    this.setState({emissionsUncertaintyInput: event.target.value})
  }
  onEmissionsUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.indicator.setUncertainty(!isNaN(uncertainty) ? uncertainty : null);
    this.props.onUpdate(this.props.indicator);
  }

}

/*
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
      <div>
        <table>
          <thead>
            <tr><td>Emissions directes de gaz à effet de serre</td>
            <td colSpan="2">Valeur</td>
            <td colSpan="2">Incertitude</td></tr>
          </thead>
          <tbody>
            <tr>
              <td>Emissions directes des sources fixes de combustion (en kgCO2e)</td>
              <td className="column_value"><NumberInput value={indicator.getItem(0)}
                                onBlur={(event) => this.updateItem(0,event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;kgCO2e</td>
              <td className="column_value"><NumberInput value={indicator.getItemUncertainty(0)} 
                                onBlur={(event) => this.updateItemUncertainty(0,event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;%</td></tr>
            <tr>
              <td>Emissions directes des sources mobiles à moteur thermique (en kgCO2e)</td>
              <td className="column_value"><NumberInput value={indicator.getItem(1)}
                                onBlur={(event) => this.updateItem(1,event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;kgCO2e</td>
              <td className="column_value"><NumberInput value={indicator.getItemUncertainty(1)} 
                                onBlur={(event) => this.updateItemUncertainty(1,event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;%</td></tr>
            <tr>
              <td>Emissions directes des procédés hors énergie (en kgCO2e)</td>
              <td className="column_value"><NumberInput value={indicator.getItem(2)}
                                onBlur={(event) => this.updateItem(2,event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;kgCO2e</td>
              <td className="column_value"><NumberInput value={indicator.getItemUncertainty(2)} 
                                onBlur={(event) => this.updateItemUncertainty(2,event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;%</td></tr>
            <tr>
              <td>Emissions directes fugitives (en kgCO2e)</td>
              <td className="column_value"><NumberInput value={indicator.getItem(3)}
                                onBlur={(event) => this.updateItem(3,event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;kgCO2e</td>
              <td className="column_value"><NumberInput value={indicator.getItemUncertainty(3)} 
                                onBlur={(event) => this.updateItemUncertainty(3,event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;%</td></tr>
            <tr>
              <td>Emissions issues de la biomasse - sol et forêt (en kgCO2e)</td>
              <td className="column_value"><NumberInput value={indicator.getItem(4)}
                                onBlur={(event) => this.updateItem(4,event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;kgCO2e</td>
              <td className="column_value"><NumberInput value={indicator.getItemUncertainty(4)} 
                                onBlur={(event) => this.updateItemUncertainty(4,event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;%</td></tr>
            <tr className="with-bottom-line">
              <td>Total des émissions directes - SCOPE 1 (en kgCO2e)</td>
              <td className="column_value"><NumberInput value={indicator.getTotalEmissions()}
                                onBlur={this.updateTotalEmissions.bind(this)}
                                ref={this.refTotal}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;kgCO2e</td>
              <td className="column_value"><NumberInput value={printValue(indicator.getTotalEmissionsUncertainty(),0)} 
                                onBlur={(event) => this.updateUncertainty(event.target.value)}
                                key={this.state.versionItems}/></td>
              <td className="column_unit">&nbsp;%</td></tr>
            <tr>
              <td>Valeur ajoutée nette</td>
              <td className="column_value">{printValue(indicator.getNetValueAdded(),0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>
            <tr>
              <td>Intensité d'émissions de gaz à effet de serre</td>
              <td className="column_value">{printValue(indicator.getValue(),1)}</td>
              <td className="column_unit">&nbsp;gCO2e/€</td>
              <td className="column_value">{printValue(indicator.getUncertainty(),0)}</td>
              <td className="column_unit">&nbsp;%</td></tr>
          </tbody>
        </table>
        <div>
          <h3>Notes</h3>
          <p>Grandeur mesurée : Emissions directes de gaz à effet de serre - SCOPE 1 (en kgCO2e)</p>
          <p>Postes d'émissions directes :<br/>
            - Sources fixes de combustion<br/>
            - Sources mobiles de combustion<br/>
            - Procédés hors énergie<br/>
            - Emissions fugitives<br/>
            - Biomasse</p>
        </div>
      </div>
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
*/