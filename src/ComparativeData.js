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


  export async function updateAggregatesFootprint(indic,prevComparativeData, newComparativeData, serie) {
    
    const newFixedCapitalConsumption = Object.assign({}, prevComparativeData.fixedCapitalConsumption[serie].indicators, {
      ...prevComparativeData.fixedCapitalConsumption[serie].indicators,
        [indic] : {
          value : newComparativeData.fixedCapitalConsumption ? newComparativeData.fixedCapitalConsumption.value : null,
          flag : newComparativeData.fixedCapitalConsumption ? newComparativeData.fixedCapitalConsumption.flag : null,
        }
     
    }
    );


    const newIntermediateConsumption = Object.assign({}, prevComparativeData.intermediateConsumption[serie].indicators, {
      ...prevComparativeData.intermediateConsumption[serie].indicators,
        [indic] : {
          value :  newComparativeData.intermediateConsumption ?   newComparativeData.intermediateConsumption.value : null,
          flag :  newComparativeData.intermediateConsumption ?  newComparativeData.intermediateConsumption.flag : null,
        }
     
    }
    );

    const newProduction = Object.assign({}, prevComparativeData.production[serie].indicators, {
      ...prevComparativeData.production[serie].indicators,
        [indic] : {
          value :  newComparativeData.production ?  newComparativeData.production.value : null,
          flag :  newComparativeData.production ?  newComparativeData.production.flag : null,
        }
     
    }
    );

    const newNetValueAdded = Object.assign({}, prevComparativeData.netValueAdded[serie].indicators, {
      ...prevComparativeData.netValueAdded[serie].indicators,
        [indic] : {
          value :  newComparativeData.netValueAdded ? newComparativeData.netValueAdded.value : null,
          flag :  newComparativeData.netValueAdded ?  newComparativeData.netValueAdded.flag : null,
        }
     
    }
    );

    const updatedAggregatesFootprint = Object.assign({}, prevComparativeData, {
      fixedCapitalConsumption: {
        ...prevComparativeData.fixedCapitalConsumption,
        [serie] : {
          indicators : newFixedCapitalConsumption
        }
       },
       intermediateConsumption: {
        ...prevComparativeData.intermediateConsumption,
        [serie] : {
            indicators : newIntermediateConsumption
                },
       },
       netValueAdded: {
        ...prevComparativeData.netValueAdded,
        [serie] : {
            indicators : newNetValueAdded
        },
       },
       production: {
        ...prevComparativeData.production,
        [serie] : {
            indicators : newProduction
        },
       },
    }); 

    return updatedAggregatesFootprint;

  }

