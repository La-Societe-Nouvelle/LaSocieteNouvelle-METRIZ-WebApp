// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Button, Container, Form } from "react-bootstrap";

// Components
import ProvidersTable from "./ProvidersTable";
import PaginationComponent from "../PaginationComponent";

//Utils
import { getSignificativeUnidentifiedProviders } from "./utils";
import { SyncSuccessModal, SyncWarningModal } from "./UserInfoModal";

const UnidentifiedProviders = (props) => {

  const financialData = props.financialData;
  const financialPeriod = props.financialPeriod;
  const minFpt = props.minFpt;
  const maxFpt = props.maxFpt;

  const [significativeProviders, setSignificativeProviders] = useState([]);
  const [showSyncSuccessModal, setShowSyncSuccessModal] = useState(false);
  const [showSyncWarningModal, setShowWarningModal] = useState(false);

  const [providers, setProviders] = useState(
    financialData.providers.filter(
      (provider) =>
        provider.useDefaultFootprint &&
        provider.periodsData.hasOwnProperty(financialPeriod.periodKey)
    )
  );
  
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showedProviders, setShowedProviders] = useState(providers);
  const [isNextStepAvailable, setIsNextStepAvailable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState("all");

  const hasSignificativeProvidersWithoutActivity = providers.some(
    (provider) =>
      provider.defaultFootprintParams.code === "00" &&
      significativeProviders.includes(provider.providerNum)
  );

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
  }, []);

  useEffect(() => {
    const showedProviders = getShowedProviders(view);
    setShowedProviders(showedProviders);
  }, [view]);

  const getShowedProviders = (view) => {
    let filteredProviders = providers;
    switch (view) {
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
  };

  const updateProviderParams = (providerNum, paramName, paramValue) => {
    
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
  };

  const handleConfirmNextStep = async () => {

    const haswarnings = providers.some(
      (provider) =>
        significativeProviders.includes(provider.providerNum) &&
        provider.defaultFootprintParams.code == "00"
    );

    haswarnings
      ? setShowWarningModal(true)
      : props.submit();
  };

  const handleSynchronize = async () => { 

    setShowWarningModal(false);
    const providersToSynchronise = providers.filter(
      (provider) =>
        provider.useDefaultFootprint && provider.footprintStatus !== 200
    );

    await props.synchronizeProviders(providersToSynchronise);

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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(showedProviders.length / itemsPerPage);

  const isSyncButtonEnable = providers.some(
    (provider) =>
      (provider.useDefaultFootprint && provider.footprintStatus !== 200) ||
      provider.footprintStatus === 203
  );

  return (
    <Container fluid id="sector-section">
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
              onChange={(e) => setView(e.target.value)}
              value={view}
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
              {hasSignificativeProvidersWithoutActivity && (
                <option key="6" value="significativeWithoutActivity">
                  Comptes significatifs non rattachés à un secteur d'activité
                </option>
              )}
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
        <ProvidersTable
          providers={showedProviders}
          significativeProviders={significativeProviders}
          financialPeriod={financialPeriod}
          startIndex={startIndex}
          endIndex={endIndex}
          updateProviderParams={updateProviderParams}
        />

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        {/* User Messages ---------------------------------------------------------*/}

        <SyncSuccessModal
          showModal={showSyncSuccessModal}
          onClose={() => setShowSyncSuccessModal(false)}
          nextStep={props.nextStep}
        />

        
        <SyncWarningModal
          showModal={showSyncWarningModal}
          onClose={() => setShowWarningModal(false)}
          onSubmit={() => props.submit()}
        />

        {/* Actions ---------------------------------------------------------*/}
        <div className="d-flex justify-content-end ">
          <div>
            <button
              className="btn btn-primary me-2"
              id="validation-button"
              onClick={() => props.prevStep()}
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
    </Container>
  );
};

export default UnidentifiedProviders;
