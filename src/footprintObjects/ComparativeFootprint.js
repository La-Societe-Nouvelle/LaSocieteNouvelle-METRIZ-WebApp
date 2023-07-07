import {Indicator} from './Indicator';

const indics = ["eco","art","soc","knw","idr","geq","ghg","mat","was","nrg","wat","haz"];

export class ComparativeFootprint {

  constructor(props) 
  {
  // ---------------------------------------------------------------------------------------------------- //
  if (props==undefined) props = {indicators: {}};
    // indicators
    this.indicators = {};
    indics.forEach(indic => this.indicators[indic] = new Indicator({indic,...props.indicators[indic]}) )
  // ---------------------------------------------------------------------------------------------------- //
  }


}

