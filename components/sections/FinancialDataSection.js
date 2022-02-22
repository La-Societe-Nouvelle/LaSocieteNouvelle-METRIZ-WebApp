// La Société Nouvelle

// React
import React from "react";
import Dropzone from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faChevronRight } from "@fortawesome/free-solid-svg-icons";

// Objects
import { FinancialData } from "../../src/FinancialData";

// Tables
import { MainAggregatesTable } from "../tables/MainAggregatesTable";
import { ImmobilisationsTable } from "../tables/ImmobilisationsTable";
import { IncomeStatementTable } from "../tables/IncomeStatementTable";
import { ExpensesTable } from "../tables/ExpensesTable";
import { StocksTable } from "../tables/StocksTable";

// Components
import { FECImportPopup } from "../popups/FECImportPopup";
import { MessagePopup, MessagePopupErrors } from "../popups/MessagePopup";

// Readers
import { FECFileReader, FECDataReader } from "../../src/readers/FECReader";
import { FECImportSection } from "./FECImportSection";

/* ----------------------------------------------------------- */
/* -------------------- FINANCIAL SECTION -------------------- */
/* ----------------------------------------------------------- */

export class FinancialDataSection extends React.Component {
  constructor(props) {
    super(props);
    this.onDrop = (files) => {
      this.setState({ files });
      this.setState({ disabled: false });
    };
    this.state = {
      corporateName: props.session.legalUnit.corporateName || "",
      selectedTable: "incomeStatement",
      importedData: null,
      disabled: true,
      errorFile: false,
      errorMessage: "",
      errors: [],
      files: [],
    };
  }

  render() {
    const {
      corporateName,
      selectedTable,
      importedData,
      errorFile,
      errorMessage,
      errors,
    } = this.state;

    const files = this.state.files.map((file) => (
      <div className="files">
        <FontAwesomeIcon icon={faFileExcel} />
        <p key={file.name}>{file.name}</p>
      </div>
    ));

    if (!this.props.session.financialData.isFinancialDataLoaded) {
      // Render if data not loaded -------------------------------------------------------------------------------- //
      return (
        <>
          <section className={"section-view financial"}>
            <div className={"section-title container-fluid "}>
              <h2>&Eacute;tape 1 - Importez vos flux comptable</h2>
            </div>
            {importedData ? (
              <FECImportSection
                FECData={importedData}
                onValidate={this.loadFECData.bind(this)}
              />
            ) : (
              <>
                <h3 className={"subtitle underline container-fluid"}>
                  C'est parti
                </h3>
                <div className={"section-container container-fluid"}>
                  <div className="section-illu">
                    <img src="/resources/illu_financialData.png" alt="" />
                  </div>
                  <div className="section-form">
                    <div className="form-group">
                    <label>Dénomination / Nom du projet</label>
                    <input
                      id="siren-input"
                      className="form-input"
                      type="text"
                      value={corporateName}
                      onChange={this.onCorporateNameChange}
                      onKeyPress={this.onEnterPress}
                    />

                    </div>
   
                    <h3>Importer vos fichiers comptables FEC*</h3>

                    <Dropzone onDrop={this.onDrop}>
                      {({ getRootProps, getInputProps }) => (
                        <div className="dropzone-section">
                          <div {...getRootProps()} className="dropzone">
                            <input {...getInputProps()} />
                            <p>
                              Glisser vos fichiers
                              <span>
                                ou cliquez ici pour sélectionner votre fichier
                              </span>
                            </p>
                          </div>
                          {files}
                        </div>
                      )}
                    </Dropzone>

                    <div className="section-info">
                      <p>
                        L’importation des écritures comptables s’effectue via un
                        Fichier d’Ecritures Comptables (FEC). Générez ce fichier{" "}
                        <b>
                          {" "}
                          à partir de votre logiciel comptable, ou demandez-le
                          auprès de votre service comptable.
                        </b>
                      </p>
                    </div>
                    <p className="info">
                      * Le fichier doit respecter les normes relatives à la
                      structure du fichier (libellés des colonnes, séparateur
                      tabulation ou barre verticale, encodage ISO 8859-15,
                      etc.).
                    </p>
                  </div>
                </div>
                <aside className="action container">
                  <button
                    className={"btn btn-secondary"}
                    onClick={this.importFECFile}
                    disabled={this.state.disabled}
                  >
                    &Eacute;tape suivante
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </aside>
              </>
            )}
          </section>

          {errorFile && (
            <MessagePopupErrors
              title="Erreur - Fichier"
              message={errorMessage}
              errors={errors}
              closePopup={() => this.setState({ errorFile: false })}
            />
          )}
        </>
      );
    } else {
      // Render if data loaded ------------------------------------------------------------------------------------ //
      return (
        <>
          <div className="container-fluid">
            <div className={"section-title"}>
              <h2>&Eacute;tape 2 - Validez votre import</h2>
            </div>
            <div className={"alert alert-info"} role="alert">
              <strong>Bravo !</strong> Votre import a été réalisé avec succès!
            </div>
            <div>
              <p>
                Par mesure de précaution, vérifiez l’exactitude des agrégats
                financiers nécessitant une validation manuelle. La lecture des
                écritures peut entraîner des exceptions (problèmes de lecture)
                dans le cas où certains flux ne peuvent être tracés. Ces
                exceptions interviennent notamment en cas d’écriture unique pour
                les opérations diverses.
              </p>
            </div>
            <div className="table-container">
              <div className="table-menu">
                <button
                  key={1}
                  value="incomeStatement"
                  onClick={this.changeFinancialTable}
                  className={
                    selectedTable == "incomeStatement" || "" ? "active" : ""
                  }
                >
                  Comptes de résultat
                </button>
                <button
                  key={2}
                  value="mainAggregates"
                  onClick={this.changeFinancialTable}
                  className={
                    selectedTable == "mainAggregates" || "" ? "active" : ""
                  }
                >
                  Soldes intermédiaires de gestion
                </button>
                <button
                  key={3}
                  value="immobilisations"
                  onClick={this.changeFinancialTable}
                  className={selectedTable == "immobilisations" ? "active" : ""}
                >
                  Immobilisations
                </button>
                <button
                  key={4}
                  value="expenses"
                  onClick={this.changeFinancialTable}
                  className={selectedTable == "expenses" ? "active" : ""}
                >
                  Charges externes
                </button>
                <button
                  key={5}
                  value="stocks"
                  onClick={this.changeFinancialTable}
                  className={selectedTable == "stocks" ? "active" : ""}
                >
                  Stocks
                </button>
              </div>

              <div className="table-data">
                {this.buildtable(selectedTable)}

                {importedData != null && (
                  <FECImportPopup
                    FECData={importedData}
                    onValidate={this.loadFECData.bind(this)}
                  />
                )}
                {errorFile && (
                  <MessagePopupErrors
                    title="Erreur - Fichier"
                    message={errorMessage}
                    errors={errors}
                    closePopup={() => this.setState({ errorFile: false })}
                  />
                )}
              </div>
            </div>
          </div>
          <div className={"action container"}>
            <button className={"btn btn-secondary"} onClick={this.props.submit}>
              Valider l'import
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </>
      );
    }
  }

  onCorporateNameChange = (event) =>
    this.setState({ corporateName: event.target.value });
  onEnterPress = (event) => {
    if (event.which == 13) event.target.blur();
  };

  submitCorporateName = () => {
    this.props.session.legalUnit.corporateName = this.state.corporateName;
    this.props.submit();
  };
  /* ---------- TABLE ---------- */

  buildtable = (selectedTable) => {
    switch (selectedTable) {
      case "mainAggregates":
        return (
          <MainAggregatesTable
            financialData={this.props.session.financialData}
          />
        ); // Soldes intermediaires de gestion
      case "incomeStatement":
        return (
          <IncomeStatementTable
            financialData={this.props.session.financialData}
          />
        ); // Compte de résultat
      case "immobilisations":
        return (
          <ImmobilisationsTable
            financialData={this.props.session.financialData}
          />
        ); // Table des immobilisations
      case "stocks":
        return <StocksTable financialData={this.props.session.financialData} />; // Table des stocks
      case "expenses":
        return (
          <ExpensesTable financialData={this.props.session.financialData} />
        ); // Dépenses par compte de charges externes
    }
  };

  /* ---------- SELECTED TABLE ---------- */

  changeFinancialTable = (event) =>
    this.setState({ selectedTable: event.target.value });

  /* ---------- FEC IMPORT ---------- */

  // Import FEC File
  importFECFile = (
    event // Load data from file to JSON (stashed in state)
  ) => {
    //let file = event.target.files[0]; // File
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
  loadFECData = async (FECData) => {
    let nextFinancialData = await FECDataReader(FECData); // read data from JSON (JSON -> financialData JSON)

    if (nextFinancialData.errors.length > 0) {
      // show error(s) (content)
      nextFinancialData.errors.forEach((error) => console.log(error));
      this.setState({
        errorFile: true,
        errorMessage: "Erreur(s) relvée(s) : ",
        errors: nextFinancialData.errors,
        importedData: null,
      });
    } else {
      // load year
      this.props.session.year = /^[0-9]{8}/.test(FECData.meta.lastDate)
        ? FECData.meta.lastDate.substring(0, 4)
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

      // update state
      this.setState({ importedData: null });
    }
  };
}

/* -------------------------------------------------- ANNEXES -------------------------------------------------- */

const getTitle = (selectedTable) => {
  switch (selectedTable) {
    case "mainAggregates":
      return "Soldes intermédiaires de gestion";
    case "incomeStatement":
      return "Compte de résultat";
    case "immobilisations":
      return "Immobilisations";
    case "expenses":
      return "Comptes de charges externes";
    case "stocks":
      return "Stocks";
  }
};
