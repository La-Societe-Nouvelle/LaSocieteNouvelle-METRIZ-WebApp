// La Société Nouvelle

// React
import React from 'react';

// Utils
import { InputText } from '/components/InputText';
import { printValue, valueOrDefault } from '/src/utils/Utils';

// Libs
import { divisions } from '/lib/nace'; 
import { areas } from '/lib/area'; 

/* ---------- COMPANIES TABLE ---------- */

export class CompaniesTable extends React.Component {
  
  constructor(props) 
  {
    super(props);
    this.state = 
    {
      companies: props.companies,
      columnSorted: "amount",
      reverseSort: false,
      page: 0
    }
  }

  componentDidUpdate(prevProps) 
  {
    if (this.props != prevProps) this.setState({companies: this.props.companies})
  }

  render() 
  {
    const {amounts} = this.props;
    const {companies,columnSorted,page} = this.state;

    companies.forEach(company => company.amount = amounts[company.account] || 0);
    this.sortCompanies(companies,columnSorted);

    return (
      <div className="table-container">
        <table className="table">
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
            {companies.slice(page*20,(page+1)*20)
                      .map((company) => 
              <RowTableCompanies key={"company_"+company.id} 
                                 {...company}
                                 updateCompany={this.updateCompany.bind(this)}
                                 syncCompany={this.syncCompany.bind(this)}/>)}
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

  changeColumnSorted(columnSorted) 
  {
    if (columnSorted!=this.state.columnSorted) {
      this.setState({columnSorted: columnSorted, reverseSort: false})
    } else {
      this.setState({reverseSort: !this.state.reverseSort});
    }
  }

  sortCompanies(companies,columSorted) 
  {
    switch(columSorted) 
    {
      case "identifiant": companies.sort((a,b) => valueOrDefault(a.corporateId,"").localeCompare(valueOrDefault(b.corporateId,""))); break;
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
    if ((currentPage+1)*20 < this.props.financialData.companies.length) {
      this.setState({page: currentPage+1})
    }
  }

  /* ---------- OPERATIONS ON EXPENSE ---------- */
  
  async fetchDataCompany(company) {
    await company.fetchData();
    this.props.financialData.updateCompany(company);
    this.forceUpdate();
  }

  updateCompany = async (nextProps) => 
  {
    await this.props.financialData.updateCompany(nextProps);
    this.setState({companies: this.props.financialData.companies});
  }

  async syncCompany(companyId) 
  {
    let company = this.props.financialData.getCompany(companyId);
    await company.updateFromRemote();
    this.setState({companies: this.props.financialData.companies});
  }

}

/* ----- COMPANY ROW ----- */

class RowTableCompanies extends React.Component {
  
  constructor(props) 
  {
    super(props);
    this.state = 
    {
      corporateId: props.corporateId || "",
      corporateName: props.corporateName,
      footprintAreaCode: props.footprintAreaCode,
      footprintActivityCode: props.footprintActivityCode,
      dataFetched: props.dataFetched,

      toggleIcon: false
    };
  }

  componentDidUpdate(prevProps)
  {
    if (this.props!=prevProps) {
      this.setState({
        corporateId: this.props.corporateId || "",
        corporateName: this.props.corporateName,
        footprintAreaCode: this.props.footprintAreaCode,
        footprintActivityCode: this.props.footprintActivityCode,
        dataFetched: this.props.dataFetched
      })
    }
  }

  render() 
  {
    const {amount,legalUnitAreaCode,legalUnitActivityCode,dataFetched} = this.props;
    const {corporateId,corporateName,footprintAreaCode,footprintActivityCode} = this.state;
    const {toggleIcon} = this.state;

    return (
      <tr>
        <td className="short">
          <InputText value={corporateId}
                     valid={dataFetched === true}
                     onUpdate={this.updateCorporateId.bind(this)}/></td>

        <td className="auto">
          <InputText value={corporateName} 
                     onUpdate={this.updateCorporateName.bind(this)}/></td>

        <td className="medium">
          <select className={dataFetched === false ? " valid" : ""}
                  value={footprintAreaCode}
                  onChange={this.onAreaCodeChange}>
          {Object.entries(areas).sort()
                                .map(([code,libelle]) => 
            <option className={(legalUnitAreaCode && code==legalUnitAreaCode) ? "default-option" : ""} 
                    key={code} 
                    value={code}>
              {code + " - " +libelle}
            </option>)}
          </select></td>

        <td className="medium">
          <select className={dataFetched === false ? " valid" : ""}
                  value={footprintActivityCode.substring(0,2)}
                  onChange={this.onActivityCodeChange}>
            {Object.entries(divisions).sort((a,b) => parseInt(a)-parseInt(b))
                                      .map(([code,libelle]) => 
              <option className={(legalUnitActivityCode && code==legalUnitActivityCode.substring(0,2)) ? "default-option" : ""} key={code} value={code}>{code + " - " +libelle}</option>)}
          </select></td>

        <td className="short right">{printValue(amount,0)}</td>
        <td className="column_unit">&nbsp;€</td>
        <td className="column_icon">
          <img className={"img" + (toggleIcon ? " active" : "")} src="/resources/icon_refresh.jpg" alt="refresh" 
               onClick={this.syncCompany}/></td>
      </tr>
    )
  }

  updateCorporateId = (nextCorporateId) => {
    this.setState({dataFetched: null})
    this.props.updateCompany({id: this.props.id, corporateId: nextCorporateId})
  }
  
  updateCorporateName = (nextCorporateName) => {
    this.props.updateCompany({id: this.props.id, corporateName: nextCorporateName})
  }

  onAreaCodeChange = (event) => {
    this.setState({footprintAreaCode: event.target.value, dataFetched: null})
    this.props.updateCompany({id: this.props.id, footprintAreaCode: event.target.value})
  }
  onActivityCodeChange = (event) => {
    this.setState({footprintActivityCode: event.target.value, dataFetched: null})
    this.props.updateCompany({id: this.props.id, footprintActivityCode: event.target.value})
  }

  syncCompany = async () => {
    this.setState({toggleIcon: true})
    await this.props.syncCompany(this.props.id)
    this.setState({toggleIcon: false})
  }

}