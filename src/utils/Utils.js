/* ----- PRINT VALUE ----- */

/** Print value :
 *    " - " if value null or undefined
 *    value in parenthesis if negative
 *    put spaces between numbers (x3)
 */

export function printValue(value, precision) {
  if (value === null || value === undefined || value === "") {
    return " - ";
  } else {
    let roundedValue = (
      Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)
    ).toFixed(precision);

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

export function printValueInput(value, precision) {
  if ((value == null) | (value === "")) {
    return "";
  } else {
    return (
      Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)
    )
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
}

/* ----- AMOUNT ----- */

export function getSumItems(items, precision) {
  if (precision != undefined) {
    return roundValue(
      items.reduce((a, b) => a + b, 0),
      precision
    );
  } else {
    return items.reduce((a, b) => a + b, 0);
  }
}

export function getAmountItems(items, precision) {
  return getSumItems(
    items.map((item) => item.amount),
    precision
  );
}

export function getPrevAmountItems(items, precision) {
  return getSumItems(
    items.map((item) => item.prevAmount),
    precision
  );
}

export function getAmountItemsForPeriod(items, periodKey, precision) {
  return getAmountItems(
    items.map((item) => item.periodsData[periodKey]),
    precision
  );
}

/* ----- UNCERTAINTY ----- */

export function getUncertainty(value, valueMin, valueMax) {
  return Math.round(
    (Math.max(valueMax - value, value - valueMin) / value) * 100
  );
}

/* ----- ROUND ----- */

export function roundValue(value, precision) {
  if (value == undefined || value == null || value === "") {
    return value;
  } else {
    return (
      Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)
    );
  }
}

/* ----- COMPARISON ----- */

export function compareToReference(value, reference, margin) {
  if (
    Math.abs(value) >= Math.abs(reference) * (1 - margin / 100) &&
    Math.abs(value) <= Math.abs(reference) * (1 + margin / 100)
  ) {
    return 0;
  } else if (value < reference) {
    return -1;
  } else {
    return 1;
  }
}

/* ----- ASSIGN ----- */

export function valueOrDefault(value, defaultValue) {
  if (value !== undefined && value !== null) {
    return value;
  } else {
    return defaultValue;
  }
}

export function ifDefined(value, defaultValue) {
  if (value !== undefined && value !== null) {
    return value;
  } else {
    return defaultValue;
  }
}

export function ifCondition(condition, value) {
  if (condition) {
    return value;
  } else {
    return null;
  }
}

/* ----- ID ----- */

export function getNewId(items) {
  return (
    items
      .map((item) => item.id)
      .reduce((a, b) => {
        return Math.max(a, b);
      }, 0) + 1
  );
}

/* ----- DATE ----- */

export const getCurrentDateString = () =>
  // dd-MM-yyyy hh:mm
  {
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

export const parseDate = (stringDate) => {
  if (/^[0-9]{8}$/.test(stringDate)) {
    return new Date(
      parseInt(stringDate.substring(0, 4)),
      parseInt(stringDate.substring(4, 6)) - 1,
      parseInt(stringDate.substring(6, 8))
    );
  } else if (/^[0-9]{6}$/.test(stringDate)) {
    return new Date(
      parseInt(stringDate.substring(0, 4)),
      parseInt(stringDate.substring(4, 6)) - 1,
      1
    );
  } else {
    return null;
  }
};

export const getPrevDate = (stringDate) => {
  let date = parseDate(stringDate);
  let prevDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - 1
  );
  return formatDate(prevDate);
};

export const getNextDate = (stringDate) => {
  let date = parseDate(stringDate);
  let nextDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1
  );
  return formatDate(nextDate);
};

export const getNextMonth = (month) => {
  let currentMonth = parseDate(month);
  let nextMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    1
  );
  return formatMonth(nextMonth);
};

export const getLastDateOfMonth = (month) => {
  let date = new Date(
    parseInt(month.substring(0, 4)),
    parseInt(month.substring(4, 6)),
    0
  );
  return formatDate(date);
};

export const getDatesEndMonths = (dateStart, dateEnd) => {
  let datesEndMonths = [];
  let month = dateStart.substring(0, 6);
  let dateEndMonth = getLastDateOfMonth(month);
  while (parseInt(dateEndMonth) <= parseInt(dateEnd)) {
    datesEndMonths.push(dateEndMonth);
    month = getNextMonth(month);
    dateEndMonth = getLastDateOfMonth(month);
  }
  return datesEndMonths;
};

export const getNbDaysBetweenDates = (stringDateA, stringDateB) => {
  let dateA = parseDate(stringDateA);
  let dateB = parseDate(stringDateB);
  return Math.round(Math.abs(dateB - dateA) / (1000 * 60 * 60 * 24));
};

export const isInPeriod = (stringDateStart, stringDateEnd, stringDate) => {
  let isAfter = isAfter(stringDateStart, stringDate);
  let isBefore = isBefore(stringDateEnd, stringDate);

  if (isAfter == null || isBefore == null) {
    return null;
  } else {
    return isAfter && isBefore;
  }
};

export const isAfter = (stringDateRef, stringDate) => {
  let dateRef = parseDate(stringDateRef);
  let date = parseDate(stringDate);

  if (dateRef == null || date == null) {
    return null;
  } else {
    return date.getDate() >= dateRef.getDate();
  }
};

export const isBefore = (stringDateRef, stringDate) => {
  let dateRef = parseDate(stringDateRef);
  let date = parseDate(stringDate);

  if (dateRef == null || date == null) {
    return null;
  } else {
    return date.getDate() <= dateRef.getDate();
  }
};

const formatDate = (date) =>
  "" +
  date.getFullYear() +
  (date.getMonth() + 1 >= 10 ? "" : "0") +
  (date.getMonth() + 1) +
  date.getDate();
const formatMonth = (date) =>
  "" +
  date.getFullYear() +
  (date.getMonth() + 1 >= 10 ? "" : "0") +
  (date.getMonth() + 1);

/* ----- SERIES ID ----- */
export const getShortCurrentDateString = () => {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return dateString;
};

export const getTargetSerieId = (indic) => {
  let id;
  switch (indic) {
    case "dis":
      id = "MACRO_TARGET_DIS_LSN_FRA_DIVISION";
      break;
    case "geq":
      id = "MACRO_TARGET_GEQ_LSN_FRA_DIVISION";
      break;
    case "ghg":
      id = "MACRO_TARGET_GHG_SNBC_FRA_DIVISION";
      break;
    case "knw":
      id = "MACRO_TARGET_KNW_LSN_FRA_DIVISION";
      break;
    case "mat":
      id = "MACRO_TARGET_MAT_LSN_FRA_DIVISION";
      break;
    case "nrg":
      id = "MACRO_TARGET_NRG_PPE_FRA_DIVISION";
      break;
    case "soc":
      id = "MACRO_TARGET_SOC_LSN_FRA_DIVISION";
      break;
    case "was":
      id = "MACRO_TARGET_WAS_PNPD_FRA_DIVISION";
      break;
    case "wat":
      id = "MACRO_TARGET_WAT_LSN_FRA_DIVISION";
      break;
    default:
      null;
      break;
  }

  return id;
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
