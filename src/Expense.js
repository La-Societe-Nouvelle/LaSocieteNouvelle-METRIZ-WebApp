import {SocialFootprint} from "/src/SocialFootprint.js";

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";

export class Expense {

  constructor({id,label,account,companyId,corporateId,corporateName,amount,footprint,dataFetched}) 
  {
    // Id
    this.id = id;
    
    // Information
    this.label = label!=undefined ? label : ""; // 14-07-2021
    this.account = account!=undefined ? account : ""; // 14-07-2021
    this.companyId = companyId!=undefined ? companyId : ""; // 14-07-2021

    // Company
    this.corporateId = corporateId!=undefined ? corporateId : "";
    this.corporateName = corporateName!=undefined ? corporateName : "";
    this.areaCode = this.initAreaCode();
    this.corporateActivity = "00";
    
    // Amount
    this.amount = amount!=undefined ? amount : 0.0;
    
    // Social footprint
    this.footprintId = this.initFootprintId();
    this.footprint = footprint!=undefined ? footprint : new SocialFootprint(); 
    
    // Sync
    this.dataFetched = dataFetched!=undefined ? dataFetched : false;
    //this.fetchData(); -- conflict with backup
  }

  // init area code
  initAreaCode() {
    if (this.corporateId.match("[0-9]{9}")) {return "FRA"}
    else {return "WLD"}
  }

  // init footrpint id
  initFootprintId() {
    // SIREN
    if (this.corporateId.match("[0-9]{9}")) {return this.corporateId}
    // SIRET
    else if (this.corporateId.match("[0-9]{14}")) {return this.corporateId.substring(0,9)}
    // VAT NUMBER
    else if (this.corporateId.match("FR[0-9]{11}")) {return this.corporateId.substring(4,11)}
    // DEFAULT
    else {return null}
  }

  update(props) {
    if (props.label!=undefined)           this.label = props.label;
    if (props.account!=undefined)         this.account = props.account;
    if (props.companyId!=undefined)       this.companyId = props.companyId;
    if (props.corporateId!=undefined)     this.corporateId = props.corporateId;
    if (props.corporateName!=undefined)   this.corporateName = props.corporateName;
    if (props.amount!=undefined)          this.amount = props.amount;
    if (props.footprint!=undefined)       this.footprint = props.footprint;
    if (props.dataFetched!=undefined)     this.dataFetched = props.dataFetched;
  }

  /* ---------- Setters ---------- */

  updateFromBackUp(backUp) {
    this.label = backUp.label!=undefined ? backUp.label : "";
    this.account = backUp.account!=undefined ? backUp.account : "";
    this.companyId = backUp.companyId;
    this.corporateId = backUp.corporateId;
    this.corporateName = backUp.corporateName;
    this.areaCode = backUp.areaCode;
    this.corporateActivity = backUp.corporateActivity;
    this.amount = backUp.amount;
    this.footprintId = backUp.footprintId;
    this.footprint = new SocialFootprint();
      this.footprint.updateFromBackUp(backUp.footprint); 
    this.dataFetched = backUp.dataFetched;
  }

  /* ---------- Setters ---------- */

  setLabel(label) {this.label = label}
  setAccount(account) {this.account = account}
  setCorporateId(identifiant) {this.corporateId = identifiant; this.footprintId = this.initFootprintId()}
  setCorporateName(denominationUniteLegale) {this.corporateName = denominationUniteLegale}
  setCorporateActivity(corporateActivity) {this.corporateActivity = corporateActivity}
  setAreaCode(geo) {this.areaCode = geo}
  setAmount(amount) {this.amount = amount}
  setFootprint(footprint) {
    this.footprint = footprint
    // evolution : update only not modified data
  }

  /* ---------- Fetch Data ---------- */  

  // Fetch all data
  async fetchData() 
  {
    this.dataFetched = false;

    if (this.footprintId!=null) 
    {  
      let endpoint = apiBaseUrl + "siren/" + this.footprintId;
      let response = await fetch(endpoint, {method:'get'});
      let data = await response.json();
      if (data.header.statut == 200) {
        this.corporateName = data.profil.descriptionUniteLegale.denomination;
        this.corporateActivity = data.profil.descriptionUniteLegale.activitePrincipale;
        this.areaCode = "FRA";
        this.footprint.updateAll(data.profil.empreinteSocietale);
        this.dataFetched = true;
      }
    }
    
    if (!this.dataFetched) {
      let area = this.areaCode !="" ? this.areaCode : "_DV";
      let activity = this.corporateActivity!=null ? this.corporateActivity : "00";
      let endpoint = apiBaseUrl + "default?" + "pays="+area + "&activite="+activity +"&flow=PRD";
      let response = await fetch(endpoint, {method:'get'});
      let data = await response.json();
      if (data.header.statut != 200) {
        endpoint = apiBaseUrl + "default?pays=_DV&activite=00&flow=GAP";
        response = await fetch(endpoint, {method:'get'});
        data = await response.json();
      }
      this.footprint.updateAll(data.empreinteSocietale);
    }
      
  }

  // Fetch CSF data for all indicators & complete general data
  fetchCSFdata() {
      let response = fetchFootprintData(footprintId);
      dataFetched = response.isValid();
      if (response.isValid()) {
          if (corporateName.equals("")) { corporateName = response.getDenomination(); }
          if (corporateActivity.equals("")) { corporateActivity = response.getEconomicBranch(); }
          if (areaCode.equals("")) { areaCode = "FRA"; }
          footprint.updateAll(response);
          
      } else {
          // to be continued
      }
  }
      
  // Fetch only CSF data for a specific indicator
  async fetchIndicCSFdata(indic) {
    if (this.footprintId!=null)
    {
      let response = await fetchFootprintData(this.footprintId);
      if (response!=null) {
        let indicData = response.profil.empreinteSocietale[indic.toUpperCase()];
        this.footprint.updateIndic(indic, indicData);
      }
    }
    else
    {
        let division = getEconomicDivision();
        let pays = "FRA";
        let response = fetchDefaultData(pays,division);
        if (response.isValid()) {
            this.footprint.updateIndic(indic,response);
        }
    }
  }

  /* ---------- Getters ---------- */

  getId() {return this.id}
  getLabel() {return this.label}
  getAccount() {return this.account}
  getCorporateId() {return this.corporateId}
  getCorporateName() {return this.corporateName}
  getCorporateActivity() {return this.corporateActivity}

   getEconomicDivision() {
      if (this.corporateActivity!=null) {
          if (this.corporateActivity.length()>=2) {
              return this.corporateActivity.substring(0, 2);
          } else {return "00"}
      } else {return "00"}
  }

  getAreaCode() {return this.areaCode}
  getAmount() {return this.amount}
  getFootprint() {return this.footprint}
  isDataFetched() {return this.dataFetched}

}

async function fetchFootprintData(siren) {
  try{
    const endpoint = `${apiBaseUrl}/siren/${siren}`;
    const response = await fetch(endpoint, {method:'get'});
    const data = await response.json();
    if (data.header.statut===200) {
      return data;
    } else {
      return null;
    }
  } catch(error){
    throw error;
  }
}

async function fetchDefaultData(pays,activite) {
  try{
    const endpoint = `${apiBaseUrl}/default?pays=${pays}&activite=${activite}&flow=PRD`;
    const response = await fetch(endpoint, {method:'get'});
    const data = await response.json();
    if (data.header.statut===200) {
      return data;
    } else {
      return null;
    }
  } catch(error){
    throw error;
  }
}