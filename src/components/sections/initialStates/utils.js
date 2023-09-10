// La Société Nouvelle

// Utils
import { isValidNumber } from "../../../utils/Utils";
import { getPrevDate, sortChronologicallyDates, sortUnchronologicallyDates } from "../../../utils/periodsUtils";

/* ---------- SYNC INITIAL STATES UTILS ---------- */

// to use to check if current footprint option is available
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
}

/* ---------- INITIAL STATES IMPORT UTILS ---------- */

/** Check merging :
 *    - periods not already in session
 *    - continuity (more recent period match with oldest in session)
 *    - for each asset corresponding amounts (between last state and initial state)
 */

export const checkLoadedSession = (session, loadedSession) => 
{
  const errors = [];

  // Check conflicts ----------------------------------
  // check if prev session periods not already in current session

  const conflictingPeriods = loadedSession.availablePeriods
    .filter((period) => Object.keys(session.availablePeriods).includes(period.periodKey));

  if (conflictingPeriods.length>0) {
    return([{
      title: "Erreur - Sauvegarde",
      message: "Des données existent au sein de la session en cours pour certaines périodes de la session importée."
    }]);
  }

  // Check continuity ---------------------------------
  // check if prev session periods linked to current period

  const dateStartSession = session.availablePeriods
    .sort((a,b) => sortChronologicallyDates(a.dateStart,b.dateStart))
    .map((period) => period.dateStart)[0];
  const dateEndPrevSession = loadedSession.availablePeriods
    .sort((a,b) => sortUnchronologicallyDates(a.dateEnd,b.dateEnd))
    .map((period) => period.dateEnd)[0];

  if (dateEndPrevSession!=getPrevDate(dateStartSession)) {
    return([{
      title: "Erreur - Sauvegarde",
      message: "La sauvegarde ne correspond pas à l'année précédente."
    }]);
  }

  // -> if errors -> return erros list
  if (errors.length>0) {
    return ({
      checked: errors.length==0,
      errors
    });
  } 

  // if not errors -> check initial states amounts
  else 
  {
    // Immobilisations
    session.financialData.immobilisations
      .filter((immobilisation) => immobilisation.isAmortisable)
      .filter((immobilisation) => immobilisation.initialState.amount>0)
      .forEach((immobilisation) => 
      {
        let prevImmobilisation = loadedSession.financialData.immobilisations
          .find((account) => account.accountNum == immobilisation.accountNum);
        
        if (!prevImmobilisation) {
          errors.push({
            title: "Compte d'immobilisation non trouvé",
            message: "Le compte d'immobilisation "+immobilisation.accountNum+" n'est pas présent dans la session importée."
          });
        } 
        else if (!isValidNumber(prevImmobilisation.lastState.amount)
              || !isValidNumber(prevImmobilisation.lastState.amortisationAmount)) {
          errors.push({
            title: "Erreur application",
            message: "Etat final non défini pour le compte d'immobilisation "+immobilisation.accountNum+"."
          });
        }
        else if (!isValidNumber(prevImmobilisation.initialState.amount) 
              || (prevImmobilisation.initialState.amount>0 && prevImmobilisation)) {
          errors.push({
            title: "Erreur application",
            message: "Etat final non défini pour le compte d'immobilisation "+immobilisation.accountNum+"."
          });
        } 
        else if (immobilisation.initialState.amount!=prevImmobilisation.lastState.amount
              || immobilisation.initialState.amortisationAmount!=prevImmobilisation.lastState.amortisationAmount) {
          errors.push({
            title: "Montants non correspondants.",
            message: "Les montants ne correspondent pas pour le compte d'immobilisation "+immobilisation.accountNum+"."
          });
        }
      });
  
    // stocks
    session.financialData.stocks
      .filter((stock) => stock.initialState.amount>0)
      .forEach((stock) => 
      {
        let prevStock = loadedSession.financialData.stocks
          .find((account) => account.accountNum == stock.accountNum);
        
        if (!prevStock) {
          errors.push({
            title: "Compte de stock non trouvé",
            message: "Le compte de stock "+stock.accountNum+" n'est pas présent dans la session importée."
          });
        }
        else if (!isValidNumber(prevStock.lastState.amount)) {
          errors.push({
            title: "Erreur application",
            message: "Etat final non défini pour le compte de stock "+stock.accountNum+"."
          });
        } 
        else if (stock.initialState.amount!=prevStock.lastState.amount) {
          errors.push({
            title: "Montants non correspondants.",
            message: "Les montants ne correspondent pas pour le compte de stock "+stock.accountNum+"."
          });
        }
      });
  
    return ({
      checked: errors.length==0,
      errors
    });
  }
}