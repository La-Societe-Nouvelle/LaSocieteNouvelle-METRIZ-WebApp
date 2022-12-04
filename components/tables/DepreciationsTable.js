// La Société Nouvelle

// React
import React from "react";
import { Table } from "react-bootstrap";

// Utils
import {
  getAmountItems,
  getPrevAmountItems,
  printValue,
} from "../../src/utils/Utils";

/* ---------- IMMOBILISATIONS TABLE ---------- */

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
    const { columnSorted } = this.state;

    const assetDepreciations = depreciations.filter((depreciation) =>
      /^29/.test(depreciation.account)
    );
    const assetDepreciationExpenses = depreciationExpenses.filter((expense) =>
      /^29/.test(expense.accountAux)
    );

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
            {immobilisations.map(({ account, accountLib }) => {
              let depreciation = assetDepreciations.filter(
                (depreciation) => depreciation.accountAux == account
              )[0];
              if (depreciation != undefined) {
                let expenses = assetDepreciationExpenses.filter(
                  (expense) => expense.accountAux == depreciation.account
                );
                let augmentation = getAmountItems(expenses);
                let dimininution =
                  depreciation.prevAmount + augmentation - depreciation.amount;
                return (
                  <tr key={account}>
                    <td>{account}</td>
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
                  <tr key={account}>
                    <td>{account}</td>
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
                  {printValue(getPrevAmountItems(assetDepreciations), 0)} &euro;
                </td>
                <td className="text-end">
                  {printValue(getAmountItems(assetDepreciationExpenses), 0)}{" "}
                  &euro;
                </td>
                <td className="text-end">
                  {printValue(
                    getPrevAmountItems(assetDepreciations) +
                      getAmountItems(assetDepreciationExpenses) -
                      getAmountItems(assetDepreciations),
                    0
                  )}{" "}
                  &euro;
                </td>
                <td className="text-end">
                  {printValue(getAmountItems(assetDepreciations), 0)} &euro;
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
        items.sort((a, b) => a.account.localeCompare(b.account));
        break;
      //case "prevAmount": items.sort((a,b) => b.prevAmount - a.prevAmount); break;
      //case "variation": items.sort((a,b) => (b.amount-b.prevAmount) - (a.amount-a.prevAmount)); break;
      //case "amount": items.sort((a,b) => b.amount - a.amount); break;
      // ...les valeurs affichées sont les valeurs nettes comptables (différentes des valeurs "amount")
    }
    if (this.state.reverseSort) items.reverse();
  }
}
