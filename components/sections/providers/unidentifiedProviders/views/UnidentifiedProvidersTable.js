// La Société Nouvelle

// React
import React from "react";
import { Table } from "react-bootstrap";

// Utils
import { valueOrDefault } from "/src/utils/Utils";

// Components
import {RowTableProviders} from "./RowTableProviders"


/* ---------- Pr TABLE ---------- */

export class UnidentifiedProvidersTable extends React.Component {
  constructor(props) {
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

  componentDidUpdate(prevProps) {
    if (prevProps.providers !== this.props.providers) {
      this.setState({ providers: this.props.providers });
    }
    if (prevProps.nbItems !== this.props.nbItems) {
      this.setState({ nbItems: this.props.nbItems, page: 0 });
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
    const { providers, significativeProviders, columnSorted, page, nbItems } =
      this.state;
    const period = this.props.financialPeriod;

    // sort providers
    this.sortProviders(providers, columnSorted);
    const showedProviders = providers.slice(
      page * nbItems,
      (page + 1) * nbItems
    );

    return (
      <div className="table-main">
        <Table>
          <thead>
            <tr>
              <td width={50}></td>
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
                period={period}
                refreshTable={this.refreshTable}
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
        providers.sort((a, b) => a.providerLib.localeCompare(b.providerLib));
        break;
      case "amount":
        providers.sort(
          (a, b) =>
            b.periodsData[period.periodKey].amount -
            a.periodsData[period.periodKey].amount
        );
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
      this.props.providers.length
    ) {
      this.setState({ page: this.state.page + 1 });
    }
  };

  refreshTable = () => this.props.refreshSection();
}
