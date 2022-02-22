// La Société Nouvelle

// Libraries
import metaAccounts from '../../lib/accounts';

// Utils
import { printValue } from '../../src/utils/Utils';

/* ---------- INCOME STATEMENT TABLE ---------- */

export const IncomeStatementTable = ({financialData}) =>
{
  const externalExpensesAggregates = financialData.getExternalExpensesAggregates();

  const depreciationExpensesAggregates = financialData.getBasicDepreciationExpensesAggregates();
  
  return(
    <>
      <table>
        <thead>
          <tr>
            <td>Agrégat</td>
            <td>Montant</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chiffre d'affaires</td>
            <td>{printValue(financialData.getRevenue(),0)} &euro;</td>
          </tr>
          <tr>
            <td>Production stockée</td>
            <td>{printValue(financialData.getStoredProduction(),0)} &euro;</td>
            </tr>
          <tr>
            <td>Production immobilisée</td>
            <td>{printValue(financialData.getImmobilisedProduction(),0)} &euro;</td>
</tr>
          <tr>
            <td>Autres produits d'exploitation</td>
            <td>{printValue(financialData.getAmountOtherOperatingIncomes(),0)} &euro;</td>
</tr>
          <tr className="total">
            <td>TOTAL DES PRODUITS D'EXPLOITATION</td>
            <td >{printValue(financialData.getAmountOperatingIncomes(),0)} &euro;</td>
          </tr>
          
          <tr>
            <td><b>Charges externes</b></td>
            <td >{printValue(financialData.getAmountIntermediateConsumption(),0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Variation de stocks</td>
            <td>{printValue(-financialData.getVariationPurchasesStocks(),0)} &euro;</td>
           </tr>
        {externalExpensesAggregates.map(({accountLib,amount},index) => 
          <tr key={index}>
            <td>&emsp;{accountLib}</td>
            <td>{printValue(amount,0)} &euro;</td>
         </tr>)}
          <tr >
            <td><b>Impots, taxes et versements assimilés</b></td>
            <td>{printValue(financialData.getAmountTaxes(),0)} &euro;</td>
         </tr>
          
          <tr >
            <td><b>Charges de personnel</b></td>
            <td>{printValue(financialData.getAmountPersonnelExpenses(),0)} &euro;</td>
         </tr>
          <tr >
            <td><b>Dotations d'exploitation</b></td>
            <td>{printValue(financialData.getAmountDepreciationExpenses()+financialData.getAmountProvisions(),0)} &euro;</td>
         </tr>
          <tr>
            <td>&emsp;Dotations aux amortissements sur immobilisations</td>
            <td>{printValue(financialData.getAmountDepreciationExpenses(),0)} &euro;</td>
          </tr>
          <tr>
            <td>&emsp;Autres dotations aux amortissements, aux dépréciations et aux provisions</td>
            <td>{printValue(financialData.getAmountProvisions(),0)} &euro;</td>
           </tr>


          <tr >
            <td><b>Autres charges d'exploitation</b></td>
            <td>{printValue(financialData.getAmountOtherExpenses(),0)} &euro;</td>
          </tr>

          <tr  className="total">
            <td>TOTAL DES CHARGES D'EXPLOITATION</td>
            <td>{printValue(financialData.getAmountOperatingExpenses(),0)} &euro;</td>
           </tr>

          <tr  className={"total operating-result"}>
            <td>RESULTAT D'EXPLOITATION</td>
            <td>{printValue(financialData.getOperatingResult(),0)} &euro;</td>
           </tr>

          <tr >
            <td>PRODUITS FINANCIERS</td>
            <td>{printValue(financialData.getAmountFinancialIncomes(),0)} &euro;</td>
           </tr>
          <tr >
            <td>CHARGES FINANCIERES</td>
            <td>{printValue(financialData.getAmountFinancialExpenses(),0)} &euro;</td>
            </tr>
          <tr >
            <td>RESULTAT FINANCIER</td>
            <td>{printValue(financialData.getFinancialResult(),0)} &euro;</td>
         </tr>
          <tr >
            <td>PRODUITS EXCEPTIONNELS</td>
            <td>{printValue(financialData.getAmountExceptionalIncomes(),0)} &euro;</td>
            </tr>
          <tr >
            <td>CHARGES EXCEPTIONNELLES</td>
            <td>{printValue(financialData.getAmountExceptionalExpenses(),0)} &euro;</td>
            </tr>
          <tr >
            <td>RESULTAT EXCEPTIONNEL</td>
            <td>{printValue(financialData.getExceptionalResult(),0)} &euro;</td>
           </tr>

          <tr >
            <td>PARTICIPATION DES SALARIES, IMPOTS SUR LES BENEFICES ET ASSIMILES</td>
            <td>{printValue(financialData.getAmountTaxOnProfits(),0)} &euro;</td>
           </tr>
       
        </tbody>
        <tfoot>
        <tr>
            <td>BENEFICE OU PERTE</td>
            <td>{printValue(financialData.getProfit(),0)} &euro;</td>
          </tr>
        </tfoot>
      </table>
    </>)
}