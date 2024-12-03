// La Société Nouvelle

import React, { useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { printValue } from "/src/utils/formatters";

/* ---------- EXPENSES TABLE  ---------- */

export const ExpensesTable = ({financialData, period}) => {

  const [columnSorted, setColumnSorted] = useState("amount");
  const [isDescending, setIsDescending] = useState(true);
  const periodKey = period.periodKey;

  const changeColumnSorted = (newColumnSorted) => {
    if (newColumnSorted === columnSorted) {
      setIsDescending(!isDescending);
    } else {
      setColumnSorted(newColumnSorted);
      setIsDescending(false);
    }
  };

  const sortExpenses = (accounts, periodKey, columnSorted) => {
    switch (columnSorted) {
      case "account":
        accounts.sort((a, b) => {
          const comparison = a.accountNum.localeCompare(b.accountNum);
          return isDescending ? -comparison : comparison;
        });
        break;
      case "amount":
        accounts
          .filter(account => account.periodsData.hasOwnProperty(periodKey))
          .sort((a, b) => {
            const amountA = a.periodsData[periodKey].amount;
            const amountB = b.periodsData[periodKey].amount;
            const comparison = amountA - amountB;
            return isDescending ? -comparison : comparison;
        });
        break;
      case "label":
        accounts.sort((a, b) =>
          isDescending
            ? b.accountLib.localeCompare(a.accountLib)
            : a.accountLib.localeCompare(b.accountLib)
        );
        break;
      default:
        break;
    }
  };
  
  const externalExpensesAccounts = [
    ...financialData.externalExpensesAccounts,
  ];

  sortExpenses(externalExpensesAccounts, periodKey, columnSorted, isDescending);

  return (
    <>
      <Table hover>
        <thead>
          <tr>
            <td onClick={() => changeColumnSorted("account")}>
              Compte{" "}
              <span>
                {isDescending ? (
                  <i className="bi bi-arrow-down-short"></i>
                ) : (
                  <i className="bi bi-arrow-up-short"></i>
                )}
              </span>
            </td>
            <td
              onClick={() => changeColumnSorted("label")}
            >Libellé
                 <span>
                {isDescending ? (
                  <i className="bi bi-arrow-down-short"></i>
                ) : (
                  <i className="bi bi-arrow-up-short"></i>
                )}
              </span>
            </td>
            <td
              className="text-end"
              onClick={() => changeColumnSorted("amount")}
            >
              Montant
              <span>
                {isDescending ? (
                  <i className="bi bi-arrow-down-short"></i>
                ) : (
                  <i className="bi bi-arrow-up-short"></i>
                )}
              </span>
            </td>
          </tr>
        </thead>
        <tbody>
          {externalExpensesAccounts
            .filter((account) => account.periodsData.hasOwnProperty(periodKey))
            .map((account) => (
              <tr key={account.accountNum}>
                <td>{account.accountNum}</td>
                <td>
                  {account.accountLib.charAt(0).toUpperCase() +
                    account.accountLib.slice(1).toLowerCase()}
                </td>
                <td className="text-end">
                  {printValue(account.periodsData[periodKey].amount, 0)} &euro;
                </td>
              </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};
