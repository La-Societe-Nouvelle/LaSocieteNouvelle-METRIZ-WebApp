import React from 'react';

// Components
import { InputText } from './InputText';

// Utils
import { printValue } from '../src/utils/Utils';

// meta data
import { metaIndicators } from '../lib/indic'

/* The base URL of the API */
const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

/* ------------------------------------------------------------ */
/* -------------------- LEGAL DATA SECTION -------------------- */
/* ------------------------------------------------------------ */

export class LegalDataSection extends React.Component {

  constructor(props) {
    super(props)
  }

  render() 
  {
    const {siren,corporateName,corporateHeadquarters,year} = this.props.session.legalUnit;

    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Informations générales</h1>
        </div>

        <div className="legal_unit_main_view">

          <div className="group"><h3>Informations légales</h3>
            <div className="inline-input short">
              <label>Numéro de siren </label>
              <InputText value={siren} onUpdate={this.updateSiren.bind(this)}/>
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
              <InputText value={year} onUpdate={this.updateYear.bind(this)}/>
            </div>
          </div>

          <div className="group"><h3>Empreinte Sociétale de l'Entreprise</h3>
            <div className="coporate-social-footprint">
              <FootprintTable session={this.props.session}/>
            </div>
          </div>

        </div>

      </div>
    )
  }

  /* --- SIREN --- */

  async updateSiren(siren) 
  {
    await this.props.session.legalUnit.setSiren(siren);
    this.forceUpdate();
  }

  /* --- EXERCICE --- */

  updateYear(year) {
    this.props.session.legalUnit.setYear(year);
  }

}

/* ---------- FOOTPRINT TABLE ---------- */

function FootprintTable({session}) 
{
  const revenueFootprint = session.getRevenueFootprint();
  
  return (
    <table>
      <thead>
        <tr>
          <td>Code</td>
          <td>Indicateur</td>
          <td colSpan="2">Valeur</td>
          <td>Incertitude</td>
        </tr>
      </thead>
      <tbody>
        {
          Object.entries(metaIndicators).map(([indic,indicData]) => {
            return(
              <tr key={indic}>
                <td className="column_code">{indic.toUpperCase()}</td>
                <td className="column_libelle">{indicData.libelle}</td>
                <td className="column_value">{printValue(revenueFootprint.getIndicator(indic).getValue(),1)}</td>
                <td className="column_unit">&nbsp;{indicData.unit}</td>
                <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(revenueFootprint.getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
  )
}