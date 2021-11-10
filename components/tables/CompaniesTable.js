// La Société Nouvelle

// React
import React from 'react';

// Utils
import { InputText } from '/components/InputText';
import { printValue, valueOrDefault } from '/src/utils/Utils';

// Libs
import divisions from '/lib/divisions'; 
import areas from '/lib/areas'; 

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
    if (this.props !== prevProps) this.setState({companies: this.props.companies})
  }

  render() 
  {
    const {amounts,nbItems} = this.props;
    const {companies,columnSorted,page} = this.state;

    companies.forEach(company => company.amount = amounts[company.account] || 0);
    this.sortCompanies(companies,columnSorted);

    return (
      <div className="table-main">
        <table className="table">
          <thead>
            <tr>
              <td className="short" 
                  onClick={() => this.changeColumnSorted("identifiant")}>Siren</td>
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
            {companies.slice(page*nbItems,(page+1)*nbItems)
                            .map((company) => 
              <RowTableCompanies key={"company_"+company.id} 
                                 {...company}
                                 updateCompany={this.updateCompany.bind(this)}
                                 syncCompany={this.updateCompanyFromRemote.bind(this)}/>)}
          </tbody>
        </table>

        {companies.length > nbItems &&
          <div className="table-navigation">
            <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
            <div><p>{page+1}/{parseInt(companies.length/nbItems+1)}</p></div>
            <button className={(page+1)*nbItems < companies.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
          </div>}
        
      </div>
    )
  }

  /* ---------- SORTING ---------- */

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
      case "denomination": companies.sort((a,b) => a.getCorporateName().localeCompare(b.getCorporateName())); break;
      case "area": companies.sort((a,b) => a.getAreaCode().localeCompare(b.getAreaCode())); break;
      case "activity": companies.sort((a,b) => a.getCorporateActivity().localeCompare(b.getCorporateActivity())); break;
      case "amount": companies.sort((a,b) => b.amount - a.amount); break;
    }
    if (this.state.reverseSort) companies.reverse();
  }

  /* ---------- NAVIGATION ---------- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*nbItems < this.props.financialData.companies.length) this.setState({page: this.state.page+1})}

  /* ---------- OPERATIONS ON COMPANY ---------- */
  
  async fetchDataCompany(company) 
  {
    await company.fetchData();
    this.props.financialData.updateCompany(company);
    this.forceUpdate();
  }

  updateCompany = (nextProps) => 
  {
    let company = this.props.financialData.getCompany(nextProps.id);
    company.update(nextProps);
    this.props.onUpdate();
    this.setState({companies: this.props.companies});
  }

  updateCompanyFromRemote = async (companyId) =>
  {
    let company = this.props.financialData.getCompany(companyId);
    await company.updateFromRemote();
    this.props.onUpdate();
    this.setState({companies: this.props.companies});
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
      areaCode: props.state!="" ? (props.state=="siren" ? props.legalUnitAreaCode : props.footprintAreaCode) : "WLD",
      activityCode: props.state!="" ? (props.state=="siren" ? props.legalUnitActivityCode : props.footprintActivityCode) : "00",

      dataUpdated: props.dataUpdated,
      toggleIcon: false
    };
  }

  componentDidUpdate(prevProps)
  {
    if (this.props!=prevProps) {
      this.setState(
        {
        corporateId: this.props.corporateId || "",
        areaCode: this.props.state!="" ? (this.props.state=="siren" ? this.props.legalUnitAreaCode : this.props.footprintAreaCode) : "WLD",
        activityCode: this.props.state!="" ? (this.props.state=="siren" ? this.props.legalUnitActivityCode : this.props.footprintActivityCode) : "00",
        dataUpdated: false
      })
    }
  }

  render() 
  {
    const {corporateName,amount,legalUnitAreaCode,legalUnitActivityCode,state,status} = this.props;
    const {corporateId,areaCode,activityCode} = this.state;
    const {dataUpdated,toggleIcon} = this.state;

    return (
      <tr>
        <td className="short">
          <InputText value={corporateId}
                     valid={!dataUpdated && state=="siren" && status==200}
                     unvalid={!dataUpdated && state=="siren" && status==404}
                     onUpdate={this.updateCorporateId.bind(this)}/></td>

        <td className="auto">
          <InputText value={corporateName} 
                     onUpdate={this.updateCorporateName.bind(this)}/></td>

        <td className="medium">
          <select className={(!dataUpdated && state=="default" && status==200) ? " valid" : ""}
                  value={areaCode || "WLD"}
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
          <select className={(!dataUpdated && state=="default" && status==200) ? " valid" : ""}
                  value={activityCode.substring(0,2) || "00"}
                  onChange={this.onActivityCodeChange}>
            {Object.entries(divisions).sort((a,b) => parseInt(a)-parseInt(b))
                                      .map(([code,libelle]) => 
              <option className={(legalUnitActivityCode && code==legalUnitActivityCode.substring(0,2)) ? "default-option" : ""} 
                      key={code} 
                      value={code}>
                {code + " - " +libelle}
              </option>)}
          </select></td>

        <td className="short right">{printValue(amount,0)}</td>
        <td className="column_unit">&nbsp;€</td>
        <td className="column_icon">
          <img className={"img" + (toggleIcon ? " active" : "")} src="/resources/icon_refresh.jpg" alt="refresh" 
               onClick={this.syncCompany}/></td>
      </tr>
    )
  }

  updateCorporateId = (nextCorporateId) => 
  {
    this.setState({dataUpdated: true})
    this.props.updateCompany({id: this.props.id, corporateId: nextCorporateId})
  }
  
  updateCorporateName = (nextCorporateName) => 
  {
    this.props.updateCompany({id: this.props.id, corporateName: nextCorporateName})
  }

  onAreaCodeChange = (event) => 
  {
    this.setState({areaCode: event.target.value, dataUpdated: true})
    this.props.updateCompany({id: this.props.id, footprintAreaCode: event.target.value})
  }
  onActivityCodeChange = (event) => 
  {
    this.setState({activityCode: event.target.value, dataUpdated: true})
    this.props.updateCompany({id: this.props.id, footprintActivityCode: event.target.value})
  }

  syncCompany = async () => 
  {
    this.setState({toggleIcon: true})
    await this.props.syncCompany(this.props.id)
    this.setState({toggleIcon: false})
  }

}