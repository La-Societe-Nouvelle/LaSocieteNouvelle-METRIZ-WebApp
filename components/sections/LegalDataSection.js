// La Société Nouvelle

// React
import React from 'react';

// Utils
import { InputText } from '../InputText';

/* ------------------------------------------------------------ */
/* -------------------- LEGAL DATA SECTION -------------------- */
/* ------------------------------------------------------------ */

/** NOTES
 *  Obbjectif : saisie numéro de siren et année de référence
 */

export class LegalDataSection extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      siren: props.session.legalUnit.siren,
      year: props.session.year,
    }
  }

  componentDidUpdate(prevProps) 
  // ...component update when importing session
  {
    if (prevProps.session.legalUnit!==this.props.session.legalUnit || prevProps.session.year!==this.props.session.year) 
    {
      this.setState({
        siren: this.props.session.legalUnit.siren,
        year: this.props.session.year,
      })
    }
  }

  render() 
  {
    const {corporateName,corporateHeadquarters,status} = this.props.session.legalUnit;
    const {siren,year} = this.state;
    
    return (
      <div className="section-view">
        
        <div className="section-view-header">
          <h1>Informations générales</h1>
        </div>

        <div className="section-view-main">

          <div className="group"><h3>Informations relatives à l'entreprise</h3>

            <div className="inline-input short">
              <label>Numéro de siren </label>
              <InputText value={siren} 
                         unvalid={siren!="" && !/[0-9]{9}/.test(siren)}
                         onUpdate={this.updateSiren.bind(this)}/>
              {status==200 && <img className="icon" src="/resources/icon_good.png" alt="refresh"/>}
              {status==404 && <span>(siren non reconnu)</span>}
              {(siren!="" && !/[0-9]{9}/.test(siren)) && <span>(erreur format)</span>}
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
          <div className="group"><h3>Informations relatives à l'exercice</h3>

            <div className="inline-input short">
              <label>Année de l'exercice</label>
              <InputText value={year} 
                         unvalid={year!="" && !(/^20[0-1][0-9]$/.test(year) || /^202[0-1]$/.test(year))}
                         onUpdate={this.updateFinancialYear.bind(this)}/>
              {/^20([0-1][0-9]|2[0-1])$/.test(year) && <img className="icon" src="/resources/icon_good.png" alt="refresh"/>}
              {(/^[0-9]{4}$/.test(year) && !/^20([0-1][0-9]|2[0-1])$/.test(year)) && <span>(année non valide)</span>}
              {(year!="" && !/^[0-9]{4}$/.test(year)) && <span>(erreur format)</span>}
            </div>

          </div>
        </div>
      </div>
    )
  }

  /* --- update legal unit data --- */

  updateSiren = async (siren) => 
  {
    this.setState({siren: siren});
    await this.props.session.legalUnit.setSiren(siren);
    this.initImpactsData();
    this.props.updateMenu();
  }

  /* --- update financial year --- */

  updateFinancialYear = (year) => 
  {
    this.setState({year: year})
    if (/^20([0-1][0-9]|2[0-1])$/.test(year)) this.props.session.legalUnit.setYear(year);
    this.props.updateMenu();
  }

  /* --- init impacts data from legal unit data --- */

  initImpactsData = () =>
  {
    let {legalUnit,impactsData} = this.props.session;

    // ART
    if (this.props.session.legalUnit.isActivitesArtisanales!=null
      && impactsData.isValueAddedCrafted==null) impactsData.isValueAddedCrafted = legalUnit.isActivitesArtisanales;

    // DIS-GEQ
    if (this.props.session.legalUnit.isEmployeur!=null
      && impactsData.hasEmployees==null) impactsData.hasEmployees = legalUnit.isEmployeur;

    // MAT
    if (this.props.session.legalUnit.activityCode!=null
      && impactsData.isExtractiveActivities==null) impactsData.isExtractiveActivities = ["01","02","03","05","06","07","08"].includes(legalUnit.activityCode.substring(0,2));

    // ECO
    if (this.props.session.legalUnit.isLocalisationEtranger!=null
      && impactsData.isAllActivitiesInFrance==null) impactsData.isAllActivitiesInFrance = !legalUnit.isLocalisationEtranger;

    // SOC
    if (this.props.session.legalUnit.isEconomieSocialeSolidaire!=null
      && impactsData.hasSocialPurpose==null) impactsData.hasSocialPurpose = legalUnit.isEconomieSocialeSolidaire;
  }

}