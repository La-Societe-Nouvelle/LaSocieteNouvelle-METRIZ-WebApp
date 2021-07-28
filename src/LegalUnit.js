import { SocialFootprint } from "./SocialFootprint";

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";
export class LegalUnit {

  constructor() 
  {
      this.siren = "";
      this.corporateName = null;
      this.corporateHeadquarters = null;
      this.areaCode = null;
      this.activityCode = null;

      this.year = "";

      this.defaultConsumptionFootprint = new SocialFootprint();
      this.fetchDefaultConsumptionFootprint();
  }

  /* ----- BACK UP ----- */

  updateFromBackUp(backUp) {
    this.siren = backUp.siren;
    this.corporateName = backUp.corporateName;
    this.corporateHeadquarters = backUp.corporateHeadquarters;
    this.areaCode = backUp.areaCode;
    this.activityCode = backUp.activityCode;
    this.year = backUp.year;
    this.defaultConsumptionFootprint.updateFromBackUp(backUp.defaultConsumptionFootprint);
  }

  /* ----- SETTERS ----- */

  async setSiren(siren) {
    this.siren = siren;
    await this.fetchLegalUnitData();
    await this.fetchDefaultConsumptionFootprint();
  }

  setYear(year) {
    this.year = year;
  }

  /* ----- FETCHING DATA ----- */

  // Fetch legal unit data
  async fetchLegalUnitData() {
    if (this.siren.match(/[0-9]{9}/)) 
    {
      try{
        const endpoint = `${apiBaseUrl}/siren/${this.siren}`;
        const response = await fetch(endpoint, {method:'get'});
        const data = await response.json();
        if (data.header.statut===200) { // if OK, read data
            this.corporateName = data.profil.descriptionUniteLegale.denomination;
            this.corporateHeadquarters = data.profil.descriptionUniteLegale.communeSiege + " (" + data.profil.descriptionUniteLegale.codePostalSiege + ")" ;
            this.areaCode = "FRA";
            this.activityCode = data.profil.descriptionUniteLegale.activitePrincipale;
        } else {
          this.corporateName = "";
          this.corporateHeadquarters = "";
          this.areaCode = "FRA";
          this.activityCode = "00";
        }
      } catch(error){
        throw error;
      }
    }
    else 
    {
      this.corporateName = null;
      this.corporateHeadquarters = null;
      this.areaCode = null;
      this.activityCode = null;
    }
  }

  // Fetch consumption CSF data
  async fetchDefaultConsumptionFootprint()
  {
      // Fetch default data
      let area = this.areaCode || "FRA";
      let activity = this.activityCode || "00";
      let endpoint = apiBaseUrl + "default?" + "pays="+area + "&activite="+activity +"&flow=IC";
      let response = await fetch(endpoint, {method:'get'});
      let data = await response.json();
      if (data.header.statut == 200) {
          this.defaultConsumptionFootprint.updateAll(data.empreinteSocietale);
      } else {
          endpoint = apiBaseUrl + "default?pays=_DV&activite=00&flow=GAP";
          response = await fetch(endpoint, {method:'get'});
          data = await response.json();
          this.defaultConsumptionFootprint.updateAll(data.empreinteSocietale);
      }
  }
}
