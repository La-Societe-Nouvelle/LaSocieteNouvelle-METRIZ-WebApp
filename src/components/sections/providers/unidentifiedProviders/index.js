// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Button, Col, Form, Image, Row } from "react-bootstrap";

// Components
import ExpenseAccountsTable from "./ExpenseAccountsTable";
import PaginationComponent from "../PaginationComponent";

//Utils
import { getMappingFromChatGPT, getSignificativeAccounts, getSignificativeAccountsFromFlows } from "./utils";
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
  synchronizeAccounts,
  sessionDidUpdate,
  legalUnitActivityCode,
  useChatGPT
}) => {

  const { providers, externalExpenses, externalExpensesAccounts, investments, immobilisations } = financialData;

  // State management
  const [accounts, setAccounts] = useState([]);

  // init accounts array
  useEffect(() => 
  {
    // providers nums without defined fpt
    let providerNums = providers
      .filter((provider) => provider.useDefaultFootprint)
      .map((provider) => provider.providerNum);

    // expense accounts
    let externalAccountNums = externalExpenses
      .filter((expense) => providerNums.includes(expense.providerNum) && financialPeriod.regex.test(expense.date))
      .map((expense) => expense.accountNum)
      .filter((value, index, self) => index === self.findIndex(item => item === value));
    let externalAccounts = externalExpensesAccounts
      .filter((account) => externalAccountNums.includes(account.accountNum));

    // update footprint origin
    externalExpenses
      .concat(investments)
      .filter((flow) => providerNums.includes(flow.providerNum))
      .forEach((flow) => flow.footprintOrigin = "account");

    // handle investment fpt (with initial state fpt of immobilisation account)
    investments
      .filter(investment => investment.footprintOrigin == "account")
      .forEach(investment => {
        let immobilisation = immobilisations.find(immobilisation => immobilisation.accountNum == investment.accountNum);
        if (immobilisation) {
          investment.footprint = immobilisation.initialState.footprint;
        } else {
          console.log("[ERROR] investment not linked to immobilisation account")
          console.log(investment);
          console.log(immobilisations);
        }
      });

    setAccounts([...externalAccounts]);
  }, [])

  // significative providers/accounts
  const [significativeAccounts, setSignificativeAccounts] = useState([]);

  // modals
  const [showSyncSuccessModal, setShowSyncSuccessModal] = useState(false);
  const [showSyncWarningModal, setShowWarningModal] = useState(false);
  const [showSyncErrorWarningModal , setShowSyncErrorWarningModal] = useState(false);

  const [filteredAccounts, setFilteredAccounts] = useState(accounts);
  const [isNextStepAvailable, setIsNextStepAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // view state
  const [viewState, setViewState] = useState({
    currentView: "",
    currentPage: 1,
    itemsPerPage: "20",
  });

  const { currentView, currentPage, itemsPerPage } = viewState;

  // --------------------------------------------------

  // initi significative accounts
  useEffect(() => {
    updateSignificativeAccounts();

    const isNextStepAvailable = checkSynchronisation();
    setIsNextStepAvailable(isNextStepAvailable);
  }, []);

  useEffect(() => {
    let filteredAccounts = filterAccountsByView(currentView, accounts, significativeAccounts);
    setFilteredAccounts(filteredAccounts);
  }, [currentView, accounts, significativeAccounts])

  // --------------------------------------------------

  // update significative accounts
  const updateSignificativeAccounts = async () => 
  {
    const expensesOnPeriod = financialData.externalExpenses
        .filter(expense => financialPeriod.regex.test(expense.date));
    const significativeAccounts =
      await getSignificativeAccountsFromFlows(
      expensesOnPeriod,
      accounts,
      providers,
      minFpt,
      maxFpt,
      financialPeriod
    );

    setSignificativeAccounts(significativeAccounts);
  };

  // check if providers are synchronized
  const checkSynchronisation = () => 
  {
    const isAccountsToSync = accounts.every((account) => account.footprintStatus == 200 && account.footprint.isValid());
    return isAccountsToSync;
  };

  // --------------------------------------------------
  // Event handlers

  const handleViewChange = (e) => {
    setViewState((prevState) => ({ ...prevState, currentView: e.target.value , currentPage : 1}));
  };

  const handleItemsPerPageChange = (e) => {
    setViewState((prevState) => ({
      ...prevState,
      itemsPerPage: e.target.value,
    }));
  };

  const handleConfirmNextStep = async () => 
  {
    const haswarnings =  accounts.some((account) => significativeAccounts.includes(account.providerNum) && account.defaultFootprintParams.code == "00");
    haswarnings ? setShowWarningModal(true) : submit();
  };

  const handleSynchronize = async () => {
    setShowWarningModal(false);

    let accountsToSynchronize = [];

    // Expense Account
    accountsToSynchronize = accounts
      .filter((account) =>  account.footprintStatus !== 200 || !account.footprint.isValid());

    try 
    {
      console.log(accountsToSynchronize);
      await synchronizeAccounts(accountsToSynchronize);
      updateSignificativeAccounts();

      const isNextStepAvailable = checkSynchronisation();
      setIsNextStepAvailable(isNextStepAvailable);

      if (!isNextStepAvailable) {
        setShowSyncErrorWarningModal(!isNextStepAvailable);
        
      
      }

      setShowSyncSuccessModal(isNextStepAvailable);
      setViewState((prevState) => ({
        ...prevState,
        currentView: "all",
        currentPage: 1,
      }));
    } catch (error) {
      console.log(error);
      // log error 
    }
  };

  // Pré-selection economic division
  const setDefaultMapping = async () => 
  {
    let accountsToMap = accounts.filter((account) => account.defaultFootprintParams.code == "00");

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
        });
      } else {
        setError(true);
      }
      setLoading(false);
    }
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
  const startIndex =  itemsPerPage == "all" ? 0 : (currentPage - 1) * parseInt(itemsPerPage);
  const endIndex =    itemsPerPage == "all" ? accounts.length : startIndex + parseInt(itemsPerPage);
  const totalPages =  itemsPerPage == "all" ? 1 : Math.ceil(accounts.length / parseInt(itemsPerPage));

  // Sync button status
  const isSyncButtonEnable = isSyncButtonEnabled(accounts);

  // Options
  // const renderSignificativeOption = hasSignificativeProvidersWithoutActivity(providers, significativeProviders);

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
            Le <b>traitement par compte de charges</b> permet de simplifier la
            démarche d'identification des activités économiques correspondantes
            aux dépenses non rattachées à un fournisseur identifié (via son
            numéro SIREN). Il permet de traiter les empreintes des dépenses par
            compte de charges plutôt que par compte fournisseur.
          </p>
          {useChatGPT && (
            <p className="mt-1">
              L'<b>association automatique est réalisée via ChatGPT</b> à partir
              du libellé du compte et de la division à laquelle appartient
              l'entreprise. Un indice de confiance (en pourcentage) est fourni
              pour exprimer le dégré de confiance dans l'association proposée.
              Elle est de 100% lorsque l'association est manuelle.
            </p>
          )}
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
                  Tous les comptes
                </option>
                <option key="4" value="significative">
                  Comptes significatifs
                </option>
                <option key="5" value="defaultActivity">
                  Comptes non rattachés à un secteur d'activité
                </option>
                <option
                  key="6"
                  value="significativeWithoutActivity"
                  // disabled={!renderSignificativeOption}
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
                disabled={accounts.length < 20}
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
        </Row>

        <div>
          <Button
            className="btn btn-primary me-2"
            onClick={setDefaultMapping}
            disabled={!useChatGPT}
          >
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

      <ExpenseAccountsTable
        accounts={filteredAccounts.filter(account => /^6/.test(account.accountNum))}
        significativeAccounts={significativeAccounts}
        financialPeriod={financialPeriod}
        startIndex={startIndex}
        endIndex={endIndex}
        setAccountDefaultFootprintParams={setAccountDefaultFootprintParams}
        externalExpenses={financialData}
      />

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(newPage) =>
          setViewState((prevState) => ({ ...prevState, currentPage: newPage }))
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
          setViewState((prevState) => ({
            ...prevState,
            currentView: "error",
            currentPage: 1,
          }))
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

function filterAccountsByView(currentView, accounts, significativeAccounts) {
  let filteredAccounts = [];

  switch (currentView) {
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
      provider.footprintStatus !== 200 ||
      !provider.footprint.isValid() ||
      provider.footprintStatus === 203
  );
}

export default UnidentifiedProviders;
