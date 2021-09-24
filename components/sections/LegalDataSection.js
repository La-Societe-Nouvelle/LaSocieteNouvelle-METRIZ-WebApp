// La Société Nouvelle

// React
import React from 'react';

// Utils
import { InputText } from '../InputText';
import { printValue } from '../../src/utils/Utils';

// Libraries
import indics from '../../lib/indics.json'

/* ------------------------------------------------------------ */
/* -------------------- LEGAL DATA SECTION -------------------- */
/* ------------------------------------------------------------ */

export class LegalDataSection extends React.Component {

  constructor(props) 
  {
    super(props);
    const legalUnit = props.session.legalUnit;
    this.state =
    {
      corporateName: legalUnit.corporateName,
      corporateHeadquarters: legalUnit.corporateHeadquarters,
    }
  }

  render() 
  {
    const session = this.props.session;
    const {siren,corporateName,corporateHeadquarters,year} = session.legalUnit;

    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Informations générales</h1>
        </div>

        <div className="section-view-main">

          <div className="group"><h3>Informations légales</h3>
            <div className="inline-input short">
              <label>Numéro de siren </label>
              <InputText value={siren} 
                         valid={/[0-9]{9}/.test(siren)}
                         onUpdate={this.updateSiren.bind(this)}/>
            </div>
            <div className="inline-input">
              <label>Dénomination </label>
              <input type="text" value={corporateName || ""} disabled={true}/>
            </div>
            <div className="inline-input">
              <label>Domiciliation du siège </label>
              <input type="text" value={corporateHeadquarters || ""} disabled={true}/>
            </div>
          </div>

          <div className="group"><h3>Informations comptables</h3>
            <div className="inline-input short">
              <label>Année de fin de l'exercice</label>
              <InputText value={year} 
                         valid={/[0-9]{4}/.test(year)}
                         onUpdate={this.updateYear.bind(this)}/>
            </div>
          </div>

          {/*<div className="group"><h3>Empreinte Sociétale de l'Entreprise</h3>
            <div className="coporate-social-footprint">
              <FootprintTable session={session}/>
            </div>
          </div>*/}

        </div>
      </div>
    )
  }

  /* --- SIREN --- */

  updateSiren = async (siren) => 
  {
    let legalUnit = this.props.session.legalUnit;
    await legalUnit.setSiren(siren);
    this.setState({
      corporateName: legalUnit.corporateName,
      corporateHeadquarters: legalUnit.corporateHeadquarters
    })
  }

  /* --- EXERCICE --- */

  updateYear = (year) => this.props.session.legalUnit.setYear(year)

}

/* ---------- FOOTPRINT TABLE ---------- */

function FootprintTable({session}) 
{
  const availableProductionFootprint = session.getProductionFootprint();
  
  return (
    <table>
      <thead>
        <tr><td>Code</td><td>Indicateur</td><td colSpan="2">Valeur</td><td>Incertitude</td></tr>
      </thead>
      <tbody>
        {Object.entries(indics).map(([indic,indicData]) => 
          <tr key={indic}>
            <td className="column_code">{indic.toUpperCase()}</td>
            <td className="auto">{indicData.libelle}</td>
            <td className="column_value">{printValue(availableProductionFootprint.getIndicator(indic).getValue(),1)}</td>
            <td className="column_unit">&nbsp;{indicData.unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(availableProductionFootprint.getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}