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
import { ProgressBarModal } from "../../modals/ProgressBarModal";
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

const ProvidersSection = ({
  session,
  sessionDidUpdate,
  period,
  submit
}) => {

  const { 
    financialData, 
    comparativeData,
    legalUnit,
    useChatGPT
  } = session;

  const [step, setStep] = useState(1);

  const [minFpt, setMinFpt] = useState(null);
  const [maxFpt, setMaxFpt] = useState(null);

  const [fetching, setFetching] = useState(false);
  const [progression, setProgression] = useState(0);
  const [apiError, setApiError] = useState(false);

  // account -> Provider or Account
  const synchronizeAccountData = async (account) => 
  {
    try 
    {
      // fetch data
      await account.updateFromRemote();
      // apply data
      financialData.externalExpenses
        .concat(financialData.investments)
        .filter((expense) => (expense.providerNum === account.providerNum)
                          || (expense.footprintOrigin=="account" && expense.accountNum === account.accountNum)) // only update expenses not already linked to a provider fpt
        .forEach((expense) => {
          expense.footprint = account.footprint;
          expense.footprintOrigin = (expense.providerNum === account.providerNum) ? "provider" : "account";
        });
    } catch (error) {
      setApiError(true);
      throw error;
    }
  };

  const synchronizeAccounts = async (accountsToSynchronise) => 
  {
    setFetching(true);
    setProgression(0);
    let i = 0;
    const n = accountsToSynchronise.length;
    for (const account of accountsToSynchronise) {
      try {
        await synchronizeAccountData(account);
        i++;
        setProgression(Math.round((i / n) * 100));
      } catch (error) {
        setFetching(false);
        throw error;
      }
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
      <ProgressBarModal
        message="Récupération des données fournisseurs..."
        progression={progression}
      />
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
          financialPeriod={period}
          nextStep={() => setStep(2)}
          minFpt={minFpt}
          maxFpt={maxFpt}
          submit={submit}
          synchronizeProviders={synchronizeAccounts}
          sessionDidUpdate={sessionDidUpdate}
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
          financialPeriod={period}
          minFpt={minFpt}
          maxFpt={maxFpt}
          prevStep={() => setStep(1)}
          submit={submit}
          synchronizeAccounts={synchronizeAccounts}
          sessionDidUpdate={sessionDidUpdate}
          legalUnitActivityCode={legalUnit.activityCode || comparativeData.comparativeDivision}
          useChatGPT={useChatGPT}
        />
      </>
    );
  }

  return null;
};

export default ProvidersSection;
