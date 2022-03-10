// La Société Nouvelle

// React
import React from "react";

// Utils
import { InputText } from "/components/InputText";
import { printValue, valueOrDefault } from "/src/utils/Utils";

/* ---------- COMPANIES TABLE ---------- */

export class DefaultCompaniesTable extends React.Component {
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
              >
                Siren
              </td>
              <td
                onClick={() => this.changeColumnSorted("denomination")}
              >
                Libellé du compte fournisseur
              </td>
             <td>
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
      //case "area": companies.sort((a,b) => a.footprintAreaCode.localeCompare(b.footprintAreaCode)); break;
      //case "activity": companies.sort((a,b) => a.footprintActivityCode.localeCompare(b.footprintActivityCode)); break;
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



  
}

/* ----- COMPANY ROW ----- */

class RowTableCompanies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      corporateId: props.corporateId || "",
      areaCode:
        props.state != ""
          ? props.state == "siren"
            ? props.legalUnitAreaCode
            : props.footprintAreaCode
          : "WLD",
      activityCode:
        props.state != ""
          ? props.state == "siren"
            ? props.legalUnitActivityCode
            : props.footprintActivityCode
          : "00",

      dataUpdated: props.dataUpdated,
      toggleIcon: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props != prevProps) {
      this.setState({
        corporateId: this.props.corporateId || "",
        areaCode:
          this.props.state != ""
            ? this.props.state == "siren"
              ? this.props.legalUnitAreaCode
              : this.props.footprintAreaCode
            : "WLD",
        activityCode:
          this.props.state != ""
            ? this.props.state == "siren"
              ? this.props.legalUnitActivityCode
              : this.props.footprintActivityCode
            : "00",
        dataUpdated: false,
      });
    }
  }

  render() {
    const {
      corporateName,
      account,
      amount,
      state,
      status,
    } = this.props;
    const { corporateId } = this.state;
    const { dataUpdated } = this.state;

    return (
      <tr>
        <td>
          {corporateId}
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

}
