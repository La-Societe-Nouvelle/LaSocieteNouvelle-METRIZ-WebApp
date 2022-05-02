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
      <Table bordered hover>
        <thead>
          <tr>
            <td>Agrégat</td>
            <td className="align-right">Montant</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chiffre d'affaires *</td>
            <td className="align-right toChecked">{printValue(financialData.getRevenue(), 0)} &euro; </td>
          </tr>
          <tr>
            <td>Production stockée *</td>
            <td className="align-right toChecked">{printValue(financialData.getStoredProduction(), 0)} &euro; </td>
          </tr>
          <tr>
            <td>Production immobilisée *</td>
            <td className="align-right toChecked">{printValue(financialData.getImmobilisedProduction(), 0)} &euro; </td>
          </tr>
          <tr>
            <td>Autres produits d'exploitation</td>
            <td className="align-right">{printValue(financialData.getAmountOtherOperatingIncomes(), 0)} &euro;</td>
          </tr>
          <tr className="total">
            <td>TOTAL DES PRODUITS D'EXPLOITATION</td>
            <td className="align-right">{printValue(financialData.getAmountOperatingIncomes(), 0)} &euro;</td>
          </tr>

          {operatingExpensesAggregates.map(({ accountLib, amount, isToBeChecked }, index) =>
            <tr key={index}>
              <td>{accountLib} { isToBeChecked ? "*" : ""}</td>
              <td title={ isToBeChecked ? "Chiffre clé à vérifier" : ""} className={ isToBeChecked ? "toChecked align-right" : "align-right"}>{printValue(amount, 0)} &euro;</td>
            </tr>)}

          <tr className="total">
            <td>TOTAL DES CHARGES D'EXPLOITATION</td>
            <td className="align-right">{printValue(financialData.getAmountOperatingExpenses(), 0)} &euro;</td>
          </tr>

          <tr className={"total"}>
            <td>RESULTAT D'EXPLOITATION</td>
            <td className="align-right">{printValue(financialData.getOperatingResult(), 0)} &euro;</td>
          </tr>

          <tr >
            <td>PRODUITS FINANCIERS</td>
            <td className="align-right">{printValue(financialData.getAmountFinancialIncomes(), 0)} &euro;</td>
          </tr>
          <tr >
            <td>CHARGES FINANCIERES</td>
            <td className="align-right">{printValue(financialData.getAmountFinancialExpenses(), 0)} &euro;</td>
          </tr>
          <tr >
            <td>RESULTAT FINANCIER</td>
            <td className="align-right">{printValue(financialData.getFinancialResult(), 0)} &euro;</td>
          </tr>
          <tr >
            <td>PRODUITS EXCEPTIONNELS</td>
            <td className="align-right">{printValue(financialData.getAmountExceptionalIncomes(), 0)} &euro;</td>
          </tr>
          <tr >
            <td>CHARGES EXCEPTIONNELLES</td>
            <td className="align-right">{printValue(financialData.getAmountExceptionalExpenses(), 0)} &euro;</td>
          </tr>
          <tr >
            <td>RESULTAT EXCEPTIONNEL</td>
            <td className="align-right">{printValue(financialData.getExceptionalResult(), 0)} &euro;</td>
          </tr>

          <tr >
            <td>PARTICIPATION DES SALARIES, IMPOTS SUR LES BENEFICES ET ASSIMILES</td>
            <td className="align-right">{printValue(financialData.getAmountTaxOnProfits(), 0)} &euro;</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>BENEFICE OU PERTE</td>
            <td className="align-right">{printValue(financialData.getProfit(), 0)} &euro;</td>
          </tr>
        </tfoot>
      </Table>
      <p className="align-right toChecked">
      *Chiffres clés à vérifier
    </p>
    </>)
}