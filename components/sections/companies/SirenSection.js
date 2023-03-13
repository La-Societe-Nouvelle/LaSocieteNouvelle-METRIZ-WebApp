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
import { MessagePopup } from "../../popups/MessagePopup";
import { Container } from "react-bootstrap";
import { ErrorApi } from "../../ErrorAPI";

export class SirenSection extends React.Component 
{
  constructor(props) 
  {
    super(props);
    this.state = {
      providers: props.session.financialData.providers,
      providersShowed: props.session.financialData.providers,
      view: "all",
      nbItems: 20,
      fetching: false,
      file: null,
      progression: 0,
      synchronised: 0,
      popup: false,
      isDisabled: true,
      errorFile: false,
      error: false,
    };

    this.onDrop = (files) => {
      if (files.length) {
        this.importFile(files[0]);
        this.openPopup();
        this.setState({ isDisabled: false });
        this.setState({ errorFile: false });
      } else {
        this.setState({ errorFile: true });
      }
    };
  }

  handleChange = (event) => 
  {
    let view = event.target.value;
    switch (view) {
      case "undefined":
        return this.setState({
          providersShowed: this.state.providers.filter(
            (provider) => provider.state != "siren"
          ),
          view: view,
        });
      case "unsync":
        return this.setState({
          providersShowed: this.state.providers.filter(
            (provider) => provider.status != 200
          ),
          view: view,
        });
      case "error":
        return this.setState({
          providersShowed: this.state.providers.filter(
            (provider) => provider.status == 404
          ),
          view: view,
        });
      default:
        return this.setState({
          providersShowed: this.state.providers,
          view: view,
        });
    }
  };

  render() {
    const {
      providers,
      view,
      nbItems,
      fetching,
      progression,
      synchronised,
      providersShowed,
      popup,
      isDisabled,
      errorFile,
      error,
    } = this.state;

    const financialData = this.props.session.financialData;
    const financialPeriod = this.props.financialPeriod;

    const isNextStepAvailable = nextStepAvailable(providers);

    let buttonNextStep;
    if (
      this.state.providers.filter((provider) => provider.status == 200).length ==
      this.state.providers.length
    ) {
      buttonNextStep = (
        <div>
          <button
            onClick={() => this.props.nextStep()}
            className={"btn btn-primary me-3"}
          >
            Secteurs d'activité <i className="bi bi-chevron-right"></i>
          </button>
          <button
            className={"btn btn-secondary"}
            id="validation-button"
            onClick={this.props.submit}
          >
            Mesurer mon impact
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      );
    } else {
      buttonNextStep = (
        <button
          className={"btn btn-secondary"}
          id="validation-button"
          onClick={() => this.props.nextStep()}
          disabled={!isNextStepAvailable}>
          Valider les fournisseurs
          <i className="bi bi-chevron-right"></i>
        </button>
      );
    }

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
              <MessagePopup
                message="Votre fichier a bien été importé !"
                type="success"
                closePopup={() => this.closePopup()}
              />
            )}
          </div>
          <div className="step" id="step-3">
            <h4>3. Synchroniser les données de vos fournisseurs</h4>

            <div className="table-container">
              <div className="table-data table-company">
                {error && <ErrorApi />}
                { providers.some(provider => provider.status == "404") && (
                  <div className="alert alert-danger">
                    <p>
                      <i className="bi bi-x-lg me-2"></i> Certains comptes n'ont pas pu être synchroniser. Vérifiez le numéro de siren et
                      resynchronisez les données.
                    </p>
                    <button
                      onClick={this.handleChange}
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
                    {providers.filter((provider) => provider.state == "default")
                      .length > 0 && (
                      <button
                        onClick={this.handleChange}
                        value="undefined"
                        className={"btn btn-tertiary"}
                      >
                        Comptes sans numéro de siren (
                        {
                          providers.filter(
                            (provider) => provider.state == "default"
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
                  disabled={isDisabled}
                >
                  <i className="bi bi-arrow-repeat"></i> Synchroniser les
                  données
                </button>
              </div>}


                <div className="pagination">
                  <div className="form-group">
                    <select
                      onChange={this.handleChange}
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
                        ? providersShowed.length
                        : parseInt(nbItems)
                    }
                    onUpdate={this.updateFootprints.bind(this)}
                    providers={providersShowed}
                    financialData={financialData}
                    financialPeriod={financialPeriod}
                    checkSync={this.enableButton.bind(this)}
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
            {buttonNextStep}</div>
        </section>
      </Container>
    );
  }

  /* ---------- VIEW ---------- */

  changeNbItems = (event) => this.setState({ nbItems: event.target.value });

  /* ---------- UPDATES ---------- */

  updateFootprints = () => {
    this.props.session.updateFootprints();
    this.setState({ providers: this.props.session.financialData.providers });
  };

  enableButton = () => {
    let providers = this.props.session.financialData.providers;

    let nonSyncWithSiren = providers.filter(
      (provider) => provider.state == "siren" && provider.status != 200
    );

    let disable;

    nonSyncWithSiren.length > 0 ? (disable = false) : (disable = true);

    this.setState({ isDisabled: disable });
  };

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
          let provider  = providerNum ? this.props.session.financialData.getCompanyByAccount(providerNum) : this.props.session.financialData.getCompanyByName(corporateName);
          if (provider) {
            provider.corporateName = corporateName;
            provider.corporateId = corporateId;
            provider.state = "siren";
            provider.dataFetched = false; // check if changes or use update()
          }
        })
      );
      this.setState({
        providers: this.props.session.financialData.providers,
      });
    };

    reader.readAsText(file);
  };

  // Import XLSX File
  importXLSXFile = (file) => 
  {
    let reader = new FileReader();
    reader.onload = async () => {
      let XLSXData = await XLSXFileReader(reader.result);
      await Promise.all(
        XLSXData.map(async ({ accountNum, accountLib, denomination, siren, account }) => {
          if (account && !accountNum) accountNum = account;
          let provider = accountNum ? 
              this.props.session.financialData.providers.filter(provider => provider.providerNum == accountNum)[0]    // based on num
            : this.props.session.financialData.providers.filter(provider => provider.providerLib == accountLib)[0];   // based on lib
          if (provider) {
            provider.corporateId = siren;
            provider.corporateName = denomination;
            provider.state = "siren";
            provider.dataFetched = false; // check if changes or use update()
          }
        })
      );
      this.setState({
        providers: this.props.session.financialData.providers,
      });
    };

    reader.readAsArrayBuffer(file);
  };

  /* ---------- FILE EXPORT ---------- */

  // Export CSV File
  exportXLSXFile = async () => {
    console.log(this.props.session.financialData.providers)
    let jsonContent = await this.props.session.financialData.providers
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

  synchroniseProviders = async () => {
    let providersToSynchronise = this.state.providers.filter(
      (provider) => provider.state == "siren" && provider.status != 200
    );

    // synchronise data
    this.setState({ fetching: true, progression: 0 });

    let i = 0;
    let n = providersToSynchronise.length;

    for (let provider of providersToSynchronise) {
      try {
        await provider.updateFromRemote();
      } catch (error) {
        this.setState({ error: true });
        break;
      }
      i++;
      this.setState({ progression: Math.round((i / n) * 100) });
    }

    // update state

    this.setState({
      fetching: false,
      progression: 0,
      view: "all",
      providersShowed: this.state.providers,
      synchronised: this.state.providers.filter(
        (provider) => provider.status == 200
      ).length,
    });

    document.getElementById("step-3").scrollIntoView();

    this.enableButton();
    // update session
    //this.props.session.updateFootprints();
  };

  /* ----- POP-UP ----- */

  closePopup = () => this.setState({ popup: false });
  openPopup = () => this.setState({ popup: true });
}
/* -------------------------------------------------- ANNEXES -------------------------------------------------- */

const nextStepAvailable = (providers) => {
  let nbSirenSynchronised = providers.filter(
    (provider) => provider.state == "siren" && provider.status == 200
  ).length;

  let nbSiren = providers.filter((provider) => provider.state == "siren").length;
  if (nbSirenSynchronised == nbSiren && nbSiren != 0) {
    return true;
  } else {
    return false;
  }
};
