import {Indicator} from './Indicator';

const indics = ["eco","art","soc","knw","dis","geq","ghg","mat","was","nrg","wat","haz"];

export class HistoricalFootprint {

  constructor(props) 
  {
  // ---------------------------------------------------------------------------------------------------- //
  if (props==undefined) props = {indicators: {}};
    // indicators
    this.indicators = {};

    indics.forEach(indic => this.indicators[indic] = {data : new Array(1).fill(new Indicator({indic,...props.indicators[indic]})), meta : {}})

    
  // ---------------------------------------------------------------------------------------------------- //
  }


}