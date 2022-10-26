import React from "react";
import Dropzone from "react-dropzone";


// Table
import { CorporateIdTable } from "../../tables/CorporateIdTable";

// Reader & Writers
import { XLSXFileWriterFromJSON } from "../../../src/writers/XLSXWriter";
import { CSVFileReader, processCSVCompaniesData } from "/src/readers/CSVReader";
import { XLSXFileReader } from "/src/readers/XLSXReader";

// Components
import { ProgressBar } from "../../popups/ProgressBar";
import { MessagePopup } from "../../popups/MessagePopup";
import { Container } from "react-bootstrap";
import { ErrorApi } from "../../ErrorAPI";
export class SirenSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      companies: props.session.financialData.companies,
      companiesShowed: props.session.financialData.companies,
      view: "all",
      nbItems: 20,
      fetching: false,
      file: null,
      progression: 0,
      synchronised: 0,
      popup: false,
      isDisabled: false,
      errorFile : false,
      error : false,
    };

    this.onDrop = (files) => {
      if(files.length) {
        this.importFile(files[0]);
        this.openPopup();
        this.setState({isDisabled : false});
      }
      else {
        this.setState({errorFile : true});
      }
    };

  }


  handleChange = (event) => {
    let view = event.target.value;

    switch (view) {
      case "undefined":
        return this.setState({
          companiesShowed: this.state.companies.filter(
            (company) => company.state != "siren"
          ),
          view: view,
        });
      case "unsync":
        return this.setState({
          companiesShowed: this.state.companies.filter(
            (company) => company.status != 200
          ),
          view: view,
        });
        case "error":
          return this.setState({
            companiesShowed: this.state.companies.filter(
              (company) => company.status == 404
            ),
            view: view,
          });
      default:
        return this.setState({
          companiesShowed: this.state.companies,
          view: view,
        });
    }
  };

  render() {
    const {
      companies,
      view,
      nbItems,
      fetching,
      progression,
      synchronised,
      companiesShowed,
      popup,
      isDisabled,
      errorFile,
      error
    } = this.state;

    const financialData = this.props.session.financialData;
    const setCompanyStep = this.props.setCompanyStep;

    const isNextStepAvailable = nextStepAvailable(companies);

    let buttonNextStep;

    if (
      this.state.companies.filter((company) => company.status == 200).length ==
      this.state.companies.length
    ) {
      buttonNextStep = (
        <div>
            <button
              onClick={() => setCompanyStep(2)}
            className={"btn btn-primary me-3"}>
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
          onClick={() => setCompanyStep(2)}
          disabled= {!isNextStepAvailable}
        >
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
            <h4>1. Téléchargez et complétez le tableaux de vos fournisseurs</h4>
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
            <h4>2. Importez le fichier excel complété</h4>

             <Dropzone onDrop={this.onDrop} accept={[".xlsx", ".csv"]} maxFiles={1} >
              {({ getRootProps, getInputProps }) => (
                <div className="dropzone-section">
                  <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    <p>
                    <i className="bi bi-file-arrow-up-fill"></i>
                      Glisser votre fichier ici
                    </p>
                    <p className="small-text">OU</p>
                    <p className="btn btn-primary">
                      Selectionner votre fichier
                    </p>
                  </div>
                </div>
              )}
            </Dropzone>

            {errorFile && (
              <p className="alert alert-danger">
                 <i className="bi bi-check-circle-fill me-1"></i> Fichier incorrect
              </p>

            )}
            {popup && (
              <MessagePopup
                title="Importation des fournisseurs..."
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
                {!error && !isNextStepAvailable && synchronised != 0 && (
                  <div className="alert alert-error">
                    <p>
                    <i className="bi bi-x-lg"></i> Certains comptes n'ont
                      pas pu être synchronisés. Vérifiez le numéro de siren et
                      resynchronisez les données.
                    </p>
                    <button
                      onClick={this.handleChange}
                      value="unsync"
                      className={"btn btn-error"}
                    >
                      Afficher les données non synchronisées
                    </button>
                  </div>
                )}
                {isNextStepAvailable && synchronised.length > 0 ? (
                  <div className="alert alert-success">
                    <p>
                      <i className="bi bi-check2"></i> Tous les comptes
                      ayant un n° de Siren ont bien été synchronisés.
                    </p>
                    {companies.filter((company) => company.state == "default")
                      .length > 0 && (
                      <button
                        onClick={this.handleChange}
                        value="undefined"
                        className={"btn btn-success"}
                      >
                        Afficher les comptes sans siren (
                        {
                          companies.filter(
                            (company) => company.state == "default"
                          ).length
                        }
                        /{companies.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="alert alert-warning">
                      <p>
                        <i className="bi bi-exclamation-triangle"></i>  Les empreintes de
                        certains comptes doivent être synchronisées.
                      </p>
                    </div>
                    <button
                  onClick={() => this.synchroniseCompanies()}
                  className={"btn btn-secondary"}
                  disabled={isDisabled}
                >
                  <i className="bi bi-arrow-repeat"></i>  Synchroniser les données
                </button>
                  </>

                )}
                             

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
                {companies.length && (
                  <CorporateIdTable
                    nbItems={
                      nbItems == "all"
                        ? companiesShowed.length
                        : parseInt(nbItems)
                    }
                    onUpdate={this.updateFootprints.bind(this)}
                    companies={companiesShowed}
                    financialData={financialData}
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

          <div className="text-end">{buttonNextStep}</div>
        </section>
      </Container>
    );
  }

  /* ---------- VIEW ---------- */

  changeNbItems = (event) => this.setState({ nbItems: event.target.value });

  /* ---------- UPDATES ---------- */

  updateFootprints = () => {
    this.props.session.updateFootprints();
    this.setState({ companies: this.props.session.financialData.companies });
  };

  enableButton = () => {
    let companies = this.props.session.financialData.companies;

    let nonSyncWithSiren = companies.filter(
      (company) => company.state == "siren" && company.status != 200
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
  importCSVFile = (file) => {
    let reader = new FileReader();
    reader.onload = async () => {
      let CSVData = await CSVFileReader(reader.result);

      let companiesIds = await processCSVCompaniesData(CSVData);
      await Promise.all(
        Object.entries(companiesIds).map(async ([corporateName, corporateId]) =>
          this.props.session.financialData.updateCorporateId(
            corporateName,
            corporateId
          )
        )
      );
      this.setState({
        companies: this.props.session.financialData.companies,
      });
    };

    reader.readAsText(file);
  };

  // Import XLSX File
  importXLSXFile = (file) => {
    let reader = new FileReader();
    reader.onload = async () => {
      let XLSXData = await XLSXFileReader(reader.result);
      
      await Promise.all(
        XLSXData.map(async ({ account,denomination, siren }) =>
          this.props.session.financialData.updateCorporateId(
            account,
            denomination,
            siren
          )
        )
      );
      this.setState({
        companies: this.props.session.financialData.companies,
      });
    };

    reader.readAsArrayBuffer(file);
  };

  /* ---------- FILE EXPORT ---------- */

  // Export CSV File
  exportXLSXFile = async () => {
    let jsonContent = await this.props.session.financialData.companies
      .filter((company) => company.account.charAt(0) != "_")
      .map((company) => {
        return {
          account : company.account,
          denomination: company.corporateName,
          siren: company.corporateId
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

  synchroniseCompanies = async () => {
    let companiesToSynchronise = this.state.companies.filter(
      (company) => company.state == "siren" && company.status != 200
    );

    // synchronise data
    this.setState({ fetching: true, progression: 0 });

    let i = 0;
    let n = companiesToSynchronise.length;

    for (let company of companiesToSynchronise) {

      try {
        await company.updateFromRemote();
        
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
      companiesShowed: this.state.companies,
      synchronised: this.state.companies.filter(
        (company) => company.status == 200
      ).length,
    });

    document.getElementById("step-3").scrollIntoView();

    this.enableButton();
    // update session
    this.props.session.updateFootprints();
  };

  /* ----- POP-UP ----- */

  closePopup = () => this.setState({ popup: false });
  openPopup = () => this.setState({ popup: true });
}
/* -------------------------------------------------- ANNEXES -------------------------------------------------- */

const nextStepAvailable = (  companies ) => {

  let nbSirenSynchronised = companies.filter(company => company.state == "siren" && company.status == 200).length;

  let nbSiren = companies.filter((company) => company.state == "siren").length;

  if(nbSirenSynchronised == nbSiren) {
    return true;
  }else{
    return false;
  }
  
};
