import { ComparativeFootprint } from "./footprintObjects/ComparativeFootprint";

export class ComparativeData { 
  constructor(props) {
    if (props == undefined) props = {};

    // Activity Code for comparative division 
    this.activityCode = props.activityCode || "00";

    //Get Comparative footprint for each aggreagate 

    this.fixedCapitalConsumption = props.fixedCapitalConsumption || {
      areaFootprint: new ComparativeFootprint(),
      targetAreaFootprint: new ComparativeFootprint(),
      divisionFootprint: new ComparativeFootprint(),
      targetDivisionFootprint : new ComparativeFootprint(),
      trendsFootprint: new ComparativeFootprint(),
    };
  
    this.intermediateConsumption = props.intermediateConsumption || {
      areaFootprint: new ComparativeFootprint(),
      targetAreaFootprint: new ComparativeFootprint(),
      divisionFootprint: new ComparativeFootprint(),
      targetDivisionFootprint : new ComparativeFootprint(),
      trendsFootprint: new ComparativeFootprint(),
    };

    this.production = props.production || {
      areaFootprint: new ComparativeFootprint(),
      targetAreaFootprint: new ComparativeFootprint(),
      divisionFootprint: new ComparativeFootprint(),
      targetDivisionFootprint : new ComparativeFootprint(),
      trendsFootprint: new ComparativeFootprint(),
    };
    
    this.netValueAdded = props.intermediateConsumption || {
      areaFootprint: new ComparativeFootprint(),
      targetAreaFootprint: new ComparativeFootprint(),
      divisionFootprint: new ComparativeFootprint(),
      targetDivisionFootprint : new ComparativeFootprint(),
      trendsFootprint: new ComparativeFootprint(),
    };
  }
}


  // Update Comparative Data
  export async function updateAreaFootprint(indic, 
    comparativeData, 
    fixedCapitalConsumption,
    intermediateConsumption,
    production,netValueAdded) {
    

    const newFixedCapitalConsumption = Object.assign({}, comparativeData.fixedCapitalConsumption.areaFootprint.indicators, {
      ...comparativeData.fixedCapitalConsumption.areaFootprint.indicators,
        [indic] : {
          value : fixedCapitalConsumption ? fixedCapitalConsumption.value : null,
          flag : fixedCapitalConsumption ? fixedCapitalConsumption.flag : null,
        }
     
    }
    );

    const newIntermediateConsumption = Object.assign({}, comparativeData.intermediateConsumption.areaFootprint.indicators, {
      ...comparativeData.intermediateConsumption.areaFootprint.indicators,
        [indic] : {
          value : intermediateConsumption ?  intermediateConsumption.value : null,
          flag : intermediateConsumption ? intermediateConsumption.flag : null,
        }
     
    }
    );

    const newProduction = Object.assign({}, comparativeData.production.areaFootprint.indicators, {
      ...comparativeData.production.areaFootprint.indicators,
        [indic] : {
          value : production ? production.value : null,
          flag : production ? production.flag : null,
        }
     
    }
    );

    const newNetValueAdded = Object.assign({}, comparativeData.netValueAdded.areaFootprint.indicators, {
      ...comparativeData.netValueAdded.areaFootprint.indicators,
        [indic] : {
          value : netValueAdded ? netValueAdded.value : null,
          flag : netValueAdded ? netValueAdded.flag : null,
        }
     
    }
    );

    const updatedAreaFootprint = Object.assign({}, comparativeData, {
      fixedCapitalConsumption: {
        ...comparativeData.fixedCapitalConsumption,
        areaFootprint : {
          indicators : newFixedCapitalConsumption
        }
       },
       intermediateConsumption: {
        ...comparativeData.intermediateConsumption,
        areaFootprint : {
            indicators : newIntermediateConsumption
                },
       },
       netValueAdded: {
        ...comparativeData.netValueAdded,
        areaFootprint : {
            indicators : newNetValueAdded
        },
       },
       production: {
        ...comparativeData.production,
        areaFootprint : {
            indicators : newProduction
        },
       },
    }); 
    return updatedAreaFootprint;
  }

  export async function updateTargetAreaFootprint(indic, 
    comparativeData, 
    fixedCapitalConsumption,
    intermediateConsumption,
    production,netValueAdded) {
    

    const newFixedCapitalConsumption = Object.assign({}, comparativeData.fixedCapitalConsumption.targetAreaFootprint.indicators, {
      ...comparativeData.fixedCapitalConsumption.targetAreaFootprint.indicators,
        [indic] : {
          value : fixedCapitalConsumption ? fixedCapitalConsumption.value : null,
          flag : fixedCapitalConsumption ? fixedCapitalConsumption.flag : null,
        }
     
    }
    );

    const newIntermediateConsumption = Object.assign({}, comparativeData.intermediateConsumption.targetAreaFootprint.indicators, {
      ...comparativeData.intermediateConsumption.targetAreaFootprint.indicators,
        [indic] : {
          value : intermediateConsumption ? intermediateConsumption.value : null,
          flag : intermediateConsumption ? intermediateConsumption.flag : null,
        }
     
    }
    );

    const newProduction = Object.assign({}, comparativeData.production.targetAreaFootprint.indicators, {
      ...comparativeData.production.targetAreaFootprint.indicators,
        [indic] : {
          value : production ? production.value : null,
          flag : production ? production.flag : null,
        }
     
    }
    );

    const newNetValueAdded = Object.assign({}, comparativeData.netValueAdded.targetAreaFootprint.indicators, {
      ...comparativeData.netValueAdded.targetAreaFootprint.indicators,
        [indic] : {
          value : netValueAdded ? netValueAdded.value : null,
          flag : netValueAdded ? netValueAdded.flag : null,
        }
     
    }
    );


    const updatedTargetFootprint = Object.assign({}, comparativeData, {
      fixedCapitalConsumption: {
        ...comparativeData.fixedCapitalConsumption,
        targetAreaFootprint : {
          indicators : newFixedCapitalConsumption
        }
       },
       intermediateConsumption: {
        ...comparativeData.intermediateConsumption,
        targetAreaFootprint : {
            indicators : newIntermediateConsumption
        },
       },
       netValueAdded: {
        ...comparativeData.netValueAdded,
        targetAreaFootprint : {
            indicators : newNetValueAdded
        },
       },
       production: {
        ...comparativeData.production,
        targetAreaFootprint : {
            indicators : newProduction
        },
       },
    }); 

    return updatedTargetFootprint;
  }

  export async function updateDivisionFootprint(indic, 
    comparativeData, 
    fixedCapitalConsumption,
    intermediateConsumption,
    production,netValueAdded) {
    

    const newFixedCapitalConsumption = Object.assign({}, comparativeData.fixedCapitalConsumption.divisionFootprint.indicators, {
      ...comparativeData.fixedCapitalConsumption.divisionFootprint.indicators,
        [indic] : {
          value : fixedCapitalConsumption ? fixedCapitalConsumption.value : null,
          flag : fixedCapitalConsumption ? fixedCapitalConsumption.flag : null,
        }
     
    }
    );

    const newIntermediateConsumption = Object.assign({}, comparativeData.intermediateConsumption.divisionFootprint.indicators, {
      ...comparativeData.intermediateConsumption.divisionFootprint.indicators,
        [indic] : {
          value : intermediateConsumption ? intermediateConsumption.value : null,
          flag : intermediateConsumption ? intermediateConsumption.flag : null,
        }
     
    }
    );

    const newProduction = Object.assign({}, comparativeData.production.divisionFootprint.indicators, {
      ...comparativeData.production.divisionFootprint.indicators,
        [indic] : {
          value : production ? production.value : null,
          flag : production ? production.flag : null,
        }
     
    }
    );

    const newNetValueAdded = Object.assign({}, comparativeData.netValueAdded.divisionFootprint.indicators, {
      ...comparativeData.netValueAdded.divisionFootprint.indicators,
        [indic] : {
          value : netValueAdded ? netValueAdded.value : null,
          flag : netValueAdded ? netValueAdded.flag : null,
        }
     
    }
    );


    const updatedDivisionFootprint = Object.assign({}, comparativeData, {
      fixedCapitalConsumption: {
        ...comparativeData.fixedCapitalConsumption,
        divisionFootprint : {
          indicators : newFixedCapitalConsumption
        }
       },
       intermediateConsumption: {
        ...comparativeData.intermediateConsumption,
        divisionFootprint : {
            indicators : newIntermediateConsumption
        },
       },
       netValueAdded: {
        ...comparativeData.netValueAdded,
        divisionFootprint : {
            indicators : newNetValueAdded
        },
       },
       production: {
        ...comparativeData.production,
        divisionFootprint : {
            indicators : newProduction
        },
       },
    }); 

    return updatedDivisionFootprint;
  }

  export async function updateTargetDivisionFootprint(indic, 
    comparativeData, 
    fixedCapitalConsumption,
    intermediateConsumption,
    production,netValueAdded) {
    

    const newFixedCapitalConsumption = Object.assign({}, comparativeData.fixedCapitalConsumption.targetDivisionFootprint.indicators, {
      ...comparativeData.fixedCapitalConsumption.targetDivisionFootprint.indicators,
        [indic] : {
          value : fixedCapitalConsumption ? fixedCapitalConsumption.value : null,
          flag : fixedCapitalConsumption ? fixedCapitalConsumption.flag : null,
        }
     
    }
    );

    const newIntermediateConsumption = Object.assign({}, comparativeData.intermediateConsumption.targetDivisionFootprint.indicators, {
      ...comparativeData.intermediateConsumption.targetDivisionFootprint.indicators,
        [indic] : {
          value : intermediateConsumption ? intermediateConsumption.value : null,
          flag : intermediateConsumption ? intermediateConsumption.flag : null,
        }
     
    }
    );

    const newProduction = Object.assign({}, comparativeData.production.targetDivisionFootprint.indicators, {
      ...comparativeData.production.targetDivisionFootprint.indicators,
        [indic] : {
          value : production ? production.value : null,
          flag : production ? production.flag : null,
        }
     
    }
    );

    const newNetValueAdded = Object.assign({}, comparativeData.netValueAdded.targetDivisionFootprint.indicators, {
      ...comparativeData.netValueAdded.targetDivisionFootprint.indicators,
        [indic] : {
          value : netValueAdded ? netValueAdded.value : null,
          flag : netValueAdded ? netValueAdded.flag : null,
        }
     
    }
    );


    const updatedTargetFootprint = Object.assign({}, comparativeData, {
      fixedCapitalConsumption: {
        ...comparativeData.fixedCapitalConsumption,
        targetDivisionFootprint : {
          indicators : newFixedCapitalConsumption
        }
       },
       intermediateConsumption: {
        ...comparativeData.intermediateConsumption,
        targetDivisionFootprint : {
            indicators : newIntermediateConsumption
        },
       },
       netValueAdded: {
        ...comparativeData.netValueAdded,
        targetDivisionFootprint : {
            indicators : newNetValueAdded
        },
       },
       production: {
        ...comparativeData.production,
        targetDivisionFootprint : {
            indicators : newProduction
        },
       },
    }); 

    return updatedTargetFootprint;
  }


