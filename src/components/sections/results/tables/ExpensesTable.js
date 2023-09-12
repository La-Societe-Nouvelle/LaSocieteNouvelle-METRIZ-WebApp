// La Société Nouvelle

// React
import React, { useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { printValue } from "/src/utils/formatters";

// Lib
import metaIndics from "/lib/indics";
import { getPrevDate } from "../../../../utils/periodsUtils";

/** EXPENSES TABLE
 *  
 *  Show footprints of external expenses accounts
 * 
 */

const indicsWithGrossImpact = ["ghg", "haz", "mat", "nrg", "was", "wat"];

export const  ExpensesTable = ({
  session,
  period,
  indic
}) => {

  const {
    financialData
  } = session;
  const externalExpensesAccounts = financialData.externalExpensesAccounts;

  const prevDateEnd = getPrevDate(period.dateStart);
  const prevPeriod = session.availablePeriods
    .find((period) => period.dateEnd == prevDateEnd);

  const { unit, nbDecimals, unitAbsolute} = metaIndics[indic];

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
        accounts.sort(
          (a, b) => {
            if (a.periodsData[period.periodKey] && b.periodsData[period.periodKey]) {
              return b.periodsData[period.periodKey].amount - a.periodsData[period.periodKey].amount;
            } else if (a.periodsData[period.periodKey]) {
              return -1;
            } else {
              return 1;
            }
          }
        );
        break;
      default:
        break;
    }
    if (reverseSort) accounts.reverse();
  };

  sortAccounts(externalExpensesAccounts, columnSorted);

  const showGrossImpact = indicsWithGrossImpact.includes(indic);

  return (
      <Table id="indicatorExpenses">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th colSpan={showGrossImpact ? "4" : "3"} className="text-center">
              Année N
            </th>
            {prevPeriod && (
              <th
                colSpan={showGrossImpact ? "3" : "2"}
                className="text-center border-left"
              >
                N-1
              </th>
            )}
          </tr>
          <tr className="align-top">
            <td onClick={() => changeColumnSorted("account")}>
              {" "}
              <i className="bi bi-arrow-down-up me-1"></i>Compte
            </td>
            <td onClick={() => changeColumnSorted("label")}>
              {" "}
              <i className="bi bi-arrow-down-up me-1"></i>Libellé
            </td>
            <td
              className="text-end"
              onClick={() => changeColumnSorted("amount")}
            >
              {" "}
              <i className="bi bi-arrow-down-up me-1"></i>Montant
              <span className="tw-normal small d-block">&euro;</span>
            </td>
            <td className="text-end">
              Empreinte <span className="tw-normal small d-block">{unit}</span>
            </td>
            <td className="text-end">
              Incertitude <span className="tw-normal small d-block">%</span>
            </td>
            {showGrossImpact && (
              <td className="text-end">
                Impact{" "}
                <span className="tw-normal small d-block">{unitAbsolute}</span>
              </td>
            )}

            {prevPeriod && (
              <>
                <td className="text-end border-left">
                  Empreinte{" "}
                  <span className="tw-normal small d-block">{unit}</span>
                </td>
                <td className="text-end">
                  Incertitude <span className="tw-normal small d-block">%</span>
                </td>
                {showGrossImpact && (
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
          {externalExpensesAccounts.map(
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
                  {showGrossImpact && (
                    <td className="text-end">
                      {printValue(
                        periodsData[period.periodKey].footprint.indicators[
                          indic
                        ].getGrossImpact(
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
                          periodsData[
                            prevPeriod.periodKey
                          ].footprint.indicators[indic].getValue(),
                          nbDecimals
                        )}
                      </td>
                      <td className="text-end">
                        <u>+</u>
                        {printValue(
                          periodsData[
                            prevPeriod.periodKey
                          ].footprint.indicators[indic].getUncertainty(),
                          0
                        )}
                      </td>
                      {showGrossImpact && (
                        <td className="text-end">
                          {printValue(
                            periodsData[
                              prevPeriod.periodKey
                            ].footprint.indicators[indic].getGrossImpact(
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
  );
}