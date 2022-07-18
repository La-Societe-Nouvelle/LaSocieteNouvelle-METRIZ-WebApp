// La Société Nouvelle

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

// Utils
import { printValue } from '../../src/utils/Utils';
import { Table } from "react-bootstrap";

/* ---------- INCOME STATEMENT TABLE ---------- */

export const IncomeStatementTable = ({ financialData }) => {

  const operatingExpensesAggregates = financialData.getOperatingExpensesAggregates();

  return (
    <>
      <Table  hover>
        <thead>
          <tr>
            <td>Agrégat</td>
            <td className="text-end">Montant</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chiffre d'affaires *</td>
            <td className="text-end toChecked">{printValue(financialData.getRevenue(), 0)} &euro; </td>
          </tr>
          <tr>
            <td>Production stockée *</td>
            <td className="text-end toChecked">{printValue(financialData.getStoredProduction(), 0)} &euro; </td>
          </tr>
          <tr>
            <td>Production immobilisée *</td>
            <td className="text-end toChecked">{printValue(financialData.getImmobilisedProduction(), 0)} &euro; </td>
          </tr>
          <tr>
            <td>Autres produits d'exploitation</td>
            <td className="text-end">{printValue(financialData.getAmountOtherOperatingIncomes(), 0)} &euro;</td>
          </tr>
          <tr className="total">
            <td>TOTAL DES PRODUITS D'EXPLOITATION</td>
            <td className="text-end">{printValue(financialData.getAmountOperatingIncomes(), 0)} &euro;</td>
          </tr>

          {operatingExpensesAggregates.map(({ accountLib, amount, isToBeChecked }, index) =>
            <tr key={index}>
              <td>{accountLib} { isToBeChecked ? "*" : ""}</td>
              <td title={ isToBeChecked ? "Chiffre clé à vérifier" : ""} className={ isToBeChecked ? "toChecked text-end" : "text-end"}>{printValue(amount, 0)} &euro;</td>
            </tr>)}

          <tr className="total">
            <td>TOTAL DES CHARGES D'EXPLOITATION</td>
            <td className="text-end">{printValue(financialData.getAmountOperatingExpenses(), 0)} &euro;</td>
          </tr>

          <tr className={"total"}>
            <td>RESULTAT D'EXPLOITATION</td>
            <td className="text-end">{printValue(financialData.getOperatingResult(), 0)} &euro;</td>
          </tr>

          <tr >
            <td>PRODUITS FINANCIERS</td>
            <td className="text-end">{printValue(financialData.getAmountFinancialIncomes(), 0)} &euro;</td>
          </tr>
          <tr >
            <td>CHARGES FINANCIERES</td>
            <td className="text-end">{printValue(financialData.getAmountFinancialExpenses(), 0)} &euro;</td>
          </tr>
          <tr >
            <td>RESULTAT FINANCIER</td>
            <td className="text-end">{printValue(financialData.getFinancialResult(), 0)} &euro;</td>
          </tr>
          <tr >
            <td>PRODUITS EXCEPTIONNELS</td>
            <td className="text-end">{printValue(financialData.getAmountExceptionalIncomes(), 0)} &euro;</td>
          </tr>
          <tr >
            <td>CHARGES EXCEPTIONNELLES</td>
            <td className="text-end">{printValue(financialData.getAmountExceptionalExpenses(), 0)} &euro;</td>
          </tr>
          <tr >
            <td>RESULTAT EXCEPTIONNEL</td>
            <td className="text-end">{printValue(financialData.getExceptionalResult(), 0)} &euro;</td>
          </tr>

          <tr >
            <td>PARTICIPATION DES SALARIES, IMPOTS SUR LES BENEFICES ET ASSIMILES</td>
            <td className="text-end">{printValue(financialData.getAmountTaxOnProfits(), 0)} &euro;</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>BENEFICE OU PERTE</td>
            <td className="text-end">{printValue(financialData.getProfit(), 0)} &euro;</td>
          </tr>
        </tfoot>
      </Table>
      <p className="text-end toChecked">
      *Chiffres clés à vérifier
    </p>
    </>)
}