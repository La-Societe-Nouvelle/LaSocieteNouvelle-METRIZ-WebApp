import React from "react";
import Dropzone from "react-dropzone";

// Table
import { IdentifiedProvidersTable } from "../../tables/IdentifiedCompaniesTable";

// Reader & Writers
import { XLSXFileWriterFromJSON } from "../../../src/writers/XLSXWriter";
import { CSVFileReader, processCSVCompaniesData } from "/src/readers/CSVReader";
import { XLSXFileReader } from "/src/readers/XLSXReader";

// Components
import { ProgressBar } from "../../popups/ProgressBar";
import { FileImportSuccessPopup } from "../../popups/MessagePopup";
import { Container } from "react-bootstrap";
import { ErrorApi } from "../../ErrorAPI";

// Formulas
import { getSignificativeProviders } from "/src/formulas/significativeLimitFormulas";

// API
import { fetchMaxFootprint, fetchMinFootprint } from "/src/services/DefaultDataService";

export class SirenSection extends React.Component 
{
  constructor(props) 
  {
    super(props);
    this.state = {
      significativeProviders: [],   // significative companies
      view: "all",
      nbItems: 20,
      fetching: false,
      file: null,
      progression: 0,
      synchronised: 0,
      popup: false,
      isSyncButtonEnable: checkSyncButtonEnable(props.financialData.providers),
      isNextStepAvailable: checkNextStepAvailable(props.financialData.providers),
      errorFile: false,
      error: false,
      minFpt: null,
      maxFpt: null
    };

    this.onDrop = (files) => 
    {
      if (files.length) {
        this.importFile(files[0]);
        this.openPopup();
        this.setState({ errorFile: false });
      } else {
        this.setState({ errorFile: true });
      }
    };
  }

  componentDidMount = async () =>
  {
    let minFpt = await fetchMinFootprint();
    let maxFpt = await fetchMaxFootprint();
    let significativeProviders = await getSignificativeProviders(
      this.props.financialData.providers,
      minFpt,maxFpt,
      this.props.financialPeriod
    );
    this.setState({significativeProviders,minFpt,maxFpt})
  }

  componentDidUpdate = () =>
  {
    
    // next step available
    const isNextStepAvailable = checkNextStepAvailable(this.props.financialData.providers);
    if (this.state.isNextStepAvailable!=isNextStepAvailable) {
      this.setState({ isNextStepAvailable });
    }
    // providers fpt to sync
    const isSyncButtonEnable = checkSyncButtonEnable(this.props.financialData.providers);
    if (this.state.isSyncButtonEnable!=isSyncButtonEnable) {
      this.setState({ isSyncButtonEnable });
    }
  }

  render() {
    const {
      significativeProviders,
      view,
      nbItems,
      fetching,
      progression,
      popup,
      isSyncButtonEnable,
      isNextStepAvailable,
      errorFile,
      error,
    } = this.state;

    const financialData = this.props.financialData;
    const financialPeriod = this.props.financialPeriod;

    const providers = financialData.providers.filter(provider => provider.periodsData.hasOwnProperty(financialPeriod.periodKey));

    //const providers = financialData.providers ;
    const showedProviders = getShowedProviders(view,providers,significativeProviders);
    const allProvidersIdentified = (providers.filter((provider) => provider.footprintStatus == 200).length == providers.length);

    const nbSignificativeProvidersUnidentified = providers.filter((provider) => provider.useDefaultFootprint && significativeProviders.includes(provider.providerNum)).length;
    const someSignificativeProvidersUnidentified = nbSignificativeProvidersUnidentified > 0;

    return (
      <Container fluid id="siren-section">
        <section className="step">
          <div className="section-title">
            <h2 className="mb-3">Etape 3 - Traitement des fournisseurs</h2>
            <h3 className="subtitle mb-4">
              Synchronisation des données grâce au numéro de siren
            </h3>
          </div>
          <div className="step mt-3">
            <h4>1. Télécharger et compléter le tableaux de vos fournisseurs</h4>
            <p className="form-text">
              Exportez la liste des comptes fournisseurs auxiliaires afin de
              renseigner les numéros siren de vos fournisseurs.
            </p>
            <button
              className="btn btn-primary mt-3"
              onClick={this.exportXLSXFile}
            >
              <i className="bi bi-download"></i> Exporter mes fournisseurs
            </button>
          </div>
          <div className="step">
            <h4>2. Importer le fichier excel complété</h4>

            <Dropzone
              onDrop={this.onDrop}
              accept={[".xlsx", ".csv"]}
              maxFiles={1}
            >
              {({ getRootProps, getInputProps }) => (
                <div className="dropzone-section">
                  <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    <p>
                      <i className="bi bi-file-arrow-up-fill"></i>
                      Glisser votre fichier ici
                    </p>
                    <p className="small">OU</p>
                    <p className="btn btn-primary">
                      Selectionner votre fichier
                    </p>
                  </div>
                </div>
              )}
            </Dropzone>

            {errorFile && (
              <div className="alert alert-danger">
                <p> <i className="bi bi-x-octagon"></i> Fichier incorrect</p>
              </div>
            )}
            {popup && (
              <FileImportSuccessPopup
                message="Vous pouvez maintenant synchroniser les
                données des fournisseurs."
                closePopup={() => this.closePopup()}
              />
            )}
          </div>
          <div className="step" id="step-3">
            <h4>3. Synchroniser les données de vos fournisseurs</h4>

            <div className="table-container">
              <div className="table-data table-company">
                {error && <ErrorApi />}
                {providers.some(provider => provider.footprintStatus == 404) && (
                  <div className="alert alert-danger">
                    <p>
                      <i className="bi bi-x-lg me-2"></i> Certains comptes n'ont pas pu être synchroniser. Vérifiez le numéro de siren et
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
                      <i className="bi bi-check2 me-2"></i> Tous les comptes ayant un
                      n° de Siren ont bien été synchronisés.
                    </p>
                    {providers.some((provider) => provider.useDefaultFootprint) && (
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
                ) : 
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
              </div>}


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
                      <option key="5" value="significative">Comptes significatifs</option>
                      {someSignificativeProvidersUnidentified && <option key="6" value="significativeUnidentified">Comptes significatifs non identifiés</option>}
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
                disabled={!isNextStepAvailable}>
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

  refreshSection = async () => 
  {
    // next step available
    const isNextStepAvailable = checkNextStepAvailable(this.props.financialData.providers);

    // data to sync
    const isSyncButtonEnable = checkSyncButtonEnable(this.props.financialData.providers);

    // significative prodiders
    let {minFpt,maxFpt} = this.state;
    let significativeProviders = await getSignificativeProviders(
      this.props.financialData.providers,
      minFpt,maxFpt,
      this.props.financialPeriod
    );

    this.setState({
      isNextStepAvailable,
      isSyncButtonEnable,
      significativeProviders 
    })
  }

  /* ---------- FILE IMPORT ---------- */

  importFile = (file) => {
    this.setState({ file });
    let extension = file.name.split(".").pop();

    switch (extension) {
      case "csv":
        this.importCSVFile(file);
        break;
      case "xlsx":
        this.importXLSXFile(file);
        break;
    }

    this.setState({ view: "all" });
  };

  // Import CSV File
  importCSVFile = (file) => 
  {
    let reader = new FileReader();

    reader.onload = async () => 
    {
      let CSVData = await CSVFileReader(reader.result);

      let companiesIds = await processCSVCompaniesData(CSVData);
      await Promise.all(
        Object.entries(companiesIds).map(async ([providerNum, corporateName, corporateId]) => {
          let provider  = providerNum ? 
              this.props.financialData.providers.find(provider => provider.providerNum==providerNum) 
            : this.props.financialData.providers.find(provider => provider.providerLib==corporateName);
          if (provider) {
            provider.corporateId = corporateId;
            provider.legalUnitData.denomination = denomination;
            provider.useDefaultFootprint = false;
            provider.footprintStatus = 0; // check if changes or use update()
          }
        })
      );
      this.setState({
        providers: this.props.financialData.providers,
      });
    };

    reader.readAsText(file);
  };

  // Import XLSX File
  importXLSXFile = async (file) => 
  {
    let reader = new FileReader();
    reader.onload = async () => {
      let XLSXData = await XLSXFileReader(reader.result);
      await Promise.all(
        XLSXData.map(async ({ accountNum, accountLib, denomination, siren, account }) => {
          if (account && !accountNum) accountNum = account;
          let provider = accountNum ? 
              this.props.financialData.providers.filter(provider => provider.providerNum == accountNum)[0]    // based on num
            : this.props.financialData.providers.filter(provider => provider.providerLib == accountLib)[0];   // based on lib
          if (provider) {
            provider.corporateId = siren;
            provider.legalUnitData.denomination = denomination;
            provider.useDefaultFootprint = false;
            provider.footprintStatus = 0; // check if changes or use update()
          }
          return;
        })
      );
      this.setState({
        providers: this.props.financialData.providers,
      });
    };

    reader.readAsArrayBuffer(file);
  };

  /* ---------- FILE EXPORT ---------- */

  // Export CSV File
  exportXLSXFile = async () => {
    let jsonContent = await this.props.financialData.providers
      .filter((provider) => provider.providerNum.charAt(0) != "_")
      .map((provider) => {
        return {
          accountNum: provider.providerNum,
          denomination: provider.corporateName,
          siren: provider.corporateId,
        };
      });
    let fileProps = { wsclos: [{ wch: 50 }, { wch: 20 }] };

    // write file (JSON -> ArrayBuffer)
    let file = await XLSXFileWriterFromJSON(
      fileProps,
      "fournisseurs",
      jsonContent
    );

    // trig download
    let blob = new Blob([file], { type: "application/octet-stream" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fournisseurs.xlsx";
    link.click();
  };

  /* ---------- FETCHING DATA ---------- */

  // fetch data for showed providers
  synchroniseProviders = async () => 
  {
    // providers with fpt unfetched
    let providersToSynchronise = this.props.financialData.providers.filter((provider) => !provider.useDefaultFootprint && provider.footprintStatus != 200);
    // synchronise data
    this.setState({ fetching: true, progression: 0 });

    let i = 0;
    let n = providersToSynchronise.length;

    for (let provider of providersToSynchronise) 
    {
      try 
      {
        // fetch footprint
        await provider.updateFromRemote();
        // assign to expenses & investments
        this.props.financialData.externalExpenses
          .concat(this.props.financialData.investments)
          .filter(expense => expense.providerNum==provider.providerNum)
          .forEach(expense => {
            expense.footprint = provider.footprint;
          });
      } 
      catch (error) {
        console.log(error)
        this.setState({ error: true });
        break;
      }
      i++;
      this.setState({ progression: Math.round((i / n) * 100) });
    }

    // significative prodiders
    let {minFpt,maxFpt} = this.state;
    let significativeProviders = await getSignificativeProviders(
      this.props.financialData.providers,
      minFpt,maxFpt,
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
      significativeProviders
    });

    document.getElementById("step-3").scrollIntoView();
  };

  /* ----- POP-UP ----- */

  closePopup = () => this.setState({ popup: false });
  openPopup = () => this.setState({ popup: true });
}

/* -------------------------------------------------- ANNEXES -------------------------------------------------- */

const checkNextStepAvailable = (providers) => 
{
  let nbSirenSynchronised = providers.filter(
    (provider) => !provider.useDefaultFootprint && provider.footprintStatus == 200
  ).length;

  let nbSiren = providers.filter((provider) => !provider.useDefaultFootprint).length;
  if (nbSirenSynchronised == nbSiren && nbSiren != 0) {
    return true;
  } else {
    return false;
  }
};

// provider not using default footprint & footprint status not OK
const checkSyncButtonEnable = (providers) => 
{
  let enable = providers.some((provider) => !provider.useDefaultFootprint && provider.footprintStatus != 200 || provider.footprintStatus == 203);
  return enable;
};

const getShowedProviders = (view,providers,significativeProviders) => 
{
  switch (view) {
    case "undefined": 
      return providers.filter((provider) => provider.useDefaultFootprint);
    case "unsync":    
      return providers.filter((provider) => provider.footprintStatus != 200);
    case "error":     
      return providers.filter((provider) => provider.footprintStatus == 404);
    case "significative":                     // significative provider
      return providers.filter((provider) => significativeProviders.includes(provider.providerNum));
    case "significativeUnidentified":        // significative provider & no id set
      return providers.filter((provider) => significativeProviders.includes(provider.providerNum) && provider.useDefaultFootprint);
    default:          return providers;
  }
};