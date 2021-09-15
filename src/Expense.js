import { EconomicValue } from "./EconomicValue";

export class Expense extends EconomicValue {

  constructor({id,label,amount,footprint,
               account,accountLib,
               accountAux,accountAuxLib}) 
  {
    super({id,label,amount,footprint})
    
    this.account = account || "";
    this.accountLib = accountLib || "";

    this.accountAux = accountAux || "";
    this.accountAuxLib = accountAuxLib || "";
  }

  update = (props) => super.update(props)
  
  /* ---------- Getters ---------- */

  getAccount = () => this.account
  getAccountAux = () => this.accountAux

  /* ---------- Setters ---------- */

  setAccount(account) {this.account = account}
  setCompany(company) 
  {
    this.accountAux = company.accountAux;
    this.footprint = company.footprint
  }

}