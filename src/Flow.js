import { EconomicValue } from "./EconomicValue";

export class Flow extends EconomicValue {

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

}