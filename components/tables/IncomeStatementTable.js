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
    <div className="table-main">

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
            <td className="">{printValue(financialData.getRevenue(),0)} &euro;</td>
          </tr>
          <tr>
            <td>Production stockée</td>
            <td className="">{printValue(financialData.getStoredProduction(),0)} &euro;</td>
            </tr>
          <tr>
            <td>Production immobilisée</td>
            <td className="">{printValue(financialData.getImmobilisedProduction(),0)} &euro;</td>
</tr>
          <tr>
            <td>Autres produits d'exploitation</td>
            <td className="">{printValue(financialData.getAmountOtherOperatingIncomes(),0)} &euro;</td>
</tr>
          <tr className="total">
            <td>TOTAL DES PRODUITS D'EXPLOITATION</td>
            <td >{printValue(financialData.getAmountOperatingIncomes(),0)} &euro;</td>
          </tr>
          
          <tr className="">
            <td><b>Charges externes</b></td>
            <td >{printValue(financialData.getAmountIntermediateConsumption(),0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Variation de stocks</td>
            <td className="">{printValue(-financialData.getVariationPurchasesStocks(),0)} &euro;</td>
           </tr>
        {externalExpensesAggregates.map(({accountLib,amount},index) => 
          <tr key={index}>
            <td>&emsp;{accountLib}</td>
            <td className="">{printValue(amount,0)} &euro;</td>
         </tr>)}
          <tr  className="">
            <td><b>Impots, taxes et versements assimilés</b></td>
            <td className="">{printValue(financialData.getAmountTaxes(),0)} &euro;</td>
         </tr>
          
          <tr  className="">
            <td><b>Charges de personnel</b></td>
            <td className="">{printValue(financialData.getAmountPersonnelExpenses(),0)} &euro;</td>
         </tr>
          <tr  className="">
            <td><b>Dotations d'exploitation</b></td>
            <td className="">{printValue(financialData.getAmountDepreciationExpenses()+financialData.getAmountProvisions(),0)} &euro;</td>
         </tr>
          <tr>
            <td>&emsp;Dotations aux amortissements sur immobilisations</td>
            <td className="">{printValue(financialData.getAmountDepreciationExpenses(),0)} &euro;</td>
          </tr>
          <tr>
            <td>&emsp;Autres dotations aux amortissements, aux dépréciations et aux provisions</td>
            <td className="">{printValue(financialData.getAmountProvisions(),0)} &euro;</td>
           </tr>


          <tr  className="">
            <td><b>Autres charges d'exploitation</b></td>
            <td className="">{printValue(financialData.getAmountOtherExpenses(),0)} &euro;</td>
          </tr>

          <tr  className="total">
            <td>TOTAL DES CHARGES D'EXPLOITATION</td>
            <td className="">{printValue(financialData.getAmountOperatingExpenses(),0)} &euro;</td>
           </tr>

          <tr  className={"total operating-result"}>
            <td>RESULTAT D'EXPLOITATION</td>
            <td className="">{printValue(financialData.getOperatingResult(),0)} &euro;</td>
           </tr>

          <tr  className="">
            <td>PRODUITS FINANCIERS</td>
            <td className="">{printValue(financialData.getAmountFinancialIncomes(),0)} &euro;</td>
           </tr>
          <tr  className="">
            <td>CHARGES FINANCIERES</td>
            <td className="">{printValue(financialData.getAmountFinancialExpenses(),0)} &euro;</td>
            </tr>
          <tr  className="">
            <td>RESULTAT FINANCIER</td>
            <td className="">{printValue(financialData.getFinancialResult(),0)} &euro;</td>
         </tr>
          <tr  className="">
            <td>PRODUITS EXCEPTIONNELS</td>
            <td className="">{printValue(financialData.getAmountExceptionalIncomes(),0)} &euro;</td>
            </tr>
          <tr  className="">
            <td>CHARGES EXCEPTIONNELLES</td>
            <td className="">{printValue(financialData.getAmountExceptionalExpenses(),0)} &euro;</td>
            </tr>
          <tr  className="">
            <td>RESULTAT EXCEPTIONNEL</td>
            <td className=" ">{printValue(financialData.getExceptionalResult(),0)} &euro;</td>
           </tr>

          <tr  className="">
            <td>PARTICIPATION DES SALARIES, IMPOTS SUR LES BENEFICES ET ASSIMILES</td>
            <td>{printValue(financialData.getAmountTaxOnProfits(),0)} &euro;</td>
           </tr>
          
          <tr className={"total profit"}>
            <td>BENEFICE OU PERTE</td>
            <td>{printValue(financialData.getProfit(),0)} &euro;</td>
          </tr>
        </tbody>
      </table>
    </div>)
}