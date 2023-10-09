// La Société Nouvelle

// Utils
import { roundValue } from "../../../../utils/Utils";

const parseAmount = (stringAmount) =>
  roundValue(parseFloat(stringAmount.replace(",", ".")), 2)

const checkBalance = (lines) => {
  let amount = lines
    .map((line) => parseAmount(line.Debit) - parseAmount(line.Credit))
    .reduce((a, b) => a + b, 0);
  return Math.round(amount) == 0;
}

/* ------------------------------------------------------------------------------------ */
/* ------------------------- ENTRY READER - EXTERNAL EXPENSES ------------------------- */

/** The function read external expenses in complex entry
 * 
 *  The function return an object with the following props :
 *    - entryData (Array) : data from the entry to add the "main" data object
 *    - status (Boolean) : status of the reading
 *    - message (String) : -
 */

export const readExternalExpensesFromEntry = async (entry) => 
{
  // ---------- Entry ---------- //

  let res = readExternalExpenses(entry);
  if (res.isExpensesTracked) return res;

  // ---------- Sub-entries ---------- //

  let subEntries = [];

  // group by balanced group
  subEntries = getSubEntriesByBalancedGroup(entry); // try to split entries with the current order
  if (subEntries.length>1) {
    res = readExternalExpensesFromSubEntries(subEntries);
    if (res.isExpensesTracked) return res;
  }

  // group by amount
  subEntries = await getSubEntriesByAmount(entry);
  if (subEntries.length>1) {
    res = readExternalExpensesFromSubEntries(subEntries);
    if (res.isExpensesTracked) return res;  
  }

  // ---------- Error ---------- //

  // if reading unsuccessfull
  res.isExpensesTracked = false;
  res.message = "ERROR";

  return res;
}

/* ------------------------------------------------------------------------------------ */
/** The function try to read external expenses from subEntries (array of entries)
 * 
 */

const readExternalExpensesFromSubEntries = (subEntries) => 
{
  let res = {
    expensesData: [],
    isExpensesTracked: false,
    message: "",
    defaultProviders: [],
  };

  // for each subEntry
  for (let subEntry of subEntries) 
  {
    // read entry
    let resSubEntry = readExternalExpenses(subEntry);

    // if correct reading
    if (resSubEntry.isExpensesTracked) {
      res.expensesData.push(...resSubEntry.expensesData);
      res.defaultProviders.push(...resSubEntry.defaultProviders);
    } 
    // else (stop process)
    else {
      res.isExpensesTracked = false;
      res.message = resSubEntry.message; // (NOK)
      return res;
    }
  }

  res.isExpensesTracked = true;
  res.message = "OK";
  return res;
}

/* ------------------------------------------------------------------------------------ */
/** The function try to read external expenses from entry or sub-entry
 * 
 */

const readExternalExpenses = (lignes) => 
{
  // response
  let res = {
    expensesData: [],
    isExpensesTracked: false,
    message: "",
    defaultProviders: [],
  };

  // lignes relatives aux comptes de charges
  let lignesComptesCharges = lignes.filter((ligne) => /^6(0[^3]|[1-2])/.test(ligne.CompteNum));

  // lignes relatives aux comtpes fournisseurs
  let lignesFournisseurs = lignes.filter((ligne) => /^40/.test(ligne.CompteNum));

  // Empty entry -------------------------------------------------------------------------------------- //

  if (lignesComptesCharges.length == 0) 
  {
    res.isExpensesTracked = true;
    res.message = "Aucune charge externe";
    return res;
  }

  // Single expense account --------------------------------------------------------------------------- //
  // not usable (impossible to track flows)

  // Single (or no) provider account ------------------------------------------------------------------ //

  let distinctProviderAccounts = 
    lignesFournisseurs.filter((value, index, self) => 
      index === self.findIndex((item) => item.CompteNum === value.CompteNum 
                                      && item.CompAuxNum === value.CompAuxNum));

  if (distinctProviderAccounts.length<=1)
  {
    res.isExpensesTracked = true;
    res.message = "OK";

    // ligne relative au compte fournisseur
    let ligneFournisseur = lignesFournisseurs[0] || {};

    // build data
    lignesComptesCharges.forEach((ligneCompteCharges) => 
    {
      // amortisation expense data
      let expenseData = {
        label: ligneCompteCharges.EcritureLib.replace(/^\"/, "").replace(/\"$/,""),
        accountNum: ligneCompteCharges.CompteNum,
        accountLib: ligneCompteCharges.CompteLib,
        providerNum: ligneFournisseur.CompAuxNum || "_" + ligneCompteCharges.CompteNum,
        providerLib: ligneFournisseur.CompAuxLib || "DEPENSES " + ligneCompteCharges.CompteLib,
        isDefaultProviderAccount: ligneFournisseur.CompAuxNum ? false : true,
        amount: parseAmount(ligneCompteCharges.Debit) - parseAmount(ligneCompteCharges.Credit),
        date: ligneCompteCharges.EcritureDate,
      };

      // push data
      res.expensesData.push(expenseData);
      if (expenseData.isDefaultProviderAccount) {
        res.defaultProviders.push(expenseData.providerNum);
      }
    });

    // return
    return res;
  }

  res.isExpensesTracked = false;
  res.message = "NOK";
  return res;
}

/* ------------------------------------------------------------------------------------ */
/** sub-entries by balanced group
 *    
 *  process : 
 *    iterate over all rows
 *      -> if sub-entry is balanced, save as sub entry and start new one
 *      -> if sub-entry is not balanced, go on
 *  input : 
 *    lines to split
 * 
 */

const getSubEntriesByBalancedGroup = (entry) => 
{
  let subEntries = [];

  // build subEntries
  let currentSubEntry = [];

  for (let row of entry) 
  {
    currentSubEntry.push(row);
    if (checkBalance(currentSubEntry)) {
      subEntries.push(currentSubEntry);
      currentSubEntry = [];
    }
  }
  // add last one if not empty
  if (currentSubEntry.length > 0) subEntries.push(currentSubEntry);

  return subEntries;
}

/* ------------------------------------------------------------------------------------ */
/** sub-entries by amounts
 *    
 *  process : 
 *    try each possibilities
 *      -> if sub-entry is balanced, try to split remaining lines
 *      -> if sub-entry is not balanced, go on
 *   input : 
 *    rows in sub-entry
 *    rows out of sub-entry
 *    remaining rows
 * 
 */

const getSubEntriesByAmount = async (entry) => 
{
  let response = await buildSubEntriesByAmount([],[],entry);
  return response.subEntries;
}

const buildSubEntriesByAmount = async (subEntryA,subEntryB,remainingLines) => 
{
  // if no more lines to split -> test if lines splited or not
  if (remainingLines.length==0) {
    if (checkBalance(subEntryA) && subEntryA.length>0
     && checkBalance(subEntryB) && subEntryB.length>0) {
      return({
        isSplited: true,
        error: false,
        subEntries: [subEntryA, subEntryB]
      })
    } else {
      return({
        isSplited: false,
        error: false,
        subEntries: [[...subEntryA, ...subEntryB]]
      })
    }
  }

  // if subEntryA empty -> take 1st one line
  else if (subEntryA.length==0 && subEntryB.length==0) {
    let nextSubEntryA = [...remainingLines].slice(0,1);
    let nextSubEntryB = [];
    let nextRemainingLines = [...remainingLines].slice(1);
    return await buildSubEntriesByAmount(nextSubEntryA,nextSubEntryB,nextRemainingLines);
  }

  // if remaining lines > 0
  else 
  {
    let solutions = [];
    
    for (let [i,line] of remainingLines.entries()) 
    {
      let linesAfter = [...remainingLines].slice(i+1);
      let linesBefore = [...remainingLines].slice(0,i);

      let nextSubEntryA = [...subEntryA, line];
      let nextSubEntryB = [...subEntryB, ...linesBefore];
      let nextRemainingLines = [...linesAfter];
      
      // if group ok -> add to solution
      if (checkBalance(nextSubEntryA)) 
      {
        // if subEntryA contains all lines
        if (nextSubEntryB.length==0 && nextRemainingLines.length==0) {
          return({
            isSplited: false,
            error: false,
            subEntries: [nextSubEntryA]
          })
        } 
        // if subEntry not empty or remaining lines
        else {
          let splitA = await buildSubEntriesByAmount([],[],[...nextSubEntryA]);
          let splitB = await buildSubEntriesByAmount([],[],[...nextSubEntryB, ...nextRemainingLines]);
          // if error spliting remaining lines -> keep error
          if (splitB.error || splitA.error) {
            return({
              isSplited: false,
              error: true,
              subEntries: [[
                ...subEntryA, 
                ...subEntryB,
                ...remainingLines
              ]]
            })
          } 
          // else merge split
          else if (!splitA.isSplited) {
            let subEntries = [...splitA.subEntries, ...splitB.subEntries];
            solutions.push(subEntries);
          }
        }
      }

      // if not balanced -> continue
      else 
      {
        let splitA = await buildSubEntriesByAmount(nextSubEntryA,nextSubEntryB,nextRemainingLines);

        // if split succeded
        if (splitA.isSplited) {
          solutions.push(splitA.subEntries);
        } 
        // if error (multiple solutions)
        else if (splitA.error) {
          return({
            isSplited: false,
            error: true,
            subEntries: [[
              ...subEntryA,
              ...subEntryB,
              ...remainingLines
            ]]
          })
        }
      }      
    }

    // check solutions
    
    // no solution -> return the entry
    if (solutions.length==0) {
      return({
        isSplited: false,
        error: false,
        subEntries: [[
          ...subEntryA,
          ...subEntryB,
          ...remainingLines
        ]]
      })
    } 
    // one solution -> 
    else if (solutions.length==1) {
      return({
        isSplited: true,
        error: false,
        subEntries: [...solutions[0]]
      })
    } else {
      return({
        isSplited: false,
        error: true,
        subEntries: [[
          ...subEntryA,
          ...subEntryB,
          ...remainingLines
        ]]
      })
    }
  }
}