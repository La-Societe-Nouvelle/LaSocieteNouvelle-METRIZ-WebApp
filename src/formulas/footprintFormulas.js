// La Société Nouvelle

// Objects
import { SocialFootprint } from '../footprintObjects/SocialFootprint';
import { Indicator } from '/src/footprintObjects/Indicator';

// Utils
import { isValidNumber, roundValue } from '../utils/Utils';

// Librairies
import metaIndics from '/lib/indics';

/* ---------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- FOOTPRINT FORMULAS ---------------------------------------- */
/* ---------------------------------------------------------------------------------------------------- */

// Utils

const getUncertainty = (value,valueMax,valueMin) => 
{
  if (Math.abs(value) > 0) {
    let gapWithMax = Math.abs( valueMax-value ); // | max - value |
    let gapWithMin = Math.abs( valueMin-value ); // | min - value |
    let uncertainty = Math.max(gapWithMax,gapWithMin) / Math.abs(value) * 100.0;
    return roundValue(uncertainty, 0);
  } else {
    return 0.0;
  }
}

/* ---------------------------------------------------------------------------------------------------- */
/* BUILD AGGREGATE FOOTPRINT
 *  -> footprint based on list of elements
 *
 */

// build aggregate footprint from list of items (with amount & footprint props)
export async function buildAggregateFootprint(items) 
{
  const footprint = new SocialFootprint();
  let indics = Object.keys(footprint.indicators);
  for (let indic of indics) {
    footprint.indicators[indic] = await buildAggregateIndicator(indic,items);;
  }
  return footprint;
}

export async function buildAggregateIndicator(indic,items) 
{
  const { nbDecimals } = metaIndics[indic];
  
  // init indicators
  const indicator = new Indicator({indic});

  let totalAmount = 0.0;
  let grossImpact = 0.0;
  let grossImpactMax = 0.0;
  let grossImpactMin = 0.0;

  let missingData = false;
    
  for (let item of items)
  {
    let amount = item.amount;
    let indicatorItem = item.footprint.indicators[indic];

    if (isValidNumber(amount) && amount!=0 && indicatorItem.isValid()) 
    {
      grossImpact+= indicatorItem.getValue()*amount;
      grossImpactMax+= indicatorItem.getValueMax()*amount;
      grossImpactMin+= indicatorItem.getValueMin()*amount;
      totalAmount+= amount;
    }
    else if (!isValidNumber(amount) || !indicatorItem.isValid()) {
      missingData = true;
    }
  };

  if (!missingData && totalAmount!=0) {
    let value =  roundValue(grossImpact/totalAmount, nbDecimals);
    let uncertainty = getUncertainty(grossImpact,grossImpactMax,grossImpactMin);
    indicator.setValue(value);
    indicator.setUncertainty(uncertainty);
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
  const footprint = new SocialFootprint();
  let indics = Object.keys(footprint.indicators);
  for (let indic of indics) {
    footprint.indicators[indic] = await buildDifferenceIndicator(indic,itemA,itemB);;
  }
  return footprint;
}

export async function buildDifferenceIndicator(indic,itemA,itemB)
{
  const { nbDecimals } = metaIndics[indic];
  
  // init indicator
  const indicator = new Indicator({indic});

  let amountA = itemA.amount;
  let amountB = itemB.amount;
  let indicatorA = itemA.footprint.indicators[indic];
  let indicatorB = itemA.footprint.indicators[indic];

  if (isValidNumber(itemA.amount) && itemA.footprint.indicators[indic].isValid()
   && isValidNumber(itemB.amount) && itemB.footprint.indicators[indic].isValid())
  {
    let amountVariation = amountA - amountB;
    let impactVariation = indicatorA.getValue()*amountA - indicatorB.getValue()*amountB;
    let impactMaxVariation = indicatorA.getValueMax()*amountA - indicatorB.getValueMax()*amountB;
    let impactMinVariation = indicatorA.getValueMin()*amountA - indicatorB.getValueMin()*amountB;
  
    if (amountVariation!=0) {
      let value = roundValue(impactVariation/amountVariation, nbDecimals);
      let uncertainty = getUncertainty(impactVariation,impactMaxVariation,impactMinVariation);
      indicator.setValue(value);
      indicator.setUncertainty(uncertainty);
    } else {
      indicator.setValue(null);
      indicator.setUncertainty(null);
    }
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
  const footprint = new SocialFootprint();
  let indics = Object.keys(footprint.indicators);
  for (let indic of indics) {
    footprint.indicators[indic] = await buildAggregatePeriodIndicator(indic,accounts,periodKey);
  }
  return footprint;
}

export async function buildAggregatePeriodIndicator(indic,accounts,periodKey) 
{
  const { nbDecimals } = metaIndics[indic].nbDecimals;
  const accountsOnPeriod =  accounts.filter(account => account.periodsData.hasOwnProperty(periodKey));
   
  // init indicator
  const indicator = new Indicator({indic});
    
  let totalAmount = 0.0;
  let grossImpact = 0.0;
  let grossImpactMax = 0.0;
  let grossImpactMin = 0.0;

  let missingData = false;

  for (let account of accountsOnPeriod)
  {
    let amountAccount = account.periodsData[periodKey].amount;
    let indicatorAccount = account.periodsData[periodKey].footprint.indicators[indic];

    if (isValidNumber(amountAccount) && amountAccount!=0 && indicatorAccount.isValid()) 
    {
      grossImpact+= indicatorAccount.getValue()*amountAccount;
      grossImpactMax+= indicatorAccount.getValueMax()*amountAccount;
      grossImpactMin+= indicatorAccount.getValueMax()*amountAccount;
      totalAmount+= amountAccount;
    } 
    else if (!isValidNumber(amountAccount) || !indicatorAccount.isValid()) {
      missingData = true;
    }
  }

  if (!missingData && totalAmount != 0) { 
    let value = roundValue(grossImpact/totalAmount, nbDecimals);
    let uncertainty = getUncertainty(grossImpact,grossImpactMax,grossImpactMin);
    indicator.setValue(value);
    indicator.setUncertainty(uncertainty);
  } else {
    indicator.setValue(null); 
    indicator.setUncertainty(null);
  }

  return indicator;
}