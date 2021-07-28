import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
export class StatementWAS extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      wasteProduction: valueOrDefault(props.impactsData.wasteProduction, ""),
      wasteProductionUncertainty: valueOrDefault(props.impactsData.wasteProductionUncertainty, ""),
    }
  }

  render() 
  {
    const {wasteProduction,wasteProductionUncertainty} = this.state;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Productiont totale de déchets (y compris DAOM<sup>1</sup>)</label>
          <input className="input-value" 
                 value={wasteProduction} 
                 onChange={this.onWasteProductionChange}
                 onBlur={this.onWasteProductionBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <input className="input-value" 
                 value={wasteProductionUncertainty} 
                 onChange={this.onUncertaintyChange}
                 onBlur={this.onUncertaintyBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;%</span>
        </div>
        <div className="notes">
          <p><sup>1</sup> Déchets assimilés aux ordures ménagères</p>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onWasteProductionChange = (event) => {
    this.setState({wasteProduction: event.target.value});
  }
  onWasteProductionBlur = (event) => {
    let wasteProduction = parseFloat(event.target.value);
    this.props.impactsData.setWasteProduction(!isNaN(wasteProduction) ? wasteProduction : null);
    this.setState({wasteProductionUncertainty: valueOrDefault(this.props.impactsData.wasteProductionUncertainty, "")});
    this.props.onUpdate(this.props.impactsData);
  }

  onUncertaintyChange = (event) => {
    this.setState({wasteProductionUncertainty: event.target.value});
  }
  onUncertaintyBlur = (event) => {
    let uncertainty = parseFloat(event.target.value);
    this.props.impactsData.wasteProductionUncertainty = !isNaN(uncertainty) ? uncertainty : null;
    this.props.onUpdate(this.props.impactsData);
  }

}