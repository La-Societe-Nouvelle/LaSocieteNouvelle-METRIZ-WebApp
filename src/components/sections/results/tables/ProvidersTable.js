// La Société Nouvelle

// React
import React, { useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { printValue } from "/src/utils/formatters";

// Lib
import metaIndics from "/lib/indics";
import flagData from "/lib/flags";

/** EXPENSES TABLE
 *
 *  Show footprints of external expenses accounts
 *
 */

const indicsWithGrossImpact = ["ghg", "haz", "mat", "nrg", "was", "wat"];

export const ProvidersTable = ({ session, period, indic }) => 
{
  const { financialData } = session;
  const providers = financialData.providers.filter(provider => provider.periodsData.hasOwnProperty(period.periodKey));

  const { unit, nbDecimals, unitAbsolute } = metaIndics[indic];

  // sorting
  const [columnSorted, setColumnSorted] = useState("impact");
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
      case "amount":
        accounts.sort((a, b) => {
          if (
            a.periodsData[period.periodKey] &&
            b.periodsData[period.periodKey]
          ) {
            return (
              b.periodsData[period.periodKey].amountExpenses -
              a.periodsData[period.periodKey].amountExpenses
            );
          } else if (a.periodsData[period.periodKey]) {
            return -1;
          } else {
            return 1;
          }
        });
        break;
      case "impact":
        accounts.sort((a, b) => {
          if (
            a.footprint.indicators[indic].getGrossImpact(
              a.periodsData[period.periodKey].amountExpenses
            ) >
            b.footprint.indicators[indic].getGrossImpact(
              b.periodsData[period.periodKey].amountExpenses
            )
          ) {
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

  sortAccounts(providers, columnSorted);

  const showGrossImpact = indicsWithGrossImpact.includes(indic);

  return (
    <Table id="indicatorExpenses">
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th colSpan={showGrossImpact ? "5" : "4"} className="text-center">
            Année N
          </th>
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
          <td className="text-end" onClick={() => changeColumnSorted("amount")}>
            {" "}
            <i className="bi bi-arrow-down-up me-1"></i>Montant
            <span className="tw-normal small d-block">&euro;</span>
          </td>
          <td className="text-end">
            Empreinte <span className="tw-normal small d-block">{unit}</span>
          </td>
          <td className="text-end">Flag</td>
          <td className="text-end">
            Incertitude <span className="tw-normal small d-block">%</span>
          </td>
          {showGrossImpact && (
            <td className="text-end">
              Impact{" "}
              <span className="tw-normal small d-block">{unitAbsolute}</span>
            </td>
          )}
        </tr>
      </thead>
      <tbody>
        {providers
          .filter((provider) => !provider.isDefaultProviderAccount)
          .filter((provider) => provider.footprintStatus == 200 && provider.footprint.isValid())
          .filter((provider) =>
            provider.periodsData.hasOwnProperty(period.periodKey)
          )
          .filter(
            (provider) =>
              provider.periodsData[period.periodKey].amountExpenses != 0
          )
          .map(({ providerNum, providerLib, footprint, periodsData }) => {
            return (
              <tr key={providerNum}>
                <td>{providerNum}</td>
                <td>{providerLib}</td>
                <td className="text-end">
                  {printValue(periodsData[period.periodKey].amountExpenses, 0)}
                </td>
                <td className="text-end">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}
                </td>
                <td className="text-end">{footprint.indicators[indic].flag}</td>
                <td className="text-end uncertainty">
                  <u>+</u>
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}
                </td>
                {showGrossImpact && (
                  <td className="text-end">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(
                        periodsData[period.periodKey].amountExpenses
                      ),
                      nbDecimals
                    )}
                  </td>
                )}
              </tr>
            );
          })}
      </tbody>
      <caption className="legend  text-end">
        {Object.keys(flagData).map((flagCode) => (
          <span key={flagCode} className="ms-3 border-right">
            {flagCode} : {flagData[flagCode]}
          </span>
        ))}
      </caption>
    </Table>
  );
};
