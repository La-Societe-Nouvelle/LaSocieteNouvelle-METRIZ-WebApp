import { ifDefined } from "/src/utils/Utils";

export class Indicator {

  constructor(props) 
  {
    if (props==undefined) props = {};

    // ---------------------------------------------------------------------------------------------------- //
    
    this.indic = props.indic;
    this.value = props.value!=undefined ? props.value : null;
    this.flag = props.flag!=undefined ? props.flag : null;
    this.uncertainty = props.uncertainty!=undefined ? props.uncertainty : null;
    this.source = props.source!=undefined ? props.source : "";
    this.info = props.info!=undefined ? props.info : "";
    
    // Complements
    this.libelleFlag = props.libelleFlag!=undefined ? props.libelleFlag : null;
  // ---------------------------------------------------------------------------------------------------- //
  }

  updateFromBackUp(backUp) 
  {
    this.value = backUp.value;
    this.flag = backUp.flag;
    this.uncertainty = backUp.uncertainty;
    this.libelleFlag = backUp.libelleFlag;
    this.info = backUp.info;
  }

  /* ---------- Getters ---------- */
    
  getIndic = () => this.indic
  getValue = () => this.value  
  getFlag = () => this.flag
  getInfo = () => this.info
  getSource = () => this.source
  
  getUncertainty() {
    if (this.getValue()!=null) {return this.uncertainty}
    else                       {return null}
  }

  getLibelleFlag() {return this.libelleFlag}

  // Values

  getGrossImpact = (amount) =>
  {
    if (amount!=null && this.value!=null) 
    { 
        if      (["ghg","haz","mat","nrg","was","wat"].includes(this.indic))  { return amount*this.value/1000; }
        else if (["art","eco","knw","soc"].includes(this.indic))              { return amount*this.value/100; }
        else                                                                  { return null; }
    }
    else {return null}
  }

  getValueAbsolute(amount) {
    if (amount!=null && this.getValue()!=null) 
    { 
        if      (["ghg","haz","mat","nrg","was","wat"].includes(this.indic))  { return amount*this.getValue()/1000; }
        else if (["art","eco","knw","soc"].includes(this.indic))              { return amount*this.getValue()/100; }
        else                                                                  { return null; }
    }
    else {return null}
  }
  getValueMax() {
    if (this.value!=null & this.getUncertainty()!=null) {
        let coef = 1.0 + this.getUncertainty()/100;
        if (["art","dis","eco","geq","knw","soc"].includes(this.indic)) {
            return Math.min(this.value*coef,100.0);
        } else {
            return this.value*coef;
        }
    } else {return null}
  }
  getValueMin() {
    if (this.value!=null & this.getUncertainty()!=null) {
        let coef = Math.max(1.0 - this.getUncertainty()/100, 0.0);
        return this.value*coef;
    } else  {return null}
  }

  /* ---------- Update from API & Setters ---------- */
    
  update(data) {
    this.value = data.value;
    this.flag = data.flag;
    this.uncertainty = data.uncertainty;
    this.info = data.info;
    this.source = data.source;
    // Complements
    this.libelleFlag = data.libelleFlag;
  }
        
  setValue(value) 
  {
    this.value = value;
    if (value!=null) 
    {
        this.flag = "m";
        this.libelleFlag = "Valeur modifiée";
    } 
    else 
    {
        this.flag = "i";
        this.libelleFlag = "Valeur invalide";
        this.uncertainty = null;
    }
  }

  setUncertainty(value) 
  {
    this.uncertainty = value;
  }

}