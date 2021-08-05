import { valueOrDefault } from "./utils/Utils";
import { SocialFootprint } from "/src/SocialFootprint.js";

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";

export class Company {

  constructor({id,account,corporateId,corporateName,
               legalUnitName,legalUnitAreaCode,legalUnitActivityCode,
               footprintId,footprintAreaCode,footprintActivityCode,dataFetched,
               footprint}) 
  {    
    // Id
    this.id = id;

    // Company
    this.account = account || null;
    this.corporateId = corporateId || null;
    this.corporateName = corporateName || "";
    // Legal data
    this.legalUnitName = legalUnitName || null;
    this.legalUnitAreaCode = legalUnitAreaCode || null;
    this.legalUnitActivityCode = legalUnitActivityCode || null;
    // Footrpint data
    this.dataFetched = valueOrDefault(dataFetched,null);
    this.footprintId = footprintId || this.getDefaultFootprintId();
    this.footprintAreaCode = footprintAreaCode || this.getDefaultFootprintAreaCode();
    this.footprintActivityCode = footprintActivityCode || "00";
    
    // Amount
    this.amount = null;

    // Social footprint
    this.footprint = new SocialFootprint({...footprint});
  }

  // init area code
  getDefaultFootprintAreaCode() {
    if (this.corporateId==null) {return "WLD"}
    // SIREN
    if (this.corporateId.match(/[0-9]{9}/)) {return "FRA"}
    // VAT NUMBER
    // ...
    else {return "WLD"}
  }

  // init footrpint id
  getDefaultFootprintId() {
    if (this.corporateId==null) {return null}
    // SIREN
    if (this.corporateId.match("[0-9]{9}")) {return this.corporateId}
    // SIRET
    else if (this.corporateId.match("[0-9]{14}")) {return this.corporateId.substring(0,9)}
    // VAT NUMBER
    else if (this.corporateId.match("FR[0-9]{11}")) {return this.corporateId.substring(4,11)}
    // DEFAULT
    else {return null}
  }

  /* -------------------- OPERATIONS -------------------- */

  /* ---------- Update ---------- */

  async update(props) 
  {
    // Update
    if (props.corporateName!=undefined)         this.corporateName = props.corporateName;
    // update from remote if id changes
    if (props.corporateId!=undefined && props.corporateId!=this.corporateId) 
    {
      this.corporateId = props.corporateId;
      this.footprintId = this.getDefaultFootprintId();
      await this.updateFromRemote();
    }
    // update from remote if footprint data change
    if ( (props.footprintAreaCode!=undefined && props.footprintAreaCode!=this.footprintAreaCode)
      || (props.footprintActivityCode!=undefined && props.footprintActivityCode!=this.footprintActivityCode)) 
    {
      this.footprintId = null;
      if (props.footprintAreaCode!=undefined)     this.footprintAreaCode = props.footprintAreaCode;
      if (props.footprintActivityCode!=undefined) this.footprintActivityCode = props.footprintActivityCode;
      await this.updateFootprintFromRemote();
      this.dataFetched = false;
    }
  }

  /* ---------- Setters ---------- */

  // used for list
  setAmount(amount) {this.amount = amount}

  /* ---------- Remote ---------- */

  async updateFromRemote() 
  {
    if (this.footprintId==null) this.footprintId = this.getDefaultFootprintId();
    if (this.footprintId!=null) 
    {
      let data = await this.fetchData();

      if (data!=null) 
      {
        this.dataFetched = true;
        // update legal data
        this.legalUnitName = data.descriptionUniteLegale.denomination;
        this.legalUnitAreaCode = "FRA";
        this.legalUnitActivityCode = data.descriptionUniteLegale.activitePrincipale;
        // update footprint data
        this.footprintAreaCode = "FRA";
        this.footprintActivityCode = data.descriptionUniteLegale.activitePrincipale;
        // update footprint parameters
        this.footprint.footprintId = this.footprintId;
        this.footprint.areaCode = "FRA";
        this.footprint.activityCode = data.descriptionUniteLegale.activitePrincipale;
        // update footprint values
        this.footprint.updateAll(data.empreinteSocietale);
      } 
      else {
        this.dataFetched = false;
        this.footprintId = null;
        await this.updateFromRemote();
      }
    }
    else
    {
      let data = await this.fetchDefaultData();
      
      if (data!=null)
      {
        this.dataFetched = false;
        // update legal data
        this.legalUnitName = null;
        this.legalUnitAreaCode = null;
        this.legalUnitActivityCode = null;
        // update footprint data
        this.footprintId = null;
        this.footprintAreaCode = data.areaCode;
        this.footprintActivityCode = data.activityCode;
        // update footprint parameters
        this.footprint.footprintId = null;
        this.footprint.areaCode = data.areaCode;
        this.footprint.activityCode = data.activityCode;
        // update footprint values
        this.footprint.updateAll(data.empreinteSocietale);
      } 
      else {
        this.footprintAreaCode = "_DV";
        this.footprintActivityCode = "00";
        await this.updateFromRemote();
      }
    }
  }

  async updateFootprintFromRemote() 
  {
    if (this.footprintId!=null) {
      let data = await this.fetchData();
      if (data!=null) {this.footprint.updateAll(data.empreinteSocietale);this.dataFetched = true}
      else {this.dataFetched = null}
    } else {
      let data = await this.fetchDefaultData();
      if (data!=null) {this.footprint.updateAll(data.empreinteSocietale);this.dataFetched = false}
      else {this.dataFetched = null}
    }
  }

  async updateIndicatorFromRemote() 
  {
    if (this.footprintId!=null) {
      let data = await this.fetchData();
      if (data!=null) this.footprint.updateIndic(indic, data.empreinteSocietale[indic.toUpperCase()]);
    } else {
      let data = await this.fetchDefaultData();
      if (data!=null) this.footprint.updateIndic(indic, data.empreinteSocietale[indic.toUpperCase()]);
    }
  }

  /* ---------- Fetch Data ---------- */  

  // Fetch data (by id)
  async fetchData() 
  {
    let endpoint = apiBaseUrl + "siren/" + this.footprintId;
    let response = await fetch(endpoint, {method:'get'});
    let data = await response.json();
    if (data.header.statut == 200) {return data.profil}
    else                           {return null}
  }

  // Fetch default data
  async fetchDefaultData() 
  {
    let endpoint = apiBaseUrl + "default?" + "pays="+this.footprintAreaCode + "&activite="+this.footprintActivityCode +"&flow=PRD";
    let response = await fetch(endpoint, {method:'get'});
    let data = await response.json();
    if (data.header.statut == 200) {return {areaCode: this.footprintAreaCode, activityCode: this.footprintActivityCode, ...data}} 
    else                           {return null}
  }

  /* ---------- Getters ---------- */

  getId() {return this.id}
  
  getCorporateId() {return this.corporateId}
  getCorporateName() {return this.corporateName}

  getAreaCode() {return this.footprintAreaCode}
  getActivityCode() {return this.footprintActivityCode}
  
  getFootprint() {return this.footprint}

  getAmount() {return this.amount}

  getEconomicDivision() {
    if (this.corporateActivity!=null) {
        if (this.corporateActivity.length()>=2) {
            return this.corporateActivity.substring(0, 2);
        } else {return "00"}
    } else {return "00"}
  }
  
}
