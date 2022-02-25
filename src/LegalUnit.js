import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

/* ---------- LEGAL UNIT DATA ---------- */
export class LegalUnit {

  constructor(props) 
  {
    if (props==undefined) props = {};
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
    this.isActivitesArtisanales = props.isActivitesArtisanales || null;
    this.isLocalisationEtranger = props.isLocalisationEtranger || null;

    // Accounting period
    this.year = props.year || "";

    // Sector footprints
    this.productionSectorFootprint = new SocialFootprint(props.productionSectorFootprint);
    this.valueAddedSectorFootprint = new SocialFootprint(props.valueAddedSectorFootprint);
    this.consumptionSectorFootprint = new SocialFootprint(props.consumptionSectorFootprint);
    // Economic area footprints
    this.productionAreaFootprint = new SocialFootprint(props.productionAreaFootprint);
    this.valueAddedAreaFootprint = new SocialFootprint(props.valueAddedAreaFootprint);

    // status
    this.status = props.status || "";                                                             // OK:200 NOT FOUND: 404 ERROR: 500
    this.dataFetched = props.dataFetched || false;

    // fetch default references
    if (props.productionAreaFootprint==undefined) this.initFootprintsReferences();

  // ---------------------------------------------------------------------------------------------------- //
  }

  /* ----- SETTERS ----- */

  setSiren = async (siren) =>
  {
    this.siren = siren;
    this.dataFetched = null;
    // Fetch data
    await this.fetchLegalUnitData();
    await this.fetchFootprintsReferences();
  }

  setYear = (year) => this.year = year

  /* ----- FETCHING DATA ----- */

  // Fetch legal unit data
  fetchLegalUnitData = async () => 
  {
    if (/[0-9]{9}/.test(this.siren)) 
    {
      try 
      {
        const endpoint = `${apiBaseUrl}/siren/${this.siren}`;
        // console.log(endpoint);
        const response = await fetch(endpoint, {method:'get'});
        const data = await response.json();

        if (data.header.statut===200) 
        {
          this.corporateName = data.profil.descriptionUniteLegale.denomination;
          this.corporateHeadquarters = data.profil.descriptionUniteLegale.communeSiege + " (" + data.profil.descriptionUniteLegale.codePostalSiege + ")" ;
          this.areaCode = "FRA";
          this.activityCode = data.profil.descriptionUniteLegale.activitePrincipale;

          this.isEmployeur = data.profil.descriptionUniteLegale.isEmployeur;
          this.trancheEffectifs = data.profil.descriptionUniteLegale.trancheEffectifs;
          this.isEconomieSocialeSolidaire = data.profil.descriptionUniteLegale.isEconomieSocialeSolidaire;
          this.isActivitesArtisanales = data.profil.descriptionUniteLegale.isActivitesArtisanales;
          this.isLocalisationEtranger = data.profil.descriptionUniteLegale.isLocalisationEtranger;

          this.status = 200;
          this.dataFetched = true;
        } 
        else 
        {
          this.corporateName = "";
          this.corporateHeadquarters = "";
          this.areaCode = "FRA";
          this.activityCode = "00";
          this.isEmployeur = null;
          this.trancheEffectifs = null;
          this.isEconomieSocialeSolidaire = null;
          this.isActivitesArtisanales = null;
          this.isLocalisationEtranger = null;
          this.status = 404;
          this.dataFetched = false;
        }
      } 
      catch(error) {throw error} // this.status = 500;
    }
    else 
    {
      this.corporateName = "";
      this.corporateHeadquarters = "";
      this.areaCode = "";
      this.activityCode = "";
      this.isEmployeur = null;
      this.trancheEffectifs = null;
      this.isEconomieSocialeSolidaire = null;
      this.isActivitesArtisanales = null;
      this.isLocalisationEtranger = null;
      this.status = null;
      this.dataFetched = false;
    }
  }

  // Fetch consumption CSF data
  fetchFootprintsReferences = async () =>
  {
    let endpoint; let response; let data;

    // Fetch sector footprints
    if (this.activityCode!=null)
    {
      let division = this.activityCode.substring(0,2);
      
      // Production
      endpoint = apiBaseUrl + "/default?" + "area=FRA" + "&activity="+division +"&flow=PRD";
      // console.log(endpoint);
      response = await fetch(endpoint, {method:'get'});
      data = await response.json();
      if (data.header.statut == 200) this.productionSectorFootprint.updateAll(data.empreinteSocietale);
      else this.productionSectorFootprint = new SocialFootprint();
      
      // Value Added
      endpoint = apiBaseUrl + "/default?" + "area=FRA" + "&activity="+division +"&flow=GVA";
      // console.log(endpoint);
      response = await fetch(endpoint, {method:'get'});
      data = await response.json();
      if (data.header.statut == 200) this.valueAddedSectorFootprint.updateAll(data.empreinteSocietale);
      else this.valueAddedSectorFootprint = new SocialFootprint();
      
      // Intermediate Consumption
      endpoint = apiBaseUrl + "/default?" + "area=FRA" + "&activity="+division +"&flow=IC";
      // console.log(endpoint);
      response = await fetch(endpoint, {method:'get'});
      data = await response.json();
      if (data.header.statut == 200) this.consumptionSectorFootprint.updateAll(data.empreinteSocietale)
      else this.consumptionSectorFootprint = new SocialFootprint();
    }
    else
    {
      this.productionSectorFootprint = new SocialFootprint();
      this.valueAddedAreaFootprint = new SocialFootprint();
      this.consumptionSectorFootprint = new SocialFootprint();
    }

    // Fetch area footprints
    
    // PIB+IMP FRA (Available production in FRA)
    endpoint = apiBaseUrl + "/default?" + "area=FRA" + "&activity=00" +"&flow=GAP";
    // console.log(endpoint);
    response = await fetch(endpoint, {method:'get'});
    data = await response.json();
    if (data.header.statut == 200) this.productionAreaFootprint.updateAll(data.empreinteSocietale);
    else this.productionAreaFootprint = new SocialFootprint();

    // PIB FRA (Value Added in France)
    endpoint = apiBaseUrl + "/default?" + "area=FRA" + "&activity=00" +"&flow=GVA";
    // console.log(endpoint);
    response = await fetch(endpoint, {method:'get'});
    data = await response.json();
    if (data.header.statut == 200) this.valueAddedAreaFootprint.updateAll(data.empreinteSocietale);
    else this.valueAddedAreaFootprint = new SocialFootprint();
  }

  initFootprintsReferences = async () =>
  {
    let endpoint; let response; let data;

    // Fetch area footprints
    
    // PIB+IMP FRA (Available production in FRA)
    endpoint = apiBaseUrl + "/default?" + "area=FRA" + "&activity=00" +"&flow=GAP";
    // console.log(endpoint);
    response = await fetch(endpoint, {method:'get'});
    data = await response.json();
    if (data.header.statut == 200) this.productionAreaFootprint.updateAll(data.empreinteSocietale);
    else this.productionAreaFootprint = new SocialFootprint();

    // PIB FRA (Value Added in France)
    endpoint = apiBaseUrl + "/default?" + "area=FRA" + "&activity=00" +"&flow=GVA";
    // console.log(endpoint);
    response = await fetch(endpoint, {method:'get'});
    data = await response.json();
    if (data.header.statut == 200) this.valueAddedAreaFootprint.updateAll(data.empreinteSocietale);
    else this.valueAddedAreaFootprint = new SocialFootprint();
  }

}
