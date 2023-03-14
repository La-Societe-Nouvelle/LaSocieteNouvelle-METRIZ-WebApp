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

const divisionsOptions = Object.entries(divisions)
  .sort((a,b) => parseInt(a)-parseInt(b))
  .map(([value, label]) => {return({ value: value, label: value + " - " + label })});
const areasOptions = Object.entries(areas)
  .sort()
  .map(([value, label]) => {return({value: value, label: value + " - " + label })});

export class UnidentifiedCompaniesTable extends React.Component 
{
  constructor(props) 
  {
    super(props);
    this.state = {
      providers: props.providers,
      significativeProviders: props.significativeProviders,
      columnSorted: "amount",
      reverseSort: false,
      page: 0,
      nbItems: props.nbItems,
    };
  }

  componentDidUpdate(prevProps) 
  {
    if (prevProps.providers !== this.props.providers) {
      this.setState({ providers: this.props.providers });
    }
    if (prevProps.nbItems !== this.props.nbItems) {
      this.setState({ nbItems: this.props.nbItems });
    }
    if (
      prevProps.significativeProviders !== this.props.significativeProviders
    ) {
      this.setState({
        significativeProviders: this.props.significativeProviders,
      });
    }
  }

  render() {
    const { providers, significativeProviders, columnSorted, page, nbItems } = this.state;
    const financialPeriod = this.props.financialPeriod;

    // sort providers
    this.sortProviders(providers, columnSorted);
    let showedProviders = providers.slice(page * nbItems, (page + 1) * nbItems);

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
            {showedProviders.map((provider) => (
              <RowTableProviders
                key={"company_" + provider.providerNum}
                provider={provider}
                isSignificative={significativeProviders.includes(
                  provider.providerNum
                )}
                updateProvider={this.updateProvider.bind(this)}
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

  sortProviders(providers, period, columSorted) {
    switch (columSorted) {
      case "identifiant":
        providers.sort((a, b) =>
          valueOrDefault(a.corporateId, "").localeCompare(
            valueOrDefault(b.corporateId, "")
          )
        );
        break;
      case "denomination":
        providers.sort((a, b) =>
          a.providerLib.localeCompare(b.providerLib)
        );
        break;
      case "amount":
        providers.sort((a, b) => b.periodsData[period.periodKey].amount - a.periodsData[period.periodKey].amount);
        break;
    }
    if (this.state.reverseSort) providers.reverse();
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
      this.props.financialData.providers.length
    ) {
      this.setState({ page: this.state.page + 1 });
    }
  };

  /* ---------- OPERATIONS ON COMPANY ---------- */

  async fetchDataProvider(provider) {
    await provider.fetchData();
    this.props.financialData.updateCompany(provider);
    this.forceUpdate();
  }

  updateProvider = (nextProps) => {
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

class RowTableProviders extends React.Component 
{
  constructor(props) 
  {
    super(props);
    this.state = {
      activityCode: props.provider.defaultFootprintParams.code || "00",
      areaCode: props.provider.defaultFootprintParams.area || "FRA",
      dataUpdated: props.dataUpdated,
      toggleIcon: false,
    };
  }

  componentDidUpdate(prevProps)
  {
    if (this.props != prevProps) {
      this.setState({
        areaCode: this.props.provider.defaultFootprintParams.area || "FRA",
        activityCode: this.props.provider.defaultFootprintParams.code || "00",
        dataUpdated: false,
      });
    }
  }

  render() 
  {
    const { providerNum, providerLib, periodsData, status, dataFetched } = this.props.provider;
    const period = this.props.period;
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
          {providerLib}
        </td>
        <td>{providerNum}</td>
        <td>
          <Select
            defaultValue={{
              label: areaCode + " - " + areas[areaCode],
              value: areaCode,
            }}
            placeholder={"Choisissez un espace économique"}
            className={!dataUpdated && status == 200 ? "success" : ""}
            options={areasOptions}
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
            options={divisionsOptions}
            onChange={this.onActivityCodeChange}
          />
        </td>
        <td className="text-end">{printValue(periodsData[period.periodKey].amount, 0)} &euro;</td>
      </tr>
    );
  }

  onAreaCodeChange = (event) => {
    //this.setState({ areaCode: event.value, dataUpdated: true });
    let provider = this.props.provider;
    provider.defaultFootprintParams.area = event.value;
    provider.dataFetched = false;
  };

  onActivityCodeChange = (event) => {
    //this.setState({ activityCode: event.value, dataUpdated: true });
    let provider = this.props.provider;
    provider.defaultFootprintParams.code = event.value;
    provider.dataFetched = false;
  };
}
