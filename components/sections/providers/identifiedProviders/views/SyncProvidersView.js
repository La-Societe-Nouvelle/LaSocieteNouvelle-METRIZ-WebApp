// La Société Nouvelle

// React
import React, { useState } from "react";
import { Button, Form, Pagination, Table } from "react-bootstrap";

// Utils
import { printValue } from "../../../../../src/utils/Utils";

// Modal
import { SyncErrorModal } from "../modals/AlertModal";

const SyncProvidersView = ({
  providers,
  financialPeriod,
  updateProviders,
  significativeProviders,
  synchroniseProviders,
  showSyncErrorModal,
  closeSyncErrorModal,
}) => {

  const [view, setView] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);


  // Filtered Providers
  const getShowedProviders = (view) => {
    let filteredProviders = providers;

    switch (view) {
      case "notDefined":
        filteredProviders = filteredProviders.filter(
          (provider) => !provider.corporateId
        );
        break;
      case "unsync":
        filteredProviders = filteredProviders.filter(
          (provider) => provider.footprintStatus !== 200
        );
        break;
      case "error":
        filteredProviders = filteredProviders.filter(
          (provider) => provider.footprintStatus === 404
        );
        break;
      case "significative":
        filteredProviders = filteredProviders.filter((provider) =>
          significativeProviders.includes(provider.providerNum)
        );
        break;
      case "significativeUnidentified":
        filteredProviders = filteredProviders.filter(
          (provider) =>
            significativeProviders.includes(provider.providerNum) &&
            provider.useDefaultFootprint
        );
        break;
      default:
        break;
    }

    return filteredProviders;
  };
  const showedProviders = getShowedProviders(view);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(showedProviders.length / itemsPerPage);

  const handleChangeView = (e) => {
    const view = e.target.value;
    setView(view);
  };

  const handleSirenProvider = async (e, providerNum) => {
    const newSiren = e.target.value;
    const updatedProviders = providers.map((provider) => {
      if (provider.providerNum === providerNum) {
        provider.update({ corporateId: newSiren });
        return provider;
      }
      return provider;
    });

    updateProviders(updatedProviders);
  };

  const handleChangeItemsPerPage = (e) => {
    let newItemsPerPage;
    if (e.target.value == "all") {
      newItemsPerPage = providers.length;
    } else {
      newItemsPerPage = parseInt(e.target.value);
    }

    setItemsPerPage(newItemsPerPage);
  };

  const isSyncButtonEnable = providers.some(
    (provider) =>
      (!provider.useDefaultFootprint && provider.footprintStatus !== 200) ||
      provider.footprintStatus === 203
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  return (
    <div className="step">
      <h4>3. Synchroniser les données de vos fournisseurs</h4>

      <SyncErrorModal
        showModal={showSyncErrorModal}
        onClose={closeSyncErrorModal}
        changeView={() => setView("error")}
      />

      <div className="text-end my-3">
        <Button
          onClick={() => synchroniseProviders()}
          className="btn btn-secondary"
          disabled={!isSyncButtonEnable}
        >
          <i className="bi bi-arrow-repeat"></i> Synchroniser les données
        </Button>
      </div>
      <div className="d-flex py-2 justify-content-end">
        <div className="d-flex align-items-center me-2 ">
          <Form.Select size="sm" onChange={handleChangeView} value={view}>
            <option key="1" value="all">
              Tous les comptes externes
            </option>
            <option key="2" value="notDefined">
              Comptes sans numéro de siren
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
            <option key="6" value="significativeUnidentified">
              Comptes significatifs non identifiés
            </option>
          </Form.Select>
        </div>
        <div className="d-flex align-items-center">
          <label></label>
          <Form.Select
            size="sm"
            onChange={handleChangeItemsPerPage}
            value={itemsPerPage}
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
      </div>
      <Table>
        <thead>
          <tr>
            <th width={10}></th>
            <th className="siren">Siren</th>
            <th>
              <i className="bi bi-arrow-down-up me-1"></i>
              Libellé du compte fournisseur
            </th>
            <th>Compte fournisseur</th>

            <th className="text-end">
              <i className="bi bi-arrow-down-up me-1"></i>
              Montant
            </th>
          </tr>
        </thead>
        <tbody>
          {showedProviders
            .slice(startIndex, endIndex)
            .map((provider, index) => (
              <tr key={index}>
                <td>
                  {provider.corporateId && !provider.footprintStatus && (
                    <i
                      className="bi bi-arrow-repeat text-success"
                      title="Données prêtes à être synchronisées"
                    ></i>
                  )}
                  {provider.corporateId && provider.footprintStatus === 200 && (
                    <i
                      className="bi bi-check2 text-success"
                      title="Données synchronisées"
                    ></i>
                  )}
                  {provider.corporateId && provider.footprintStatus === 404 && (
                    <i
                      className="bi bi-x-lg text-danger"
                      title="Erreur lors de la synchronisation"
                    ></i>
                  )}
                  {!provider.corporateId &&
                    !provider.isDefaultProviderAccount && (
                      <i
                        className="bi bi-exclamation-circle text-info"
                        title="Donnée manquante"
                      ></i>
                    )}
                </td>
                <td className="siren-input">
                  <Form.Control
                    type="text"
                    value={provider.corporateId || ""}
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
            ))}
        </tbody>
      </Table>

      <Pagination size="sm" className="justify-content-end">
        {Array.from({ length: totalPages }, (_, index) => (
          <Pagination.Item
            key={index}
            onClick={() => handlePageChange(index + 1)}
            active={currentPage === index + 1}
          >
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
};

export default SyncProvidersView;
