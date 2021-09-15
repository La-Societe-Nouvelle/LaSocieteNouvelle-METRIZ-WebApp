
/* ----- PRINT VALUE ----- */

export function printValue(value,precision) 
{
  if (value==null || value==undefined || value=="") {return " - "}
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

export function printValueIf(value,precision,condition)
{
  if (condition) return printValue(value,precision);
  else return " - ";
}

export function printValueInput(value,precision) {
  if (value==null | value==="") {return ""}
  else                          {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision))
                                          .toFixed(precision)
                                          .toString()
                                          .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
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
