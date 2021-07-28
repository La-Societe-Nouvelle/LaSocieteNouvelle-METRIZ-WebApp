import { EconomicValue } from "./EconomicValue";

export class Expense extends EconomicValue {

  constructor({id,label,amount,account,accountProvider,companyId,companyName,footprint}) 
  {
    super({id,label,amount,footprint})
    
    this.account = account || "";
    this.accountProvider = accountProvider || "";
    this.companyId = companyId || "";
    this.companyName = companyName || "";
  }

  update(props) {
    super.update(props);
    if (props.account!=undefined) this.account = props.account;
    if (props.accountProvider!=undefined) this.accountProvider = props.accountProvider;
    if (props.companyId!=undefined) this.companyId = props.companyId;
    if (props.companyName!=undefined) this.companyName = props.companyName;
  }

  /* ---------- Back Up ---------- */

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.account = backUp.account || "";
    this.accountProvider = backUp.accountProvider || "";
    this.companyId = backUp.companyId || "";
    this.companyName = backUp.companyName || "";
  }
  
  /* ---------- Getters ---------- */

  getAccount() {return this.account}
  getAccountProvider() {return this.accountProvider}
  getCompanyId() {return this.companyId}
  getCompanyId() {return this.companyName}

  /* ---------- Setters ---------- */

  setAccount(account) {this.account = account}
  setCompany(company) {
    this.accountProvider = company.accountAux;
    this.companyId = company.id;
    this.companyName = company.corporateName;
    this.footprint = company.footprint
  }

}