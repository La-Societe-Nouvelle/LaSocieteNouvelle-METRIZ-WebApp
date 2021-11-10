// La Société Nouvelle

// React
import React from 'react';

/* ------------------------------------------------------- */
/* -------------------- SIREN SECTION -------------------- */
/* ------------------------------------------------------- */

export class SirenSection extends React.Component {

  constructor(props)
  {
    super(props);
    this.state = {
      siren: props.session.legalUnit.siren,
    };
  }

  render ()
  {
    const {siren} = this.state;

    return (
      <div className="section-view"> 

        <div className="section-view-actions">
          <div className="sections-actions"></div>
          <div>
            <button id="validation-button" disabled={!/^[0-9]{9}$/.test(siren)} onClick={this.submitSiren}>Valider</button>
          </div>
        </div>

        <div id="siren-form-container">
          <div className="siren-input input">
            <label>Numéro de siren (9 chiffres) : </label>
            <input id="siren-input" type="text" 
                   value={siren} 
                   onChange={this.onSirenChange} 
                   onKeyPress={this.onEnterPress}/>
          </div>
        </div>
        
      </div>)
  }

  onSirenChange = (event) => this.setState({siren: event.target.value});
  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  submitSiren = () => 
  {
    this.props.session.legalUnit.setSiren(this.state.siren);
    this.initImpactsData();
    this.props.submit();
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