import React from 'react';

import { printValue } from '../../src/utils/Utils';

import { metaIndicators } from '../../lib/indic';

/* ------------------------------------------------------ */
/* -------------------- EXPENSES TAB -------------------- */
/* ------------------------------------------------------ */

export function ExpensesTab(props) {

  const {session,indic} = props;

  return (
    <div className="indicator-section-view">
      <div className="view-header">
        <button className="retour"onClick = {() => props.onGoBack()}>Retour</button>
      </div>
      <div className="group">
        <h3>Détails des impacts indirects des consommations</h3>
        <TableExpenses 
          indic={indic}
          companies={session.financialData.getCompaniesExpenses()}
          onUpdate={props.onUpdate}/>
      </div>
    </div>
  )
}

/* ---------- EXPENSES TAB ---------- */

class TableExpenses extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      page: 0
    }
  }

  render() {
    const {companies} = this.props;
    const {page} = this.state;
    console.log(companies);
    companies.sort((a,b) => b.getFootprint().getIndicator(this.props.indic).getValueAbsolute(b.getAmount()) - a.getFootprint().getIndicator(this.props.indic).getValueAbsolute(a.getAmount()));
    return (
      <div>
        <table>
          <thead>
            <tr>
              <td>Fournisseur</td>
              <td colSpan="2">Montant</td>
              <td colSpan="2">Valeur</td>
              <td colSpan="2">Incertitude</td>
              <td>Flag</td>
              <td></td>
          </tr>
          </thead>
          <tbody>
            {
              companies.slice(page*20,(page+1)*20).map((company) => {
                return(<RowTableExpenses 
                  key={"company_"+company.getId()} 
                  company={company} 
                  onUpdate={this.updateCompany.bind(this)} 
                  indic={this.props.indic}/>)
              })
            }
          </tbody>
        </table>
        {companies.length > 20 &&
          <div className="table-navigation">
            <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
            <button className={(page+1)*20 < companies.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
          </div>}
      </div>
    )
  }

  /* ---------- NAVIGATION ---------- */

  prevPage = () => {
    let currentPage = this.state.page;
    if (currentPage > 0) this.setState({page: currentPage-1})
  }

  nextPage = () => {
    let currentPage = this.state.page;
    if ((currentPage+1)*20 < this.props.companies.length) {
      this.setState({page: currentPage+1})
    }
  }

  /* ---------- COMPANIES ---------- */

  updateCompany(id,value,uncertainty) {
    // REWRITE
    this.props.financialData.getExpense(id).getFootprint().getIndicator(this.props.indic).setValue(value);
    this.props.financialData.getExpense(id).getFootprint().getIndicator(this.props.indic).setUncertainty(uncertainty);
    this.props.onUpdate(this.props.financialData);
  }

}

class RowTableExpenses extends React.Component {
  
  constructor(props) {
    super(props);
    const indicator = props.company.getFootprint().getIndicator(props.indic);
    this.state = {
      valueInput: indicator.getValue(),
      uncertaintyInput: indicator.getUncertainty()
    };
  }

  render() {
    const {corporateName,footprint,amount} = this.props.company;
    const {valueInput,uncertaintyInput} = this.state;
    return (
      <tr>
        <td className="column_auto">{corporateName}</td>
        <td className="column_value">{printValue(amount,0)}</td>
        <td className="column_unit">&nbsp;€</td>
        <td className="column_value">
          <input value={valueInput} onChange={this.onValueChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_unit">&nbsp;{metaIndicators[this.props.indic].unit}</td>
        <td className="column_value">
          <input value={uncertaintyInput} onChange={this.onUncertaintyChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_unit">&nbsp;%</td>
        <td className="column_libelleFlag">&nbsp;{footprint.getIndicator(this.props.indic).getLibelleFlag()}</td>
        <td className="column_resync">
          <img className="img" src="/resources/icon_refresh.jpg" alt="refresh" onClick={this.onSyncCompany}/></td>
      </tr>
    )
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onValueChange = (event) => {
    this.setState({valueInput: event.target.value})
  }
  onUncertaintyChange = (event) => {
    this.setState({uncertaintyInput: event.target.value})
  }

  onSyncCompany = (event) => {
    this.fetchData();
  }

  async fetchData() {
    let company = this.props.company;
    await company.fetchIndicCSFdata(this.props.indic);
    const {value,uncertainty} = company.getFootprint().getIndicator(this.props.indic);
    this.setState({valueInput: value, uncertaintyInput: uncertainty});
    this.props.onUpdate(this.props.company.getId(),value,uncertainty);
  }

  onBlur = (event) => {
    let value = !isNaN(parseFloat(this.state.valueInput)) ? parseFloat(this.state.valueInput) : null;
    let uncertainty = !isNaN(parseFloat(this.state.uncertaintyInput)) ? parseFloat(this.state.uncertaintyInput) : null;
    this.props.onUpdate(this.props.company.getId(),value,uncertainty);
  }

}