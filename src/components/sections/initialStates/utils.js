
export const isCurrentFootprintAvailable = (account, financialData) => 
{
  // stock account
  if (/^3/.test(account.accountNum)) {
    account.hasInputs = financialData.externalExpenses.some((expense) =>
      account.purchasesAccounts.includes(expense.accountNum)
    );
  } 
  // immobilisation account
  else if (/^2/.test(account.accountNum)) {
    account.hasInputs = financialData.investments.some(
      (investment) => investment.accountNum == account.accountNum
    );
  }
};

export const checkMergeSessions = (session, prevSession) => 
{
  const errors = [];

  // Matching periods ---------------------------------

  // check if prev session periods not includes current session period
  const conflictingPeriods = prevSession.availablePeriods
    .filter((prevPeriod) => Object.keys(currSession.availablePeriods).includes(prevPeriod.periodKey));

  if (conflictingPeriods.length>0) {
    errors.push({
      title: "Erreur - Sauvegarde",
      message: "Des données existent au sein de la session en cours pour certaines périodes de la session importée."
        + " Veuillez vérifier la sauvegarde et réessayer."
    });
  }

  // check if prev session periods linked to current period
  const prevPeriod = prevSession.availablePeriods
    .find((prevPeriod) => prevPeriod.dateEnd == getPrevDate(session.initialState.date));

  if (!prevPeriod) {
    errors.push({
      title: "Erreur de Fichier",
      message: "La sauvegarde ne correspond pas à l'année précédente."
      +" Veuillez vérifier le fichier et réessayer."
    });
  }

  // 
  let checkANouveaux = true;

  // Vérification des montants

  // immobilisation
  session.financialData.immobilisations
    .filter((immobilisation) => immobilisation.initialState.amount > 0)
    .forEach((immobilisation) => 
    {
      let prevImmobilisation = prevSession.financialData.immobilisations
        .find((account) => account.accountNum == immobilisation.accountNum);
      
      let prevStateDateEnd = immobilisation.initialState.date;

      if (!prevImmobilisation) {
        // account missing
      } else if (!prevImmobilisation.states[prevStateDateEnd]) {
        // ?
        checkANouveaux = false;
      } 
      else if (immobilisation.initialState.amount!=prevImmobilisation.lastState.amount
            || immobilisation.initialState.amortisationAmount!=prevImmobilisation.lastState.amortisationAmount) {
        checkANouveaux = false;
      }
    });

  // stocks
  session.financialData.stocks
    .filter((stock) => stock.initialState.amount > 0)
    .forEach((stock) => {
      let prevStock = prevSession.financialData.stocks.find(
        (prevStock) => prevStock.accountNum == stock.accountNum
      );
      let prevStateDateEnd = stock.initialState.date;
      if (!prevStock) {
        checkANouveaux = false;
      } else if (!prevStock.states[prevStateDateEnd]) {
        checkANouveaux = false;
      } else if (stock.initialState.amount!=prevStock.lastState.amount) {
        checkANouveaux = false;
      }
    });
  if (!checkANouveaux) {
    setTitlePopup("Erreur - Correspondances des données");
    setMessage("Des données importées ne correspondent pas aux données du journal des A-Nouveaux. Veuillez vérifier le fichier et réessayer.");
    setPopupError(true);
    return;
  }
}