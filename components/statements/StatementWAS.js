// La Société Nouvelle

// React
import React from 'react';

//Utils
import { printValue, roundValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #WAS ---------- */

export class StatementWAS extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      wasteProduction: valueOrDefault(props.impactsData.wasteProduction, ""),
      wasteProductionUncertainty: valueOrDefault(props.impactsData.wasteProductionUncertainty, ""),
      info : props.impactsData.comments.was || ""
    }
  }

  componentDidUpdate() 
  {
    if (this.state.wasteProduction!=this.props.impactsData.wasteProduction) {
      this.setState({wasteProduction: this.props.impactsData.wasteProduction});
    }
    if (this.state.wasteProductionUncertainty!=this.props.impactsData.wasteProductionUncertainty) {
      this.setState({wasteProductionUncertainty: this.props.impactsData.wasteProductionUncertainty});
    }
  }

  render() 
  {
    const {netValueAdded} = this.props.impactsData;
    const {wasteProduction,wasteProductionUncertainty} = this.state;

    let isValid = wasteProduction!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Productiont totale de déchets (y compris DAOM<sup>1</sup>)</label>
          <InputNumber value={roundValue(wasteProduction,0)} 
                       onUpdate={this.updateWasteProduction}/>
          <span>&nbsp;kg</span>
        </div>
        <div className="statement-item">
          <label>Incertitude</label>
          <InputNumber value={roundValue(wasteProductionUncertainty,0)} 
                       onUpdate={this.updateWasteProductionUncertainty}/>
          <span>&nbsp;%</span>
        </div>
        <div className="notes">
          <p><sup>1</sup> Déchets assimilés aux ordures ménagères</p>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  updateWasteProduction = (input) => 
  {
    this.props.impactsData.setWasteProduction(input);
    this.setState({wasteProductionUncertainty: this.props.impactsData.wasteProductionUncertainty});
    this.props.onUpdate("was");
  }

  updateWasteProductionUncertainty = (input) => 
  {
    this.props.impactsData.wasteProductionUncertainty = input;
    this.props.onUpdate("was");
  }
  
  updateInfo = (event) => this.setState({info: event.target.value});
  saveInfo = () => this.props.impactsData.comments.was = this.state.info;

  onValidate = () => this.props.onValidate()
}

export const writeStatementWAS = (doc,x,y,impactsData) =>
{
  doc.text("Valeur ajoutée artisanale : "+printValue(impactsData.craftedProduction,0)+" kg"+(impactsData.isValueAddedCrafted ? "*" : ""),x,y);
  if (impactsData.isValueAddedCrafted)
  {
    y+=6;
    doc.setFont("Calibri","italic");
    doc.text("*Les activités de l'entreprise sont déclarées artisanales / faisant appel à un savoir-faire reconnu",x,y);
    doc.setFont("Calibri","normal");
  }
  return y;
}