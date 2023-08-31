/* --------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- UTILS FUNCTIONS -------------------------------------------------- */
/* --------------------------------------------------------------------------------------------------------------------- */


  // download session (session -> JSON data)
  export const downloadSession = async (session) => {
    const { legalUnit, financialPeriod } = session;
    const siren = legalUnit.siren || legalUnit.corporateName;
    const periodKey = financialPeriod.periodKey.slice(2);
  
    const fileName = `session-metriz-${siren}-${periodKey}`;
    const json = JSON.stringify(session);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = href;
    link.download = `${fileName}.json`;
    link.click();
  };
  
/* -------------------------- Options -------------------------- */
import divisions from "/lib/divisions";
import areas from "/lib/areas";
import branches from "/lib/branches";

export const getBranchesOptions = () => {
  return Object.entries(branches)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([value, label]) => {
      return { value: value, label: value + " - " + label };
    });
};

export const getDivisionsOptions = () => {
  return Object.entries(divisions)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(([value, label]) => {
      return { value: value, label: value + ' - ' + label };
    });
};

// utils.js
export const getAreasOptions = () => {
  return Object.entries(areas)
    .map(([value, label]) => {
      return { value: value, label:  label };
    });
};


/* -------------------------- PRINT FUNCTIONS -------------------------- */
// to format values

/** PRINT VALUE (simple)
 *    value null or undefined -> " - "
 *    round value with precision set
 *    negative value in parenthesis
 *    spaces between 3-digits group
 */

export function printValue(value, precision) {
  // value null/undefined/empty
  if (value === null || value === undefined || value === "") {
    return " - ";
  } else {
    if (!precision) precision = 0;
    let roundedValue = roundValue(value, precision).toFixed(precision);

    if (roundedValue < 0) {
      return (
        "(" +
        (-roundedValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") +
        ")"
      );
    } else {
      return roundedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
  }
}

/** PRINT VALUE INPUT (used for input number)
 *    value null or empty -> empty string
 *    round value with precision set
 *    negative value in parenthesis
 *    spaces between 3-digits group
 */

export function printValueInput(value, precision) {
  if ((value == null) | (value === "")) {
    return "";
  } else {
    if (!precision) precision = 0;
    let formattedValue = roundValue(value, precision)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return formattedValue;
  }
}

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

/* -------------------------- ROUNDING FUNCTION -------------------------- */
// correct value

export const isValidNumber = (value,min,max) => 
{
  // is a number
  if (!isNaN(value) && value!=="") {
    // check min
    if (min!=undefined) 
    {
      if (!isValidNumber(min)) {
        return false;
      } else if (isValidNumber(min) && min>value) {
        return false;
      }
    }
    // check max
    if (max!=undefined) 
    {
      if (!isValidNumber(max)) {
        return false;
      } else if (isValidNumber(max) && max<value) {
        return false;
      }
    }
    // a number and between min & max
    return true;
  }
  // not a number
  else {
    return false
  }
}

export const isValidInput = (value,min,max) => 
{
  return value==="" || isValidNumber(value,min,max);
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

/* -------------------------- DATES -------------------------- */

/** CURRENT DATE
 *    get current date
 *    format : dd-MM-yyyy hh:mm
 */

export const getCurrentDateString = () => {
  const today = new Date();
  const dateString =
    String(today.getDate()).padStart(2, "0") +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    today.getFullYear() +
    " " +
    today.getHours() +
    ":" +
    today.getMinutes();
  return dateString;
};

export const getShortCurrentDateString = () => {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return dateString;
};

/** PARSE DATE
 *    string -> date format
 *    format input : "yyyyMMdd"
 */

export const parseDate = (stringDate) => {
  // if full date (yyyyMMdd)
  if (/^[0-9]{8}$/.test(stringDate)) {
    return new Date(
      parseInt(stringDate.substring(0, 4)),
      parseInt(stringDate.substring(4, 6)) - 1,
      parseInt(stringDate.substring(6, 8))
    );
  }
  // if just month (yyyyMM)
  else if (/^[0-9]{6}$/.test(stringDate)) {
    return new Date(
      parseInt(stringDate.substring(0, 4)),
      parseInt(stringDate.substring(4, 6)) - 1,
      1
    );
  }
  // if just year (yyyy)
  else if (/^[0-9]{4}$/.test(stringDate)) {
    return new Date(parseInt(stringDate.substring(0, 4)), 0, 1);
  }
  // error format date
  else return null;
};

/** PARSE DATE -> TO STRING
 *    date format -> string "yyyyMMdd"
 *    format input : date
 */

const formatDate = (date) => "" + date.getFullYear() + (date.getMonth() + 1 >= 10 ? "" : "0") + (date.getMonth() + 1) + (date.getDate()<10 ? "0"+date.getDate() : date.getDate());
const formatMonth = (date) => "" + date.getFullYear() + (date.getMonth() + 1 >= 10 ? "" : "0") + (date.getMonth() + 1);

/** GET PREV/NEXT DATE
 *    get day just before
 *    format input : "yyyyMMdd" (string)
 */

export const getPrevDate = (stringDate) => {
  let date = parseDate(stringDate);
  let prevDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - 1 // day before
  );
  return formatDate(prevDate);
};

export const getNextDate = (stringDate) => {
  let date = parseDate(stringDate);
  let nextDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1 // day after
  );
  return formatDate(nextDate);
};

/** GET PREV/NEXT MONTH
 *    get month just before
 *    format input : "yyyyMM" (string)
 */

export const getNextMonth = (month) => {
  let currentMonth = parseDate(month);
  let nextMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1, // next month
    1
  );
  return formatMonth(nextMonth);
};

/** GET LAST DATE
 *    last date of month
 *    format input : "yyyyMMdd" (string)
 */

export const getLastDateOfMonth = (month) => {
  let date = new Date(
    parseInt(month.substring(0, 4)), // year
    parseInt(month.substring(4, 6)), // month after (-1+1)
    0 // day 0 -> end of month before
  );
  return formatDate(date);
};

export const getDatesEndMonths = (dateStart, dateEnd) => {
  let datesEndMonths = [];
  let month = dateStart.substring(0, 6); // month
  let dateEndMonth = getLastDateOfMonth(month);
  while (parseInt(dateEndMonth) <= parseInt(dateEnd)) {
    // while date at end of month before date end
    datesEndMonths.push(dateEndMonth);
    month = getNextMonth(month);
    dateEndMonth = getLastDateOfMonth(month);
  }
  return datesEndMonths;
};

/** GET NB DAYS BETWEEN DATES
 *
 */

export const getNbDaysBetweenDates = (stringDateA, stringDateB) => {
  let dateA = parseDate(stringDateA);
  let dateB = parseDate(stringDateB);
  return Math.round(Math.abs(dateB - dateA) / (1000 * 60 * 60 * 24));
};

/** SORT DATES
 *
 */

export const sortChronologicallyDates = (dateA, dateB) => {
  return parseInt(dateA) - parseInt(dateB);
};

export const sortUnchronologicallyDates = (dateA, dateB) => {
  return parseInt(dateB) - parseInt(dateA);
};

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

export function getEvolution(value, target) {
  if (target) {
    const evolution = ((target - value) / value) * 100;
    return evolution.toFixed(0);
  } else {
    return "-";
  }
}


export const getExpensesGroupByAccount = (expenses) => {
  const expensesByAccount = {};
  expenses.forEach(({ accountNum, accountLib, amount }) => {
    if (!expensesByAccount[accountNum]) {
      expensesByAccount[accountNum] = { accountNum, amount, accountLib };
    } else {
      expensesByAccount[accountNum].amount += amount;
    }
  });
  return Object.entries(expensesByAccount).map(
    ([accountNum, { amount, accountLib }]) => ({
      accountNum,
      amount,
      accountLib,
    })
  );
};



