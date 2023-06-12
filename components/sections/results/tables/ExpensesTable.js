// La Société Nouvelle

// React
import React from "react";

// Utils
import { printValue } from "/src/utils/Utils";
import { Table } from "react-bootstrap";

/* -------------------- EXPENSES TABLE -------------------- */

/*  Notes :
 *  The table shows the footprint (indicator) for each expenditures accounts (subaccounts of 60, 61 & 62)
 */

export class ExpensesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnSorted: "amount",
      reverseSort: false,
    };
  }

  render() {
    const { externalExpensesAccounts, indic, metaIndic, period, prevPeriod } = this.props;
    const { columnSorted } = this.state;
    const filteredExternalExpensesAccounts = externalExpensesAccounts.filter((provider) =>
        provider.periodsData.hasOwnProperty(period.periodKey)
      );
      console.log(period)

    this.sortAccounts(filteredExternalExpensesAccounts, period, columnSorted);

    const nbDecimals = metaIndic.nbDecimals;
    const unit = metaIndic.unit;
    const unitAbsolute = metaIndic.unitAbsolute;
    const impactAbsolu = ["ghg", "haz", "mat", "nrg", "was", "wat"].includes(
      indic
    );

    return (
      <div className="table-main">
        <Table id="indicatorExpenses">
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th colSpan={impactAbsolu ? "4" : "3"} className="text-center">
                Année N
              </th>
              {prevPeriod && (
                <th
                  colSpan={impactAbsolu ? "3" : "2"}
                  className="text-center border-left"
                >
                  N-1
                </th>
              )}
            </tr>
            <tr className="align-top">
              <td onClick={() => this.changeColumnSorted("account")}>
                {" "}
                <i className="bi bi-arrow-down-up me-1"></i>Compte
              </td>
              <td onClick={() => this.changeColumnSorted("label")}>
                {" "}
                <i className="bi bi-arrow-down-up me-1"></i>Libellé
              </td>
              <td
                className="text-end"
                onClick={() => this.changeColumnSorted("amount")}
              >
                {" "}
                <i className="bi bi-arrow-down-up me-1"></i>Montant
                <span className="tw-normal small d-block">&euro;</span>
              </td>
              <td className="text-end">
                Empreinte{" "}
                <span className="tw-normal small d-block">{unit}</span>
              </td>
              <td className="text-end">
                Incertitude <span className="tw-normal small d-block">%</span>
              </td>
              {impactAbsolu && (
                <td className="text-end">
                  Impact{" "}
                  <span className="tw-normal small d-block">
                    {unitAbsolute}
                  </span>
                </td>
              )}

              {prevPeriod && (
                <>
                  <td className="text-end border-left">
                    Empreinte{" "}
                    <span className="tw-normal small d-block">{unit}</span>
                  </td>
                  <td className="text-end">
                    Incertitude{" "}
                    <span className="tw-normal small d-block">%</span>
                  </td>
                  {impactAbsolu && (
                    <td className="text-end">
                      Impact{" "}
                      <span className="tw-normal small d-block">
                        {unitAbsolute}
                      </span>
                    </td>
                  )}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredExternalExpensesAccounts.map(
              ({ accountNum, accountLib, periodsData }) => {
                return (
                  <tr key={accountNum}>
                    <td> {accountNum}</td>
                    <td>
                      {" "}
                      {accountLib.charAt(0).toUpperCase() +
                        accountLib.slice(1).toLowerCase()}
                    </td>
                    <td className="text-end">
                      {printValue(periodsData[period.periodKey].amount, 0)}
                    </td>
                    <td className="text-end">
                      {printValue(
                        periodsData[period.periodKey].footprint.indicators[
                          indic
                        ].getValue(),
                        nbDecimals
                      )}
                    </td>
                    <td className="text-end">
                      <u>+</u>
                      {printValue(
                        periodsData[period.periodKey].footprint.indicators[
                          indic
                        ].getUncertainty(),
                        0
                      )}
                    </td>
                    {impactAbsolu && (
                      <td className="text-end">
                        {printValue(
                          periodsData[period.periodKey].footprint.indicators[
                            indic
                          ].getValueAbsolute(
                            periodsData[period.periodKey].amount
                          ),
                          nbDecimals
                        )}
                      </td>
                    )}

                    {prevPeriod && (
                      <>
                        <td className="text-end border-left">
                          {printValue(
                            periodsData[prevPeriod.periodKey].footprint.indicators[
                              indic
                            ].getValue(),
                            nbDecimals
                          )}
                        </td>
                        <td className="text-end">
                          <u>+</u>
                          {printValue(
                            periodsData[prevPeriod.periodKey].footprint.indicators[
                              indic
                            ].getUncertainty(),
                            0
                          )}
                        </td>
                        {impactAbsolu && (
                          <td className="text-end">
                            {printValue(
                              periodsData[
                                prevPeriod.periodKey
                              ].footprint.indicators[indic].getValueAbsolute(
                                periodsData[prevPeriod.periodKey].amount
                              ),
                              nbDecimals
                            )}
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                );
              }
            )}
          </tbody>
        </Table>
      </div>
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

  sortAccounts(accounts, period, columSorted) {
    switch (columSorted) {
      case "account":
        accounts.sort((a, b) => a.accountNum.localeCompare(b.accountNum));
        break;
      case "amount":
        accounts.sort(
          (a, b) =>
            b.periodsData[period.periodKey].amount -
            a.periodsData[period.periodKey].amount
        );
        break;
    }
    if (this.state.reverseSort) accounts.reverse();
  }
}

export const getExpensesGroupByAccount = (expenses) => {
  let expensesByAccount = {};
  expenses.forEach(({ accountNum, accountLib, amount }) => {
    if (expensesByAccount[accountNum] == undefined)
      expensesByAccount[accountNum] = { accountNum, amount, accountLib };
    else expensesByAccount[accountNum].amount += amount;
  });
  return Object.entries(expensesByAccount).map(
    ([accountNum, { amount, accountLib }]) => ({
      accountNum,
      amount,
      accountLib,
    })
  );
};
