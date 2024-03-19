// La Société Nouvelle

// API url
import api from "/config/api";

// ################################################## LEGAL UNIT OBJECT ##################################################

export class LegalUnit {

  constructor(props) 
  {
    if (props == undefined) props = {};
    // ---------------------------------------------------------------------------------------------------- //

    // identifiant
    this.siren = props.siren || "";

    // Legal data
    this.corporateName = props.corporateName || null;
    this.creationDate = props.creationDate ||null;
    this.legalStatusCode = props.legalStatusCode ||  null;
    this.corporateHeadquarters = props.corporateHeadquarters || null;
    this.nbActiveEstablishments = props.nbActiveEstablishments || null;
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
        const legalUnitData = res.data.legalUnit;
        this.corporateName = legalUnitData.denomination;
        this.corporateHeadquarters = `${legalUnitData.communeSiege} (${legalUnitData.codePostalSiege})` || "";
        this.creationDate = legalUnitData.datecreationunitelegale;
        this.legalStatusCode = legalUnitData.categorieJuridiqueCode  
        this.nbActiveEstablishments = legalUnitData.nbEtablissements;  
        this.areaCode = "FRA";
        this.activityCode = legalUnitData.activitePrincipaleCode;
        this.isEmployeur = legalUnitData.caractereEmployeur;
        this.trancheEffectifs = legalUnitData.trancheEffectifs;
        this.isEconomieSocialeSolidaire = legalUnitData.economieSocialeSolidaire;
        this.isSocieteMission = legalUnitData.societeMission;
        this.hasCraftedActivities = legalUnitData.hasCraftedActivities;
      }
      else {
        this.corporateName = "";
        this.corporateHeadquarters = "";
        this.creationDate = "";
        this.legalStatusCode = "";
        this.nbActiveEstablishments = "";
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