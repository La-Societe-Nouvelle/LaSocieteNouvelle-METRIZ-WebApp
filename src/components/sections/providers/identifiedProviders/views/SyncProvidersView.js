// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";

// Utils
import { printValue } from "/src/utils/formatters";
import { getIdentifiedProviderStatus, getIdentifiedProviderStatusIcon } from "../utils";

// Modal
import { SyncErrorModal } from "../modals/AlertModal";

// Component
import PaginationComponent from "../../PaginationComponent";
import { sortProviders } from "../../utils";

const SyncProvidersView = ({
  providers,
  financialPeriod,
  updateProviders,
  significativeProviders,
  handleSynchronize,
  showSyncErrorModal,
  closeSyncErrorModal,
  view,
}) => {
  const [state, setState] = useState({
    currentView: view,
    currentPage: 1,
    itemsPerPage: 20,
    sortColumn: "montant",
    sortOrder: "desc",
  });

  const { currentView, currentPage, itemsPerPage, sortColumn, sortOrder } = state;

  useEffect(() => {
    setState((prevState) => ({ ...prevState, currentView: view }));
  }, [view]);

  // Handlers

  const handleViewChange = (e) => {
    setState((prevState) => ({ ...prevState, currentView: e.target.value, currentPage : 1 }));
  };

  const handleItemsPerPageChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      itemsPerPage:
        e.target.value === "all" ? providers.length : parseInt(e.target.value),
    }));
  };

  const handleSort = (column) => {
    if (column === sortColumn) {
      setState((prevState) => ({
        ...prevState,
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        sortColumn: column,
        sortOrder: "asc",
      }));
    }
  };

  const handleSirenProvider = async (e, providerNum) => {
   
    const newSiren = e.target.value.replace(/\s/g,'');
 
    const updatedProviders = providers.map((provider) => {
      if (provider.providerNum === providerNum) {
        provider.update({ corporateId: newSiren });
        return provider;
      }
      return provider;
    });

    await updateProviders(updatedProviders);
  };

  // Filter providers based on the current view

  const filteredProviders = filterProvidersByView(
    currentView,
    significativeProviders,
    providers
  );

  // Sorting for providers
  const sortedProviders = sortProviders(
    filteredProviders,
    sortColumn,
    sortOrder,
    financialPeriod
  );

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);

  // Sync button status
  const isSyncButtonEnable = isSyncButtonEnabled(providers);

  const renderSignificativeOption = hasSignificativeProvidersWithoutSiren(
    providers,
    significativeProviders
  );

  return (
    <div className="box">
      <h4>Synchroniser les données de vos fournisseurs</h4>
      <div className="d-flex py-2 justify-content-between">
        <div className="d-flex align-items-center ">
          <Form.Select
            size="sm"
            onChange={handleViewChange}
            value={currentView}
            className="me-3"
          >
            <option key="1" value="all">
              Tous les comptes externes
            </option>
            <option key="2" value="notDefined">
              Comptes sans numéro SIREN
            </option>
            <option key="3" value="unsync">
              Comptes non synchronisés
            </option>
            <option key="4" value="error">
              Numéros de siren incorrects
            </option>
            <option key="5" value="significative">
              Comptes significatifs
            </option>
            <option key="6" value="significativeUnidentified" disabled={!renderSignificativeOption}>
              Comptes significatifs non identifiés
            </option>
          </Form.Select>

          <Form.Select
            size="sm"
            onChange={handleItemsPerPageChange}
            value={itemsPerPage}
            disabled={providers.length < 20}
          >
            <option key="1" value="20">
              20 fournisseurs par page
            </option>
            <option key="2" value="50">
              50 fournisseurs par page
            </option>
            <option key="3" value="all">
              Tous
            </option>
          </Form.Select>
        </div>

        <Button
          onClick={handleSynchronize}
          className="btn btn-secondary"
          disabled={!isSyncButtonEnable}
        >
          <i className="bi bi-arrow-repeat"></i> Synchroniser les données
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th width={10}></th>
            <th className="siren">Siren</th>
            <th onClick={() => handleSort("libelle")}>
              <i className="bi bi-arrow-down-up me-1"></i>
              Libellé du compte fournisseur
            </th>
            <th>Compte fournisseur</th>

            <th className="text-end" onClick={() => handleSort("montant")}>
              <i className="bi bi-arrow-down-up me-1"></i>
              Montant
            </th>
          </tr>
        </thead>
        <tbody>
        
          {sortedProviders.length === 0 ? (
            <tr>
              <td colSpan="5">Aucun compte</td>
            </tr>
          ) : (
            sortedProviders
              .slice(startIndex, endIndex)
              .map((provider, index) => (
                <tr key={index}>
                  <td>
                    <i
                      className={
                        getIdentifiedProviderStatusIcon(provider).className
                      }
                      title={getIdentifiedProviderStatusIcon(provider).title}
                    ></i>
                  </td>
                  <td className="siren-input">
                    <Form.Control
                      type="text"
                      value={provider.corporateId || ""}
                      className={getIdentifiedProviderStatus(provider)}
                      onChange={(e) =>
                        handleSirenProvider(e, provider.providerNum)
                      }
                    />
                  </td>
                  <td>{provider.providerLib}</td>
                  <td>{provider.providerNum}</td>
                  <td className="text-end">
                    {printValue(
                      provider.periodsData[financialPeriod.periodKey].amount,
                      0
                    )}{" "}
                    &euro;
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </Table>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(newPage) =>
          setState((prevState) => ({ ...prevState, currentPage: newPage }))
        }
      />

      <SyncErrorModal
        showModal={showSyncErrorModal}
        onClose={closeSyncErrorModal}
        changeView={() =>
          setState((prevState) => ({ ...prevState, currentView: "error" }))
        }
      />
    </div>
  );
};

function filterProvidersByView(currentView, significativeProviders, providers) {
  const filterConfig = {
    notDefined: (provider) =>
      provider.corporateId === null ||
      !/^[0-9]{9}$/.test(provider.corporateId) ||
      (provider.footprintStatus === 0 &&
        /^[0-9]{9}$/.test(provider.corporateId)),
    unsync: (provider) => provider.footprintStatus !== 200,
    error: (provider) => provider.footprintStatus === 404,
    significative: (provider) =>
      significativeProviders.includes(provider.providerNum),
    significativeUnidentified: (provider) =>
      (significativeProviders.includes(provider.providerNum) &&
        provider.useDefaultFootprint &&
        provider.corporateId === null) ||
      !/^[0-9]{9}$/.test(provider.corporateId) ||
      (provider.footprintStatus === 0 &&
        /^[0-9]{9}$/.test(provider.corporateId)),
  };

  return filterConfig[currentView]
    ? providers.filter(filterConfig[currentView])
    : providers;
}

function isSyncButtonEnabled(providers) {
  return providers.some(
    (provider) =>
      (!provider.useDefaultFootprint &&
        (provider.footprintStatus !== 200 ||
          !provider.footprint.isValid())) ||
      provider.footprintStatus === 203
  );
}

function hasSignificativeProvidersWithoutSiren(
  providers,
  significativeProviders
) {
  return providers.some(
    (provider) =>
      provider.corporateId === null &&
      significativeProviders.includes(provider.providerNum)
  );
}

export default SyncProvidersView;
