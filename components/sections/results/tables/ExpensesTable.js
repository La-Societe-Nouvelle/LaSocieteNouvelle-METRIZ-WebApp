// La Société Nouvelle

import React, { useState } from "react";
import { printValue } from "/src/utils/Utils";
import { Table } from "react-bootstrap";

import metaIndics from "/lib/indics";

export const  ExpensesTable = ({
  session,
  indic,
  period
}) => {

  const {
    financialData
  } = session;
  const externalExpensesAccounts = financialData.externalExpensesAccounts;

  const prevDateEnd = period.dateEnd;
  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  const { unit, nbDecimals, unitAbsolute} = metaIndics[indic];

  const [columnSorted, setColumnSorted] = useState("amount");
  const [reverseSort, setReverseSort] = useState(false);

  const filteredExternalExpensesAccounts = externalExpensesAccounts.filter(
    (provider) => provider.periodsData.hasOwnProperty(period.periodKey)
  );

  const sortAccounts = (accounts, columnSorted) => {
    switch (columnSorted) {
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
      default:
        break;
    }
    if (reverseSort) accounts.reverse();
  };

  sortAccounts(filteredExternalExpensesAccounts, columnSorted);

  const impactAbsolu = ["ghg", "haz", "mat", "nrg", "was", "wat"].includes(
    indic
  );

  const changeColumnSorted = (columnSorted) => {
    if (columnSorted !== columnSorted) {
      setColumnSorted(columnSorted);
      setReverseSort(false);
    } else {
      setReverseSort(!reverseSort);
    }
  };

  return (
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
            {impactAbsolu && (
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
  );
};


