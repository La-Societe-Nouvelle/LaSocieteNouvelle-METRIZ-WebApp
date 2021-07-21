
/* ----- PRINT VALUE ----- */

export function printValue(value,precision) {
  if (value==null | value==="") {return " - "}
  else                          {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision))
                                          .toFixed(precision)
                                          .toString()
                                          .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
}

export function printValueInput(value,precision) {
  if (value==null | value==="") {return ""}
  else                          {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision))
                                          .toFixed(precision)
                                          .toString()
                                          .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
}