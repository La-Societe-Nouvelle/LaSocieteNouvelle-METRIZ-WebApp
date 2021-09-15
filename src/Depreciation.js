import { EconomicValue } from './EconomicValue';

export class Depreciation extends EconomicValue {

  constructor({id,label,amount,footprint,
               account,accountLib,
               accountAux,accountAuxlib}) 
  {
    super({id,label,amount,footprint})

    this.account = account;
    this.accountLib = accountLib;

    this.accountAux = accountAux;
    this.accountAuxLib = accountAuxlib;
  }

  update(props) {
    super.update(props);
    if (props.account!=undefined) this.account = props.account;
    if (props.accountAux!=undefined) this.accountAux = props.accountAux;
  }

  /* ---------- Back Up ---------- */

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.account = backUp.account || "";
    this.accountAux = backUp.accountImmobilisation || "";
  }
  
  /* ---------- Getters ---------- */

  getAccount() {return this.account}
  getAccountAuxn() {return this.accountAux}

  /* ---------- Setters ---------- */

  setAccount(account) {this.account = account}
  setImmobilisation(immobilisation) {
    this.accountAux = immobilisation.account;
    this.footprint = immobilisation.footprint
  }

}