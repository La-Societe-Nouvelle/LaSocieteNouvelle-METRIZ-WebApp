// La Société Nouvelle

// React
import React from 'react';

// Libraries
import metaIndics from '/lib/indics';

// Utils
import { printValue } from "../../src/utils/Utils";
import { Table } from 'react-bootstrap';

/* -------------------- INDICATOR COMPANIES TABLE -------------------- */

/*  Notes :
 *  The table shows the footprint (indicator) for each companies whose value is not a default one
 */

export class IndicatorCompaniesTable extends React.Component {
  
  constructor(props) 
  {
    super(props)
    this.state = 
    {
      columnSorted: "amount",
      reverseSort: false,
    }
  }

  render() 
  {
    const {session,indic} = this.props;
    const {columnSorted} = this.state;

    const companies = session.financialData.companies.filter(company => company.dataFetched)
                                                     .filter(company => company.footprint.indicators[indic].flag=="p");
    const expensesByCompanies = getExpensesByCompanies(companies,session.financialData.expenses);

    this.sortCompanies(companies,columnSorted);

    const nbDecimals = metaIndics[indic].nbDecimals;
    const unit = metaIndics[indic].unit;
    const unitAbsolute = metaIndics[indic].unitAbsolute;
    const impactAbsolu = ["ghg","haz","mat","nrg","was","wat"].includes(indic);

    return (
      <div className="table-main">

      {companies.length == 0 &&
        <p>Aucun fournisseur n'a publié ses données</p>}

      {companies.length > 0 &&
        <Table>
          <thead>
            <tr>
              <td className="short center" onClick={() => this.changeColumnSorted("identifiant")}>Identifiant</td>
              <td className="auto" onClick={() => this.changeColumnSorted("denomination")}>Dénomination</td>
              <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
              <td className="column_value" colSpan="2">Valeur</td>
              <td className="column_uncertainty">Incertitude</td>
              {impactAbsolu ? <td className="column_value" colSpan="2">Impact</td> : null}
            </tr>
          </thead>
          <tbody>
          {companies.map(({corporateId,corporateName,accountNum,footprint}) => 
            {
              const indicator = footprint.indicators[indic];
              return(
                <tr key={corporateId}>
                  <td className="short center">{corporateId}</td>
                  <td className="auto">{corporateName}</td>
                  <td className="short right">{printValue(expensesByCompanies[accountNum],0)}</td>
                  <td className="column_unit">&nbsp;€</td>
                  <td className="column_value">{printValue(indicator.getValue(),nbDecimals)}</td>
                  <td className="column_unit">&nbsp;{unit}</td>
                  <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(indicator.getUncertainty(),0)}&nbsp;%</td>
                  {impactAbsolu ? <td className="column_value">{printValue(indicator.getValueAbsolute(expensesByCompanies[accountNum]),nbDecimals)}</td> : null}
                  {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
                </tr>)})}
          </tbody>
        </Table>}
      </div>
    )
  }

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) 
  {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortCompanies(companies,columSorted) 
  {
    switch(columSorted) 
    {
      case "identifiant": companies.sort((a,b) => valueOrDefault(a.corporateId,"").localeCompare(valueOrDefault(b.corporateId,""))); break;
      case "denomination": companies.sort((a,b) => a.providerLib.localeCompare(b.providerLib)); break;
      case "amount": companies.sort((a,b) => b.amount - a.amount); break;
    }
    if (this.state.reverseSort) companies.reverse();
  }

}

const getExpensesByCompanies = (companies,expenses) => 
{
    let expensesByCompanies = {};
    companies.forEach(company =>
      {
        expensesByCompanies[company.accountNum] = expenses.filter(expense => expense.accountAux == company.accountNum)
                                                       .map(expense => expense.amount)
                                                       .reduce((a,b) => a+b,0);
      })
    return expensesByCompanies;
}