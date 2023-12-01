// La Société Nouvelle

// React
import React, { useState, useEffect, useRef } from "react";
import { Image } from "react-bootstrap";

// Views
import ImportProvidersView from "./views/ImportProvidersView";
import InvoicesProvidersView from "./views/InvoicesProvidersView";
import SyncProvidersView from "./views/SyncProvidersView";

// Utils
import { getSignificativeProviders } from "./utils";

// Modals
import { SyncSuccessModal } from "./modals/AlertModal";

const IdentifiedProviders = (props) => {
  const [significativeProviders, setSignificativeProviders] = useState([]);
  const [showSyncErrorModal, setShowSyncErrorModal] = useState(false);
  const [showSyncSuccessModal, setShowSyncSuccessModal] = useState(false);
  const [currentView, setCurrentView] = useState("all");
  const scrollTargetRef = useRef(null);
  const financialData = props.financialData;
  const financialPeriod = props.financialPeriod;
  const minFpt = props.minFpt;
  const maxFpt = props.maxFpt;

  const [providers, setProviders] = useState(
    financialData.providers.filter((provider) =>
      provider.periodsData.hasOwnProperty(financialPeriod.periodKey)
    )
  );

  useEffect(() => {
    const fetchData = async () => {
      let significativeProviders = await getSignificativeProviders(
        providers,
        minFpt,
        maxFpt,
        financialPeriod
      );
      setSignificativeProviders(significativeProviders);
    };

    fetchData();
  }, [providers]);

  const updateProviders = (updatedProviders) => {
    financialData.providers = updatedProviders;
    setProviders(updatedProviders);
    props.sessionDidUpdate();
  };

  const handleSynchronize = async () => {
    let providersToSynchronise = providers.filter(
      (provider) =>
        !provider.useDefaultFootprint &&
        (provider.footprintStatus !== 200 || !provider.footprint.isValid())
    );
    await props.synchronizeProviders(providersToSynchronise);

    const updatedSignificativeProviders = await getSignificativeProviders(
      financialData.providers,
      minFpt,
      maxFpt,
      financialPeriod
    );

    const hasSyncError = providersToSynchronise.some(
      (provider) => provider.footprintStatus === 404
    );

    setShowSyncErrorModal(hasSyncError);
    setShowSyncSuccessModal(!hasSyncError);
    setSignificativeProviders(updatedSignificativeProviders);
    setCurrentView("all");

    if (scrollTargetRef.current) {
      window.scrollTo({
        top: scrollTargetRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  };

  const handleChangeView = (updatedView) => {
    setCurrentView(updatedView);
    setShowSyncSuccessModal(false);
  };

  // Check if all providers have their footprint data synchronized
  const allProvidersIdentified = providers.every(
    (provider) =>
      provider.footprintStatus === 200 && provider.footprint.isValid()
  );

  // Check if all providers with SIREN number have been synchronized
  const nbSirenSynchronised = providers.filter(
    (provider) =>
      !provider.useDefaultFootprint &&
      provider.footprintStatus === 200 &&
      provider.footprint.isValid()
  ).length;
  const nbSiren = providers.filter(
    (provider) => !provider.useDefaultFootprint
  ).length;

  const isNextStepAvailable = nbSirenSynchronised === nbSiren;

  return (
    <section className="step">
      <h2 className="mb-3">Etape 3 - Traitement des fournisseurs</h2>
      <h3 className=" my-4">
        Synchronisation des données grâce au numéro SIREN
      </h3>

      <div className="alert-info">
        <div className="info-icon">
          <Image src="/info-circle.svg" alt="icon info" />
        </div>
        <div className="ms-2">
          <p>
          La mesure de l'empreinte des consommations s'effectue à partir des empreintes de la production des fournisseurs, 
          accessibles via leur numéro SIREN. 
          Lors de la lecture du FEC, les dépenses ont été groupées par compte fournisseur auxiliaire. 
          En l'absence de compte auxiliaire au sein de de l'écriture comptable, la dépense est rattachée à un compte auxiliaire par défaut lié au compte de charges.
          </p>
         <p className="mt-1">Pour établir la correspondance entre les
            numéros de compte auxiliaire dans vos écritures comptables et les
            numéros de SIREN, vous avez trois options : <br></br>
          </p>
          <ul className="small mb-0 mt-1 ms-1 p-1">
            <li>
              <strong>Importer </strong> les numéros SIREN de vos fournisseurs
              via un fichier au format Excel ou CSV
            </li>
            <li>
              <strong>Associer </strong> les comptes fournisseurs à partir des
              factures
            </li>
            <li>
              <strong>Compléter </strong> manuellement le tableau
            </li>
          </ul>
        </div>
      </div>

      {/* Views --------------------------------------------------------- */}
      <div className="d-flex align-items-stretch justify-content-between">
        <ImportProvidersView
          providers={providers}
          updateProviders={updateProviders}
          handleSynchronize={handleSynchronize}
        />

        <InvoicesProvidersView
          providers={providers}
          externalExpenses={financialData.externalExpenses}
          updateProviders={updateProviders}
        />
      </div>
      <div ref={scrollTargetRef}>

        <SyncProvidersView
          providers={providers}
          significativeProviders={significativeProviders}
          financialPeriod={financialPeriod}
          updateProviders={updateProviders}
          handleSynchronize={handleSynchronize}
          showSyncErrorModal={showSyncErrorModal}
          closeSyncErrorModal={() => setShowSyncErrorModal(false)}
          view={currentView}
        />
      </div>
      {/* Modals --------------------------------------------------------- */}
      <SyncSuccessModal
        showModal={showSyncSuccessModal}
        onClose={() => setShowSyncSuccessModal(false)}
        isAllProvidersIdentified={allProvidersIdentified}
        nextStep={allProvidersIdentified ? props.submit : props.nextStep}
        changeView={handleChangeView}
      />

      {/* Actions ---------------------------------------------------------*/}
      <div className="text-end">
        {allProvidersIdentified ? (
          <div>
            <button
              className="btn btn-primary me-3"
              onClick={() => props.nextStep()}
            >
              Secteur d'activité <i className="bi bi-chevron-right"></i>
            </button>
            <button
              className="btn btn-secondary me-3"
              onClick={() => props.submit()}
            >
              Mesurer mon impact <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        ) : (
          <button
            className="btn btn-secondary"
            id="validation-button"
            onClick={() => props.nextStep()}
            disabled={!isNextStepAvailable}
          >
            Compléter les comptes fournisseurs sans siren
            <i className="bi bi-chevron-right"></i>
          </button>
        )}
      </div>
    </section>
  );
};

export default IdentifiedProviders;
