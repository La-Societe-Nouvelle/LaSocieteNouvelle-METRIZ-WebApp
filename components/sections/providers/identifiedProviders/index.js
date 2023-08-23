// La Société Nouvelle

// React
import React from "react";
import Dropzone from "react-dropzone";
import { Container } from "react-bootstrap";

// API
import api from "../../../../config/api";

// Services
import {
  fetchMaxFootprint,
  fetchMinFootprint,
} from "/src/services/DefaultDataService";

// Views

import SIRENProvidersImport from "./views/SIRENProvidersImport";

// Table
import { IdentifiedProvidersTable } from "../../../tables/IdentifiedCompaniesTable";

// Utils
import { getSignificativeProviders } from "./utils";

// Modals
import { ProgressBar } from "../../../modals/ProgressBar";
import { ErrorAPIModal, InfoModal } from "../../../modals/userInfoModals";
import { InvoicesDataModal } from "./modals/InvoicesDataModal";

// pdf extractor
import pdf from "pdf-extraction";
import { getDefaultFootprintId } from "/src/Provider";


const identificationPatterns = [
  /FR[0-9]{11}( |$|\r\n|\r|\n)/g,
  /FR [0-9]{2} [0-9]{3} [0-9]{3} [0-9]{3}( |$|\r\n|\r|\n)/g,
  /(SIRET|SIREN|RCS)( |)[0-9]{9,15}( |)($|\r\n|\r|\n)/g,
  /(^|)( |)[0-9]{9,15}( |)(SIRET|SIREN|RCS)/g,
];

export class IdentifiedProviders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      significativeProviders: [], // significative companies
      view: "all",
      nbItems: 20,
      fetching: false,
      file: null,
      progression: 0,
      synchronised: 0,
      showInvoicesDataModal: false,
      showInfoModal: false,
      isSyncButtonEnable: checkSyncButtonEnable(props.financialData.providers),
      isNextStepAvailable: checkNextStepAvailable(
        props.financialData.providers
      ),
      errorFile: false,
      error: false,
      minFpt: null,
      maxFpt: null,
      invoicesData: null,
    };

 
    this.onInvoicesDrop = async (files) => {
      if (files.length > 0) {
        let invoicesData = await this.readInvoices(files);

        if (Object.keys(invoicesData).length !== 0) {
          this.setState({
            fetching: false,
            progression: 0,
            showInvoicesDataModal: true,
            errorFile: false,
            invoicesData,
          });
        } else {
          this.setState({
            fetching: false,
            progression: 0,
            showInfoModal: true,
          });
        }
      } else {
        this.setState({
          showInvoicesDataModal: false,
          errorFile: true,
          invoicesData: null,
        });
      }
    };
  }

  componentDidMount = async () => {
    let minFpt = await fetchMinFootprint();
    let maxFpt = await fetchMaxFootprint();
    let significativeProviders = await getSignificativeProviders(
      this.props.financialData.providers,
      minFpt,
      maxFpt,
      this.props.financialPeriod
    );
    this.setState({ significativeProviders, minFpt, maxFpt });
  };

  componentDidUpdate = () => {

    
    // next step available
    const isNextStepAvailable = checkNextStepAvailable(
      this.props.financialData.providers
    );
    if (this.state.isNextStepAvailable != isNextStepAvailable) {
      this.setState({ isNextStepAvailable });
    }
    // providers fpt to sync
    const isSyncButtonEnable = checkSyncButtonEnable(
      this.props.financialData.providers
    );
    if (this.state.isSyncButtonEnable != isSyncButtonEnable) {
      this.setState({ isSyncButtonEnable });
    }
  };

  updateProviders = (updatedProviders) => {
    this.setState({ financialData: { ...this.state.financialData, providers: updatedProviders } });
  };
  
  render() {
    const {
      significativeProviders,
      view,
      nbItems,
      fetching,
      progression,
      showInvoicesDataModal,
      showInfoModal,
      isSyncButtonEnable,
      isNextStepAvailable,
      error,
      invoicesData,
    } = this.state;

    const financialData = this.props.financialData;
    const financialPeriod = this.props.financialPeriod;

    const providers = financialData.providers.filter((provider) =>
      provider.periodsData.hasOwnProperty(financialPeriod.periodKey)
    );

    //const providers = financialData.providers ;
    const showedProviders = getShowedProviders(
      view,
      providers,
      significativeProviders
    );
    const allProvidersIdentified =
      providers.filter((provider) => provider.footprintStatus == 200).length ==
      providers.length;

    const nbSignificativeProvidersUnidentified = providers.filter(
      (provider) =>
        provider.useDefaultFootprint &&
        significativeProviders.includes(provider.providerNum)
    ).length;
    const someSignificativeProvidersUnidentified =
      nbSignificativeProvidersUnidentified > 0;

    return (
      <Container fluid id="siren-section">
        <section className="step">
        <h2 className="mb-3">Etape 3 - Traitement des fournisseurs</h2>
          <h3 className=" my-4">
            Synchronisation des données grâce au numéro SIREN
          </h3>
          <p className="small">
            La synchronisation des données relatives aux fournisseurs s'effectue
            via le numéro siren. Pour établir la correspondance entre les
            numéros de compte auxiliaire dans vos écritures comptables et les
            numéros de SIREN, vous avez trois options :
          </p>
          <ol className="small">
            <li>
              <strong>Importer </strong> les numéros SIREN de vos
              fournisseurs via un fichier au format Excel ou CSV
            </li>
            <li>
              <strong>Associer </strong>  les comptes fournisseurs à partir des
              factures
            </li>
            <li>
              <strong>Compléter </strong> manuellement le tableau 
            </li>
          </ol>
          <SIRENProvidersImport
            providers={financialData.providers}
            updateProviders={this.updateProviders}
            synchroniseProviders={this.synchroniseProviders}
          />

          {/* TO DO : Upload Invoices component */}
          <div className="step">
            <h4>2. Déposer des factures</h4>

            <Dropzone onDrop={this.onInvoicesDrop} accept={[".pdf"]}>
              {({ getRootProps, getInputProps }) => (
                <div className="dropzone-section">
                  <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    <p>
                      <i className="bi bi-file-arrow-up-fill"></i>
                      Glisser vos factures ici
                    </p>
                    <p className="small">OU</p>
                    <p className="btn btn-primary">Selectionner les fichiers</p>
                  </div>
                </div>
              )}
            </Dropzone>

            <InfoModal
              showModal={showInfoModal}
              title={"Association des comptes fournisseurs"}
              message="Aucun SIREN n'a pu être extrait des documents importés.  
              Veuillez renseigner manuellement le numero SIREN de ces comptes fournisseurs "
              onClose={() => {
                this.setState({ showInfoModal: false });
              }}
            ></InfoModal>

            {invoicesData && (
              <InvoicesDataModal
                showModal={showInvoicesDataModal}
                invoicesData={invoicesData}
                providers={providers}
                onClose={() => this.setState({ showInvoicesDataModal: false })}
                onSubmit={(invoicesData) =>
                  this.setInvoicesProvider(invoicesData)
                }
              />
            )}
          </div>
          {/*  TO DO : Providers Data component */}
          <div className="step">
            <h4>3. Synchroniser les données de vos fournisseurs</h4>

            <div className="table-container">
              <div className="table-data table-company">
                <ErrorAPIModal
                  hasError={error}
                  onClose={() => this.setState({ error: false })}
                ></ErrorAPIModal>

                {providers.some(
                  (provider) => provider.footprintStatus == 404
                ) && (
                  <div className="alert alert-danger">
                    <p>
                      <i className="bi bi-x-lg me-2"></i> Certains comptes n'ont
                      pas pu être synchroniser. Vérifiez le numéro de siren et
                      resynchronisez les données.
                    </p>
                    <button
                      onClick={this.changeView}
                      value="unsync"
                      className="btn btn-secondary"
                    >
                      Comptes non synchronisés
                    </button>
                  </div>
                )}
                {isNextStepAvailable ? (
                  <div className="alert alert-success">
                    <p>
                      <i className="bi bi-check2 me-2"></i> Tous les comptes
                      ayant un n° de Siren ont bien été synchronisés.
                    </p>
                    {providers.some(
                      (provider) => provider.useDefaultFootprint
                    ) && (
                      <button
                        onClick={this.changeView}
                        value="undefined"
                        className={"btn btn-tertiary"}
                      >
                        Comptes sans numéro de siren (
                        {
                          providers.filter(
                            (provider) => provider.useDefaultFootprint
                          ).length
                        }
                        /{providers.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <p>
                      <i className="bi bi bi-exclamation-circle"></i> Les
                      empreintes de certains comptes doivent être synchronisées.
                    </p>
                    <button
                      onClick={() => this.synchroniseProviders()}
                      className="btn btn-secondary"
                      disabled={!isSyncButtonEnable}
                    >
                      <i className="bi bi-arrow-repeat"></i> Synchroniser les
                      données
                    </button>
                  </div>
                )}

                <div className="d-flex mb-3">
                  <div className="form-group me-2">
                    <select
                      onChange={this.changeView}
                      value={view}
                      className="form-select"
                    >
                      <option key="1" value="all">
                        Tous les comptes externes
                      </option>

                      <option key="2" value="undefined">
                        Comptes sans numéro de siren
                      </option>
                      <option key="3" value="unsync">
                        Non synchronisé
                      </option>
                      <option key="4" value="error">
                        Numéros de siren incorrects
                      </option>
                      <option key="5" value="significative">
                        Comptes significatifs
                      </option>
                      {someSignificativeProvidersUnidentified && (
                        <option key="6" value="significativeUnidentified">
                          Comptes significatifs non identifiés
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <select
                      value={nbItems}
                      onChange={this.changeNbItems}
                      className="form-select"
                    >
                      <option key="1" value="20">
                        20 fournisseurs par page
                      </option>
                      <option key="2" value="50">
                        50 fournisseurs par page
                      </option>
                      <option key="3" value="all">
                        Afficher tous les fournisseurs
                      </option>
                    </select>
                  </div>
                </div>
                {providers.length && (
                  <IdentifiedProvidersTable
                    nbItems={
                      nbItems == "all"
                        ? showedProviders.length
                        : parseInt(nbItems)
                    }
                    providers={showedProviders}
                    significativeProviders={significativeProviders}
                    financialData={financialData}
                    financialPeriod={financialPeriod}
                    refreshSection={this.refreshSection}
                  />
                )}
              </div>
            </div>
          </div>

          {fetching && (
            <ProgressBar
              message="Récupération des données fournisseurs..."
              progression={progression}
            />
          )}

          <div className="text-end">
            {allProvidersIdentified && (
              <div>
                <button
                  className={"btn btn-primary me-3"}
                  onClick={() => this.props.nextStep()}
                >
                  Secteurs d'activité <i className="bi bi-chevron-right"></i>
                </button>
                <button
                  className={"btn btn-secondary"}
                  id="validation-button"
                  onClick={() => this.props.nextStep()}
                >
                  Mesurer mon impact
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
            {!allProvidersIdentified && (
              <button
                className={"btn btn-secondary"}
                id="validation-button"
                onClick={() => this.props.nextStep()}
                disabled={!isNextStepAvailable}
              >
                Valider les fournisseurs
                <i className="bi bi-chevron-right"></i>
              </button>
            )}
          </div>
        </section>
      </Container>
    );
  }

  /* ---------- VIEW ---------- */

  changeNbItems = (event) => this.setState({ nbItems: event.target.value });
  changeView = (event) => this.setState({ view: event.target.value });

  /* ---------- UPDATES ---------- */

  refreshSection = async () => {
    // next step available
    const isNextStepAvailable = checkNextStepAvailable(
      this.props.financialData.providers
    );

    // data to sync
    const isSyncButtonEnable = checkSyncButtonEnable(
      this.props.financialData.providers
    );

    // significative prodiders
    let { minFpt, maxFpt } = this.state;
    let significativeProviders = await getSignificativeProviders(
      this.props.financialData.providers,
      minFpt,
      maxFpt,
      this.props.financialPeriod
    );

    this.setState({
      isNextStepAvailable,
      isSyncButtonEnable,
      significativeProviders,
    });
  };

 
  readInvoices = async (files) => {
    let invoicesData = [];
    let promises = [];
    for (let file of files) {
      let filePromise = new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(file);
      });
      promises.push(filePromise);
    }

    await Promise.all(promises).then(async (fileContents) => {
      for (let fileContent of fileContents) {
        let data = await pdf(fileContent);

        // VAT Identification Numbers
        let identificationNumbers = identificationPatterns
          .map((regex) => data.text.match(regex) || [])
          .reduce((a, b) => a.concat(b), [])
          .map((number) =>
            number.replace(/( |\r\n|\r|\n|RCS|SIREN|SIRET)/g, "")
          )
          .filter(
            (value, index, self) =>
              index === self.findIndex((item) => item == value)
          );
        // Dates
        let dates = (
          data.text.match(/[0-9]{2}\/[0-9]{2}\/(20|)[0-9]{2}/g) || []
        )
          .map(
            (date) =>
              "20" +
              (date.length == 8
                ? date.substring(6, 8)
                : date.substring(8, 10)) +
              date.substring(3, 5) +
              date.substring(0, 2)
          )
          .filter(
            (value, index, self) =>
              index === self.findIndex((item) => item == value)
          );
        // Amounts
        let amounts = (data.text.match(/[0-9| ]+(.|,)[0-9]{0,2}( |)€/g) || [])
          .map((amount) =>
            amount.replace(/€/g, "").replace(/ /g, "").replace(",", ".")
          )
          .map((amount) => parseFloat(amount))
          .filter(
            (value, index, self) =>
              index === self.findIndex((item) => item == value)
          );

        let invoiceData = {
          identificationNumbers,
          dates,
          amounts,
        };

        invoicesData.push(invoiceData);
      }
    });

    // start fetching data
    this.setState({ fetching: true, progression: 0 });

    let i = 0;
    let n = invoicesData.length;
    // group by provider
    let invoicesProviders = {};
    for (let invoiceData of invoicesData) {
      if (invoiceData.identificationNumbers.length == 1) {
        let idProvider = invoiceData.identificationNumbers[0];
        if (!Object.keys(invoicesProviders).includes(idProvider)) {
          let siren = getDefaultFootprintId(idProvider);
          let legalUnitData = {};
          await api
            .get("legalunitfootprint/" + siren)
            .then((res) => {
              let status = res.data.header.code;
              if (status == 200) {
                legalUnitData = res.data.legalUnit;
              }
            })
            .catch((err) => {
              this.setState({ error: true });
            });
          // fetch data
          invoicesProviders[idProvider] = {
            legalUnitData,
            invoices: [],
          };
        }
        // push data
        invoicesProviders[idProvider].invoices.push({
          dates: invoiceData.dates,
          amounts: invoiceData.amounts,
        });
      }
      // update progression
      i++;
      this.setState({ progression: Math.round((i / n) * 100) });
    }

    // default matching
    let defaultMatching = [];
    // for each provider identified in invoices
    for (let providerId of Object.keys(invoicesProviders)) {
      let providerData = invoicesProviders[providerId];
      let providersMatching = {};
      // for each invoice
      for (let invoiceData of providerData.invoices) {
        let expensesMatching = this.props.financialData.externalExpenses.filter(
          (expense) =>
            invoiceData.dates.includes(expense.date) &&
            invoiceData.amounts.includes(expense.amount)
        );
        // for each expense matching a date & an amount in invoices -> add to matching scores
        expensesMatching
          .map((expense) => expense.providerNum)
          .filter(
            (value, index, self) =>
              index === self.findIndex((item) => item == value)
          )
          .forEach(
            (providerNum) =>
              (providersMatching[providerNum] =
                (providersMatching[providerNum] || 0) + 1)
          );
      }
      // if a least a match
      if (Object.entries(providersMatching).length > 0) {
        // get providers (account aux) with max matching in invoices
        let maxMatches = Math.max(...Object.values(providersMatching));
        let providersWithMax = Object.entries(providersMatching)
          .filter(([_, nbMatches]) => nbMatches == maxMatches)
          .map(([providerNum, _]) => providerNum);
        // if a single provider has max -> add to default matching array
        if (providersWithMax.length == 1) {
          defaultMatching.push({
            providerId,
            denomination: providerData.legalUnitData.denomination,
            providerNum: providersWithMax[0],
          });
        }
      }
    }

    defaultMatching
      .filter(
        (value, _, self) =>
          self.filter((item) => item.providerId == value.providerId).length == 1
      )
      .forEach(
        (matching) =>
          (invoicesProviders[matching.providerId].matching =
            matching.providerNum)
      );

    return invoicesProviders;
  };

  setInvoicesProvider = (invoicesData) => {
    for (let invoiceData of Object.values(invoicesData)) {
      if (invoiceData.matching != "") {
        let provider = this.props.financialData.providers.find(
          (provider) => provider.providerNum == invoiceData.matching
        );
        if (provider) {
          provider.corporateId = invoiceData.legalUnitData.siren;
          provider.legalUnitData = invoiceData.legalUnitData;
          provider.useDefaultFootprint = false;
          provider.footprintStatus = 0;
        }
      } else {
        // remove data from provider
      }
    }

    this.setState({ invoicesData: null, showInvoicesDataModal: false });
  };


  /* ---------- FETCHING DATA ---------- */

  // fetch data for showed providers
  synchroniseProviders = async () => {
    // Hide the import providers modal after initiating synchronization

    // providers with fpt unfetched
    let providersToSynchronise = this.props.financialData.providers.filter(
      (provider) =>
        !provider.useDefaultFootprint && provider.footprintStatus != 200
    );
    // synchronise data
    this.setState({ fetching: true, progression: 0 });

    let i = 0;
    let n = providersToSynchronise.length;

    for (let provider of providersToSynchronise) {
      try {
        // fetch footprint
        await provider.updateFromRemote();
        // assign to expenses & investments
        this.props.financialData.externalExpenses
          .concat(this.props.financialData.investments)
          .filter((expense) => expense.providerNum == provider.providerNum)
          .forEach((expense) => {
            expense.footprint = provider.footprint;
          });
      } catch (error) {
        this.setState({ error: true });
        break;
      }
      i++;
      this.setState({ progression: Math.round((i / n) * 100) });
    }

    // significative prodiders
    let { minFpt, maxFpt } = this.state;
    let significativeProviders = await getSignificativeProviders(
      this.props.financialData.providers,
      minFpt,
      maxFpt,
      this.props.financialPeriod
    );

    // update state
    this.setState({
      fetching: false,
      progression: 0,
      view: "all",
      synchronised: this.props.financialData.providers.filter(
        (provider) => provider.footprintStatus == 200
      ).length,
      significativeProviders,
    });

    document.getElementById("step-3").scrollIntoView();
  };

  /* ----- MODALS ----- */

  closeInvoicesDataModal = () =>
    this.setState({
      showInvoicesDataModal: false,
      invoicesData: null,
      file: [],
    });
}

/* -------------------------------------------------- ANNEXES -------------------------------------------------- */

const checkNextStepAvailable = (providers) => {
  let nbSirenSynchronised = providers.filter(
    (provider) =>
      !provider.useDefaultFootprint && provider.footprintStatus == 200
  ).length;

  let nbSiren = providers.filter(
    (provider) => !provider.useDefaultFootprint
  ).length;
  if (nbSirenSynchronised == nbSiren && nbSiren != 0) {
    return true;
  } else {
    return false;
  }
};

// provider not using default footprint & footprint status not OK
const checkSyncButtonEnable = (providers) => {
  let enable = providers.some(
    (provider) =>
      (!provider.useDefaultFootprint && provider.footprintStatus != 200) ||
      provider.footprintStatus == 203
  );
  return enable;
};

const getShowedProviders = (view, providers, significativeProviders) => {
  switch (view) {
    case "undefined":
      return providers.filter((provider) => provider.useDefaultFootprint);
    case "unsync":
      return providers.filter((provider) => provider.footprintStatus != 200);
    case "error":
      return providers.filter((provider) => provider.footprintStatus == 404);
    case "significative": // significative provider
      return providers.filter((provider) =>
        significativeProviders.includes(provider.providerNum)
      );
    case "significativeUnidentified": // significative provider & no id set
      return providers.filter(
        (provider) =>
          significativeProviders.includes(provider.providerNum) &&
          provider.useDefaultFootprint
      );
    default:
      return providers;
  }
};
