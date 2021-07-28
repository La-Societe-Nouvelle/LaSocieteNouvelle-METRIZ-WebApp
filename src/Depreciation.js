import { EconomicValue } from './EconomicValue';

export class Depreciation extends EconomicValue {

  constructor({id,label,amount,account,accountImmobilisation,footprint}) 
  {
    super({id,label,amount,footprint})

    this.account = account;
    this.accountImmobilisation = accountImmobilisation;
  }

  update(props) {
    super.update(props);
    if (props.account!=undefined) this.account = props.account;
    if (props.accountImmobilisation!=undefined) this.accountImmobilisation = props.accountImmobilisation;
  }

  /* ---------- Back Up ---------- */

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.account = backUp.account || "";
    this.accountImmobilisation = backUp.accountImmobilisation || "";
  }
  
  /* ---------- Getters ---------- */

  getAccount() {return this.account}
  getAccountImmobilisation() {return this.accountImmobilisation}

  /* ---------- Setters ---------- */

  setAccount(account) {this.account = account}
  setImmobilisation(immobilisation) {
    this.accountImmobilisation = immobilisation.account;
    this.footprint = immobilisation.footprint
  }

}