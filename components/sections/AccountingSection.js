// La Société Nouvelle

// React
import React from 'react';
import Dropzone from "react-dropzone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faChevronRight, faInfo, faFileExcel, faUpload, faCheck } from "@fortawesome/free-solid-svg-icons";

import { FECImportSection } from "./FECImportSection";

// Objects
import { FinancialData } from '../../src/FinancialData';

// Components
import { MessagePopup, MessagePopupErrors } from '../popups/MessagePopup';

// Readers
import { FECFileReader, FECDataReader } from '../../src/readers/FECReader';

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
            errorMessage: "",
            errors: [],
            files: [],
            disabledNextStep: true
        };
        this.isFormValid = () => {
            return this.state.corporateName == '' || this.state.files.length == 0;
        }
        this.onDrop = (files) => {
            this.setState({ files });
        };
        this.onClick = () => {
            this.importFECFile();
            this.submitCorporateName();
        }

    }

    componentDidMount() {
        window.scrollTo(0, 0)
    }


    render() {

        const {
            corporateName,
            importedData,
            errorFile,
            errorMessage,
            errors,
            files,
            disabledNextStep,
        } = this.state;

        return (
            <>
                {importedData ? (
                    <div id="aNouveauSection" className="container">
                        <section >
                            <div className={"section-title"}>
                                <h2>
                                    <FontAwesomeIcon icon={faArrowTrendUp} /> &Eacute;tape 1 - Importez vos flux comptable
                                </h2>
                                <h3 className={"subtitle underline"}>Identification du journal des A-Nouveaux</h3>
                   
                            </div>

                            <FECImportSection
                                FECData={importedData}
                                onChangeJournalANouveaux={this.updateMeta}
                            />
                        </section>
                        <section className={"action"}>
                            <div className="container-fluid">
                                <button className={"btn btn-secondary"} onClick={this.loadFECData}>
                                    J'ai identifié le journal des A-Nouveaux
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        </section>
                    </div>
                ) : (
                    <div id="importSection">
                        <section className="container">
                            <div className="section-title">
                                <h2>
                                    <FontAwesomeIcon icon={faArrowTrendUp} /> &Eacute;tape 1 - Importez
                                    vos flux comptable
                                </h2>
                                <h3 className={"subtitle underline"}>
                                    C'est parti
                                </h3>
                            </div>
                            <div className="row aln-center">
                                <div>
                                    <img src="/resources/illu_financialData.svg" alt="Financial Data Illustration" />
                                </div>
                                <div>
                                    <div id="form-container" className='step'>
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

                                        <Dropzone onDrop={this.onDrop} maxFiles={1} multiple={false} >
                                            {({ getRootProps, getInputProps }) => (
                                                <div className="dropzone-section">
                                                    <div {...getRootProps()} className="dropzone">
                                                        <input {...getInputProps()} />
                                                        <p>
                                                            Glisser votre fichier
                                                            <span>
                                                                ou cliquez ici pour sélectionner votre fichier
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </Dropzone>
                                    </div>
                                    {
                                        (files.length > 0) ?

                                            <div className={"alert alert-success"}>
                                                <h4>Votre fichier a bien été importé</h4>

                                                <ul>

                                                    {

                                                        files.map((file) => (
                                                            <li key={file.name} > <FontAwesomeIcon icon={faFileExcel} /> {file.name}
                                                            </li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>

                                            :

                                            <>

                                                <div className={"alert alert-info row aln-center"}>
                                                    <div className="f0">
                                                        <FontAwesomeIcon icon={faInfo} />
                                                    </div>
                                                    <div>
                                                        <p>
                                                            L’importation des écritures comptables s’effectue via un
                                                            Fichier d’Ecritures Comptables (FEC). Générez ce fichier{" "}
                                                            <b>
                                                                à partir de votre logiciel comptable, ou demandez-le
                                                                auprès de votre service comptable.
                                                            </b>
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="legend">
                                                    * Le fichier doit respecter les normes relatives à la structure du fichier (libellés des colonnes, séparateur tabulation ou barre verticale, encodage ISO 8859-15, etc.).
                                                </p>
                                            </>
                                    }
                                    {errorFile && (
                                        <div className={"alert alert-error"}>
                                            <h4>Erreur - Fichier</h4>
                                            <p>{errorMessage}</p>
                                            <p>{errors}</p>

                                        </div>
                                    )}
                                </div>
                            </div>

                        </section>
                        <section className="action">
                            <div className="container-fluid">

                                <button
                                    className={"btn btn-secondary"}
                                    onClick={this.onClick}
                                    disabled={this.isFormValid()}
                                >
                                    &Eacute;tape suivante
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>

                        </section>

                    </div>
                )}

            </>
        )


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
    }

    /* ---------- FEC IMPORT ---------- */

    // Import FEC File
    importFECFile = (event) =>                                                              // Load data from file to JSON (stashed in state)
    {
        let file = this.state.files[0];

        let reader = new FileReader();
        reader.onload = async () =>                                                           // Action after file loaded
        {
            try {
                let FECData = await FECFileReader(reader.result)                                  // read file (file -> JSON)
                this.setState({ importedData: FECData });                                           // update state with imported data
            }
            catch (error) { this.setState({ errorFile: true, errorMessage: error, errors: [] }); }   // show error(s) (file structure)
        }

        try {
            reader.readAsText(file, "iso-8859-1");                                              // Read file
        }
        catch (error) { this.setState({ errorFile: true, errorMessage: error, errors: [] }); }     // show error (file)
    }

    // Load imported data into financial data
    loadFECData = async () => {

        let nextFinancialData = await FECDataReader(this.state.importedData);                                                                 // read data from JSON (JSON -> financialData JSON)

        if (nextFinancialData.errors.length > 0)                                                                              // show error(s) (content)
        {
            nextFinancialData.errors.forEach(error => console.log(error));
            this.setState({ errorFile: true, errorMessage: "Erreur(s) relvée(s) : ", errors: nextFinancialData.errors, importedData: null });
        }
        else {
            // load year
            this.props.session.year = /^[0-9]{8}/.test(this.state.importedData.meta.lastDate) ? this.state.importedData.meta.lastDate.substring(0, 4) : "";

            // load financial data
            this.props.session.financialData = new FinancialData(nextFinancialData);
            this.props.session.financialData.companiesInitializer();
            this.props.session.financialData.initialStatesInitializer();

            // load impacts data
            this.props.session.impactsData.netValueAdded = this.props.session.financialData.getNetValueAdded();
            this.props.session.impactsData.knwDetails.apprenticeshipTax = nextFinancialData.KNWData.apprenticeshipTax;
            this.props.session.impactsData.knwDetails.vocationalTrainingTax = nextFinancialData.KNWData.vocationalTrainingTax;

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
    }

}
