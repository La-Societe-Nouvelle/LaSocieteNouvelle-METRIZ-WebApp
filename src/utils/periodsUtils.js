// La Société Nouvelle

/** Period JSON :
 *    dateStart: yyyyMMdd format
 *    dateEnd: yyyyMMdd format
 *    periodKey: "FY"+yyyy (year period)
 *    regex: (regex to match date)
 * 
 *  Utility functions :
 *    getMoreRecentYearlyPeriod -> get more recent period (yearly period)
 * 
 */

export const getMoreRecentYearlyPeriod = (periods) =>
{
  let yearlyPeriods = periods
    .filter((period) => /^FY/.test(period.periodKey))
    .sort((a, b) => parseInt(a) - parseInt(b));
  
  return yearlyPeriods.at(-1);
}

export const getYearPeriod = (period) => {
  return period.dateEnd.substring(0,4);
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

export const buildRegexFinancialPeriod = (dateStart, dateEnd) => {
  let datesEndMonths = getDatesEndMonths(dateStart, dateEnd);
  let months = datesEndMonths.map((date) => date.substring(0, 6));

  let datesLastMonth = [];
  if (dateEnd != getLastDateOfMonth(dateEnd)) {
    let lastMonth = dateEnd.substring(0, 6);
    let prevDate = dateEnd;
    while (prevDate.startsWith(lastMonth)) {
      datesLastMonth.push(prevDate);
      prevDate = getPrevDate(prevDate);
    }
  }

  let regexString = "^(" + months.concat(datesLastMonth).join("|") + ")";
  return new RegExp(regexString);
}