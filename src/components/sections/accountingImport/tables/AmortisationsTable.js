// La Société Nouvelle

import React, { useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { getAmountItems, getSumItems } from "/src/utils/Utils";
import { printValue } from "/src/utils/formatters";
import { getPrevDate } from "/src/utils/periodsUtils";

/* ---------- AMORTISATIONS TABLE ---------- */

export const AmortisationsTable = ({financialData, period}) => {
  
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
      case "accountLib":
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
      // ... Autres colonnes triables
    }
  };

  sortItems(financialData.immobilisations, columnSorted);

  return (
    <Table hover className="immobilisationsTable">
      <caption>Tableau des amortissements</caption>
      <thead>
        <tr>
          <th className="short" onClick={() => changeColumnSorted("account")}>
            Compte{" "}
            <span>
              {isDescending ? (
                <i className="bi bi-arrow-down-short"></i>
              ) : (
                <i className="bi bi-arrow-up-short"></i>
              )}
            </span>
          </th>
          <th onClick={() => changeColumnSorted("accountLib")}>
            Libellé{" "}
            <span>
              {isDescending ? (
                <i className="bi bi-arrow-down-short"></i>
              ) : (
                <i className="bi bi-arrow-up-short"></i>
              )}
            </span>
          </th>
          <th className="text-end">Valeur brute au début de l'exercice</th>
          <th className="text-end">Augmentations</th>
          <th className="text-end">Diminutions</th>
          <th className="text-end">Valeur brute à la fin de l'exercice</th>
        </tr>
      </thead>
      <tbody>
        {financialData.immobilisations.map((immobilisation) => {
          if (immobilisation.amortisationAccountNum) {
            let augmentation = getAmountItems(
              immobilisation.amortisationEntries.filter(
                (entry) => period.regex.test(entry.date) && entry.amount > 0
              ),
              0
            );
            let diminution = getAmountItems(
              immobilisation.amortisationEntries.filter(
                (entry) => period.regex.test(entry.date) && entry.amount < 0
              ),
              0
            );
            return (
              <tr key={immobilisation.accountNum}>
                <td>{immobilisation.accountNum}</td>
                <td>
                  {immobilisation.accountLib.charAt(0).toUpperCase() +
                    immobilisation.accountLib.slice(1).toLowerCase()}
                </td>
                <td className="text-end">
                  {printValue(
                    immobilisation.states[prevStateDateEnd].amortisationAmount,
                    0
                  )}{" "}
                  &euro;
                </td>
                <td className="text-end">
                  {printValue(augmentation, 0)} &euro;
                </td>
                <td className="text-end">{printValue(diminution, 0)} &euro;</td>
                <td className="text-end">
                  {printValue(
                    immobilisation.states[period.dateEnd].amortisationAmount,
                    0
                  )}{" "}
                  &euro;
                </td>
              </tr>
            );
          } else {
            return (
              <tr key={immobilisation.accountNum}>
                <td>{immobilisation.accountNum}</td>
                <td>
                  {immobilisation.accountLib.charAt(0).toUpperCase() +
                    immobilisation.accountLib.slice(1).toLowerCase()}
                </td>
                <td className="text-end"></td>
                <td className="text-end"></td>
                <td className="text-end"></td>
                <td className="text-end"></td>
              </tr>
            );
          }
        })}
      </tbody>

      {financialData.immobilisations.length > 0 && (
        <tfoot>
          <tr>
            <td colSpan="2">TOTAL</td>
            <td className="text-end">
              {printValue(
                getSumItems(
                  financialData.immobilisations.map(
                    (immobilisation) =>
                      immobilisation.states[prevStateDateEnd].amortisationAmount
                  ),
                  0
                ),
                0
              )}{" "}
              &euro;
            </td>
            <td className="text-end">
              {printValue(
                getAmountItems(financialData.amortisationExpenses),
                0
              )}{" "}
              &euro;
            </td>
            <td className="text-end">
              {printValue(
                getSumItems(
                  financialData.immobilisations.map(
                    (immobilisation) =>
                      immobilisation.states[prevStateDateEnd].amortisationAmount
                  )
                ) +
                  getAmountItems(financialData.amortisationExpenses) -
                  getSumItems(
                    financialData.immobilisations.map(
                      (immobilisation) =>
                        immobilisation.states[period.dateEnd].amortisationAmount
                    )
                  ),
                0
              )}{" "}
              &euro;
            </td>
            <td className="text-end">
              {printValue(
                getSumItems(
                  financialData.immobilisations.map(
                    (immobilisation) =>
                      immobilisation.states[period.dateEnd].amortisationAmount
                  ),
                  0
                ),
                0
              )}{" "}
              &euro;
            </td>
          </tr>
        </tfoot>
      )}
    </Table>
  );
};

