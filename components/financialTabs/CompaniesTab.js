import React from 'react';

import { CSVFileReader, processCSVCompaniesData } from '../../src/readers/CSVReader';

import { divisions } from '../../lib/nace'; 
import { areas } from '../../lib/area'; 

/* ------------------------------------------------------- */
/* -------------------- COMPANIES TAB -------------------- */
/* ------------------------------------------------------- */

export class CompaniesTab extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return(
      <div className="financial_data_depreciations_view">
        <div className="group">
          <h3>Liste des fournisseurs</h3>
          <div className="actions">
            <button onClick={() => document.getElementById('import-companies').click()}>Importer un fichier CSV</button>
            <input id="import-companies" type="file" accept=".csv" onChange={this.importCSVFile} visibility="collapse"/>
            <button onClick={this.synchroniseAll}>Re-Synchroniser tout</button>
          </div>
          <TableCompanies {...this.props}/>
        </div>
      </div>
  )}

  // Import CSV File
  importCSVFile = (event) => {
    let reader = new FileReader();
    reader.onload = async () => {
      CSVFileReader(reader.result)
        .then((CSVData) => processCSVCompaniesData(CSVData))
        .then(async (companiesId) => {
          await Promise.all(Object.entries(companiesId).map(async ([corporateName,corporateId]) => {
            let company = this.props.financialData.getCompanyByName(corporateName);
            if (company!=undefined) {
              this.props.financialData.updateCompany({
                id: company.id,
                corporateId})
            };
          }))
        })
        .then(() => this.forceUpdate())
      };
    reader.readAsText(event.target.files[0]);
  }

  // Synchronisation
  synchroniseAll = () => {
    this.props.financialData.getCompanies().forEach((company) => {
      this.fetchDataCompany(company);
    })
    this.props.onUpdate(this.props.financialData);
  }

  async fetchDataCompany(company) {
    await company.fetchData();
    this.props.financialData.updateCompany(company);
    this.props.onUpdate(this.props.financialData);
    this.forceUpdate();
  }

  updateCompany(updatedData) {
    let financialData = this.props.financialData;
    financialData.updateCompany({
      id: updatedData.id,
      corporateId: updatedData.corporateIdInput,
      corporateName: updatedData.corporateNameInput,
      areaCode: updatedData.areaCodeInput,
      corporateActivity: updatedData.corporateActivityInput
    })
    this.props.onUpdate(financialData);
  }

}

/* --------------------------------------------------------- */
/* -------------------- COMPANIES TABLE -------------------- */
/* --------------------------------------------------------- */

class TableCompanies extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      columnSorted: "amount",
      reverseSort: false,
      unfetchedFilter: false,
      page: 0
    }
  }

  render() {
    const companies = this.props.financialData.getCompanies();
    const {columnSorted,page} = this.state;
    this.sortCompanies(companies,columnSorted);
    return (
      <div>
        <table className="table_expenses">
          <thead>
            <tr>
              <td className="column_short-input"
                  onClick={() => this.changeColumnSorted("identifiant")}>Identifiant</td>
              <td className="column_auto"
                  onClick={() => this.changeColumnSorted("denomination")}>Denomination</td>
              <td className="column_areaCode"
                  onClick={() => this.changeColumnSorted("area")}>Pays</td>
              <td className="column_corporateActivity"
                  onClick={() => this.changeColumnSorted("activity")}>Code division</td>
              <td className="column_amount" colSpan={companies.length > 0 ? "2" : "1"}
                  onClick={() => this.changeColumnSorted("amount")}>Montant</td>
              <td className="column_icon" colSpan="1"></td></tr>
          </thead>
          <tbody>
            {
              companies.slice(page*20,(page+1)*20).map((company) => {
                return(<RowTableCompanies 
                          key={"company_"+company.id} 
                          {...company} 
                          onSave={this.updateCompany.bind(this)}
                          onSync={this.syncCompany.bind(this)}/>)
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

  /* ---------- SORTING ---------- */

  changeColumnSorted(columnSorted) {
    if (columnSorted!=this.state.columnSorted) {
      this.setState({columnSorted: columnSorted, reverseSort: false})
    } else {
      this.setState({reverseSort: !this.state.reverseSort});
    }
  }

  sortCompanies(companies,columSorted) {
    switch(columSorted) {
      case "identifiant": companies.sort((a,b) => a.getCorporateId().localeCompare(b.getCorporateId())); break;
      case "denomination": companies.sort((a,b) => a.getCorporateName().localeCompare(b.getCorporateName())); break;
      case "area": companies.sort((a,b) => a.getAreaCode().localeCompare(b.getAreaCode())); break;
      case "activity": companies.sort((a,b) => a.getCorporateActivity().localeCompare(b.getCorporateActivity())); break;
      case "amount": companies.sort((a,b) => b.getAmount() - a.getAmount()); break;
    }
    if (this.state.reverseSort) companies.reverse();
  }

  /* ---------- NAVIGATION ---------- */

  prevPage = () => {
    let currentPage = this.state.page;
    if (currentPage > 0) this.setState({page: currentPage-1})
  }

  nextPage = () => {
    let currentPage = this.state.page;
    if ((currentPage+1)*20 < this.props.financialData.getCompanies().length) {
      this.setState({page: currentPage+1})
    }
  }

  /* ---------- OPERATIONS ON EXPENSE ---------- */
  
  async fetchDataCompany(company) {
    await company.fetchData();
    this.props.financialData.updateCompany(company);
    this.props.onUpdate(this.props.financialData);
    this.forceUpdate();
  }

  updateCompany(updatedData) {
    let financialData = this.props.financialData;
    financialData.updateCompany({
      id: updatedData.id,
      corporateId: updatedData.corporateIdInput,
      corporateName: updatedData.corporateNameInput,
      areaCode: updatedData.areaCodeInput,
      corporateActivity: updatedData.corporateActivityInput
    })
    this.props.onUpdate(financialData);
  }

  syncCompany(companyId) {
    let company = this.props.financialData.getCompany(companyId);
    this.fetchDataCompany(company);
  }

}

class RowTableCompanies extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      corporateIdInput: props.corporateId!=null ? props.corporateId : "",
      corporateNameInput: props.corporateName,
      areaCodeInput: props.areaCode,
      corporateActivityInput: props.corporateActivity};
  }

  componentDidUpdate(prevProps) {
    if (this.props.corporateId != prevProps.corporateId
        || this.props.corporateName != prevProps.corporateName
        || this.props.areaCode != prevProps.areaCode
        || this.props.corporateActivity != prevProps.corporateActivity) {
      this.setState({
        id: this.props.id,
        corporateIdInput: this.props.corporateId,
        corporateNameInput: this.props.corporateName,
        areaCodeInput: this.props.areaCode,
        corporateActivityInput: this.props.corporateActivity});
    }
  }

  render() {
    const {dataFetched,amount} = this.props;
    const {corporateIdInput,corporateNameInput,areaCodeInput,corporateActivityInput} = this.state;
    return (
      <tr>
        <td className={"column_corporateId"+(dataFetched ? " valid" : "")}>
          <input value={corporateIdInput} 
                 onChange={this.onCorporateIdChange} 
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/></td>
        <td className="column_corporateName">
          <input value={corporateNameInput} 
                 onChange={this.onCorporateNameChange} 
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/></td>
        <td className="column_areaCode">
          <select onChange={this.onAreaCodeChange} value={areaCodeInput}>{
            Object.entries(areas)
              .sort()
              .map(([code,libelle]) => { return(
                <option key={code} value={code} /*selected={code==areaCodeInput}*/>{code + " - " +libelle}</option>
                )})
          }</select></td>
        <td className="column_corporateActivity">
          <select onChange={this.onCorporateActivityChange} value={corporateActivityInput.substring(0,2)}>{
            Object.entries(divisions)
              .sort((a,b) => parseInt(a)-parseInt(b))
              .map(([code,libelle]) => { return(
                <option key={code} value={code} /*selected={code==corporateActivityInput.substring(0,2)}*/>{code + " - " +libelle}</option>
                )})
          }</select></td>
        <td className="column_amount">{printValue(amount,0)}</td>
        <td className="column_unit">&nbsp;€</td>
        <td className="column_resync">
          <img className="img" src="/resources/icon_refresh.jpg" alt="refresh" 
               onClick={this.onSyncCompany}/></td>
      </tr>
    )
  }
  
  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onCorporateIdChange = (event) => {
    this.setState({corporateIdInput: event.target.value})
  }
  onCorporateNameChange = (event) => {
    this.setState({corporateNameInput: event.target.value})
  }
  onAreaCodeChange = (event) => {
    let nextProps = this.state;
    nextProps.areaCodeInput = event.target.value;
    this.setState(nextProps);
    this.props.onSave(nextProps);
  }
  onCorporateActivityChange = (event) => {
    let nextProps = this.state;
    nextProps.corporateActivityInput = event.target.value;
    this.setState(nextProps)
    this.props.onSave(nextProps);
  }

  // Props functions
  onBlur = (event) => {
    this.props.onSave(this.state);
  }
  onSyncCompany = (event) => {
    this.props.onSync(this.props.id);
  }

}

function printValue(value,precision) {
  if (value==null) {return "-"}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
}