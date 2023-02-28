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

/* ----- ID ----- */

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

export function getEvolution(value, target) {
  if (target) {
    const evolution = ((target - value) / value) * 100;
    return evolution.toFixed(0);
  } else {
    return "-";
  }
}
