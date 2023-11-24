// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";

// Components
import ProvidersTable from "./ProvidersTable";
import ExpenseAccountsTable from "./ExpenseAccountsTable";
import PaginationComponent from "../PaginationComponent";

//Utils
import { getMappingFromChatGPT, getSignificativeAccounts, getSignificativeUnidentifiedProviders } from "./utils";
import { SyncSuccessModal, SyncWarningModal } from "./UserInfoModal";

// Modals
import { Loader } from "/src/components/modals/Loader";
import { ErrorAPIModal } from "/src/components/modals/userInfoModals";

const UnidentifiedProviders = ({
  financialData,
  financialPeriod,
  minFpt,
  maxFpt,
  prevStep,
  submit,
  synchronizeProviders,
  sessionDidUpdate,
  legalUnitActivityCode
}) => {

  // State management

  const [providers, setProviders] = useState(
    financialData.providers.filter(
      (provider) =>
        provider.useDefaultFootprint &&
        provider.periodsData.hasOwnProperty(financialPeriod.periodKey)
    )
  );

  const [accounts, setAccounts] = useState([]);
  useEffect(() => {
    let providerNums = providers.map((provider) => provider.providerNum);
    let accountNums = financialData.externalExpenses
      //.concat(financialData.investments)
      .filter((expense) => providerNums.includes(expense.providerNum) && financialPeriod.regex.test(expense.date))
      .map((expense) => expense.accountNum)
      .filter((value, index, self) => index === self.findIndex(item => item === value));
    let accounts = financialData.externalExpensesAccounts.filter((account) => accountNums.includes(account.accountNum));
    setAccounts(accounts);
  }, [])

  const [significativeProviders, setSignificativeProviders] = useState([]);
  const [significativeAccounts, setSignificativeAccounts] = useState([]);
  
  const [treatmentByExpenseAccount, setTreatmentByExpenseAccount] = useState(
    financialData.externalExpenses
      .filter((expense) => financialPeriod.regex.test(expense.date))
      .some((flow) => flow.footprintOrigin == "account")
  );
  const [showSyncSuccessModal, setShowSyncSuccessModal] = useState(false);
  const [showSyncWarningModal, setShowWarningModal] = useState(false);
  const [filteredProviders, setFilteredProviders] = useState(providers);
  const [isNextStepAvailable, setIsNextStepAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [state, setState] = useState({
    currentView: "all",
    currentPage: 1,
    itemsPerPage: 20,
  });

  const { currentView, currentPage, itemsPerPage } = state;

  // --------------------------------------------------

  // initi significative providers
  useEffect(() => 
  {
    updateSignificativeProviders();
    updateSignificativeAccounts();
    
    const isNextStepAvailable = checkSynchronisation();
    setIsNextStepAvailable(isNextStepAvailable);
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

  useEffect(() => {
    const isNextStepAvailable = checkSynchronisation();
    setIsNextStepAvailable(isNextStepAvailable);
  }, [treatmentByExpenseAccount])

  // --------------------------------------------------
  // derivated arrays

  const externalFlowsOnPeriod = [
    ...financialData.externalExpenses,
    ...financialData.investments
  ].filter((flow) => financialPeriod.regex.test(flow.date));

  const providersToSync = providers
      .filter((provider) => externalFlowsOnPeriod.some((flow) => flow.footprintOrigin=="provider" && flow.providerNum==provider.providerNum));
  const accountsToSync = accounts
    .filter((account) => externalFlowsOnPeriod.some((flow) => flow.footprintOrigin=="account" && flow.accountNum==account.accountNum));

  // --------------------------------------------------

  // update significative providers
  const updateSignificativeProviders = async () => 
  {
    const significativeProviders =
      await getSignificativeUnidentifiedProviders(
        financialData.providers,
        minFpt,
        maxFpt,
        financialPeriod
      );

    setSignificativeProviders(significativeProviders);
  };

  // update significative accounts
  const updateSignificativeAccounts = async () => 
  {
    const significativeAccounts =
      await getSignificativeAccounts(
        accounts,
        minFpt,
        maxFpt,
        financialPeriod
      );

    setSignificativeAccounts(significativeAccounts);
  };

  // check if providers are synchronized
  const checkSynchronisation = () => 
  {
    const isProvidersSync = [...providersToSync, ...accountsToSync]
      .every((account) => account.footprintStatus == 200 && account.footprint.isValid());
    
    return isProvidersSync;;
  };

  // --------------------------------------------------
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

  const handleConfirmNextStep = async () => 
  {
    const haswarnings = treatmentByExpenseAccount ? 
        accounts.some((account) => significativeAccounts.includes(account.providerNum) && account.defaultFootprintParams.code == "00")
      : providers.some((provider) => significativeProviders.includes(provider.providerNum) && provider.defaultFootprintParams.code == "00");

    haswarnings ? setShowWarningModal(true) : submit();
  };

  const handleSynchronize = async () => 
  {
    setShowWarningModal(false);

    // treatment by provider account
    if (!treatmentByExpenseAccount) 
    {
      const providersToSynchronise = providersToSync.filter((provider) =>
        provider.useDefaultFootprint && (provider.footprintStatus !== 200 || !provider.footprint.isValid())
      );
  
      await synchronizeProviders(providersToSynchronise);
  
      updateSignificativeProviders();

      const isNextStepAvailable = checkSynchronisation();
      setIsNextStepAvailable(isNextStepAvailable);
      setShowSyncSuccessModal(isNextStepAvailable);
    }

    // treatment by expenses account
    else if (treatmentByExpenseAccount) 
    {
      const accountsToSynchronise = accountsToSync.filter((account) => 
        (account.footprintStatus !== 200 || !account.footprint.isValid())
      );
  
      await synchronizeProviders(accountsToSynchronise);
  
      updateSignificativeAccounts();

      const isNextStepAvailable = checkSynchronisation();
      setIsNextStepAvailable(isNextStepAvailable);
      setShowSyncSuccessModal(isNextStepAvailable);
    }
  };

  const switchView = (event) => 
  {
    const treatmentByExpenseAccount = event.target.checked;

    let providerNums = providers.map((provider) => provider.providerNum);
    externalFlowsOnPeriod
      .filter((flow) => providerNums.includes(flow.providerNum))
      .forEach((flow) => flow.footprintOrigin = treatmentByExpenseAccount ? "account" : "provider");
    setTreatmentByExpenseAccount(treatmentByExpenseAccount);
  }


  // Pré-selection economic division
  const setDefaultMapping = async () => 
  {
    let accountsToMap = treatmentByExpenseAccount ?
        accounts.filter((account) => account.defaultFootprintParams.code == "00")
      : providers.filter((provider) => provider.defaultFootprintParams.code == "00");

    if (accountsToMap.length > 0) {
      setLoading(true);
      // call chat GPT
      let res = await getMappingFromChatGPT(accountsToMap, legalUnitActivityCode);
      console.log(res);
      console.log(res.isAvailable);
      // Waiting
      if (res.isAvailable) 
      {
        res.mapping.forEach(({ accountId, defaultCode, accuracy }) => 
        {
          if (treatmentByExpenseAccount) {
            let account = accounts.find((account) => account.accountNum == accountId);
            account.defaultFootprintParams.code = defaultCode;
            account.defaultFootprintParams.accuracyMapping = accuracy;
          } else {
            let provider = providers.find((provider) => provider.providerNum == accountId);
            provider.defaultFootprintParams.code = defaultCode;
            provider.defaultFootprintParams.accuracyMapping = accuracy;
          }
        });
      } else {
        setError(true);
      }
      setLoading(false);
    }
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
          accuracyMapping: 100
        };
        provider.update({ defaultFootprintParams: updatedParams });
        return provider;
      }
      return provider;
    });
    setProviders(updatedProviders);

    sessionDidUpdate();
  };

  // Update Providers
  const setAccountDefaultFootprintParams = (accountNum, paramName, paramValue) => {

    // Disable next step to force user to re-synchronize
    setIsNextStepAvailable(false);

    const updatedAccounts = accounts.map((account) => {
      if (account.accountNum === accountNum) {
        const updatedParams = {
          ...account.defaultFootprintParams,
          [paramName]: paramValue,
          accuracyMapping: 100
        };
        account.update({ defaultFootprintParams: updatedParams });
        return account;
      }
      return account;
    });
    setAccounts(updatedAccounts);

    sessionDidUpdate();
  };

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil((treatmentByExpenseAccount ? accountsToSync.length : filteredProviders.length) / itemsPerPage);

  // Sync button status
  const isSyncButtonEnable = isSyncButtonEnabled(providers);

  // Options
  const renderSignificativeOption = hasSignificativeProvidersWithoutActivity(providers, significativeProviders);

  console.log(isNextStepAvailable);
  console.log(checkSynchronisation());

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
            <option
              key="6"
              value="significativeWithoutActivity"
              disabled={!renderSignificativeOption}
            >
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

        <Form.Check
          type="checkbox"
          value={treatmentByExpenseAccount}
          checked={treatmentByExpenseAccount}
          onChange={switchView}
          label="Traitement par compte de charges"
        />

        <div>
          <Button className="btn btn-primary me-2" onClick={setDefaultMapping} disabled={!treatmentByExpenseAccount}>
            <i className="bi bi-shuffle"></i> Association automatique
          </Button>
          <Button
            onClick={handleSynchronize}
            className="btn btn-secondary"
            disabled={!isSyncButtonEnable}
          >
            <i className="bi bi-arrow-repeat"></i> Synchroniser les données
          </Button>
        </div>
      </div>

      {!treatmentByExpenseAccount && 
        <ProvidersTable
          providers={filteredProviders}
          significativeProviders={significativeProviders}
          financialPeriod={financialPeriod}
          startIndex={startIndex}
          endIndex={endIndex}
          setProviderDefaultFootprintParams={setProviderDefaultFootprintParams}
        />}

      {treatmentByExpenseAccount && 
        <ExpenseAccountsTable
          providers={filteredProviders}
          accounts={accounts}
          significativeProviders={significativeProviders}
          financialPeriod={financialPeriod}
          startIndex={startIndex}
          endIndex={endIndex}
          setAccountDefaultFootprintParams={setAccountDefaultFootprintParams}
        />}

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

      {loading && <Loader title={"Association automatique en cours ..."} />}

      {/* Error Modal for API Errors */}
      <ErrorAPIModal hasError={error} onClose={() => setError(false)} />

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
        (provider.footprintStatus !== 200 || !provider.footprint.isValid())) ||
      provider.footprintStatus === 203
  );
}
function hasSignificativeProvidersWithoutActivity(
  providers,
  significativeProviders
) {
  return providers.some(
    (provider) =>
      provider.defaultFootprintParams.code === "00" &&
      significativeProviders.includes(provider.providerNum)
  );
}

export default UnidentifiedProviders;
