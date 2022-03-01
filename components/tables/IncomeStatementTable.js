// La Société Nouvelle

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

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
            <td className="align-right">Montant</td>
            <td className="bg-white"></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chiffre d'affaires</td>
            <td className="align-right">{printValue(financialData.getRevenue(),0)} &euro; </td>
            <td className="bg-white"><FontAwesomeIcon icon={faCircleInfo} /></td>
          </tr>
          <tr>
            <td>Production stockée</td>
            <td className="align-right">{printValue(financialData.getStoredProduction(),0)} &euro; </td>
            <td className="bg-white"><FontAwesomeIcon icon={faCircleInfo} /></td>

            </tr>
          <tr>
            <td>Production immobilisée</td>
            <td className="align-right">{printValue(financialData.getImmobilisedProduction(),0)} &euro; </td>
            <td className="bg-white"><FontAwesomeIcon icon={faCircleInfo} /></td>

</tr>
          <tr>
            <td>Autres produits d'exploitation</td>
            <td className="align-right">{printValue(financialData.getAmountOtherOperatingIncomes(),0)} &euro;</td>
</tr>
          <tr className="total">
            <td>TOTAL DES PRODUITS D'EXPLOITATION</td>
            <td className="align-right">{printValue(financialData.getAmountOperatingIncomes(),0)} &euro;</td>
          </tr>
          
          <tr>
            <td><b>Charges externes</b></td>
            <td className="align-right">{printValue(financialData.getAmountIntermediateConsumption(),0)} &euro;</td>
            <td className="bg-white"><FontAwesomeIcon icon={faCircleInfo} /></td>
            </tr>
          <tr>
            <td>&emsp;Variation de stocks</td>
            <td className="align-right">{printValue(-financialData.getVariationPurchasesStocks(),0)} &euro;</td>
           </tr>
        {externalExpensesAggregates.map(({accountLib,amount},index) => 
          <tr key={index}>
            <td>&emsp;{accountLib}</td>
            <td className="align-right">{printValue(amount,0)} &euro;</td>
         </tr>)}
          <tr >
            <td><b>Impots, taxes et versements assimilés</b></td>
            <td className="align-right">{printValue(financialData.getAmountTaxes(),0)} &euro;</td>
         </tr>
          
          <tr >
            <td><b>Charges de personnel</b></td>
            <td className="align-right">{printValue(financialData.getAmountPersonnelExpenses(),0)} &euro;</td>
         </tr>
          <tr >
            <td><b>Dotations d'exploitation</b></td>
            <td className="align-right">{printValue(financialData.getAmountDepreciationExpenses()+financialData.getAmountProvisions(),0)} &euro;</td>
         </tr>
          <tr>
            <td>&emsp;Dotations aux amortissements sur immobilisations</td>
            <td className="align-right">{printValue(financialData.getAmountDepreciationExpenses(),0)} &euro;</td>
            <td className="bg-white">
            <FontAwesomeIcon icon={faCircleInfo} />
            </td>
          </tr>
          <tr>
            <td>&emsp;Autres dotations aux amortissements, aux dépréciations et aux provisions</td>
            <td className="align-right">{printValue(financialData.getAmountProvisions(),0)} &euro;</td>
           </tr>


          <tr >
            <td><b>Autres charges d'exploitation</b></td>
            <td className="align-right">{printValue(financialData.getAmountOtherExpenses(),0)} &euro;</td>
          </tr>

          <tr  className="total">
            <td>TOTAL DES CHARGES D'EXPLOITATION</td>
            <td className="align-right">{printValue(financialData.getAmountOperatingExpenses(),0)} &euro;</td>
           </tr>

          <tr  className={"total operating-result"}>
            <td>RESULTAT D'EXPLOITATION</td>
            <td className="align-right">{printValue(financialData.getOperatingResult(),0)} &euro;</td>
           </tr>

          <tr >
            <td>PRODUITS FINANCIERS</td>
            <td className="align-right">{printValue(financialData.getAmountFinancialIncomes(),0)} &euro;</td>
           </tr>
          <tr >
            <td>CHARGES FINANCIERES</td>
            <td className="align-right">{printValue(financialData.getAmountFinancialExpenses(),0)} &euro;</td>
            </tr>
          <tr >
            <td>RESULTAT FINANCIER</td>
            <td className="align-right">{printValue(financialData.getFinancialResult(),0)} &euro;</td>
         </tr>
          <tr >
            <td>PRODUITS EXCEPTIONNELS</td>
            <td className="align-right">{printValue(financialData.getAmountExceptionalIncomes(),0)} &euro;</td>
            </tr>
          <tr >
            <td>CHARGES EXCEPTIONNELLES</td>
            <td className="align-right">{printValue(financialData.getAmountExceptionalExpenses(),0)} &euro;</td>
            </tr>
          <tr >
            <td>RESULTAT EXCEPTIONNEL</td>
            <td className="align-right">{printValue(financialData.getExceptionalResult(),0)} &euro;</td>
           </tr>

          <tr >
            <td>PARTICIPATION DES SALARIES, IMPOTS SUR LES BENEFICES ET ASSIMILES</td>
            <td className="align-right">{printValue(financialData.getAmountTaxOnProfits(),0)} &euro;</td>
           </tr>
       
        </tbody>
        <tfoot>
        <tr>
            <td>BENEFICE OU PERTE</td>
            <td className="align-right">{printValue(financialData.getProfit(),0)} &euro;</td>
          </tr>
        </tfoot>
      </table>
    </>)
}