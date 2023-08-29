// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";

// Views
import ImportProvidersView from "./views/ImportProvidersView";
import InvoicesProvidersView from "./views/InvoicesProvidersView";
import SyncProvidersView from "./views/SyncProvidersView";

// Services
import {fetchMaxFootprint,fetchMinFootprint,} from "/src/services/DefaultDataService";

// Utils
import { getSignificativeProviders } from "./utils";

// Modals
import { ProgressBar } from "../../../modals/ProgressBar";
import { SyncSuccessModal } from "./modals/AlertModal";

const IdentifiedProviders = (props) => {
  const [significativeProviders, setSignificativeProviders] = useState([]);

  const [fetching, setFetching] = useState(false);
  const [progression, setProgression] = useState(0);
  const [showSyncErrorModal, setShowSyncErrorModal] = useState(false);
  const [showSyncSuccessModal, setShowSyncSuccessModal] = useState(false);

  const financialData = props.financialData;
  const financialPeriod = props.financialPeriod;

  const [providers, setProviders] = useState(
    financialData.providers.filter((provider) =>
      provider.periodsData.hasOwnProperty(financialPeriod.periodKey)
    )
  );

  const [minFpt, setMinFpt] = useState();
  const [maxFpt, setMaxFpt] = useState();

  const updateProviders = (updatedProviders) => {
    financialData.providers = updatedProviders;
    setProviders(updatedProviders);
  };

  const synchroniseProviders = async () => {
    setFetching(true);
    setProgression(0);

    let providersToSynchronise = financialData.providers.filter(
      (provider) =>
        !provider.useDefaultFootprint && provider.footprintStatus !== 200
    );

    let i = 0;
    let n = providersToSynchronise.length;
    let hasSyncError = false;

    for (let provider of providersToSynchronise) {
      try {
        await provider.updateFromRemote();
        financialData.externalExpenses
          .concat(financialData.investments)
          .filter((expense) => expense.providerNum === provider.providerNum)
          .forEach((expense) => {
            expense.footprint = provider.footprint;
          });
      } catch (error) {
        console.log(error);
        setFetching(false);
        setProgression(0);
        setSignificativeProviders([]);
        return;
      }

      if (provider.footprintStatus === 404) {
        hasSyncError = true;
      }

      i++;
      setProgression(Math.round((i / n) * 100));
    }

    let significativeProviders = await getSignificativeProviders(
      financialData.providers,
      minFpt,
      maxFpt,
      financialPeriod
    );

    setShowSyncErrorModal(hasSyncError);
    setShowSyncSuccessModal(!hasSyncError);

    setFetching(false);
    setProgression(0);
    setSignificativeProviders(significativeProviders);
  };

  useEffect(() => {
    const fetchData = async () => {
      let minFpt = await fetchMinFootprint();
      let maxFpt = await fetchMaxFootprint();

      let significativeProviders = await getSignificativeProviders(
        providers,
        minFpt,
        maxFpt,
        financialPeriod
      );
      setMinFpt(minFpt);
      setMaxFpt(maxFpt);
      setSignificativeProviders(significativeProviders);
    };

    fetchData();
  }, []);

  // Check if all providers have their footprint data synchronized
  const allProvidersIdentified =
    providers.filter((provider) => provider.footprintStatus === 200).length ===
    providers.length;

  // Check if all providers with SIREN number have been synchronized
  const nbSirenSynchronised = providers.filter(
    (provider) =>
      !provider.useDefaultFootprint && provider.footprintStatus === 200
  ).length;
  const nbSiren = providers.filter(
    (provider) => !provider.useDefaultFootprint
  ).length;

  const isNextStepAvailable = nbSirenSynchronised === nbSiren && nbSiren !== 0;

  return (
    <Container fluid id="siren-section">
      <section className="step">
        <h2 className="mb-3">Etape 3 - Traitement des fournisseurs</h2>
        <h3 className=" my-4">
          Synchronisation des données grâce au numéro SIREN
        </h3>
        <p className="small">
          La synchronisation des données relatives aux fournisseurs s'effectue
          via le numéro siren. Pour établir la correspondance entre les numéros
          de compte auxiliaire dans vos écritures comptables et les numéros de
          SIREN, vous avez trois options :
        </p>
        <ol className="small">
          <li>
            <strong>Importer </strong> les numéros SIREN de vos fournisseurs via
            un fichier au format Excel ou CSV
          </li>
          <li>
            <strong>Associer </strong> les comptes fournisseurs à partir des
            factures
          </li>
          <li>
            <strong>Compléter </strong> manuellement le tableau
          </li>
        </ol>

        {/* Views --------------------------------------------------------- */}

        <ImportProvidersView
          providers={providers}
          updateProviders={updateProviders}
          synchroniseProviders={synchroniseProviders}
        />
        <InvoicesProvidersView
          providers={providers}
          externalExpenses={financialData.externalExpenses}
          updateProviders={updateProviders}
        />

        <SyncProvidersView
          providers={providers}
          significativeProviders={significativeProviders}
          financialPeriod={financialPeriod}
          updateProviders={updateProviders}
          synchroniseProviders={synchroniseProviders}
          showSyncErrorModal={showSyncErrorModal}
          closeSyncErrorModal={() => setShowSyncErrorModal(false)}
        />

        {/* Modals --------------------------------------------------------- */}

        {fetching && (
          <ProgressBar
            message="Récupération des données fournisseurs..."
            progression={progression}
          />
        )}
        <SyncSuccessModal
          showModal={showSyncSuccessModal}
          onClose={() => setShowSyncSuccessModal(false)}
          isAllProvidersIdentified={allProvidersIdentified}
          nextStep={allProvidersIdentified ? props.submit : props.nextStep}
        />

        {/* Actions ---------------------------------------------------------*/}
        <div className="text-end">
          {allProvidersIdentified ? (
            <div>
              <button
                className="btn btn-primary me-3"
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
              Étape suivante
              <i className="bi bi-chevron-right"></i>
            </button>
          )}
        </div>
      </section>
    </Container>
  );
};

export default IdentifiedProviders;
