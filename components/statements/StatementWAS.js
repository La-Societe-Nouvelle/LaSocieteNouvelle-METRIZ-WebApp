import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';
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
          <InputNumber value={wasteProduction} 
                       onUpdate={this.updateWasteProduction}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={wasteProductionUncertainty} 
                       onUpdate={this.updateWasteProductionUncertainty}/>
          <span>&nbsp;%</span>
        </div>
        <div className="notes">
          <p><sup>1</sup> Déchets assimilés aux ordures ménagères</p>
        </div>
      </div>
    ) 
  }

  updateWasteProduction = (input) => {
    this.props.impactsData.setWasteProduction(input);
    this.setState({wasteProductionUncertainty: this.props.impactsData.wasteProductionUncertainty});
    this.props.onUpdate(this.props.impactsData);
  }

  updateWasteProductionUncertainty = (input) => {
    this.props.impactsData.wasteProductionUncertainty = input;
    this.props.onUpdate(this.props.impactsData);
  }

}