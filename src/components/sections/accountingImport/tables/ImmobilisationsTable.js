// La Société Nouvelle
import React, { useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { getAmountItems, getSumItems } from "/src/utils/Utils";
import { printValue } from "/src/utils/formatters";
import { getPrevDate } from "/src/utils/periodsUtils";

/* ---------- IMMOBILISATIONS TABLE  ---------- */

export const ImmobilisationsTable = ({financialData,period}) => {

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
      //case "prevAmount": items.sort((a,b) => b.prevAmount - a.prevAmount); break;
      //case "variation": items.sort((a,b) => (b.amount-b.prevAmount) - (a.amount-a.prevAmount)); break;
      //case "amount": items.sort((a,b) => b.amount - a.amount); break;
      // ...les valeurs affichées sont les valeurs nettes comptables (différentes des valeurs "amount")
    }
  };

  sortItems(financialData.immobilisations, columnSorted);

  return (
    <Table hover className="immobilisationsTable">
      <caption>Tableau des immobilisations</caption>
      <thead>
        <tr>
          <th className="short" onClick={() => changeColumnSorted("account")}>
            Compte
            <span>
              {isDescending ? (
                <i className="bi bi-arrow-down-short"></i>
              ) : (
                <i className="bi bi-arrow-up-short"></i>
              )}
            </span>
          </th>
          <th onClick={() => changeColumnSorted("accountLib")}>
            Libellé
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
          let augmentation = getAmountItems(
            immobilisation.entries.filter(
              (entry) => period.regex.test(entry.date) && entry.amount > 0
            ),
            0
          );
          let diminution = getAmountItems(
            immobilisation.entries.filter(
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
                {printValue(immobilisation.states[prevStateDateEnd].amount, 0)}{" "}
                &euro;
              </td>
              <td className="text-end">{printValue(augmentation, 0)} &euro;</td>
              <td className="text-end">{printValue(diminution, 0)} &euro;</td>
              <td className="text-end">
                {printValue(immobilisation.states[period.dateEnd].amount, 0)}{" "}
                &euro;
              </td>
            </tr>
          );
        })}
      </tbody>
      {financialData.immobilisations.length > 0 && (
        <tfoot>
          <tr>
            <td colSpan="2">TOTAL</td>
            <td className="text-end">
              {printValue(
                getSumItems(
                  financialData.immobilisations.map((immobilisation) =>
                    getGrossAmountImmobilisation(
                      immobilisation,
                      prevStateDateEnd
                    )
                  ),
                  0
                ),
                0
              )}{" "}
              &euro;
            </td>
            <td className="text-end">
              {printValue(
                getAmountItems(financialData.investments),
                0
              )}{" "}
              &euro;
            </td>
            <td className="text-end">
              {printValue(
                getSumItems(
                  financialData.immobilisations.map((immobilisation) =>
                    getGrossAmountImmobilisation(
                      immobilisation,
                      prevStateDateEnd
                    )
                  ),
                  0
                ) +
                  getAmountItems(financialData.investments) -
                  getSumItems(
                    financialData.immobilisations.map((immobilisation) =>
                      getGrossAmountImmobilisation(
                        immobilisation,
                        period.dateEnd
                      )
                    ),
                    0
                  ),
                0
              )}{" "}
              &euro;
            </td>
            <td className="text-end">
              {printValue(
                getSumItems(
                  financialData.immobilisations.map((immobilisation) =>
                    getGrossAmountImmobilisation(immobilisation, period.dateEnd)
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

const getGrossAmountImmobilisation = (immobilisation, date) =>
  immobilisation.states[date].amount;
