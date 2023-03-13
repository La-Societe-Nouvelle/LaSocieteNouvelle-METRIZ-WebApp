// La Société Nouvelle

// React
import React from "react";

// Utils
import { InputText } from "/components/input/InputText";
import { printValue, valueOrDefault } from "/src/utils/Utils";
import { Table } from "react-bootstrap";

/* ---------- PROVIDERS TABLE ---------- */

export class IdentifiedProvidersTable extends React.Component 
{
  constructor(props) 
  {
    super(props);
    this.state = {
      providers: props.providers,
      columnSorted: "amount",
      reverseSort: false,
      page: 0,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.providers !== this.props.providers) {
      this.setState({ providers: this.props.providers });
    }
  }

  render() 
  {
    const { nbItems, financialPeriod } = this.props;
    const { providers, columnSorted, page } = this.state;
    this.sortProviders(providers, financialPeriod, columnSorted);
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
            {providers
              .slice(page * nbItems, (page + 1) * nbItems)
              .map((provider) => (
                <RowTableProviders
                  key={"provider_" + provider.id}
                  {...provider}
                  financialPeriod={financialPeriod}
                  updateProvider={this.updateProvider.bind(this)}
                />
              ))}
          </tbody>
        </Table>
        {providers.length == 0 && (
          <p
            className="small
        "
          >
            Aucun résultat
          </p>
        )}
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
                (page + 1) * nbItems < providers.length ? "btn btn-primary" : "hidden"
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
          a.getCorporateName().localeCompare(b.getCorporateName())
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
    if (this.state.page > 0) this.setState({ page: this.state.page - 1 });
  };
  nextPage = () => {
    if (
      (this.state.page + 1) * this.props.nbItems <
      this.props.financialData.providers.length
    )
      this.setState({ page: this.state.page + 1 });
  };

  /* ---------- OPERATIONS ON PROVIDER ---------- */

  updateProvider = (nextProps) => {
    let provider = this.props.financialData.getCompany(nextProps.id);
    provider.update(nextProps);
    this.props.checkSync(nextProps);
    this.setState({ providers: this.props.providers });
  };

  updateProviderFromRemote = async (providerNum) => {
    let provider = this.props.financialData.getCompany(providerNum);
    await provider.updateFromRemote();
    this.props.onUpdate();
    this.setState({ providers: this.props.providers });
  };
}

/* ----- PROVIDER ROW ----- */

class RowTableProviders extends React.Component 
{
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
    const { corporateName, accountNum, periodsData, status, isDefaultAccount, financialPeriod } = this.props;
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
        <td className="text-end">{printValue(periodsData[financialPeriod.periodKey].amount, 0)} &euro;</td>
      </tr>
    );
  }

  updateCorporateId = (nextCorporateId) => {
    this.setState({ dataUpdated: true });
    this.props.updateProvider({
      id: this.props.id,
      corporateId: nextCorporateId,
    });
  };
}
