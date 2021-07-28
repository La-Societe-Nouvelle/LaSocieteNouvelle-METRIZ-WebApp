import {SocialFootprint} from "/src/SocialFootprint.js";

export class EconomicValue {

  constructor({id,label,amount,footprint}) 
  {
    this.id = id || 0;
    this.label = label || "";
    this.amount = amount!=undefined ? amount : 0.0;
    this.footprint = footprint || new SocialFootprint(); 
  }

  update(props) {
    if (props.label!=undefined) this.label = props.label;
    if (props.amount!=undefined) this.amount = props.amount;
    if (props.footprint!=undefined) this.footprint = props.footprint;
  }

  /* ---------- Back Up ---------- */

  updateFromBackUp(backUp) {
    this.label = backUp.label || "";
    this.amount = backUp.amount;
    this.footprint = new SocialFootprint();
    this.footprint.updateFromBackUp(backUp.footprint); 
  }

  /* ---------- Getters ---------- */

  getId() {return this.id}
  getLabel() {return this.label}
  getAmount() {return this.amount}
  getFootprint() {return this.footprint}
  isDataFetched() {return this.footprint.isDataFetched()}


  /* ---------- Setters ---------- */

  setLabel(label) {this.label = label}
  setAmount(amount) {this.amount = amount}
  setFootprint(footprint) {this.footprint = footprint} // evolution : update only not modified data

  /* ---------- Fetch Data ---------- */  

  // Fetch data
  async fetchFootprintData() 
  {
    this.footprint.fetchData();
  }  

  async updateFromRemote() {
    await this.footprint.updateFromRemote();
  }

  async updateIndicFromRemote(indic) {
    await this.footprint.updateFromRemote(indic);
  }


}