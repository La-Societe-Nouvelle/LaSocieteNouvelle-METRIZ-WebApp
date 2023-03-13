// La Société Nouvelle

// React
import React from "react";

// Utils
import { printValue, valueOrDefault } from "/src/utils/Utils";

// Libs
import divisions from "/lib/divisions";
import areas from "/lib/areas";
import { Table } from "react-bootstrap";
import Select from "react-select";

/* ---------- COMPANIES TABLE ---------- */

export class UnidentifiedCompaniesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      providers: props.providers,
      significativeCompanies: props.significativeCompanies,
      columnSorted: "amount",
      reverseSort: false,
      page: 0,
      nbItems: props.nbItems,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.companies !== this.props.companies) {
      this.setState({ companies: this.props.companies });
    }
    if (prevProps.nbItems !== this.props.nbItems) {
      this.setState({ nbItems: this.props.nbItems });
    }
    if (
      prevProps.significativeCompanies !== this.props.significativeCompanies
    ) {
      this.setState({
        significativeCompanies: this.props.significativeCompanies,
      });
    }
  }

  render() {
    const { providers, significativeCompanies, columnSorted, page, nbItems } =
      this.state;

    // sort companies
    this.sortCompanies(providers, columnSorted);
    let showedCompanies = providers.slice(page * nbItems, (page + 1) * nbItems);

    return (
      <div className="table-main">
        <Table>
          <thead>
            <tr>
          <td width={50}>

          </td>
              <td onClick={() => this.changeColumnSorted("denomination")}>
                <i className="bi bi-arrow-down-up me-1"></i>Libellé du compte
                fournisseur
              </td>
              <td>Compte fournisseur</td>
              <td
                className="area-column"
                onClick={() => this.changeColumnSorted("area")}
              >
                <i className="bi bi-arrow-down-up me-1"></i>Espace économique
              </td>
              <td
                className="division-column"
                onClick={() => this.changeColumnSorted("activity")}
              >
                <i className="bi bi-arrow-down-up me-1"></i>Secteur d'activité
              </td>
              <td
                className="text-end"
                onClick={() => this.changeColumnSorted("amount")}
              >
                <i className="bi bi-arrow-down-up me-1"></i>Montant
              </td>
            </tr>
          </thead>
          <tbody>
            {showedCompanies.map((company) => (
              <RowTableCompanies
                key={"company_" + company.id}
                {...company}
                isSignificative={significativeCompanies.includes(
                  company.accountNum
                )}
                updateCompany={this.updateCompany.bind(this)}
              />
            ))}
          </tbody>
        </Table>

        {providers.length > nbItems && (
          <div className="table-navigation">
            <button
              className={page == 0 ? "hidden" : "btn btn-primary"}
              onClick={this.prevPage}
            >
              &lsaquo; Page précédente
            </button>
            <div>
              <p>
                {page + 1}/{parseInt(providers.length / nbItems + 1)}
              </p>
            </div>
            <button
              className={
                (page + 1) * nbItems < providers.length
                  ? "btn btn-primary"
                  : "hidden"
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
    if (this.state.page > 0) {
      this.setState({ page: this.state.page - 1 });
    }
  };

  nextPage = () => {
    if (
      (this.state.page + 1) * this.props.nbItems <
      this.props.financialData.companies.length
    ) {
      this.setState({ page: this.state.page + 1 });
    }
  };

  /* ---------- OPERATIONS ON COMPANY ---------- */

  async fetchDataCompany(company) {
    await company.fetchData();
    this.props.financialData.updateCompany(company);
    this.forceUpdate();
  }

  updateCompany = (nextProps) => {
    let provider = this.props.financialData.getCompany(nextProps.id);
    provider.update(nextProps);
    this.props.onUpdate();
    this.setState({ companies: this.props.companies });
  };

  updateCompanyFromRemote = async (companyId) => {
    let provider = this.props.financialData.getCompany(companyId);
    await provider.updateFromRemote();
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
      areaCode: props.state != "" ? props.footprintAreaCode : "FRA",
      activityCode: props.state != "" ? props.footprintActivityCode : "00",
      dataUpdated: props.dataUpdated,
      toggleIcon: false,
      divisionsOptions: [],
      areasOptions: [],
    };

    //Divisions select options
    Object.entries(divisions)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(([value, label]) =>
        this.state.divisionsOptions.push({
          value: value,
          label: value + " - " + label,
        })
      );

    // area select options
    Object.entries(areas)
      .sort()
      .map(([value, label]) =>
        this.state.areasOptions.push({
          value: value,
          label: value + " - " + label,
        })
      );
  }

  componentDidUpdate(prevProps) {
    if (this.props != prevProps) {
      this.setState({
        corporateId: this.props.corporateId || "",
        areaCode: this.props.state != "" ? this.props.footprintAreaCode : "FRA",
        activityCode:
          this.props.state != "" ? this.props.footprintActivityCode : "00",
        dataUpdated: false,
      });
    }
  }

  render() {
    const { corporateName, accountNum, amount, status, dataFetched } = this.props;
    const { areaCode, activityCode, dataUpdated } = this.state;
    let isSignificative = this.props.isSignificative;
    let icon;

 if (status == 200) {
      icon = (
        <i
          className="bi bi-check2 text-success"
          title="Données synchronisées"
        ></i>
      );
    } else {
      icon = <i className="bi bi-arrow-repeat text-success"></i>;
    }

    return (
      <tr>
        <td>
        {icon}
        {isSignificative && activityCode == "00" && (
            <i
              className="ms-1 bi bi-exclamation-triangle text-warning"
              title="Grand risque d'imprécision"
            ></i>
          )}
        </td>
        <td >
          {corporateName}

        </td>
        <td>{accountNum}</td>
        <td>
          <Select
            defaultValue={{
              label: areaCode + " - " + areas[areaCode],
              value: areaCode,
            }}
            placeholder={"Choisissez un espace économique"}
            className={!dataUpdated && status == 200 ? "success" : ""}
            options={this.state.areasOptions}
            onChange={this.onAreaCodeChange}
          />
        </td>
        <td>
          <Select
            defaultValue={{
              label: activityCode + " - " + divisions[activityCode],
              value: activityCode,
            }}
            placeholder={"Choisissez un secteur d'activité"}
            className={!dataUpdated && status == 200 ? "success" : ""}
            options={this.state.divisionsOptions}
            onChange={this.onActivityCodeChange}
          />
        </td>
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

  onAreaCodeChange = (event) => {
    this.setState({ areaCode: event.value, dataUpdated: true });
    this.props.updateCompany({
      id: this.props.id,
      footprintAreaCode: event.value,
    });
  };

  onActivityCodeChange = (event) => {
    this.setState({ activityCode: event.value, dataUpdated: true });
    this.props.updateCompany({
      id: this.props.id,
      footprintActivityCode: event.value,
    });
  };
}
