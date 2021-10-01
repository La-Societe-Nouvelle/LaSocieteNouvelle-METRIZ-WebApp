// La Société Nouvelle

// React
import React from 'react';

// Utils
import { InputText } from '../InputText';

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
      siren: legalUnit.siren || "",
      year: legalUnit.year || "",
    }
  }

  componentDidUpdate(prevProps) 
  // ...update state when importing session
  {
    if (prevProps.session.legalUnit!==this.props.session.legalUnit) {
      this.setState({
        siren: this.props.session.legalUnit.siren || "",
        year: this.props.session.legalUnit.year || "",
      })
    }
  }

  render() 
  {
    const {corporateName,corporateHeadquarters,dataFetched} = this.props.session.legalUnit;
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
                         onUpdate={this.updateSiren.bind(this)}/>
              {dataFetched && <img className="icon" src="/resources/icon_good.png" alt="refresh"/>}
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

          <div className="group"><h3>Informations relatives à l'analyse</h3>
            <div className="inline-input short">
              <label>Année de fin de l'exercice</label>
              <InputText value={year} 
                         onUpdate={this.updateYear.bind(this)}/>
              {/[0-9]{4}/.test(year) && <img className="icon" src="/resources/icon_good.png" alt="refresh"/>}
            </div>
          </div>

        </div>
      </div>
    )
  }

  /* --- SIREN --- */

  updateSiren = async (siren) => 
  {
    await this.props.session.legalUnit.setSiren(siren);
    this.setState({siren: siren})
    this.initImpactsData();
    this.props.updateMenu();
  }

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

  /* --- EXERCICE --- */

  updateYear = (year) => 
  {
    this.props.session.legalUnit.setYear(year);
    this.setState({year: year})
    this.props.updateMenu();
  }

}