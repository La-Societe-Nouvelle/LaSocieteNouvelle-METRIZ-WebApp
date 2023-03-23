// La Société Nouvelle

// Components
import { roundValue } from '../utils/Utils';

// Utils
import { Indicator } from '/src/footprintObjects/Indicator';

// Librairies
import metaIndics from '/lib/indics';
import { SocialFootprint } from '../footprintObjects/SocialFootprint';

/* ---------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- FOOTPRINT FORMULAS ---------------------------------------- */
/* ---------------------------------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------------------------------- */
/* BUILD AGGREGATE FOOTPRINT
 *  -> footprint based on list of elements
 *
 */

export async function buildAggregateFootprint(elements,usePrev) 
{

    let footprint = new SocialFootprint();
    let indics = Object.keys(metaIndics);
    await Promise.all(
        indics.map(async indic => {
            let indicator = await buildAggregateIndicator(indic,elements,usePrev);
            footprint.indicators[indic] = indicator;
            return;
        })
    )
    return footprint;
}

export function buildAggregateIndicator(indic,elements,usePrev) 
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

/* ---------------------------------------------------------------------------------------------------- */
/* BUILD DIFFERENCE FOOTPRINT
 *  -> footprint based on substraction : itemA - itemB
 *
 */

export async function buildDifferenceFootprint(itemA,itemB) 
{
    let footprint = new SocialFootprint();
    let indics = Object.keys(metaIndics);
    await Promise.all(
        indics.map(async indic => {
            let indicator = await buildDifferenceIndicator(indic,itemA,itemB);
            footprint.indicators[indic] = indicator;
            return;
        })
    )
    return footprint;
}

export function buildDifferenceIndicator(indic,itemA,itemB)
{
    let indicator = new Indicator({indic});

    let precision = metaIndics[indicator.indic].nbDecimals;

    let amountVariation = itemA.amount - itemB.amount;
    let impactVariation = itemA.footprint.indicators[indic].getValue()*itemA.amount - itemB.footprint.indicators[indic].getValue()*itemB.amount;
    let impactMaxVariation = itemA.footprint.indicators[indic].getValueMax()*itemA.amount - itemB.footprint.indicators[indic].getValueMin()*itemB.amount;
    let impactMinVariation = itemA.footprint.indicators[indic].getValueMin()*itemA.amount - itemB.footprint.indicators[indic].getValueMax()*itemB.amount;

    if (amountVariation!=0 && impactVariation!=0) {
        indicator.setValue(roundValue(impactVariation/amountVariation, precision));
        let uncertainty = Math.abs(impactVariation) > 0 ? roundValue( Math.max( Math.abs(impactMaxVariation-impactVariation) , Math.abs(impactVariation-impactMinVariation) )/Math.abs(impactVariation) * 100 , 0) : 0;
        indicator.setUncertainty(uncertainty);
    } else {
        indicator.setValue(null);
        indicator.setUncertainty(null);
    }

    return indicator;
}

/* ---------------------------------------------------------------------------------------------------- */
/* BUILD AGGREGATE FOOTPRINT
 *  -> footprint based on list of elements
 *
 */

export async function mergeFootprints(items)
{
    let footprint = new SocialFootprint();
    let indics = Object.keys(metaIndics);
    await Promise.all(
        indics.map(async indic => {
            let indicator = await mergeIndicators(indic,items);
            footprint.indicators[indic] = indicator;
            return;
        })
    )
    return footprint;
}

export function mergeIndicators(indic,items) 
{
    let indicator = new Indicator({indic});
    
    let precision = metaIndics[indic].nbDecimals;

    let totalAmount = 0.0;
    let grossImpact = 0.0;
    let grossImpactMax = 0.0;
    let grossImpactMin = 0.0;

    let missingData = false;
    
    items.forEach((item) => 
    {
        let amount = item.amount;
        let indicator = item.footprint.indicators[indic];

        if (amount!=null && amount!=0 && indicator.getValue()!=null) 
        {
            grossImpact+= indicator.getValue()*amount;
            grossImpactMax+= Math.max(indicator.getValueMax()*amount,indicator.getValueMin()*amount);
            grossImpactMin+= Math.min(indicator.getValueMax()*amount,indicator.getValueMin()*amount);
            totalAmount+= amount;
        } 
        else if (amount==null || (amount!=0 && indicator.getValue()==null)) {missingData = true}
    })

    if (!missingData && totalAmount != 0) { 
        indicator.setValue(roundValue(grossImpact/totalAmount, precision));
        let uncertainty = Math.abs(grossImpact) > 0 ? roundValue(Math.max( Math.abs(grossImpactMax-grossImpact) , Math.abs(grossImpact-grossImpactMin) ) / Math.abs(grossImpact) * 100, 0) : 0;
        indicator.setUncertainty(uncertainty);
    } else if (items.length == 0) {
        indicator.setValue(0); 
        indicator.setUncertainty(0);
    } else {
        indicator.setValue(null); 
        indicator.setUncertainty(null);
    }

    return indicator;
}

/* ---------------------------------------------------------------------------------------------------- */
/* BUILD AGGREGATE PERIOD FOOTPRINT
 *  -> footprint based on list of accounts & periodKey
 *
 */

export async function buildAggregatePeriodFootprint(accounts,periodKey) 
{
  
    let footprint = new SocialFootprint();
    let indics = Object.keys(metaIndics);
    await Promise.all(
        indics.map(async indic => {
            let indicator = await buildAggregatePeriodIndicator(indic,accounts,periodKey);
            footprint.indicators[indic] = indicator;
            return;
        })
    )
    return footprint;
}

export function buildAggregatePeriodIndicator(indic,accounts,periodKey) 
{

    let currentAccounts =  accounts.filter(account => account.periodsData.hasOwnProperty(periodKey));
   
    let indicator = new Indicator({indic});
    
    let precision = metaIndics[indic].nbDecimals;

    let totalAmount = 0.0;
    let grossImpact = 0.0;
    let grossImpactMax = 0.0;
    let grossImpactMin = 0.0;

    let missingData = false;

    currentAccounts.forEach((account) => 
    {
        let amount = account.periodsData[periodKey].amount;
        let indicatorElement = account.periodsData[periodKey].footprint.indicators[indic];

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
    } else if (accounts.length == 0) {
        indicator.setValue(0); 
        indicator.setUncertainty(0);
    } else {
        indicator.setValue(null); 
        indicator.setUncertainty(null);
    }

    return indicator;
}