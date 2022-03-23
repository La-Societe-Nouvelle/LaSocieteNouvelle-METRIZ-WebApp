// La Société Nouvelle

// React
import React from "react";

// Utils
import { InputText } from "/components/InputText";
import { printValue, valueOrDefault } from "/src/utils/Utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCheckCircle ,faSyncAlt, faWarning, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";

/* ---------- COMPANIES TABLE ---------- */

export class CorporateIdTable extends React.Component {
  constructor(props) {

    super(props);
    this.state = {
      companies: props.companies,
      columnSorted: "amount",
      reverseSort: false,
      page: 0,
    };

  }
  componentDidUpdate(prevProps) {

    if (prevProps.companies !== this.props.companies) {
      this.setState({ companies: this.props.companies });
    }
  }

  render() {
    const { nbItems } = this.props;
    const { companies, columnSorted, page } = this.state;
    this.sortCompanies(companies, columnSorted);
    return (
      
      <div className="table-main" id="table">
        <table className="table w100">
          <thead>
            <tr>
              <td
                onClick={() => this.changeColumnSorted("identifiant")}
                className="siren"
              >
                Siren
              </td>
              <td
                onClick={() => this.changeColumnSorted("denomination")}
              >
                Libellé du compte fournisseur
              </td>
              <td className="company">
                Compte fournisseur
              </td>

              <td className="align-right"
                onClick={() => this.changeColumnSorted("amount")}
              >
                Montant
              </td>
            </tr>
          </thead>
          <tbody>
          
            {companies
              .slice(page * nbItems, (page + 1) * nbItems)
              .map((company) => (
                <RowTableCompanies
                  key={"company_" + company.id}
                  {...company}
                  updateCompany={this.updateCompany.bind(this)}
                />
              ))}
          </tbody>
        </table>
        {
      companies.length == 0 && (
        <p className="small-text
        ">
          Aucun résultat
        </p>
      )
      
    }
        {companies.length > nbItems && (
          <div className="table-navigation">
            <button
              className={page == 0 ? "hidden" : ""}
              onClick={this.prevPage}
            >
              Page précédente
            </button>
            <div>
              <p>
                {page + 1}/{parseInt(companies.length / nbItems + 1)}
              </p>
            </div>
            <button
              className={
                (page + 1) * nbItems < companies.length ? "" : "hidden"
              }
              onClick={this.nextPage}
            >
              Page suivante
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ---------- SORTING ---------- */

  changeColumnSorted(columnSorted) {
    if (columnSorted != this.state.columnSorted) {
      this.setState({ columnSorted: columnSorted, reverseSort: false });
    } else {
      this.setState({ reverseSort: !this.state.reverseSort });
    }
  }

  sortCompanies(companies, columSorted) {
    switch (columSorted) {
      case "identifiant":
        companies.sort((a, b) =>
          valueOrDefault(a.corporateId, "").localeCompare(
            valueOrDefault(b.corporateId, "")
          )
        );
        break;
      case "denomination":
        companies.sort((a, b) =>
          a.getCorporateName().localeCompare(b.getCorporateName())
        );
        break;

      case "amount":
        companies.sort((a, b) => b.amount - a.amount);
        break;
    }
    if (this.state.reverseSort) companies.reverse();
  }

  /* ---------- NAVIGATION ---------- */

  prevPage = () => {
    if (this.state.page > 0) this.setState({ page: this.state.page - 1 });
  };
  nextPage = () => {
    if (
      (this.state.page + 1) * this.props.nbItems <
      this.props.financialData.companies.length
    )
      this.setState({ page: this.state.page + 1 });
  };

  /* ---------- OPERATIONS ON COMPANY ---------- */

  updateCompany = (nextProps) => {
    let company = this.props.financialData.getCompany(nextProps.id);
    company.update(nextProps);
    this.props.checkSync(nextProps);
    this.setState({ companies: this.props.companies });
  };

  updateCompanyFromRemote = async (companyId) => {
    let company = this.props.financialData.getCompany(companyId);
    await company.updateFromRemote();
    this.props.onUpdate();
    this.setState({ companies: this.props.companies });
  };
}

/* ----- COMPANY ROW ----- */

class RowTableCompanies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      corporateId: props.corporateId || "",
      dataUpdated: props.dataUpdated,
      toggleIcon: false,
    };
  }

  componentDidUpdate(prevProps) {

    if (this.props != prevProps) {
      this.setState({
        corporateId: this.props.corporateId || "",
        dataUpdated: false
            });
    }
  }

  render() {
    const {
      corporateName,
      account,
      amount,
      status,
    } = this.props;
    const { corporateId} = this.state;
    let icon;
    if (corporateId && status != 200) {
      icon = <p className="success">
        <FontAwesomeIcon icon={faSyncAlt} title="Données prêtes à être synchronisées" />
      </p>
    }

    if (status == 200) {
      icon = <p className="success">
        <FontAwesomeIcon icon={faCheckCircle} title="Données synchronisées" /> </p>

    }
    if (status == 404) {
      icon = <p className="error">
        <FontAwesomeIcon icon={faXmarkCircle} title="Erreur lors la synchronisation" /> </p>

    }
    if (!corporateId) {
      icon = <p className="warning"><FontAwesomeIcon icon={faWarning} title="Données non synchronisables" /></p>
    }
   
    return (
      <tr >
        <td className="siren-input">
          {icon}
          <p  className={status==200 ? "success" : "warning"} >
            <InputText
              value={corporateId}
              onUpdate={this.updateCorporateId.bind(this)}
            />
          </p>

        </td>
        <td>
          {corporateName}
        </td>
        <td>
          {account}
        </td>
        <td className="align-right">{printValue(amount, 0)} &euro;</td>
      </tr>
    );
  }

  updateCorporateId = (nextCorporateId) => {
    this.setState({ dataUpdated: true});
    this.props.updateCompany({
      id: this.props.id,
      corporateId: nextCorporateId,
    });
  };



}
