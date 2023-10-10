// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";

// Components
import ProvidersTable from "./ProvidersTable";
import PaginationComponent from "../PaginationComponent";

//Utils
import { getSignificativeUnidentifiedProviders } from "./utils";
import { SyncSuccessModal, SyncWarningModal } from "./UserInfoModal";

const UnidentifiedProviders = ({
  financialData,
  financialPeriod,
  minFpt,
  maxFpt,
  prevStep,
  submit,
  synchronizeProviders,
  sessionDidUpdate
}) => {
  // State management

  const [providers, setProviders] = useState(
    financialData.providers.filter(
      (provider) =>
        provider.useDefaultFootprint &&
        provider.periodsData.hasOwnProperty(financialPeriod.periodKey)
    )
  );

  const [significativeProviders, setSignificativeProviders] = useState([]);
  const [showSyncSuccessModal, setShowSyncSuccessModal] = useState(false);
  const [showSyncWarningModal, setShowWarningModal] = useState(false);
  const [filteredProviders, setFilteredProviders] = useState(providers);
  const [isNextStepAvailable, setIsNextStepAvailable] = useState(false);

  const [state, setState] = useState({
    currentView: "all",
    currentPage: 1,
    itemsPerPage: 20,
  });

  const { currentView, currentPage, itemsPerPage } = state;


  // Fetch data and check if providers are synchronized
  useEffect(() => {
    const fetchData = async () => {
      const significativeProviders =
        await getSignificativeUnidentifiedProviders(
          financialData.providers,
          minFpt,
          maxFpt,
          financialPeriod
        );

      setSignificativeProviders(significativeProviders);
    };
    fetchData();

    const isProvidersSync = !providers.some(
      (provider) =>
        provider.footprintStatus !== 200 || !provider.footprint.isValid()
    );

    setIsNextStepAvailable(isProvidersSync);
  }, []);

  // Filter providers based on the current view
  useEffect(() => {
    const filteredProviders = filterProvidersByView(
      currentView,
      providers,
      significativeProviders
    );
    setFilteredProviders(filteredProviders);
  }, [currentView]);

  // Event handlers
  const handleViewChange = (e) => {
    setState((prevState) => ({ ...prevState, currentView: e.target.value }));
  };

  const handleItemsPerPageChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      itemsPerPage:
        e.target.value === "all" ? providers.length : parseInt(e.target.value),
    }));
  };

  const handleConfirmNextStep = async () => {
    const haswarnings = providers.some(
      (provider) =>
        significativeProviders.includes(provider.providerNum) &&
        provider.defaultFootprintParams.code == "00"
    );

    haswarnings ? setShowWarningModal(true) : submit();
  };

  const handleSynchronize = async () => {

    setShowWarningModal(false);

    const providersToSynchronise = providers.filter(
      (provider) =>
        provider.useDefaultFootprint &&
        (provider.footprintStatus !== 200 || !provider.footprint.isValid())
    );

    await synchronizeProviders(providersToSynchronise);

    const updatedSignificativeProviders =
      await getSignificativeUnidentifiedProviders(
        financialData.providers,
        minFpt,
        maxFpt,
        financialPeriod
      );

    const stepAvailable = !providersToSynchronise.some(
      (provider) => provider.footprintStatus !== 200
    );
    setIsNextStepAvailable(stepAvailable);
    setShowSyncSuccessModal(stepAvailable);
    setSignificativeProviders(updatedSignificativeProviders);
  };

  // Update Providers
  const setProviderDefaultFootprintParams = (providerNum, paramName, paramValue) => {

    // Disable next step to force user to re-synchronize
    setIsNextStepAvailable(false);

    const updatedProviders = providers.map((provider) => {
      if (provider.providerNum === providerNum) {
        const updatedParams = {
          ...provider.defaultFootprintParams,
          [paramName]: paramValue,
        };
        provider.update({ defaultFootprintParams: updatedParams });
        return provider;
      }
      return provider;
    });
    setProviders(updatedProviders);

    sessionDidUpdate();
  };

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);

  // Sync button status
  const isSyncButtonEnable = isSyncButtonEnabled(providers);

  // Options
  const renderSignificativeOption = hasSignificativeProvidersWithoutActivity(providers, significativeProviders);

  return (
    <section className="step">
      <div className="section-title mb-3">
        <h2 className="mb-3">Etape 3 - Traitement des fournisseurs</h2>
        <h3 className=" mb-4 ">
          Synchronisation des données grâce au secteur d'activité
        </h3>
      </div>
      <div className="d-flex py-2 justify-content-between">
        <div className="d-flex align-items-center ">
          <Form.Select
            size="sm"
            onChange={handleViewChange}
            value={currentView}
            className="me-3"
          >
            <option key="1" value="">
              Tous les comptes (sans siren)
            </option>
            <option key="2" value="aux">
              Comptes fournisseurs uniquement
            </option>
            <option key="3" value="expenses">
              Autres comptes tiers
            </option>
            <option key="4" value="significative">
              Comptes significatifs
            </option>
            <option key="5" value="defaultActivity">
              Comptes tiers non rattachés à un secteur d'activité
            </option>
              <option key="6" value="significativeWithoutActivity" disabled={!renderSignificativeOption}>
                Comptes significatifs non rattachés à un secteur d'activité
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
      <ProvidersTable
        providers={filteredProviders}
        significativeProviders={significativeProviders}
        financialPeriod={financialPeriod}
        startIndex={startIndex}
        endIndex={endIndex}
        setProviderDefaultFootprintParams={setProviderDefaultFootprintParams}
      />

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(newPage) =>
          setState((prevState) => ({ ...prevState, currentPage: newPage }))
        }
      />
      {/* User Messages ---------------------------------------------------------*/}

      <SyncSuccessModal
        showModal={showSyncSuccessModal}
        onClose={() => setShowSyncSuccessModal(false)}
      />

      <SyncWarningModal
        showModal={showSyncWarningModal}
        onClose={() => setShowWarningModal(false)}
        onSubmit={() => submit()}
      />

      {/* Actions ---------------------------------------------------------*/}
      <div className="d-flex justify-content-end ">
        <div>
          <button
            className="btn btn-primary me-2"
            id="validation-button"
            onClick={() => prevStep()}
          >
            <i className="bi bi-chevron-left"></i>
            Retour aux fournisseurs
          </button>
          <button
            className="btn btn-secondary me-3"
            onClick={handleConfirmNextStep}
            disabled={!isNextStepAvailable}
          >
            Mesurer mon impact <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

function filterProvidersByView(currentView, providers, significativeProviders) {
  let filteredProviders = providers.slice(); // Create a copy of the providers array

  switch (currentView) {
    case "aux": // provider account
      filteredProviders = filteredProviders.filter(
        (provider) => !provider.isDefaultProviderAccount
      );
      break;
    case "expenses": // default provider account
      filteredProviders = filteredProviders.filter(
        (provider) => provider.isDefaultProviderAccount
      );
      break;
    case "significative": // significative provider
      filteredProviders = filteredProviders.filter((provider) =>
        significativeProviders.includes(provider.providerNum)
      );
      break;
    case "significativeWithoutActivity": // significative provider & no activity code set
      filteredProviders = filteredProviders.filter(
        (provider) =>
          significativeProviders.includes(provider.providerNum) &&
          provider.defaultFootprintParams.code === "00"
      );
      break;
    case "defaultActivity": // no activity code set
      filteredProviders = filteredProviders.filter(
        (provider) => provider.defaultFootprintParams.code === "00"
      );
      break;
    default: // default
      break;
  }

  return filteredProviders;
}
function isSyncButtonEnabled(providers) {
  return providers.some(
    (provider) =>
      (provider.useDefaultFootprint &&
        (provider.footprintStatus !== 200 ||
          !provider.footprint.isValid())) ||
      provider.footprintStatus === 203
  );
}
function hasSignificativeProvidersWithoutActivity(providers, significativeProviders) {
  return providers.some(
    (provider) =>
      provider.defaultFootprintParams.code === "00" &&
      significativeProviders.includes(provider.providerNum)
  );
}


export default UnidentifiedProviders;
