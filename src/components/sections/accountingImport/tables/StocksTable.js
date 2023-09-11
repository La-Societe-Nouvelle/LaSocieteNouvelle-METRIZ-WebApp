// La Société Nouvelle

import React, { useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { getAmountItems, getSumItems } from "/src/utils/Utils";
import { printValue } from "/src/utils/formatters";
import { getPrevDate } from "/src/utils/periodsUtils";

/* ---------- TABLE STOCKS ---------- */

export const StocksTable = ({financialData, period}) => {
  
  const [columnSorted, setColumnSorted] = useState("account");
  const [isDescending, setIsDescending] = useState(false);

  const prevStateDateEnd = getPrevDate(period.dateStart);

  const changeColumnSorted = (newColumnSorted) => {
    if (newColumnSorted === columnSorted) {
      setIsDescending(!isDescending);
    } else {
      setColumnSorted(newColumnSorted);
      setIsDescending(false);
    }
  };

  const sortItems = (items, columnSorted) => {
    switch (columnSorted) {
      case "label":
        items.sort((a, b) =>
          isDescending
            ? b.accountLib.localeCompare(a.accountLib)
            : a.accountLib.localeCompare(b.accountLib)
        );
        break;
      case "account":
        items.sort((a, b) =>
          isDescending
            ? b.accountNum.localeCompare(a.accountNum)
            : a.accountNum.localeCompare(b.accountNum)
        );
        break;
    }
  };

  sortItems(financialData.stocks, columnSorted);

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
            <td onClick={() => changeColumnSorted("label")}>
              Libellé{" "}
              <span>
                {isDescending ? (
                  <i className="bi bi-arrow-down-short"></i>
                ) : (
                  <i className="bi bi-arrow-up-short"></i>
                )}
              </span>
            </td>
            <td className="text-end">Montant (N)</td>
            <td className="text-end">Montant (N-1)</td>
            <td className="text-end">Variation</td>
          </tr>
        </thead>
        <tbody>
          {financialData.stocks.map((stock) => {
            return (
              <tr key={stock.accountNum}>
                <td>{stock.accountNum}</td>
                <td>
                  {stock.accountLib.charAt(0).toUpperCase() +
                    stock.accountLib.slice(1).toLowerCase()}
                </td>
                <td className="text-end">
                  {printValue(stock.states[period.dateEnd].amount, 0)} &euro;
                </td>
                <td className="text-end">
                  {printValue(stock.states[prevStateDateEnd].amount, 0)} &euro;
                </td>
                <td className="text-end">
                  {printValue(
                    stock.states[period.dateEnd].amount -
                      stock.states[prevStateDateEnd].amount,
                    0
                  )}{" "}
                  &euro;
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          {financialData.stocks.length > 0 && (
            <tr className="border-top">
              <td colSpan="2">Total</td>
              <td className="text-end">
                {printValue(
                  getAmountItems(
                    financialData.stocks.map(
                      (stock) => stock.states[period.dateEnd]
                    )
                  ),
                  0
                )}{" "}
                &euro;
              </td>
              <td className="text-end">
                {printValue(
                  getAmountItems(
                    financialData.stocks.map(
                      (stock) => stock.states[prevStateDateEnd]
                    )
                  ),
                  0
                )}{" "}
                &euro;
              </td>
              <td className="text-end">
                {printValue(
                  getSumItems(
                    financialData.stocks.map(
                      (stock) =>
                        stock.states[period.dateEnd].amount -
                        stock.states[prevStateDateEnd].amount
                    )
                  ),
                  0
                )}{" "}
                &euro;
              </td>
            </tr>
          )}
        </tfoot>
      </Table>
    </>
  );
};

// const getGrossAmountStock = (stock,date) => stock.states[date].amount
// const getNetAmountStock = (stock,date) => stock.states[date].amount - stock.states[date].depreciationAmount