import React from 'react';

import { CSVFileReader, processCSVCompaniesData } from '../../src/readers/CSVReader';
import { XLSXFileReader } from '../../src/readers/XLSXReader';

import { divisions } from '../../lib/nace'; 
import { areas } from '../../lib/area'; 
import { InputText } from '../InputText';

import { printValue } from '../../src/utils/Utils';

/* ------------------------------------------------------- */
/* -------------------- COMPANIES TAB -------------------- */
/* ------------------------------------------------------- */

export class CompaniesTab extends React.Component {

  constructor(props) {
    super(props)
  }

  render() 
  {
    const companies = this.props.financialData.getCompanies();

    return(
      <div className="financial-tab-view-inner">
        <div className="group">
          <h3>Liste des fournisseurs</h3>

          <div className="actions">
            <button onClick={() => document.getElementById('import-companies').click()}>Importer un fichier CSV</button>
            <input id="import-companies" type="file" accept=".csv" onChange={this.importCSVFile} visibility="collapse"/>
            <button onClick={() => document.getElementById('import-companies-xlsx').click()}>Importer un fichier XLSX</button>
            <input id="import-companies-xlsx" type="file" accept=".xlsx" onChange={this.importXLSXFile} visibility="collapse"/>
            <button onClick={() => location.href="/classeurTiers.xlsx"}>Télécharger modèle XLSX</button>
            <button onClick={this.synchroniseAll}>Synchroniser les données</button>
          </div>

          {companies.length > 0 &&
            <TableCompanies companies={companies} {...this.props}/>
          }

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
              await this.props.financialData.updateCompany({
                id: company.id,
                corporateId})
            };
          return;}))
        })
        .then(() => {this.forceUpdate()})
      };
    reader.readAsText(event.target.files[0]);
  }

  // Import XLSX File
  importXLSXFile = (event) => {
    let reader = new FileReader();
    reader.onload = async () => {
      XLSXFileReader(reader.result)
        .then(async data => {
          await Promise.all(data.map(async ({identifiant,denomination}) => {
            let company = this.props.financialData.getCompanyByName(denomination);
            if (company!=undefined) {
              await this.props.financialData.updateCompany({
                id: company.id,
                corporateId: identifiant})
            };
          return;}))
        })
        .then(() => {this.forceUpdate()})
      };
    reader.readAsArrayBuffer(event.target.files[0]);
  }

  // Synchronisation
  synchroniseAll = async () => {
    await Promise.all(this.props.financialData.companies.map(async (company) => {
      await company.updateFootprintFromRemote();
      return;
    }));
    this.props.onUpdate();
    this.forceUpdate();
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

  render() 
  {
    const {companies} = this.props;
    const {columnSorted,page} = this.state;

    this.sortCompanies(companies,columnSorted);

    return (
      <div>
        <table className="table_expenses">
          <thead>
            <tr>
              <td className="short"
                  onClick={() => this.changeColumnSorted("identifiant")}>Identifiant</td>
              <td className="auto"
                  onClick={() => this.changeColumnSorted("denomination")}>Denomination</td>
              <td className="medium"
                  onClick={() => this.changeColumnSorted("area")}>Espace économique</td>
              <td className="medium"
                  onClick={() => this.changeColumnSorted("activity")}>Activité asssociée</td>
              <td className="short" colSpan={companies.length > 0 ? "2" : "1"}
                  onClick={() => this.changeColumnSorted("amount")}>Montant</td>
              <td className="column_icon" colSpan="1"></td></tr>
          </thead>
          <tbody>
            {
              companies.slice(page*20,(page+1)*20).map((company) => {
                return(<RowTableCompanies 
                          key={"company_"+company.id} 
                          {...company} 
                          onUpdate={this.updateCompany.bind(this)}
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
      case "identifiant": companies.sort((a,b) => a.id.localeCompare(b.id)); break;
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

  async updateCompany(nextProps) {
    await this.props.financialData.updateCompany(nextProps)
    this.props.onUpdate();
    this.forceUpdate();
  }

  async syncCompany(companyId) {
    let company = this.props.financialData.getCompany(companyId);
    await company.updateFromRemote();
    this.forceUpdate();
  }

}

class RowTableCompanies extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      corporateId: props.corporateId!=null ? props.corporateId : "",
      corporateName: props.corporateName,
      areaCode: props.footprintAreaCode,
      activityCode: props.footprintActivityCode,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.corporateId != prevProps.corporateId
        || this.props.corporateName != prevProps.corporateName
        || this.props.footprintAreaCode != prevProps.footprintAreaCode
        || this.props.footprintActivityCode != prevProps.footprintActivityCode) {
      this.setState({
        corporateId: this.props.corporateId,
        corporateName: this.props.corporateName,
        areaCode: this.props.footprintAreaCode,
        activityCode: this.props.footprintActivityCode,
      });
    }
  }

  render() 
  {
    const {amount,dataFetched,legalUnitAreaCode,legalUnitActivityCode} = this.props;
    const {corporateId,corporateName,areaCode,activityCode} = this.state;

    return (
      <tr>
        <td className={"column_corporateId"+(dataFetched === true ? " valid" : "")}>
          <InputText value={corporateId} onUpdate={this.updateCorporateId.bind(this)}/></td>
        <td className="auto">
          <InputText value={corporateName} onUpdate={this.updateCorporateName.bind(this)}/></td>
        <td className={"medium"+(dataFetched === false ? " valid" : "")}>
          <select onChange={this.onAreaCodeChange} value={areaCode}>{
            Object.entries(areas)
              .sort()
              .map(([code,libelle]) => { return(
                <option className={(legalUnitAreaCode && code==legalUnitAreaCode) ? "default-option" : ""} key={code} value={code}>{code + " - " +libelle}</option>
                )})
          }</select></td>
        <td className={"medium"+(dataFetched === false ? " valid" : "")}>
          <select onChange={this.onActivityCodeChange} value={activityCode.substring(0,2)}>{
            Object.entries(divisions)
              .sort((a,b) => parseInt(a)-parseInt(b))
              .map(([code,libelle]) => { return(
                <option className={(legalUnitActivityCode && code==legalUnitActivityCode.substring(0,2)) ? "default-option" : ""} key={code} value={code}>{code + " - " +libelle}</option>
                )})
          }</select></td>
        <td className="short right">{printValue(amount,0)}</td>
        <td className="column_unit">&nbsp;€</td>
        <td className="column_resync">
          <img className="img" src="/resources/icon_refresh.jpg" alt="refresh" 
               onClick={this.onSyncCompany}/></td>
      </tr>
    )
  }

  updateCorporateId = (nextCorporateId) => this.props.onUpdate({id: this.props.id, corporateId: nextCorporateId})
  updateCorporateName = (nextCorporateName) => this.props.onUpdate({id: this.props.id, corporateName: nextCorporateName})

  onAreaCodeChange = (event) => {
    this.setState({areaCode: event.target.value})
    this.props.onUpdate({id: this.props.id, footprintAreaCode: event.target.value});
  }
  onActivityCodeChange = (event) => {
    this.setState({activityCode: event.target.value})
    this.props.onUpdate({id: this.props.id, footprintActivityCode: event.target.value});
  }

  onSyncCompany = (event) => {
    this.props.onSync(this.props.id);
  }

}