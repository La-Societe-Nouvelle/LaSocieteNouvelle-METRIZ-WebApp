import { EconomicValue } from './EconomicValue';

export class Stock extends EconomicValue {

  constructor({id,label,amount,account,accountPurchases,footprint,prevFootprint}) 
  {
    super({id,label,amount,footprint})

    this.account = account;
    this.accountPurchases = accountPurchases;
    this.prevFootprint = prevFootprint || false;
  }

  update(props) {
    super.update(props);
    if (props.account!=undefined) this.account = props.account;
    if (props.accountPurchases!=undefined) this.accountPurchases = props.accountPurchases;
    if (props.prevFootprint!=undefined) this.prevFootprint = props.prevFootprint;
  }

  /* ---------- Getters ---------- */

  getAccount() {return this.account}
  getAccountPurchases() {return this.accountPurchases}
  getInitialAmount() {return this.amount}
  getPrevFootprint() {return this.prevFootprint}

  /* ---------- Setters ---------- */

  setAccount(nextAccount) {this.account = nextAccount}
  setAccountPurchases(accountPurchases) {this.accountPurchases = accountPurchases}
  setFootprint(nextFootprint) {this.footprint = nextFootprint}
  setPrevFootprint(nextPrevFootprint) {this.prevFootprint = nextPrevFootprint}

}