// La Société Nouvelle

// React
import React from "react";

// Utils
import { InputText } from "/components/input/InputText";
import { printValue, valueOrDefault } from "/src/utils/Utils";
import { Table } from "react-bootstrap";

/* ---------- COMPANIES TABLE ---------- */

export class IdentifiedCompaniesTable extends React.Component {
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
        <Table>
          <thead>
            <tr>
              <td width={10}></td>
              <td
                onClick={() => this.changeColumnSorted("identifiant")}
                className="siren"
              >
              <i className="bi bi-arrow-down-up me-1"></i>
                Siren
              </td>
              <td onClick={() => this.changeColumnSorted("denomination")}>
              <i className="bi bi-arrow-down-up me-1"></i>
                Libellé du compte fournisseur
              </td>
              <td>Compte fournisseur</td>

              <td
                className="text-end"
                onClick={() => this.changeColumnSorted("amount")}
              >
              <i className="bi bi-arrow-down-up me-1"></i>
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
        </Table>
        {companies.length == 0 && (
          <p
            className="small
        "
          >
            Aucun résultat
          </p>
        )}
        {companies.length > nbItems && (
          <div className="table-navigation">
            <button
              className={page == 0 ? "hidden" : "btn btn-primary"}
              onClick={this.prevPage}
            >
             &lsaquo; Page précédente
            </button>
            <div>
              <p>
                {page + 1}/{parseInt(companies.length / nbItems + 1)}
              </p>
            </div>
            <button
              className={
                (page + 1) * nbItems < companies.length ? "btn btn-primary" : "hidden"
              }
              onClick={this.nextPage}
            >
              Page suivante &rsaquo;

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
        dataUpdated: false,
      });
    }
  }

  render() {
    const { corporateName, accountNum, amount, status, isDefaultAccount } = this.props;
    const { corporateId } = this.state;
    let icon;
    if (corporateId && status != 200) {
      icon = (
        <i className="bi bi-arrow-repeat text-success" title="Données prêtes à être synchronisées"></i>

      );
    }

    if (status == 200) {
      icon = (
        <i className="bi bi-check2 text-success" title="Données synchronisées"></i>

      );
    }
    if (status == 404) {
      icon = (
        <i className="bi bi-x-lg text-danger"  title="Erreur lors de la synchronisation"></i>

      );
    }
    if (!corporateId && !isDefaultAccount) {
      icon = (
        <i className="bi bi-exclamation-circle text-info"  title="Donnée manquante"></i>
      );
    }

    return (
      <tr>
       <td>
       {icon}
        </td> 
        <td className="siren-input">
          <InputText
              value={corporateId}
              onUpdate={this.updateCorporateId.bind(this)}
            />
        </td>
        <td>{corporateName}</td>
        <td>{accountNum}</td>
        <td className="text-end">{printValue(amount, 0)} &euro;</td>
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
