/* ------------------------------------ SORTING --------------------------------------- */
export function sortProviders(providers,sortColumn,sortOrder,financialPeriod) {

    return [...providers].sort((a, b) => {
      if (sortColumn === "libelle") {
        const aValue = a.providerLib.toLowerCase();
        const bValue = b.providerLib.toLowerCase();
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (sortColumn === "montant") {
        const aValue = a.periodsData[financialPeriod.periodKey].amount;
        const bValue = b.periodsData[financialPeriod.periodKey].amount;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }



  