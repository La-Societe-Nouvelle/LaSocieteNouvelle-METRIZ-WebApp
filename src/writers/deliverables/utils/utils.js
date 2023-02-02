export function sortExpensesByFootprintIndicator(expenses, indicator, order) {
  const sortedExpenses = expenses.sort((a, b) => {
    const valueA = a.footprint.indicators[indicator].value;
    const valueB = b.footprint.indicators[indicator].value;
    if (order === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return sortedExpenses;
}

