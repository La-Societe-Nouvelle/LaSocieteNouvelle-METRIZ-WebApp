// La Société Nouvelle

// React
import React from "react";

// Utils
import { InputText } from "/components/InputText";
import { printValue, valueOrDefault } from "/src/utils/Utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckCircle, faSync,faWarning} from "@fortawesome/free-solid-svg-icons";

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
    if (this.props !== prevProps)
      this.setState({ companies: this.props.companies, page: 0 });
  }

  render() {
    const { nbItems } = this.props;
    const { companies, columnSorted, page } = this.state;

    this.sortCompanies(companies, columnSorted);

    return (
      <div className="table-main">
        <table className="table">
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
              <td
                              className="company"
              >
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
    this.props.onUpdate();
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
        dataUpdated: false,
      });
    }
  }

  render() {
    const {
      corporateName,
      account,
      amount,
    } = this.props;
    const { corporateId} = this.state;

    return (
      <tr className={!corporateId ? "warning" : "success" }>
        <td className="siren-input">
          <p>
          {
            corporateId 
            ?         
            <FontAwesomeIcon icon={faCheckCircle} title="Prêt à être synchronisé" />
            :
            <FontAwesomeIcon icon={faWarning} title="Ce fournisseur ne sera pas synchronisé" />

          }
          </p>
          <p  >
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
    this.setState({ dataUpdated: true });
    this.props.updateCompany({
      id: this.props.id,
      corporateId: nextCorporateId,
    });
  };



}
