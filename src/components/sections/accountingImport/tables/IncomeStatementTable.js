// La Société Nouvelle
// Utils
import { getAmountItems, getAmountItemsForPeriod } from '/src/utils/Utils';
import { printValue } from "/src/utils/formatters";
import { Table } from "react-bootstrap";

/* ---------- INCOME STATEMENT TABLE ---------- */

export const IncomeStatementTable = ({ financialData, period }) => 
{
  const financialItems = getFinancialItems(financialData, period.periodKey);

  return (
    <>
      <Table hover>
        <thead>
          <tr>
            <td>Agrégat</td>
            <td className="text-end">Montant</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chiffre d'affaires *</td>
            <td className="text-end toChecked">{printValue(financialItems.revenue, 0)} &euro; </td>
          </tr>
          <tr>
            <td>Production stockée *</td>
            <td className="text-end toChecked">{printValue(financialItems.storedProduction, 0)} &euro; </td>
          </tr>
          <tr>
            <td>Production immobilisée *</td>
            <td className="text-end toChecked">{printValue(financialItems.immobilisedProduction, 0)} &euro; </td>
          </tr>
          <tr>
            <td>Autres produits d'exploitation</td>
            <td className="text-end">{printValue(financialItems.otherOperatingIncomes, 0)} &euro;</td>
          </tr>
          <tr className="fw-bold border-top">
            <td>TOTAL DES PRODUITS D'EXPLOITATION</td>
            <td className="text-end">{printValue(financialItems.operatingIncomes, 0)} &euro;</td>
          </tr>

          {financialItems.operatingExpensesItems.map(({ label, amount, isToBeChecked }, index) =>
            <tr key={index}>
              <td>{label} { isToBeChecked ? "*" : ""}</td>
              <td title={ isToBeChecked ? "Chiffre clé à vérifier" : ""} className={ isToBeChecked ? "toChecked text-end" : "text-end"}>{printValue(amount, 0)} &euro;</td>
            </tr>)}

          <tr className="fw-bold border-top">
            <td>TOTAL DES CHARGES D'EXPLOITATION</td>
            <td className="text-end">{printValue(financialItems.operatingExpenses, 0)} &euro;</td>
          </tr>

          <tr className={"fw-bold border-top"}>
            <td>RESULTAT D'EXPLOITATION</td>
            <td className="text-end">{printValue(financialItems.operatingResult, 0)} &euro;</td>
          </tr>

          <tr >
            <td>PRODUITS FINANCIERS</td>
            <td className="text-end">{printValue(financialItems.financialIncomes, 0)} &euro;</td>
          </tr>
          <tr >
            <td>CHARGES FINANCIERES</td>
            <td className="text-end">{printValue(financialItems.financialExpenses, 0)} &euro;</td>
          </tr>
          <tr className={"fw-bold"}>
            <td>RESULTAT FINANCIER</td>
            <td className="text-end">{printValue(financialItems.financialResult, 0)} &euro;</td>
          </tr>
          <tr >
            <td>PRODUITS EXCEPTIONNELS</td>
            <td className="text-end">{printValue(financialItems.exceptionalIncomes, 0)} &euro;</td>
          </tr>
          <tr >
            <td>CHARGES EXCEPTIONNELLES</td>
            <td className="text-end">{printValue(financialItems.exceptionalExpenses, 0)} &euro;</td>
          </tr>
          <tr className={"fw-bold"}>
            <td>RESULTAT EXCEPTIONNEL</td>
            <td className="text-end">{printValue(financialItems.exceptionalResult, 0)} &euro;</td>
          </tr>

          <tr >
            <td>PARTICIPATION DES SALARIES, IMPOTS SUR LES BENEFICES ET ASSIMILES</td>
            <td className="text-end">{printValue(financialItems.taxOnProfits, 0)} &euro;</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>BENEFICE OU PERTE</td>
            <td className="text-end">{printValue(financialItems.profit, 0)} &euro;</td>
          </tr>
        </tfoot>
      </Table>
      <p className="text-end toChecked">
      *Chiffres clés à vérifier
    </p>
    </>)
}

/* ---------------------------------------- Details - Données financières ---------------------------------------- */

const getFinancialItems = (financialData, periodKey) => 
{
  let financialItems = {};

  // Resultat d'exploitation -------------------------- //

  // incomes
  financialItems.revenue = financialData.productionAggregates.revenue.periodsData[periodKey].amount;
  financialItems.storedProduction = financialData.productionAggregates.storedProduction.periodsData[periodKey].amount;
  financialItems.immobilisedProduction = financialData.productionAggregates.immobilisedProduction.periodsData[periodKey].amount;
  financialItems.otherOperatingIncomes = financialData.otherFinancialData.otherOperatingIncomes.periodsData[periodKey].amount;

  // total incomes
  financialItems.operatingIncomes = 
      financialItems.revenue 
    + financialItems.storedProduction 
    + financialItems.immobilisedProduction 
    + financialItems.otherOperatingIncomes;

  // expenses
  
  financialItems.operatingExpensesItems = buildOperatingExpensesItems(financialData, periodKey);

  // total expenses*
  financialItems.operatingExpenses = getAmountItems(financialItems.operatingExpensesItems, 2);
  
  // result
  financialItems.operatingResult = 
      financialItems.operatingIncomes 
    - financialItems.operatingExpenses;

  // Résultat financier ------------------------------- //

  financialItems.financialIncomes = financialData.otherFinancialData.financialIncomes.periodsData[periodKey].amount;
  financialItems.financialExpenses = financialData.otherFinancialData.financialExpenses.periodsData[periodKey].amount;
  financialItems.financialResult = 
      financialItems.financialIncomes 
    - financialItems.financialExpenses;

  // Résultat exceptionnel ---------------------------- //

  financialItems.exceptionalIncomes = financialData.otherFinancialData.exceptionalIncomes.periodsData[periodKey].amount;
  let exceptionalAmortisationExpensesAccounts = financialData.amortisationExpensesAccounts.filter(account => /^6871/.test(account.accountNum));
  financialItems.exceptionalExpenses = getAmountItemsForPeriod(exceptionalAmortisationExpensesAccounts, periodKey, 2) + financialData.otherFinancialData.exceptionalExpenses.periodsData[periodKey].amount;
  financialItems.exceptionalResult = 
      financialItems.exceptionalIncomes 
    - financialItems.exceptionalExpenses;

  // Profit ------------------------------------------- //
  
  financialItems.taxOnProfits = financialData.otherFinancialData.taxOnProfits.periodsData[periodKey].amount;
  financialItems.profit = 
      financialItems.operatingResult 
    + financialItems.financialResult
    + financialItems.exceptionalResult
    - financialItems.taxOnProfits;

  return financialItems;
}

/* ---------------------------------------- Details - Charges d'exploitation ---------------------------------------- */

/** Aggrégats - Charges d'exploitation
 *      607                                     Achats de marchandises
 *      6037                                    Variation des stocks de marchandises
 *      601,6091,602,6092                       Achats de matières premières et autres approvisionnements
 *      6031,6032                               Variation des stocks de matières premières et autres approvisionnements 
 *      604,6094,605,6095,606,6096,608,6098     Autres achats
 *      61,62                                   Autres charges externes
 *      63                                      Impôts, taxes et versements assimilés
 *      64                                      Charges sociales
 *      681                                     Dotations aux amortissements, dépréciations et provisions
 *      65                                      Autres charges d'exploitation
 */

const buildOperatingExpensesItems = (financialData, periodKey) =>
{

  let aggregates = [];

  let accounts = [];
  let filteredExternalExpensesAccounts = financialData.externalExpensesAccounts.filter(account => account.periodsData.hasOwnProperty(periodKey))

  // Achats de marchandises
  accounts = filteredExternalExpensesAccounts.filter(account => /^60(7|97)/.test(account.accountNum));
  if (accounts.length>0) {
    aggregates.push({
      label: "Achats de marchandises",
      amount: getAmountItemsForPeriod(accounts, periodKey, 2),
      isToBeChecked: true
    });
  }

  let filteredStockVariationsAccounts = financialData.stockVariationsAccounts.filter(account => account.periodsData.hasOwnProperty(periodKey))
  // Variation des stocks de marchandises
  accounts = filteredStockVariationsAccounts.filter(account => /^603/.test(account.accountNum));
  if (accounts.length>0) {
    aggregates.push({
      label: "Variation des stocks de marchandises",
      amount: getAmountItemsForPeriod(accounts, periodKey, 2),
      isToBeChecked: true
    });
  }

  // Achats de matières premières et autres approvisionnements 
  accounts = filteredExternalExpensesAccounts.filter(account => /^60([1|2]|9[1|2])/.test(account.accountNum));
  if (accounts.length>0) {
    aggregates.push({
        label: "Achats de matières premières et autres approvisionnements",
        amount: getAmountItemsForPeriod(accounts, periodKey, 2),
        isToBeChecked: true
    });
  }

  // Variation des stocks de matières premières et autres approvisionnements 
  accounts = filteredStockVariationsAccounts.filter(account => /^603(1|2)/.test(account.accountNum));
  if (accounts.length>0) {
    aggregates.push({
        label: "Variation des stocks de matières premières et autres approvisionnements",
        amount: getAmountItemsForPeriod(accounts, periodKey, 2),
        isToBeChecked: true
    });
  }

  // Autres achats
  accounts = filteredExternalExpensesAccounts.filter(account => /^60([4|5|6|8]|9[4|5|6|8])/.test(account.accountNum));
  if (accounts.length>0) {
    aggregates.push({
        label: "Autres achats",
        amount: getAmountItemsForPeriod(accounts, periodKey, 2),
        isToBeChecked: true
    });
  }

  // Autres charges externes
  accounts = filteredExternalExpensesAccounts.filter(account => /^6(1|2)/.test(account.accountNum));
  if (accounts.length>0) {
    aggregates.push({
        label: "Autres charges externes",
        amount: getAmountItemsForPeriod(accounts, periodKey, 2),
        isToBeChecked: true
    });
  }

  // Impôts, taxes et versements assimilés
  aggregates.push({
      label: "Impôts, taxes et versements assimilés", 
      amount: financialData.otherFinancialData.taxes.periodsData[periodKey].amount, 
      isToBeChecked: false
  });

  // Charges sociales
  aggregates.push({
      label: "Charges sociales",
      amount: financialData.otherFinancialData.personnelExpenses.periodsData[periodKey].amount,
      isToBeChecked: false
  });

  // Dotations aux amortissements, dépréciations et provisions
  let filteredAmortisationExpensesAccounts = financialData.amortisationExpensesAccounts.filter(account => account.periodsData.hasOwnProperty(periodKey))

  accounts = filteredAmortisationExpensesAccounts.filter(account => /^681/.test(account.accountNum));
  aggregates.push({
      label: "Dotations aux amortissements, dépréciations et provisions", 
      amount: getAmountItemsForPeriod(accounts, periodKey, 2) + financialData.otherFinancialData.provisions.periodsData[periodKey].amount,
      isToBeChecked: false
  });

  // Autres charges d'exploitation
  aggregates.push({
      label: "Autres charges d'exploitation", 
      amount: financialData.otherFinancialData.otherExpenses.periodsData[periodKey].amount,
      isToBeChecked: false
  });

  return aggregates;
}