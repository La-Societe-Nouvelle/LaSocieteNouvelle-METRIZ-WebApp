// La Société Nouvelle

// React
import React from "react";
import Dropzone from "react-dropzone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faChevronRight,
  faCheckCircle,
  faFileUpload,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";

import { FECImportSection } from "./FECImportSection";

// Objects
import { FinancialData } from "/src/FinancialData";

// Components
import { MessagePopup } from "../../popups/MessagePopup";

// Readers
import { FECFileReader, FECDataReader } from "/src/readers/FECReader";
import { sendReportToSupport } from "../../../pages/api/mail-api";

/* ----------------------------------------------------------- */
/* -------------------- FINANCIAL SECTION -------------------- */
/* ----------------------------------------------------------- */

export class AccountingSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      corporateName: props.session.legalUnit.corporateName || "",
      importedData: null,
      errorFile: false,
      errorMail: false,
      errorMessage: "",
      errors: [],
      files: [],
      disabledNextStep: true,
      popup: false,
    };
    this.isFormValid = () => {
      return (
        this.state.corporateName == "" ||
        this.state.files.length == 0 ||
        this.state.errorFile == true
      );
    };
    this.onDrop = (files) => {
      this.setState({ files: files, popup: true, errorFile: false, errorMail : false});
    };
    this.onClick = () => {
      this.importFECFile();
      this.submitCorporateName();
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const {
      corporateName,
      importedData,
      errorFile,
      errorMessage,
      errors,
      files,
      popup,
      errorMail,
    } = this.state;

    return (
      <>
        {importedData ? (
          <div id="aNouveauSection" className="container-fluid">
            <section className="step">
              <div className="section-title">
                <h2>
                  <FontAwesomeIcon icon={faArrowTrendUp} /> &Eacute;tape 1 -
                  Importez vos flux comptable
                </h2>
                <h3 className="subtitle underline">
                  Identification du journal des A-Nouveaux
                </h3>
              </div>

              <FECImportSection
                FECData={importedData}
                onChangeJournalANouveaux={this.updateMeta}
              />
              <div className="align-right">
                <button
                  className="btn btn-secondary"
                  onClick={this.loadFECData}
                >
                  J'ai identifié le journal des A-Nouveaux
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div id="importSection" className="container-fluid">
            <section className="step">
              <div className="row">
                <div className="illus-container">
                  <div className="section-title">
                    <h2>
                      <FontAwesomeIcon icon={faArrowTrendUp} /> &Eacute;tape 1 -
                      Importez vos flux comptable
                    </h2>
                    <h3 className="subtitle underline">C'est parti !</h3>
                  </div>
                  <img
                    src="/resources/illu_financialData.svg"
                    alt="Financial Data Illustration"
                  />
                </div>
                <div className="form-container">
                  <div className="form-group">
                    <label>Dénomination / Nom du projet</label>
                    <input
                      id="siren-input"
                      className="form-input w100"
                      type="text"
                      value={corporateName}
                      onChange={this.onCorporateNameChange}
                      onKeyPress={this.onEnterPress}
                    />
                  </div>
                  <label>Importer vos fichiers comptables FEC*</label>

                  <Dropzone onDrop={this.onDrop} maxFiles={1} multiple={false}>
                    {({ getRootProps, getInputProps }) => (
                      <div className="dropzone-section">
                        <div {...getRootProps()} className="dropzone">
                          <input {...getInputProps()} />
                          <p>
                            <FontAwesomeIcon
                              icon={faFileUpload}
                              className="upload-icon"
                            />
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
                  {files.length > 0 && !errorFile && (
                    <div className={"alert alert-info"}>
                      <ul>
                        {files.map((file) => (
                          <li key={file.name}>
                            {" "}
                            <FontAwesomeIcon icon={faFileUpload} /> {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="legend">
                    * Le fichier doit respecter les normes relatives à la
                    structure du fichier (libellés des colonnes, séparateur
                    tabulation ou barre verticale, encodage ISO 8859-15, etc.).
                  </p>
                  <div className="alert alert-info">
                    <p>
                      L’importation des écritures comptables s’effectue via un
                      Fichier d’Ecritures Comptables (FEC). Générez ce fichier{" "}
                      <b>
                        à partir de votre logiciel comptable, ou demandez-le
                        auprès de votre service comptable.
                      </b>
                    </p>
                  </div>
                  {popup && (
                    <MessagePopup
                      title="Votre fichier a bien été importé !"
                      message=""
                      icon={faCheckCircle}
                      type="success"
                      closePopup={() => this.closePopup()}
                    />
                  )}

                  {errorFile && (
                    <>
                      <div className={"alert alert-error"}>
                        <div>
                          <h4>Erreur</h4>
                          <p>{errorMessage}</p>
                          {errors.map((error, index) => (
                            <p key={index}> - {error}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        {errors.length > 0 && (
                          <>
                            <button
                              className="btn btn-primary"
                              onClick={() => this.sendErrorReport(errors)}
                            >
                              <FontAwesomeIcon icon={faExclamation} /> Envoyer
                              un rapport d'erreur
                            </button>

                            {errorMail && (
                              <p className="small-text">{errorMail}</p>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  )}
                  <div className="align-right">
                    <button
                      className={"btn btn-secondary"}
                      onClick={this.onClick}
                      disabled={this.isFormValid()}
                    >
                      &Eacute;tape suivante
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </>
    );
  }

  onCorporateNameChange = (event) =>
    this.setState({ corporateName: event.target.value });
  onEnterPress = (event) => {
    if (event.which == 13) event.target.blur();
  };

  submitCorporateName = () => {
    this.props.session.legalUnit.corporateName = this.state.corporateName;
  };

  updateMeta = (meta) => {
    this.state.importedData.meta = meta;
  };

  /* ---------- FEC IMPORT ---------- */

  // Import FEC File
  importFECFile = (
    event // Load data from file to JSON (stashed in state)
  ) => {
    let file = this.state.files[0];

    let reader = new FileReader();
    reader.onload = async () =>
      // Action after file loaded
      {
        try {
          let FECData = await FECFileReader(reader.result); // read file (file -> JSON)
          this.setState({ importedData: FECData }); // update state with imported data
        } catch (error) {
          this.setState({ errorFile: true, errorMessage: error, errors: [] });
        } // show error(s) (file structure)
      };

    try {
      reader.readAsText(file, "iso-8859-1"); // Read file
    } catch (error) {
      this.setState({ errorFile: true, errorMessage: error, errors: [] });
    } // show error (file)
  };

  // Load imported data into financial data
  loadFECData = async () => {
    let nextFinancialData = await FECDataReader(this.state.importedData); // read data from JSON (JSON -> financialData JSON)

    if (nextFinancialData.errors.length > 0) {
      // show error(s) (content)
      nextFinancialData.errors.forEach((error) => console.log(error));
      this.setState({
        errorFile: true,
        errorMessage: "Erreur(s) relevée(s) : ",
        errors: nextFinancialData.errors,
        importedData: null,
      });
    } else {
      // load year
      this.props.session.year = /^[0-9]{8}/.test(
        this.state.importedData.meta.lastDate
      )
        ? this.state.importedData.meta.lastDate.substring(0, 4)
        : "";

      // load financial data
      this.props.session.financialData = new FinancialData(nextFinancialData);
      this.props.session.financialData.companiesInitializer();
      this.props.session.financialData.initialStatesInitializer();

      // load impacts data
      this.props.session.impactsData.netValueAdded =
        this.props.session.financialData.getNetValueAdded();
      this.props.session.impactsData.knwDetails.apprenticeshipTax =
        nextFinancialData.KNWData.apprenticeshipTax;
      this.props.session.impactsData.knwDetails.vocationalTrainingTax =
        nextFinancialData.KNWData.vocationalTrainingTax;

      // update footprints
      this.props.session.updateFootprints();

      // update validations
      this.props.session.checkValidations();

      // update progression
      this.props.session.progression = 2;

      this.setState({ disabledNextStep: false });
      // update state
      //this.setState({ importedData: null });

      this.props.submit();
    }
  };
  /* ----- POP-UP ----- */

  closePopup = () => this.setState({ popup: false });
  openPopup = () => this.setState({ popup: true });

  sendErrorReport = async (errors) => {
    const res = await sendReportToSupport(errors);

    res.status < 300
      ? this.setState({ errorMail: "✔ Le rapport d'erreur a bien été envoyé." })
      : this.setState({
          errorMail:
            "✖ Echec lors de l'envoi du rapport d'erreur. Si le problème persiste, veuillez contacter le support.",
        });
  };
}
