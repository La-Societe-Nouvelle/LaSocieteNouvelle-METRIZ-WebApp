// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Table } from "react-bootstrap";

// Utils
import { printValue } from "/src/utils/Utils";
import { getBranchesOptions, getDivisionsOptions } from "/src/utils/Utils";

// Libraries
import divisions from "/lib/divisions";
import branches from "/lib/branches";

// Styles
import { getPrevDate } from "../../../utils/periodsUtils";
import { RowTableImmobilisation } from "./RowTableImmobilisation";
import { RowTableStock } from "./RowTableStock";

/* ---------- INITIAL STATES TABLE ---------- */

export class InitialStatesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnSorted: "account",
      reverseSort: false,
      nbItems: 20,
      page: 0,
    };
  }

  render() 
  {
    const { immobilisations, stocks } = this.props.financialData;
    const prevStateDateEnd = getPrevDate(this.props.period.dateStart);

    const { columnSorted, nbItems, page } = this.state;

    const accounts = immobilisations.concat(stocks); // merge array
    accounts.forEach((account) =>
      buildHasInputs(account, this.props.financialData)
    ); // to know if fpt can be based on current financial period

    this.sortItems(accounts, columnSorted);
    //this.sortItems(immobilisations,columnSorted);
    //this.sortItems(stocks,columnSorted);

    const nbAccounts = accounts.length;

    return (
      <>
        <Table>
          <thead>
            <tr>
              <td onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td colSpan="2">États initiaux - Empreinte sociétale</td>
              <td
                className="text-end"
                onClick={() => this.changeColumnSorted("amount")}
              >
                Montant
              </td>
            </tr>
          </thead>
          <tbody>
            {accounts
              .slice(page * nbItems, (page + 1) * nbItems)
              .map((account) => (
                <Row
                  key={account.accountNum}
                  account={account}
                  prevStateDateEnd={prevStateDateEnd}
                  onUpdate={this.rowDidUpdate}
                  syncData={this.synchroniseAccount.bind(this)}
                />
              ))}
          </tbody>
        </Table>

        {nbAccounts.length > nbItems && (
          <div className="table-navigation">
            <button
              className={page == 0 ? "hidden" : ""}
              onClick={this.prevPage}
            >
              Page précédente
            </button>
            <button
              className={
                (page + 1) * nbItems < nbAccounts.length ? "" : "hidden"
              }
              onClick={this.nextPage}
            >
              Page suivante
            </button>
          </div>
        )}
      </>
    );
  }

  /* ---------- ACTIONS ---------- */

  rowDidUpdate = () => {
    console.log("row update");
    this.props.onUpdate();
  }

  synchroniseAccount = async (accountNum) => {
    // Immobilisation
    if (/^2/.test(accountNum)) {
      let immobilisation =
        this.props.financialData.getImmobilisationByAccount(accountNum);
      this.fetchDefaultData(immobilisation);
    }
    // Stock
    else if (/^3/.test(accountNum)) {
      let stock = this.props.financialData.getStockByAccount(accountNum);
      this.fetchDefaultData(stock);
    }
  };

  async fetchDefaultData(stockOrImmobilisation) {
    await stockOrImmobilisation.updatePrevFootprintFromRemote();
    this.forceUpdate();
    this.props.onUpdate();
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
      case "label":
        items.sort((a, b) => a.label.localeCompare(b.label));
        break;
      case "account":
        items.sort((a, b) => a.accountNum.localeCompare(b.accountNum));
        break;
      case "amount":
        items.sort((a, b) => b.prevAmount - a.prevAmount);
        break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {
    if (this.state.page > 0) this.setState({ page: this.state.page - 1 });
  };
  nextPage = () => {
    if (
      (this.state.page + 1) * this.state.nbItems <
      this.props.financialData.immobilisations.length
    )
      this.setState({ page: this.state.page + 1 });
  };

  /* ----- OPERATIONS ON IMMOBILISATION ----- */

  updateAccount = (nextProps) => {
    // Immobilisation
    if (/^2/.test(nextProps.accountNum))
      this.props.financialData.updateImmobilisation(nextProps);
    // Stock
    else if (/^3/.test(nextProps.accountNum))
      this.props.financialData.updateStock(nextProps);

    this.props.onUpdate();
  };
}

/* ---------- INPUTS/OUTPUTS AVAILABLE ---------- */

const buildHasInputs = (account, financialData) => {
  if (/^3/.test(account.accountNum)) {
    account.hasInputs = financialData.externalExpenses.some((expense) =>
      account.purchasesAccounts.includes(expense.accountNum)
    );
  } else if (/^2/.test(account.accountNum)) {
    account.hasInputs = financialData.investments.some(
      (investment) => investment.accountNum == account.accountNum
    );
  }
};

/* ---------- ROWS ---------- */

const Row = (props) => {
  switch (props.account.accountNum.charAt(0)) {
    case "2":
      return <RowTableImmobilisation {...props} />;
    case "3":
      return <RowTableStock {...props} />;
  }
}