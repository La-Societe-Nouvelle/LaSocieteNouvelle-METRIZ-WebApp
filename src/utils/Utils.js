/* --------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- UTILS FUNCTIONS -------------------------------------------------- */
/* --------------------------------------------------------------------------------------------------------------------- */

import { getMoreRecentYearlyPeriod } from "./periodsUtils";

/* -------------------------- DOWNLOADS -------------------------- */

  // download session (session -> JSON data)
  export const downloadSession = async (session) => {
    const { legalUnit } = session;
    const siren = legalUnit.siren || legalUnit.corporateName;
    const period = getMoreRecentYearlyPeriod(session.availablePeriods);
  
    const fileName = `session-metriz-${siren}-${period.periodKey}`;
    const json = JSON.stringify(session);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = href;
    link.download = `${fileName}.json`;
    link.click();
  };


  // Directly download File
  export const triggerFileDownload = async (file, fileName) => {
    // Create a URL object from the Blob
    const url = URL.createObjectURL(file);

    // Create an anchor element for automatic download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    // Add the anchor element to the document
    document.body.appendChild(a);

    // Trigger a click on the anchor to initiate the download
    a.click();

    // Remove the anchor element from the document
    document.body.removeChild(a);

    // Revoke the URL of the Blob object
    URL.revokeObjectURL(url);
  };
  

/* -------------------------- OPERATIONS FUNCTIONS -------------------------- */
// operations on list

/** SUM OF ITEMS & Derivated
 *    if precision defined -> round value
 *
 */

export function getSumItems(items, precision) {
  let sum = items.reduce((a, b) => a + b, 0);
  return precision != undefined ? roundValue(sum, precision) : sum;
}

export const getAmountItems = (items, precision) =>
  getSumItems(
    items.map((item) => item.amount),
    precision
  );
export const getPrevAmountItems = (items, precision) =>
  getSumItems(
    items.map((item) => item.prevAmount),
    precision
  );
export const getAmountItemsForPeriod = (items, periodKey, precision) =>
  getAmountItems(
    items
      .filter((item) => item.periodsData.hasOwnProperty(periodKey))
      .map((item) => item.periodsData[periodKey]),
    precision
  );

/* -------------------------- ROUNDING FUNCTION -------------------------- */
// round value

export function roundValue(value, precision) {
  if (value == undefined || value == null || value === "") {
    return value;
  } else {
    return (
      Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)
    );
  }
}

/** VALUE OR DEFAULT
 *    init value if null or undefined
 *
 */

export function valueOrDefault(value, defaultValue) {
  // value defined
  if (value !== undefined && value !== null) {
    return value;
  }
  // value undefined/null
  else {
    return defaultValue;
  }
}

/* -------------------------- CHECK INPUT -------------------------- */
// correct value

// input is a number
export const isValidInputNumber = (input,nbDecimals) => 
{
  const regexPattern = 
    "^(-|)[0-9]*" 
    + ((nbDecimals && nbDecimals>0) ? "(\\.[0-9]{0,"+nbDecimals+"}|)" : "") 
    + "$";
  let regex = new RegExp(regexPattern);
  return regex.test(input);
}

// value is a number
export const isValidNumber = (value,min,max) => 
{
  // is a number
  if (!isNaN(value) && value!=="" && value!==null) {
    // check min
    if (min!=undefined) 
    {
      if (!isValidNumber(min)) {
        return false;
      } else if (isValidNumber(min) && parseFloat(min)>parseFloat(value)) {
        return false;
      };
    }
    // check max
    if (max!=undefined) 
    {
      if (!isValidNumber(max)) {
        return false;
      } else if (isValidNumber(max) && parseFloat(max)<parseFloat(value)) {
        return false;
      };
    }
    // a number and between min & max (if defined)
    return true;
  }
  // not a number
  else {
    return false
  }
}

// value is a number or unset (null or empty string)
export const isValidInput = (value,min,max) => 
{
  return value===null || value==="" || isValidNumber(value,min,max);
}

/* -------------------------- COMPARISON FUNCTION -------------------------- */
// to compare values

/** COMPARE TO REFERENCE
 *    value -> value to compare
 *    ref -> value to compare with
 *    margin -> margin within values are "close"
 *
 */

export function compareToReference(value, reference, margin) {
  // value close to reference -> 0
  if (
    Math.abs(value) >= Math.abs(reference) * (1 - margin / 100) &&
    Math.abs(value) <= Math.abs(reference) * (1 + margin / 100)
  ) {
    return 0;
  }
  // value under reference -> -1
  else if (value < reference) {
    return -1;
  }
  // value upper reference -> +1
  else {
    return 1;
  }
}

/* -------------------------- ID -------------------------- */
// manage id

/** NEW ID
 *    get new id in list (no existing)
 *
 */

export function getNewId(items) {
  return items.map((item) => item.id).reduce((a, b) => Math.max(a, b), 0) + 1;
}
/* -------------------------- UNCLASSIFIED -------------------------- */

/** CHECK IF OBJECT HAS PROPERTIES
* Return true OR false 
*/ 

export const isObjEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};


export function mergePeriodsData(current, previous) {
  const periodsData = { ...previous.periodsData, ...current.periodsData };
  return { ...current, periodsData };
}

/* -------------------------- ARRAY -------------------------- */

export const getDistinctItems = (array) => 
{
  const filteredArray = array.filter(
    (value, index, self) =>
      index === self.findIndex((item) => item == value)
  )
  return filteredArray;
}
