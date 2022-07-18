// La Société Nouvelle

// React
import React from "react";

// Utils
import { printValue, valueOrDefault } from "/src/utils/Utils";

// Libs
import divisions from "/lib/divisions";
import areas from "/lib/areas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSyncAlt,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { Table } from "react-bootstrap";
import Select from "react-select";

/* ---------- COMPANIES TABLE ---------- */

export class CompaniesTable extends React.Component {
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
      <div className="table-main">
        <Table>
          <thead>
            <tr>
              <td onClick={() => this.changeColumnSorted("denomination")}>
                Libellé du compte fournisseur
              </td>
              <td>Compte fournisseur</td>
              <td className="area-column" onClick={() => this.changeColumnSorted("area")}>
                Espace économique
              </td>
              <td
                className="division-column"
                onClick={() => this.changeColumnSorted("activity")}
              >
                Secteur d'activité
              </td>
              <td
                className="text-end"
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
        </Table>

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

  async fetchDataCompany(company) {
    await company.fetchData();
    this.props.financialData.updateCompany(company);
    this.forceUpdate();
  }

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
      areaCode:
        props.state != ""
          ? props.state == "siren"
            ? props.legalUnitAreaCode
            : props.footprintAreaCode
          : "FRA",
      activityCode:
        props.state != ""
          ? props.state == "siren"
            ? props.legalUnitActivityCode
            : props.footprintActivityCode
          : "00",

      dataUpdated: props.dataUpdated,
      toggleIcon: false,
      divisionsOptions: [],
      areasOptions: [],
    };

    //Divisions select options
    Object.entries(divisions)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(([value, label]) =>
        this.state.divisionsOptions.push({ value: value, label: value + " - " + label })
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
        areaCode:
          this.props.state != ""
            ? this.props.state == "siren"
              ? this.props.legalUnitAreaCode
              : this.props.footprintAreaCode
            : "FRA",
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
      status,
    } = this.props;
    const { areaCode, activityCode, dataUpdated } = this.state;

    let icon;

    if (activityCode == "00") {
      icon = (
        <p className="warning">
          <i className="bi bi-exclamation-triangle"  title="Risque de données incomplètes"></i>
        
        </p>
      );
    } else {
      if (status == 200) {
        icon = (
          <p className="success">
            <i class="bi bi-check2"  title="Données synchronisées"></i>
          
          </p>
        );
      } else {
        icon = (
          <p className="success">
            <FontAwesomeIcon
              icon={faSyncAlt}
              title="Données prêtes à être synchronisées"
            />
          </p>
        );
      }
    }
    return (
      <tr>
        <td className="corporate-name">
          {icon}
          <p>{corporateName}</p>
        </td>
        <td>{account}</td>
        <td>
          <Select
            defaultValue={{
              label: areaCode + " - " + areas[areaCode],
              value: areaCode,
            }}
            placeholder={"Choisissez un espace économique"}
            className={!dataUpdated && status == 200 ? "valid" : ""}
            options={this.state.areasOptions}
            onChange={this.onAreaCodeChange}
          />
        </td>

        <td className={activityCode == "00" ? "warning" : ""}>
          <Select
            defaultValue={{
              label: activityCode + " - " + divisions[activityCode],
              value: activityCode,
            }}
            placeholder={"Choisissez un secteur d'activité"}
            className={!dataUpdated && status == 200 ? "valid" : ""}
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
    console.log(event.value);
    this.setState({ activityCode: event.value, dataUpdated: true });
    this.props.updateCompany({
      id: this.props.id,
      footprintActivityCode: event.value,
    });
  };
}
