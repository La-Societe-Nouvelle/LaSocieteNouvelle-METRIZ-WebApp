
/* ----- PRINT VALUE ----- */

/** Print value :
 *    " - " if value null or undefined
 *    value in parenthesis if negative
 *    put spaces between numbers (x3)
 */

export function printValue(value,precision) 
{
  if (value===null || value===undefined || value==="") {return " - "}
  else 
  {
    let roundedValue = Math.round(value*Math.pow(10,precision))/Math.pow(10,precision).toFixed(precision);
    if (roundedValue < 0) {
      return "("+(-roundedValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+")";
    } else {
      return roundedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
  }
}

export function printValueInput(value,precision) {
  if (value==null | value==="") {return ""}
  else                          {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision))
                                          .toFixed(precision)
                                          .toString()
                                          .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
}

/* ----- AMOUNT ----- */

export function getSumItems(items)
{
  return roundValue(items.reduce((a,b) => a+b,0),2)
}

export function getAmountItems(items)
{
  return getSumItems(items.map(item => item.amount))
}

export function getPrevAmountItems(items)
{
  return getSumItems(items.map(item => item.prevAmount))
}

/* ----- UNCERTAINTY ----- */

export function getUncertainty(value,valueMin,valueMax)
{
  return Math.round((Math.max( valueMax-value , value-valueMin) / value) * 100);
}

/* ----- ROUND ----- */

export function roundValue(value,precision) 
{
  if (value==undefined || value==null || value==="") {return value}
  else {
    return Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)
  }
}

/* ----- COMPARISON ----- */

export function compareToReference(value,reference,margin)
{
  if (Math.abs(value) >= Math.abs(reference)*(1-margin/100) 
   && Math.abs(value) <= Math.abs(reference)*(1+margin/100) )
  {
    return 0;
  }
  else if (value < reference) 
  {
    return -1;
  }
  else
  {
    return 1;
  }
}


/* ----- ASSIGN ----- */

export function valueOrDefault(value,defaultValue) {
  if (value!==undefined && value!==null) {
    return value;
  } else {
    return defaultValue;
  }
}

export function ifDefined(value,defaultValue) {
  if (value!==undefined && value!==null) {
    return value;
  } else {
    return defaultValue;
  }
}

export function ifCondition(condition,value) {
  if (condition) {return value}
  else           {return null}
}

/* ----- ID ----- */

export function getNewId(items) {return items.map(item => item.id).reduce((a,b) => {return Math.max(a,b)},0)+1}

/* ----- ID ----- */

export const getCurrentDateString = () => // dd-MM-yyyy hh:mm
{
  const today = new Date();
  const dateString = String(today.getDate()).padStart(2, '0') + '-'
                   + String(today.getMonth()+1).padStart(2, '0') +'-'
                   + today.getFullYear() + ' '
                   + today.getHours() + ':'
                   + today.getMinutes();
  return dateString
}

/* ----- DATE ----- */

export const getDateFromString = (stringDate) =>
{
  if (/^[0-9]{8}$/.test(stringDate)) {
    return new Date(parseInt(stringDate.substring(0,4)), parseInt(stringDate.substring(4,6)), parseInt(stringDate.substring(6,8)));
  } else {
    return null;
  }
}