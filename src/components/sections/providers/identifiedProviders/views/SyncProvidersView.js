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

const SyncProvidersView = ({
  providers,
  financialPeriod,
  updateProviders,
  significativeProviders,
  handleSynchronize,
  showSyncErrorModal,
  closeSyncErrorModal,
  view
}) => {

  const [currentView, setCurrentView] = useState(view);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  useEffect(() => {
    setCurrentView(view);
  }, [view]);

  // Filtered Providers
  const getShowedProviders = (currentView) => {
    let filteredProviders = providers;
  
    switch (currentView) {
      case "notDefined":
        filteredProviders = filteredProviders.filter((provider) => {      
          return (
            (provider.corporateId === null || !/^[0-9]{9}$/.test(provider.corporateId)) ||
            (provider.footprintStatus === 0 && /^[0-9]{9}$/.test(provider.corporateId))
          );
        });
  
        break;
      case "unsync":
        filteredProviders = filteredProviders.filter(
          (provider) => provider.footprintStatus !== 200
        );
        break;
      case "error":
        // TO DO : Improve condition 
        filteredProviders = filteredProviders.filter(
          (provider) => provider.footprintStatus === 404 || !/^[0-9]{9}$/.test(provider.corporateId)
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
  const showedProviders = getShowedProviders(currentView);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(showedProviders.length / itemsPerPage);


  const handleSirenProvider = async (e, providerNum) => {
    const newSiren = e.target.value;
    console.log(newSiren)
    const updatedProviders = providers.map((provider) => {
      if (provider.providerNum === providerNum) {
        provider.update({ corporateId: newSiren });
        return provider;
      }
      return provider;
    });

    await updateProviders(updatedProviders);
  };



  const isSyncButtonEnable = providers.some(
    (provider) =>
      (!provider.useDefaultFootprint && (provider.footprintStatus !== 200 || !provider.footprint.isValid())) ||
      provider.footprintStatus === 203
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  
  return (
    <div className="box" >
      <h4>Synchroniser les données de vos fournisseurs</h4>

      <div className="d-flex py-2 justify-content-between">
        <div className="d-flex align-items-center ">
          <Form.Select
            size="sm"
            onChange={(e) => setCurrentView(e.target.value)}
            value={currentView}
            className="me-3"
          >
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

          <Form.Select
            size="sm"
            onChange={(e) =>
              setItemsPerPage(
                e.target.value === "all"
                  ? providers.length
                  : parseInt(e.target.value)
              )
            }
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
                 <i className={ getIdentifiedProviderStatusIcon(provider).className}
                  title={ getIdentifiedProviderStatusIcon(provider).title}></i>
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
            ))}
        </tbody>
      </Table>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <SyncErrorModal
        showModal={showSyncErrorModal}
        onClose={closeSyncErrorModal}
        changeView={() => setCurrentView("error")}
      />
    </div>
  );
};

export default SyncProvidersView;
