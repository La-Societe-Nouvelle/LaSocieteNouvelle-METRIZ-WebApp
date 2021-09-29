import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";
export class LegalUnit {

  constructor(props) 
  {
    if (props==undefined) props = {};
  // ---------------------------------------------------------------------------------------------------- //

    this.siren = props.siren || "";

    this.corporateName = props.corporateName || null;
    this.corporateHeadquarters = props.corporateHeadquarters || null;
    this.areaCode = props.areaCode || null;
    this.activityCode = props.activityCode || null;

    //
    this.isEmployeur = props.isEmployeur || null;
    this.trancheEffectifs = props.trancheEffectifs || "";
    this.isEconomieSocialeSolidaire = props.isEconomieSocialeSolidaire || null;

    // Accounting period
    this.year = props.year || "";

    // Default data
    this.defaultConsumptionFootprint = new SocialFootprint(props.defaultConsumptionFootprint);

    // Sector footprints
    this.productionSectorFootprint = new SocialFootprint(props.productionSectorFootprint);
    this.valueAddedSectorFootprint = new SocialFootprint(props.valueAddedSectorFootprint);
    this.consumptionSectorFootprint = new SocialFootprint(props.consumptionSectorFootprint);
    // Economic area footprints
    this.productionAreaFootprint = new SocialFootprint(props.productionAreaFootprint);
    this.valueAddedAreaFootprint = new SocialFootprint(props.valueAddedAreaFootprint);

    //
    this.dataFetched = props.dataFetched || false;

  // ---------------------------------------------------------------------------------------------------- //
  }

  /* ----- BACK UP ----- */

  updateFromBackUp(backUp) 
  {
    this.siren = backUp.siren;
    this.corporateName = backUp.corporateName;
    this.corporateHeadquarters = backUp.corporateHeadquarters;
    this.areaCode = backUp.areaCode;
    this.activityCode = backUp.activityCode;
    this.year = backUp.year;

    this.defaultConsumptionFootprint = new SocialFootprint(backUp.defaultConsumptionFootprint);
    this.productionSectorFootprint = new SocialFootprint(backUp.productionSectorFootprint);
    this.valueAddedSectorFootprint = new SocialFootprint(backUp.valueAddedSectorFootprint);
    this.consumptionSectorFootprint = new SocialFootprint(backUp.consumptionSectorFootprint);
    this.productionAreaFootprint = new SocialFootprint(backUp.productionAreaFootprint);
    this.valueAddedAreaFootprint = new SocialFootprint(backUp.valueAddedAreaFootprint);
  }

  /* ----- SETTERS ----- */

  async setSiren(siren)
  {
    this.siren = siren;
    this.dataFetched = false;
    // Fetch data
    await this.fetchLegalUnitData();
    await this.fetchDefaultConsumptionFootprint();
    await this.fetchFootprintsReferences();
  }

  setYear(year) {
    this.year = year;
  }

  /* ----- FETCHING DATA ----- */

  // Fetch legal unit data
  async fetchLegalUnitData() 
  {
    if (/[0-9]{9}/.test(this.siren)) 
    {
      try 
      {
        const endpoint = `${apiBaseUrl}/siren/${this.siren}`;
        console.log(endpoint);
        const response = await fetch(endpoint, {method:'get'});
        const data = await response.json();

        if (data.header.statut===200) 
        {
            this.corporateName = data.profil.descriptionUniteLegale.denomination;
            this.corporateHeadquarters = data.profil.descriptionUniteLegale.communeSiege + " (" + data.profil.descriptionUniteLegale.codePostalSiege + ")" ;
            this.areaCode = "FRA";
            this.activityCode = data.profil.descriptionUniteLegale.activitePrincipale;

            this.isEmployeur = data.profil.descriptionUniteLegale.employeur;
            this.trancheEffectifs = data.profil.descriptionUniteLegale.trancheEffectifs;
            this.isEconomieSocialeSolidaire = data.profil.descriptionUniteLegale.isEconomieSocialeSolidaire;

            this.dataFetched = true;
        } 
        else 
        {
          this.corporateName = "";
          this.corporateHeadquarters = "";
          this.areaCode = "FRA";
          this.activityCode = "00";
          this.dataFetched = false;
        }
      } 
      catch(error) {throw error}
    }
    else 
    {
      this.corporateName = "";
      this.corporateHeadquarters = "";
      this.areaCode = "";
      this.activityCode = "";
      this.dataFetched = false;
    }
  }

  // Fetch consumption CSF data
  async fetchDefaultConsumptionFootprint()
  {
      // Fetch default data
      let area = this.areaCode || "FRA";
      let activity = this.activityCode || "00";

      try 
      {
        const endpoint = apiBaseUrl + "default?" 
                                    + "pays="+area 
                                    + "&activite="+activity.substring(0,2) 
                                    + "&flow="+(activity.substring(0,2)!="00" ? "IC" : "GAP");
        console.log(endpoint);
        const response = await fetch(endpoint, {method:'get'});
        let data = await response.json();

        if (data.header.statut == 200) 
        {
            this.defaultConsumptionFootprint.updateAll(data.empreinteSocietale);
        } 
        else 
        {
            endpoint = apiBaseUrl + "default?pays=_DV&activite=00&flow=GAP";
            console.log(endpoint);
            response = await fetch(endpoint, {method:'get'});
            data = await response.json();
            this.defaultConsumptionFootprint.updateAll(data.empreinteSocietale);
        }
      } 
      catch(error) {throw error}
  }

  // Fetch consumption CSF data
  async fetchFootprintsReferences()
  {
      let endpoint; let response; let data;

      // Fetch sector footprints

      if (this.activityCode!=null)
      {
        let division = this.activityCode.substring(0,2);
        
        // Production
        endpoint = apiBaseUrl + "default?" + "pays=FRA" + "&activite="+division +"&flow=PRD";
        response = await fetch(endpoint, {method:'get'});
        data = await response.json();
        if (data.header.statut == 200) this.productionSectorFootprint.updateAll(data.empreinteSocietale);
        
        // Value Added
        endpoint = apiBaseUrl + "default?" + "pays=FRA" + "&activite="+division +"&flow=GDP";
        response = await fetch(endpoint, {method:'get'});
        data = await response.json();
        if (data.header.statut == 200) this.valueAddedSectorFootprint.updateAll(data.empreinteSocietale);
        
        // Intermediate Consumption
        endpoint = apiBaseUrl + "default?" + "pays=FRA" + "&activite="+division +"&flow=IC";
        response = await fetch(endpoint, {method:'get'});
        data = await response.json();
        if (data.header.statut == 200) this.consumptionSectorFootprint.updateAll(data.empreinteSocietale);
      }

      // Fetch area footprints
      
      // Production
      endpoint = apiBaseUrl + "default?" + "pays=FRA" + "&activite=00" +"&flow=GAP";
      response = await fetch(endpoint, {method:'get'});
      data = await response.json();
      if (data.header.statut == 200) this.productionAreaFootprint.updateAll(data.empreinteSocietale);
      // Value Added
      endpoint = apiBaseUrl + "default?" + "pays=FRA" + "&activite=00" +"&flow=GDP";
      response = await fetch(endpoint, {method:'get'});
      data = await response.json();
      if (data.header.statut == 200) this.valueAddedAreaFootprint.updateAll(data.empreinteSocietale);
  }

}
