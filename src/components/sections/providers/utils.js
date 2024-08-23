/* ------------------------------------ SORTING --------------------------------------- */

export function sortProviders(providers,sortColumn,sortOrder,financialPeriod) 
{
  return [...providers].sort((a, b) => {
    if (sortColumn === "libelle") {
      const aValue = (a.providerLib || a.accountLib).toLowerCase();
      const bValue = (b.providerLib || b.accountLib).toLowerCase();
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (sortColumn === "montant") {
      const aValue = a.periodsData[financialPeriod.periodKey].amount;
      const bValue = b.periodsData[financialPeriod.periodKey].amount;
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    } else if (sortColumn === "numero") {
      const aValue = (a.providerNum || a.accountNum).toLowerCase();
      const bValue = (b.providerNum || b.accountNum).toLowerCase();
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return 0;
  });
}