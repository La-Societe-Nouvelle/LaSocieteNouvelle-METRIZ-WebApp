// La Société Nouvelle

// React
import React from "react";
import { Table } from "react-bootstrap";

// Utils
import {
  getAmountItems,
  getPrevAmountItems,
} from "/src/utils/Utils";
import { printValue } from "/src/utils/formatters";


/* ---------- DEPRECIATIONS TABLE ---------- */

/** currently unused but to add in immobilisations view
 * 
 */

export class DepreciationsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnSorted: "account",
      reverseSort: false,
    };
  }

  render() {
    const { immobilisations, depreciations, depreciationExpenses } =
      this.props.financialData;
    const period = this.props.period;
    const prevStateDateEnd = getPrevDate(period.dateStart);
    const { columnSorted } = this.state;

    this.sortItems(immobilisations, columnSorted);

    return (
      <>
        <Table hover className="immobilisationsTable">
          <caption>Tableau des dépréciations</caption>
          <thead>
            <tr>
              <td
                className="short"
                onClick={() => this.changeColumnSorted("account")}
              >
                Compte
              </td>
              <td onClick={() => this.changeColumnSorted("accountLib")}>
                Libellé
              </td>
              <td className="text-end">Valeur brute au début de l'exercice</td>
              <td className="text-end">Augmentations</td>
              <td className="text-end">Diminutions</td>
              <td className="text-end">Valeur brute à la fin de l'exercice</td>
            </tr>
          </thead>
          <tbody>
            {immobilisations.map((immobilisation) => {
              if (immobilisation.depreciationAccountNum) {
                let expenses = depreciationExpenses.filter((expense) => expense.depreciationAccountNum == immobilisation.depreciationAccountNum);
                let augmentation = getAmountItems(expenses);
                let dimininution = depreciation.prevAmount + augmentation - depreciation.amount;
                return (
                  <tr key={accountNum}>
                    <td>{accountNum}</td>
                    <td>
                      {accountLib.charAt(0).toUpperCase() +
                        accountLib.slice(1).toLowerCase()}
                    </td>
                    <td className="text-end">
                      {printValue(depreciation.prevAmount, 0)} &euro;
                    </td>
                    <td className="text-end">
                      {printValue(augmentation, 0)} &euro;
                    </td>
                    <td className="text-end">
                      {printValue(dimininution, 0)} &euro;
                    </td>
                    <td className="text-end">
                      {printValue(depreciation.amount, 0)} &euro;
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={accountNum}>
                    <td>{accountNum}</td>
                    <td>
                      {accountLib.charAt(0).toUpperCase() +
                        accountLib.slice(1).toLowerCase()}
                    </td>
                    <td className="text-end"> </td>
                    <td className="text-end"> </td>
                    <td className="text-end"> </td>
                    <td className="text-end"> </td>
                  </tr>
                );
              }
            })}
          </tbody>

          {immobilisations.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="2">TOTAL</td>
                <td className="text-end">
                  {printValue(getPrevAmountItems(depreciations), 0)} &euro;
                </td>
                <td className="text-end">
                  {printValue(getAmountItems(depreciationExpenses), 0)}{" "}
                  &euro;
                </td>
                <td className="text-end">
                  {printValue(
                    getPrevAmountItems(depreciations) +
                      getAmountItems(depreciationExpenses) -
                      getAmountItems(depreciations),
                    0
                  )}{" "}
                  &euro;
                </td>
                <td className="text-end">
                  {printValue(getAmountItems(depreciations), 0)} &euro;
                </td>
              </tr>
            </tfoot>
          )}
        </Table>
      </>
    );
  }

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) {
    if (columnSorted != this.state.columnSorted) {
      this.setState({ columnSorted: columnSorted, reverseSort: false });
    } else {
      this.setState({ reverseSort: !this.state.reverseSort });
    }
  }

  sortItems(items, columSorted) {
    switch (columSorted) {
      case "accountLib":
        items.sort((a, b) => a.accountLib.localeCompare(b.accountLib));
        break;
      case "account":
        items.sort((a, b) => a.accountNum.localeCompare(b.accountNum));
        break;
      //case "prevAmount": items.sort((a,b) => b.prevAmount - a.prevAmount); break;
      //case "variation": items.sort((a,b) => (b.amount-b.prevAmount) - (a.amount-a.prevAmount)); break;
      //case "amount": items.sort((a,b) => b.amount - a.amount); break;
      // ...les valeurs affichées sont les valeurs nettes comptables (différentes des valeurs "amount")
    }
    if (this.state.reverseSort) items.reverse();
  }
}
