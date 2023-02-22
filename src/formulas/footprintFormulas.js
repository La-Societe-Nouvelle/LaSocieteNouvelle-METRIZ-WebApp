// La Société Nouvelle

// Components
import { roundValue } from '../utils/Utils';

// Utils
import { Indicator } from '/src/footprintObjects/Indicator';

// Librairies
import metaIndics from '/lib/indics';
import { SocialFootprint } from '../footprintObjects/SocialFootprint';

/* ------------------------------------------------------------ */
/* -------------------- FOOTPRINT FORMULAS -------------------- */
/* ------------------------------------------------------------ */

export async function buildAggregateFpt(elements,usePrev) 
{
    let footprint = new SocialFootprint();
    let indics = Object.keys(metaIndics);
    await Promise.all(
        indics.map(async indic => {
            let indicator = await buildIndicatorAggregate(indic,elements,usePrev);
            footprint.indicators[indic] = indicator;
            return;
        })
    )
    return footprint;
}

export function buildIndicatorAggregate(indic,elements,usePrev) 
{
    let indicator = new Indicator({indic});
    
    let precision = metaIndics[indic].nbDecimals;

    let totalAmount = 0.0;
    let grossImpact = 0.0;
    let grossImpactMax = 0.0;
    let grossImpactMin = 0.0;

    let missingData = false;
    
    elements.forEach((element) => 
    {
        let amount = usePrev ? element.prevAmount : element.amount;
        let indicatorElement = usePrev ? element.prevFootprint.indicators[indic] : element.footprint.indicators[indic];

        if (amount!=null && amount!=0 && indicatorElement.getValue()!=null) 
        {
            grossImpact+= indicatorElement.getValue()*amount;
            grossImpactMax+= Math.max(indicatorElement.getValueMax()*amount,indicatorElement.getValueMin()*amount);
            grossImpactMin+= Math.min(indicatorElement.getValueMax()*amount,indicatorElement.getValueMin()*amount);
            totalAmount+= amount;
        } 
        else if (amount==null || (amount!=0 && indicatorElement.getValue()==null)) {missingData = true}
    })

    if (!missingData && totalAmount != 0) { 
        indicator.setValue(roundValue(grossImpact/totalAmount, precision));
        let uncertainty = Math.abs(grossImpact) > 0 ? roundValue(Math.max( Math.abs(grossImpactMax-grossImpact) , Math.abs(grossImpact-grossImpactMin) ) / Math.abs(grossImpact) * 100, 0) : 0;
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

export async function megreFpt(footprintA,amountA,footprintB,amountB)
{
    let footprint = new SocialFootprint();
    let indics = Object.keys(metaIndics);
    await Promise.all(
        indics.map(async indic => {
            let indicatorA = footprintA.indicators[indic];
            let indicatorB = footprintB.indicators[indic];
            let indicator = await buildIndicatorMerge(indicatorA,amountA,indicatorB,amountB);
            footprint.indicators[indic] = indicator;
            return;
        })
    )
    return footprint;
}

export function buildIndicatorMerge(indicatorA,amountA,
                                    indicatorB,amountB)
{
    let indicator = new Indicator({indic: indicatorA.getIndic()});

    let precision = metaIndics[indicator.indic].nbDecimals;

    if (indicatorA.getValue()!=null && amountA!=null && amountA!=0
     && indicatorB.getValue()!=null && amountB!=null && amountB!=0)
    {
        let totalAmount = amountA + amountB;
        let grossImpact = indicatorA.getValue()*amountA + indicatorB.getValue()*amountB;
        let grossImpactMax = Math.max(indicatorA.getValueMax()*amountA, indicatorA.getValueMin()*amountA) 
                           + Math.max(indicatorB.getValueMax()*amountB, indicatorB.getValueMin()*amountB);
        let grossImpactMin = Math.min(indicatorA.getValueMax()*amountA, indicatorA.getValueMin()*amountA)
                           + Math.min(indicatorB.getValueMax()*amountB, indicatorB.getValueMin()*amountB);

        if (totalAmount != 0) {
            indicator.setValue(roundValue(grossImpact/totalAmount, precision));
            let uncertainty = Math.abs(grossImpact) > 0 ? roundValue( Math.max( Math.abs(grossImpactMax-grossImpact) , Math.abs(grossImpact-grossImpactMin) )/Math.abs(grossImpact) * 100 , 0) : 0;
            indicator.setUncertainty(uncertainty);
        } else {
            indicator.setValue(null); 
            indicator.setUncertainty(null);
        }
    }
    else if (indicatorA.getValue()!=null && amountA!=null && amountA!=0 && amountB!=null && amountB==0)
    {
        indicator.setValue(indicatorA.getValue());
        indicator.setUncertainty(indicatorA.getUncertainty());
    }
    else if (indicatorB.getValue()!=null && amountB!=null && amountB!=0 && amountA!=null && amountA==0)
    {
        indicator.setValue(indicatorB.getValue());
        indicator.setUncertainty(indicatorB.getUncertainty());
    }
     
    return indicator;
}