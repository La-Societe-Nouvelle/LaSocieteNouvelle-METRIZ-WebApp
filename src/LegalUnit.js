// API url

import api from "/config/api";


/* ---------- LEGAL UNIT DATA ---------- */
export class LegalUnit {

  constructor(props) 
  {
    if (props == undefined) props = {};
    // ---------------------------------------------------------------------------------------------------- //

    // identifiant
    this.siren = props.siren || "";

    // Legal data
    this.corporateName = props.corporateName || null;
    this.corporateHeadquarters = props.corporateHeadquarters || null;
    this.areaCode = props.areaCode || null;
    this.activityCode = props.activityCode || null;

    // Complements
    this.isEmployeur = props.isEmployeur || null;
    this.trancheEffectifs = props.trancheEffectifs || "";
    this.isEconomieSocialeSolidaire = props.isEconomieSocialeSolidaire || null;
    this.isSocieteMission = props.isSocieteMission || null;
    this.hasCraftedActivities = props.hasCraftedActivities || null;    

    // ---------------------------------------------------------------------------------------------------- //
  }
  
  /* ----- SETTERS ----- */

  setSiren = async (siren) => {
    this.siren = siren;
    this.dataFetched = null;
    await this.fetchLegalUnitData();
  };

  /* ----- FETCHING DATA ----- */

  // Fetch legal unit data
  fetchLegalUnitData = async () => 
  {

    // request
    await api.get("legalunitfootprint/" + this.siren).then((res) => {
      let status = res.data.header.code;
      if (status == 200) {
        this.corporateName = res.data.legalUnit.denomination;
        this.corporateHeadquarters =
          res.data.legalUnit.communeSiege +
          " (" +
          res.data.legalUnit.codePostalSiege +
          ")";
        this.areaCode = "FRA";
        this.activityCode = res.data.legalUnit.activitePrincipaleCode;
        this.isEmployeur = res.data.legalUnit.caractereEmployeur;
        this.trancheEffectifs = res.data.legalUnit.trancheEffectifs;
        this.isEconomieSocialeSolidaire =
          res.data.legalUnit.economieSocialeSolidaire;
        this.isSocieteMission = res.data.legalUnit.societeMission;
        this.hasCraftedActivities = res.data.legalUnit.hasCraftedActivities;
      }
      else {
        this.corporateName = "";
        this.corporateHeadquarters = "";
        this.areaCode = "";
        this.activityCode = "";
        this.isEmployeur = null;
        this.trancheEffectifs = null;
        this.isEconomieSocialeSolidaire = null;
        this.isSocieteMission = null;
        this.hasCraftedActivities = null;
        this.siren = null;
      }
    }).catch(error => {
      throw Error(error.message)      
    });
  };
}
