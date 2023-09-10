// La Société Nouvelle

/* -------------------------- PRINT NUMBERS -------------------------- */
// to format values

/** PRINT VALUE (simple)
 *    value null or undefined -> " - "
 *    round value with precision set
 *    negative value in parenthesis
 *    spaces between 3-digits group
 */

export function printValue(value, precision) 
{
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