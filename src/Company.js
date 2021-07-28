import { SocialFootprint } from "/src/SocialFootprint.js";

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";

export class Company {

  constructor({id,account,corporateId,corporateName,legalUnitName,areaCode,activityCode}) 
  {    
    // Id
    this.id = id;

    // Company
    this.account = account || null;
    this.corporateId = corporateId || null;
    this.corporateName = corporateName || "";
    this.legalUnitName = legalUnitName || "";
    this.areaCode = areaCode || this.initAreaCode();
    this.activityCode = activityCode || "00";
    this.dataFetched = false;
    
    // Amount
    this.amount = null;

    // Social footprint
    this.footprintId = this.initFootprintId();
    this.footprint = new SocialFootprint({
      footprintId: this.footprintId,
      areaCode: this.areaCode,
      activityCode: this.activityCode,
    });
  }

  // init area code
  initAreaCode() {
    if (this.corporateId==null) {return "WLD"}
    if (this.corporateId.match("[0-9]{9}")) {return "FRA"}
    else {return "WLD"}
  }

  // init footrpint id
  initFootprintId() {
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

  async update(props) {
    if (props.corporateId!=undefined & props.corporateId!=this.corporateId) 
    {
      this.corporateId = props.corporateId;
      this.footprintId = this.initFootprintId();
      await this.fetchData();
    }
    else 
    {
      if (props.corporateId!=undefined)         this.corporateId = props.corporateId;
      if (props.corporateName!=undefined)       this.corporateName = props.corporateName;
      if (props.areaCode!=undefined)            this.areaCode = props.areaCode;
      if (props.corporateActivity!=undefined)   this.corporateActivity = props.corporateActivity;
      if (props.amount!=undefined)              this.amount = props.amount;
    }
  }

  /* ---------- Back Up ---------- */

  updateFromBackUp(backUp) {
    this.corporateId = backUp.corporateId;
    this.corporateName = backUp.corporateName;
    this.areaCode = backUp.areaCode;
    this.activityCode = backUp.activityCode;
    this.amount = backUp.amount;
    this.footprintId = backUp.footprintId;
    this.footprint = new SocialFootprint();
      this.footprint.updateFromBackUp(backUp.footprint); 
    this.dataFetched = backUp.dataFetched;
  }

  /* ---------- Setters ---------- */

  async setCorporateId(identifiant) {
      if (identifiant!=this.corporateId) {
        this.corporateId = identifiant; 
        this.footprintId = this.initFootprintId();
        await this.fetchData();
    }
  }
  
  setCorporateName(denominationUniteLegale) {this.corporateName = denominationUniteLegale}
  setActivityCode(activityCode) {this.activityCode = activityCode}
  setAreaCode(areaCode) {this.areaCode = areaCode}
  setAmount(amount) {this.amount = amount}

  /* ---------- Fetch Data ---------- */  

  // Fetch all data
  async fetchData() 
  {
    this.dataFetched = false;
    // Fetch footprint
    if (this.footprintId!=null) 
    {  
      let endpoint = apiBaseUrl + "siren/" + this.footprintId;
      let response = await fetch(endpoint, {method:'get'});
      let data = await response.json();
      if (data.header.statut == 200) {
        this.dataFetched = true;
        this.legalUnitName = data.profil.descriptionUniteLegale.denomination;
        this.areaCode = "FRA";
        this.activityCode = data.profil.descriptionUniteLegale.activitePrincipale;
        this.footprint.dataFetched = true;
        this.footprint.updateAll(data.profil.empreinteSocietale);
      }
    }
    // Fetch default data
    if (!this.dataFetched) {
      let area = this.areaCode || "_DV";
      let activity = this.activityCode || "00";
      let endpoint = apiBaseUrl + "default?" + "pays="+area + "&activite="+activity +"&flow=PRD";
      let response = await fetch(endpoint, {method:'get'});
      let data = await response.json();
      if (data.header.statut == 200) {
        this.footprint.areaCode = area;
        this.footprint.activityCode = activity;
        this.footprint.updateAll(data.empreinteSocietale);
      } else {
        endpoint = apiBaseUrl + "default?pays=_DV&activite=00&flow=GAP";
        response = await fetch(endpoint, {method:'get'});
        data = await response.json();
        this.footprint.areaCode = "_DV";
        this.footprint.activityCode = "00";
        this.footprint.updateAll(data.empreinteSocietale);
      }
    }
  }

  // Fetch footprint data for all indicators & complete general data
  fetchFootprintdata() {
      this.footprint.fetchData();
  }
      
  // Fetch only CSF data for a specific indicator
  async fetchIndicFootprintData(indic) {
    this.footprint.fetchIndicFootprintData(indic);
  }

  /* ---------- Getters ---------- */

  getId() {return this.id}
  
  getCorporateId() {return this.corporateId}
  getCorporateName() {return this.corporateName}

  getAreaCode() {return this.areaCode}
  getActivityCode() {return this.activityCode}
  
  getFootprint() {return this.footprint}

  isDataFetched() {return this.dataFetched}

  getAmount() {return this.amount}

  getEconomicDivision() {
    if (this.corporateActivity!=null) {
        if (this.corporateActivity.length()>=2) {
            return this.corporateActivity.substring(0, 2);
        } else {return "00"}
    } else {return "00"}
  }
  
}
