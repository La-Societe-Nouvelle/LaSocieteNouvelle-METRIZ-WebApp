// La Société Nouvelle

// React
import React from "react";
import { Table } from "react-bootstrap";

// Utils
import { getAmountItems, getPrevDate, getSumItems, printValue } from "../../../../src/utils/Utils";

/* ---------- IMMOBILISATIONS TABLE ---------- */

export class ImmobilisationsTable extends React.Component 
{
  constructor(props) 
  {
    super(props);
    this.state = {
      columnSorted: "account",
      reverseSort: false,
    };
  }

  render() {
    const { immobilisations, investments } = this.props.financialData;
    const { columnSorted } = this.state;
    const period = this.props.period;
    const prevStateDateEnd = getPrevDate(period.dateStart);
    console.log(period);

    this.sortItems(immobilisations, columnSorted);

    return (
      <>
        <Table hover className="immobilisationsTable">
          <caption>Tableau des immobilisations</caption>
          <thead>
            <tr>
              <th
                className="short"
                onClick={() => this.changeColumnSorted("account")}
              >
                Compte
              </th>
              <th onClick={() => this.changeColumnSorted("accountLib")}>
                Libellé
              </th>
              <th className="text-end">Valeur brute au début de l'exercice</th>
              <th className="text-end">Augmentations</th>
              <th className="text-end">Diminutions</th>
              <th className="text-end">Valeur brute à la fin de l'exercice</th>
            </tr>
          </thead>
          <tbody>
            {immobilisations.map((immobilisation) => {
                let augmentation = getAmountItems(immobilisation.entries.filter((entry) => period.regex.test(entry.date) && entry.amount > 0), 0);
                let dimininution = getAmountItems(immobilisation.entries.filter((entry) => period.regex.test(entry.date) && entry.amount < 0), 0);
                return (
                  <tr key={immobilisation.accountNum}>
                    <td>{immobilisation.accountNum}</td>
                    <td>
                      {immobilisation.accountLib.charAt(0).toUpperCase() +
                        immobilisation.accountLib.slice(1).toLowerCase()}
                    </td>
                    <td className="text-end">
                      {printValue(immobilisation.states[prevStateDateEnd].amount, 0)} &euro;
                    </td>
                    <td className="text-end">
                      {printValue(augmentation, 0)} &euro;
                    </td>
                    <td className="text-end">
                      {printValue(dimininution, 0)} &euro;
                    </td>
                    <td className="text-end">{printValue(immobilisation.states[period.dateEnd].amount, 0)} &euro;</td>
                  </tr>
                );
              }
            )}
          </tbody>

          {immobilisations.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="2">TOTAL</td>
                <td className="text-end">
                  {printValue(getSumItems(immobilisations.map(immobilisation => getGrossAmountImmobilisation(immobilisation,prevStateDateEnd)), 0)
                  , 0)}{" "}&euro;
                </td>
                <td className="text-end">
                  {printValue(getAmountItems(investments), 0)} &euro;
                </td>
                <td className="text-end">
                  {printValue(
                    getSumItems(immobilisations.map(immobilisation => getGrossAmountImmobilisation(immobilisation,prevStateDateEnd)), 0)
                    + getAmountItems(investments)
                    - getSumItems(immobilisations.map(immobilisation => getGrossAmountImmobilisation(immobilisation,period.dateEnd)), 0)
                    , 0)}{" "}&euro;
                </td>
                <td className="text-end">
                  {printValue(getSumItems(immobilisations.map(immobilisation => getGrossAmountImmobilisation(immobilisation,period.dateEnd)), 0)
                  , 0)}{" "}&euro;
                </td>
              </tr>
            </tfoot>
          )}
        </Table>
      </>
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

  sortItems(items, columSorted) {
    switch (columSorted) {
      case "accountLib":
        items.sort((a, b) => a.accountLib.localeCompare(b.accountLib));
        break;
      case "account":
        items.sort((a, b) => a.accountNum.localeCompare(b.accountNum));
        break;
      //case "prevAmount": items.sort((a,b) => b.prevAmount - a.prevAmount); break;
      //case "variation": items.sort((a,b) => (b.amount-b.prevAmount) - (a.amount-a.prevAmount)); break;
      //case "amount": items.sort((a,b) => b.amount - a.amount); break;
      // ...les valeurs affichées sont les valeurs nettes comptables (différentes des valeurs "amount")
    }
    if (this.state.reverseSort) items.reverse();
  }
}


const getGrossAmountImmobilisation = (immobilisation,date) => immobilisation.states[date].amount