// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Button, Col, Form, Image, Row } from "react-bootstrap";

// Components
import ProvidersTable from "./ProvidersTable";
import ExpenseAccountsTable from "./ExpenseAccountsTable";
import PaginationComponent from "../PaginationComponent";

//Utils
import { getMappingFromChatGPT, getSignificativeAccounts, getSignificativeAccountsFromFlows, getSignificativeUnidentifiedProviders } from "./utils";
import { SyncSuccessModal, SyncWarningModal } from "./UserInfoModal";

// Modals
import { Loader } from "/src/components/modals/Loader";
import { ErrorAPIModal } from "/src/components/modals/userInfoModals";
import { SyncErrorModal } from "../identifiedProviders/modals/AlertModal";

const UnidentifiedProviders = ({
  financialData,
  financialPeriod,
  minFpt,
  maxFpt,
  prevStep,
  submit,
  synchronizeProviders,
  sessionDidUpdate,
  legalUnitActivityCode,
  useChatGPT
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

  useEffect(() => 
  {
    let providerNums = providers.map((provider) => provider.providerNum);

    // expense accounts
    let accountNums = financialData.externalExpenses
      .filter((expense) => providerNums.includes(expense.providerNum) && financialPeriod.regex.test(expense.date))
      .map((expense) => expense.accountNum)
      .filter((value, index, self) => index === self.findIndex(item => item === value));
    let accounts = financialData.externalExpensesAccounts
      .filter((account) => accountNums.includes(account.accountNum));
    
    // immobilisation providers
    let immobilisationProviderNums = financialData.investments
      .filter((investment) => providerNums.includes(investment.providerNum) && financialPeriod.regex.test(investment.date))
      .map((investment) => investment.providerNum);
    let immobilisationProviders = providers
      .filter((provider) => immobilisationProviderNums.includes(provider.providerNum));

    setAccounts([...accounts,...immobilisationProviders]);
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
  const [showSyncErrorWarningModal , setShowSyncErrorWarningModal] = useState(false);

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
  useEffect(() => {
    updateSignificativeProviders();
    updateSignificativeAccounts();

    const isNextStepAvailable = checkSynchronisation();
    setIsNextStepAvailable(isNextStepAvailable);

  }, []);

  // Filter providers or accounts based on the current view
  useEffect(() => {
    let filteredItems = [];

    if (accounts.length > 0 && treatmentByExpenseAccount) {
      filteredItems = filterAccountsByView(
        currentView,
        accounts,
        significativeAccounts
      );
    } else {
      filteredItems = filterProvidersByView(
        currentView,
        providers,
        significativeProviders,
      );
    }
    setFilteredProviders(filteredItems);
  }, [currentView]);

  useEffect(() => {
    const isNextStepAvailable = checkSynchronisation();
    setIsNextStepAvailable(isNextStepAvailable);
  }, [treatmentByExpenseAccount]);

  // --------------------------------------------------
  // derivated arrays

  const externalFlowsOnPeriod = [
    ...financialData.externalExpenses,
    ...financialData.investments,
  ].filter((flow) => financialPeriod.regex.test(flow.date));

  const providersToSync = providers
    .filter((provider) => externalFlowsOnPeriod.some((flow) => (flow.footprintOrigin=="provider" || /^2/.test(flow.accountNum)) && flow.providerNum==provider.providerNum));
  const accountsToSync = accounts
    .filter((account) => externalFlowsOnPeriod.some((flow) => (flow.footprintOrigin=="account" && flow.accountNum==account.accountNum) || account.providerNum));

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
    // const significativeAccounts =
    //   await getSignificativeAccounts(
    //     accounts,
    //     minFpt,
    //     maxFpt,
    //     financialPeriod
    //   );

    const expensesOnPeriod = financialData.externalExpenses
        .filter(expense => financialPeriod.regex.test(expense.date));
    const significativeAccounts =
      await getSignificativeAccountsFromFlows(
        expensesOnPeriod,
        accounts,
        financialData.providers,
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
    setState((prevState) => ({ ...prevState, currentView: e.target.value , currentPage : 1}));
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

  const handleSynchronize = async () => {
    setShowWarningModal(false);

    let elementsToSynchronize = [];

    // Default Treatement
    if (!treatmentByExpenseAccount) {
      elementsToSynchronize = providersToSync.filter(
        (provider) =>
          provider.useDefaultFootprint &&
          (provider.footprintStatus !== 200 || !provider.footprint.isValid())
      );
    } 

    // Expense Account
    if (treatmentByExpenseAccount) {
      elementsToSynchronize = accountsToSync
        .concat(providersToSync)
        .filter(
          (account) =>
            account.footprintStatus !== 200 || !account.footprint.isValid()
        );
    }

    await synchronizeProviders(elementsToSynchronize);

    if (!treatmentByExpenseAccount) {
      updateSignificativeProviders();
    } else {
      updateSignificativeAccounts();
    }

    const isNextStepAvailable = checkSynchronisation();
    setIsNextStepAvailable(isNextStepAvailable);

    setShowSyncErrorWarningModal(!isNextStepAvailable);
    setShowSyncSuccessModal(isNextStepAvailable);
    setState((prevState) => ({
      ...prevState,
      currentView: "all",
      currentPage: 1,
    }));

  
  };

  const switchView = (event) => 
  {
    const treatmentByExpenseAccount = event.target.checked;

    let providerNums = providers.map((provider) => provider.providerNum);
    externalFlowsOnPeriod
      .filter((flow) => providerNums.includes(flow.providerNum))
      .forEach((flow) => flow.footprintOrigin = treatmentByExpenseAccount ? "account" : "provider");
    setTreatmentByExpenseAccount(treatmentByExpenseAccount);

    if (treatmentByExpenseAccount) {
      updateSignificativeAccounts();
      setFilteredProviders(accounts)
      setState((prevState) => ({
        ...prevState,
        currentView: "all",
        currentPage: 1,
      }));
    } else {
      updateSignificativeProviders();
      setFilteredProviders(providers);
      setState((prevState) => ({
        ...prevState,
        currentView: "all",
        currentPage: 1,
      }));
    }
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
      // Waiting
      if (res.isAvailable) 
      {
        res.mapping.forEach(({ accountId, defaultCode, accuracy }) => 
        {
          let account = accounts.find((account) => account.accountNum == accountId);
          if (account) {
            account.update({
              defaultFootprintParams: {
                code: defaultCode,
                accuracyMapping: accuracy
              }
            });
          } 
          
          let provider = providers.find((provider) => provider.providerNum == accountId);
          if (provider) {
            provider.update({
              defaultFootprintParams: {
                code: defaultCode,
                accuracyMapping: accuracy
              }
            });
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
          accuracyMapping: 100,
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
      if (account.accountNum === accountNum || account.providerNum === accountNum) {
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
  const isSyncButtonEnable = isSyncButtonEnabled(treatmentByExpenseAccount ? accounts : providers);

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

      <div className="alert-info ">
        <div className="info-icon">
          <Image src="/info-circle.svg" alt="icon info" />
        </div>
        <div>
          <p>
            Le <b>traitement par compte de charges</b> permet de simplifier la démarche
            d'identification des activités économiques correspondantes aux
            dépenses non rattachées à un fournisseur identifié (via son numéro
            SIREN).
            Il permet de traiter les empreintes des dépenses par compte de charges plutôt que
            par compte fournisseur.
          </p>
          {useChatGPT && <p className="mt-1">
            L'<b>association automatique est réalisée via ChatGPT</b> à partir du libellé
            du compte et de la division à laquelle appartient l'entreprise.
            Un indice de confiance (en pourcentage) est fourni pour exprimer le dégré
            de confiance dans l'association proposée. Elle est de 100% lorsque l'association
            est manuelle.
          </p>}
        </div>
      </div>

      <div className="d-flex py-2 justify-content-between">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex">
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
                <option key="7" value="error">
                  Erreurs de synchronisation
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
          </Col>

          <Col>
            <Form.Check
              className="fw-bold"
              type="switch"
              value={treatmentByExpenseAccount}
              checked={treatmentByExpenseAccount}
              onChange={switchView}
              id="Traitement par compte de charges"
              label="Traitement par compte de charges"
            />
          </Col>
        </Row>

        <div>
          <Button className="btn btn-primary me-2" 
                  onClick={setDefaultMapping}
                  disabled={!useChatGPT}>
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

      {!treatmentByExpenseAccount && (
        <ProvidersTable
          providers={filteredProviders}
          significativeProviders={significativeProviders}
          financialPeriod={financialPeriod}
          startIndex={startIndex}
          endIndex={endIndex}
          setProviderDefaultFootprintParams={setProviderDefaultFootprintParams}
        />
      )}

      {treatmentByExpenseAccount && (
        <ExpenseAccountsTable
          accounts={filteredProviders}
          externalFlowsOnPeriod={externalFlowsOnPeriod}
          significativeAccounts={significativeAccounts}
          financialPeriod={financialPeriod}
          startIndex={startIndex}
          endIndex={endIndex}
          setAccountDefaultFootprintParams={setAccountDefaultFootprintParams}
        />
      )}

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

      <SyncErrorModal
        showModal={showSyncErrorWarningModal}
        onClose={() => setShowSyncErrorWarningModal(false)}
        changeView={() =>
          setState((prevState) => ({ ...prevState, currentView: "error", currentPage: 1 }))
        }
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
  let filteredProviders = providers.slice();
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
    case "error":
      filteredProviders = filteredProviders.filter(
        (provider) => provider.footprintStatus === 500
      );
      break;
    default: // default
      break;
  }

  return filteredProviders;
}
function filterAccountsByView(currentView, accounts, significativeAccounts) {
  let filteredAccounts = [];

  switch (currentView) {
    case "aux": // provider account
    filteredAccounts = accounts.filter(
        (account) => !account.isDefaultProviderAccount
      );
      break;
    case "expenses": // default provider account
    filteredAccounts = accounts.filter(
        (account) => account.isDefaultProviderAccount
      );
      break;
    case "significative": // significative provider
    filteredAccounts = accounts.filter((account) =>
      significativeAccounts.includes(account.accountNum)
      );
      break;
    case "significativeWithoutActivity": // significative provider & no activity code set
    filteredAccounts = accounts.filter(
        (account) =>
        significativeAccounts.includes(account.accountNum) &&
        account.defaultFootprintParams.code === "00"
      );
      break;
    case "defaultActivity": // no activity code set
    filteredAccounts = accounts.filter(
        (account) => account.defaultFootprintParams.code === "00"
      );
      break;
    case "error":
      filteredAccounts = accounts.filter(
        (account) => account.footprintStatus === 500
      );
      break;
    default:
      filteredAccounts = accounts;
      break;
  }

  return filteredAccounts;
}

function isSyncButtonEnabled(providers) {
  return providers.some(
    (provider) =>
        (provider.footprintStatus !== 200 || !provider.footprint.isValid()) 
      || provider.footprintStatus === 203
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
