// La Société Nouvelle

// Components
import { roundValue } from '../utils/Utils';

// Utils
import { Indicator } from '/src/footprintObjects/Indicator';

// Librairies
import metaIndics from '/lib/indics';

/* ------------------------------------------------------------ */
/* -------------------- FOOTPRINT FORMULAS -------------------- */
/* ------------------------------------------------------------ */


export function buildIndicatorAggregate(indic,elements,usePrev) 
{
    let indicator = new Indicator({indic});
    
    let totalAmount = 0.0;
    let grossImpact = 0.0;
    let grossImpactMax = 0.0;
    let grossImpactMin = 0.0;

    let missingData = false;
    
    elements.forEach((element) => 
    {
        let amount = usePrev ? element.prevAmount : element.amount;
        let indicatorElement = usePrev ? element.prevFootprint.indicators[indic] : element.footprint.indicators[indic];

        if (amount!=null && indicatorElement.getValue()!=null) 
        {
            grossImpact+= indicatorElement.getValue()*amount;
            grossImpactMax+= Math.max(indicatorElement.getValueMax()*amount,indicatorElement.getValueMin()*amount);
            grossImpactMin+= Math.min(indicatorElement.getValueMax()*amount,indicatorElement.getValueMin()*amount);
            totalAmount+= amount;
        } 
        else {missingData = true}
    })

    if (!missingData && totalAmount != 0) { 
        indicator.setValue(roundValue(grossImpact/totalAmount,metaIndics[indic].nbDecimals));
        let uncertainty = Math.abs(grossImpact) > 0 ? roundValue(Math.max( Math.abs(grossImpactMax-grossImpact) , Math.abs(grossImpact-grossImpactMin) )/Math.abs(grossImpact) *100 ,0) : 0;
        indicator.setUncertainty(uncertainty);
    } else if (elements.length == 0) {
        indicator.setValue(0); 
        indicator.setUncertainty(0);
    } else {
        indicator.setValue(null); 
        indicator.setUncertainty(null);
    }

    return indicator;
}

export function buildIndicatorMerge(indicatorA,amountA,
                                    indicatorB,amountB)
{
    let indicator = new Indicator({indic: indicatorA.getIndic()});

    if (indicatorA.getValue()!=null && amountA!=null
     && indicatorB.getValue()!=null && amountB!=null)
    {
        let totalAmount = amountA + amountB;
        let grossImpact = indicatorA.getValue()*amountA + indicatorB.getValue()*amountB;
        let grossImpactMax = Math.max(indicatorA.getValueMax()*amountA, indicatorA.getValueMin()*amountA) 
                           + Math.max(indicatorB.getValueMax()*amountB, indicatorB.getValueMin()*amountB);
        let grossImpactMin = Math.min(indicatorA.getValueMax()*amountA, indicatorA.getValueMin()*amountA)
                           + Math.min(indicatorB.getValueMax()*amountB, indicatorB.getValueMin()*amountB);

        if (totalAmount != 0) {
            indicator.setValue(roundValue(grossImpact/totalAmount,metaIndics[indicator.indic].nbDecimals));
            let uncertainty = Math.abs(grossImpact) > 0 ? roundValue(Math.max( Math.abs(grossImpactMax-grossImpact) , Math.abs(grossImpact-grossImpactMin) )/Math.abs(grossImpact) *100,0) : 0;
            indicator.setUncertainty(uncertainty);
        } else {
            indicator.setValue(null); 
            indicator.setUncertainty(null);
        }
    }
     
    return indicator;
}