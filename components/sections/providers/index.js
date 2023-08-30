// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";

// Views
import UnidentifiedProviders from "./unidentifiedProviders";
import IdentifiedProviders from "./identifiedProviders";

// Services
import {
  fetchMaxFootprint,
  fetchMinFootprint,
} from "/src/services/DefaultDataService";

// Modals
import { ProgressBar } from "../../modals/ProgressBar";
import { ErrorAPIModal } from "../../modals/userInfoModals";

/* ----------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- PROVIDERS SECTION -------------------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------------------- */

/** Providers section
 *  Two steps :
 *    1- identified providers (with siren number)
 *    2- unidentified providers (default account & provider account without siren number) -> useDefaultFootprint == true
 *  State :
 *    -> step (1 or 2)
 *
 */

const ProvidersSection = (props) => {
  const { financialData, financialPeriod } = props.session;
  const [step, setStep] = useState(1);

  const [minFpt, setMinFpt] = useState(null);
  const [maxFpt, setMaxFpt] = useState(null);

  const [fetching, setFetching] = useState(false);
  const [progression, setProgression] = useState(0);
  const [apiError, setApiError] = useState(false);

  const synchronizeProviderData = async (provider) => {
    try {
      await provider.updateFromRemote();
      financialData.externalExpenses
        .concat(financialData.investments)
        .filter((expense) => expense.providerNum === provider.providerNum)
        .forEach((expense) => {
          expense.footprint = provider.footprint;
        });
    } catch (error) {
      setApiError(true);
    }
  };

  const synchronizeProviders = async (providersToSynchronise) => {
    setFetching(true);
    setProgression(0);
    let i = 0;
    const n = providersToSynchronise.length;
    for (const provider of providersToSynchronise) {
      await synchronizeProviderData(provider);
      i++;
      setProgression(Math.round((i / n) * 100));
    }

    setFetching(false);
    setProgression(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      let minFpt = await fetchMinFootprint();
      let maxFpt = await fetchMaxFootprint();

      setMinFpt(minFpt);
      setMaxFpt(maxFpt);
    };

    fetchData();
  }, []);

  const progressBar = fetching && (
    <div className="popup">
      <ProgressBar
        message="Récupération des données fournisseurs..."
        progression={progression}
      />
    </div>
  );

  const apiErrorModal = apiError && (
    <ErrorAPIModal
    hasError = {apiError}
    onClose={() => setApiError(false)}/>
  )
  if (step === 1) {
    return (
      <>
        {progressBar}
        {apiErrorModal}
        <IdentifiedProviders
          financialData={financialData}
          financialPeriod={financialPeriod}
          nextStep={() => setStep(2)}
          minFpt={minFpt}
          maxFpt={maxFpt}
          submit={props.submit}
          synchronizeProviders={synchronizeProviders}
        />
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        {progressBar}
        {apiErrorModal}
        <UnidentifiedProviders
          financialData={financialData}
          financialPeriod={financialPeriod}
          minFpt={minFpt}
          maxFpt={maxFpt}
          prevStep={() => setStep(1)}
          nextStep={props.submit}
          synchronizeProviders={synchronizeProviders}
        />
      </>
    );
  }

  return null;
};

export default ProvidersSection;
