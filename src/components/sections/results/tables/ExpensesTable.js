// La Société Nouvelle

// React
import React, { useState } from "react";
import { Button, Table } from "react-bootstrap";

// Utils
import { printValue } from "/src/utils/formatters";

// Lib
import metaIndics from "/lib/indics";
import { getPrevDate } from "../../../../utils/periodsUtils";
import { TableHeaderRow, TableHeaderRowUnits } from "./utils";

/** EXPENSES TABLE
 *
 *  Show footprints of external expenses accounts
 *
 */

export const ExpensesTable = ({ session, period, indic }) => {
  const { financialData } = session;

  const externalExpensesAccounts = financialData.externalExpensesAccounts;

  const { unit, nbDecimals, unitAbsolute } = metaIndics[indic];

  // Prev period

  const prevDateEnd = getPrevDate(period.dateStart);
  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  const [showColumn, setShowColumn] = useState(false);

  const toggleColumn = () => {
    setShowColumn(!showColumn);
  };

  // sorting
  const [columnSorted, setColumnSorted] = useState("amount");
  const [reverseSort, setReverseSort] = useState(false);

  const changeColumnSorted = (columnSorted) => {
    if (columnSorted !== columnSorted) {
      setColumnSorted(columnSorted);
      setReverseSort(false);
    } else {
      setReverseSort(!reverseSort);
    }
  };

  const sortAccounts = (accounts, columnSorted) => {
    switch (columnSorted) {
      case "account":
        accounts.sort((a, b) => a.accountNum.localeCompare(b.accountNum));
        break;
      case "amount":
        accounts.sort((a, b) => {
          if (
            a.periodsData[period.periodKey] &&
            b.periodsData[period.periodKey]
          ) {
            return (
              b.periodsData[period.periodKey].amount -
              a.periodsData[period.periodKey].amount
            );
          } else if (a.periodsData[period.periodKey]) {
            return -1;
          } else {
            return 1;
          }
        });
        break;
      default:
        break;
    }
    if (reverseSort) accounts.reverse();
  };

  sortAccounts(externalExpensesAccounts, columnSorted);

  // Show Gross Impact column

  const indicsWithGrossImpact = new Set([
    "ghg",
    "haz",
    "mat",
    "nrg",
    "was",
    "wat",
  ]);
  const showGrossImpact = indicsWithGrossImpact.has(indic);

  return (
    <div className="d-flex">
      <Table id="expensesTable" className="mb-0">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th colSpan={showGrossImpact ? "4" : "3"} className="text-center">
              Année N
            </th>
          </tr>
          <tr className="align-top">
            <th onClick={() => changeColumnSorted("account")}>
              {" "}
              <i className="bi bi-arrow-down-up me-1"></i>Compte
            </th>
            <th onClick={() => changeColumnSorted("label")}>
              {" "}
              <i className="bi bi-arrow-down-up me-1"></i>Libellé
            </th>
            <th
              className="text-end"
              onClick={() => changeColumnSorted("amount")}
            >
              <i className="bi bi-arrow-down-up me-1"></i>Montant
            </th>
            {TableHeaderRow(showGrossImpact, unit, unitAbsolute)}
          </tr>
          <tr className="small fw-normal">
            <th></th>
            <th></th>
            {TableHeaderRowUnits(showGrossImpact, unit, unitAbsolute)}
          </tr>
        </thead>
        <tbody>
          {externalExpensesAccounts
            .filter(({ periodsData }) =>
              periodsData.hasOwnProperty(period.periodKey)
            )
            .map(({ accountNum, accountLib, periodsData }) => {
              return (
                <tr key={accountNum}>
                  <td> {accountNum}</td>
                  <td>
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
                  <td className="text-end uncertainty">
                    <u>+</u>
                    {printValue(
                      periodsData[period.periodKey].footprint.indicators[
                        indic
                      ].getUncertainty(),
                      0
                    )}
                  </td>
                  {showGrossImpact && (
                    <td className="text-end">
                      {printValue(
                        periodsData[period.periodKey].footprint.indicators[
                          indic
                        ].getGrossImpact(periodsData[period.periodKey].amount),
                        nbDecimals
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </Table>
      {prevPeriod && showColumn && (
        <Table className="prevTable">
          <thead>
            <tr>
              <th
                colSpan={showGrossImpact ? "4" : "3"}
                className="text-center "
              >
                N-1
              </th>
            </tr>
            <tr>
              <td
                className="text-end "
                onClick={() => changeColumnSorted("amount")}
              >
                <i className="bi bi-arrow-down-up me-1"></i>Montant
              </td>
              {TableHeaderRow(showGrossImpact, unit, unitAbsolute)}
            </tr>
            <tr className="small fw-normal">
              {TableHeaderRowUnits(showGrossImpact, unit, unitAbsolute)}
            </tr>
          </thead>
          <tbody>
            {externalExpensesAccounts
              .filter(({ periodsData }) =>
                periodsData.hasOwnProperty(period.periodKey)
              )
              .map(({ accountNum, accountLib, periodsData }) => {
                return (
                  <tr key={accountNum}>
                    <td className="text-end">
                      {printValue(periodsData[prevPeriod.periodKey]?.amount, 0)}
                    </td>
                    <td className="text-end ">
                      {periodsData.hasOwnProperty(prevPeriod.periodKey)
                        ? printValue(
                            periodsData[
                              prevPeriod.periodKey
                            ].footprint.indicators[indic].getValue(),
                            nbDecimals
                          )
                        : " - "}
                    </td>
                    <td className="text-end uncertainty">
                      <u>+</u>
                      {periodsData.hasOwnProperty(prevPeriod.periodKey)
                        ? printValue(
                            periodsData[
                              prevPeriod.periodKey
                            ].footprint.indicators[indic].getUncertainty(),
                            0
                          )
                        : " - "}
                    </td>
                    {showGrossImpact && (
                      <td className="text-end">
                        {periodsData.hasOwnProperty(prevPeriod.periodKey)
                          ? printValue(
                              periodsData[
                                prevPeriod.periodKey
                              ].footprint.indicators[indic].getGrossImpact(
                                periodsData[prevPeriod.periodKey].amount
                              ),
                              nbDecimals
                            )
                          : " - "}
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </Table>
      )}
      {prevPeriod && (
        <Button onClick={toggleColumn} className="vertical-button">
          {showColumn ? (
            <>
              <i className="bi bi-dash-circle me-2"></i> Masquer N-1
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle me-2"></i> Afficher N-1
            </>
          )}
        </Button>
      )}
    </div>
  );
};

