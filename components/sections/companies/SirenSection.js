import React from "react";
import Dropzone from "react-dropzone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSync, faChevronRight, faFileExport, faWarning, faCheckCircle, faXmark } from "@fortawesome/free-solid-svg-icons";


import { CorporateIdTable } from "../../tables/CorporateIdTable";

import { XLSXFileWriterFromJSON } from "../../../src/writers/XLSXWriter";


import { CSVFileReader, processCSVCompaniesData } from "/src/readers/CSVReader";
import { XLSXFileReader } from "/src/readers/XLSXReader";
import { ProgressBar } from "../../popups/ProgressBar";

export class SirenSection extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            companies: props.session.financialData.companies,
            view: "all",
            nbItems: 20,
            fetching: false,
            file: null,
            progression: 0,
            nbCompaniesSynchronised: 0,
            nbwithoutCorporateId: props.session.financialData.companies.filter((company) => company.state != "siren").length
        };

    }

    componentDidUpdate(prevProps) {

        if (prevProps.session.financialData.companies !== this.state.companies) {
            this.setState({
                nbCompaniesSynchronised: this.state.companies.filter((company) => company.status == 200).length,
                nbwithoutCorporateId: this.state.companies.filter((company) => company.state != "siren").length
            });
        }

        // change view to main if array of companies with data unfetched empty
        if (
            this.state.view == "unsync" &&
            this.state.companies.filter((company) => company.status != 200).length ==
            0
        )
            this.setState({ view: "all" });

        if (
            this.state.view == "undefined" &&
            this.state.companies.filter((company) => company.state != "siren").length ==
            0
        )
            this.setState({ view: "all" });
    }

    render() {
        const {
            companies,
            view,
            nbItems,
            fetching,
            progression,
            file,
            nbCompaniesSynchronised,
            nbwithoutCorporateId
        } = this.state;

        const financialData = this.props.session.financialData;
        const setCompanyStep = this.props.setCompanyStep;

        // Filter commpanies showed
        const companiesShowed = filterCompanies(
            companies,
            view,
        );

        const isNextStepAvailable = nextStepAvailable(this.state);


        let buttonNextStep;

        if (this.state.companies.filter((company) => company.status == 200) == this.state.companies.length

        ) {
            buttonNextStep = <button
                className={"btn btn-secondary"}
                id="validation-button"
                onClick={this.props.submit}
            >
                Mesurer mon impact
                <FontAwesomeIcon icon={faChevronRight} />
            </button>

        }
        else {
            buttonNextStep = <button
                className={"btn btn-secondary"}
                id="validation-button"
                disabled={!isNextStepAvailable}
                onClick={() => setCompanyStep(2)}
            >
                Valider les fournisseurs
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        }

        return (
            <section className="container">

                <div className={"section-title"}>
                    <h2>&Eacute;tape 4 - Traitement des fournisseurs</h2>
                    <h3 className={"subtitle underline"}>
                        1. Synchronisation des données grâce au numéro de siren
                    </h3>
                </div>
                <div className="step-company mt-2">
                    <h4>
                        &Eacute;tape 1 : Téléchargez et complétez le tableaux de vos fournisseurs
                    </h4>
                    <p>
                        Exportez la liste des comptes fournisseurs auxiliaires afin de renseigner les numéros siren de vos fournisseurs.
                    </p>
                    <button className="btn btn-primary" onClick={this.exportXLSXFile}>
                        <FontAwesomeIcon icon={faFileExport} /> Exporter mes comptes fournisseurs
                    </button>
                </div>
                <div className="step-company">
                    <h4>
                        &Eacute;tape 2 : Importez le fichier excel complété
                    </h4>

                    <Dropzone onDrop={(files) => {files.map((file) => this.importFile(file))}}
                        maxFiles={1} multiple={false} >
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
                    {
                        file && Object.keys(file).length &&
                        <div className="alert alert-success">
                            <p>
                                <FontAwesomeIcon icon={faCheck} /> Votre fichier a bien été importé.
                            </p>
                        </div>

                    }

                </div>
                <div className="step-company">

                    <h4>&Eacute;tape 3 : Synchroniser les données de vos fournisseurs</h4>

                    <div className="table-container">
                        <div className="table-data table-company">
                            {companies.length ?
                                <>
                                    {
                                        nbCompaniesSynchronised != companies.length && (
                                            <div className="alert alert-warning">
                                                {
                                                    nbwithoutCorporateId > 0 && (
                                                        <p>
                                                            <FontAwesomeIcon icon={faWarning} /> {nbwithoutCorporateId}/{companies.length} comptes ne seront pas initialisés.
                                                        </p>
                                                    )
                                                }
                                                <button
                                                    onClick={() => this.synchroniseCompanies()}
                                                    className={"btn btn-warning"}
                                                >
                                                    <FontAwesomeIcon icon={faSync} /> Synchroniser les
                                                    données
                                                </button>
                                            </div>
                                        )

                                    }


                                    <div className="pagination">

                                        <div className="form-group">
                                            <select
                                                value={view}
                                                onChange={this.changeView}
                                                className="form-input"
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
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <select
                                                value={nbItems}
                                                onChange={this.changeNbItems}
                                                className="form-input"
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

                                    <CorporateIdTable
                                        nbItems={
                                            nbItems == "all"
                                                ? companiesShowed.length
                                                : parseInt(nbItems)
                                        }
                                        onUpdate={this.updateFootprints.bind(this)}
                                        companies={companiesShowed}
                                        financialData={financialData}
                                    />

                                    {
                                        !isNextStepAvailable && nbCompaniesSynchronised != 0 && (
                                            <div className="alert alert-error">
                                                <p>
                                                    <FontAwesomeIcon icon={faXmark} /> Certains comptes n'ont pas pu être synchronisé. Vérifiez le numéro de siren et resynchronisez les données.
                                                </p>
                                            </div>
                                        )
                                    }

                                    {
                                        isNextStepAvailable && (
                                            <div className="alert alert-success">
                                                <p>
                                                    <FontAwesomeIcon icon={faCheckCircle} />  Les données ont été synchronisées.
                                                </p>
                                            </div>
                                        )
                                    }

                                </>
                                :
                                ""
                            }
                        </div>
                    </div>


                </div>

                {fetching && (
                    <div className="popup">
                        <ProgressBar
                            message="Récupération des données fournisseurs..."
                            progression={progression}
                        />
                    </div>
                )}

                <div className="action">
                    {buttonNextStep}
                </div>

            </section>

        )

    }


    /* ---------- VIEW ---------- */

    changeView = (event) => this.setState({ view: event.target.value });
    changeNbItems = (event) => this.setState({ nbItems: event.target.value });
    /* ---------- UPDATES ---------- */

    updateFootprints = () => {
        this.props.session.updateFootprints();
        this.setState({ companies: this.props.session.financialData.companies });
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
                nbwithoutCorporateId: this.props.session.financialData.companies.filter((company) => company.state != "siren").length

            });
        };

        reader.readAsText(file);

    };

    // Import XLSX File
    importXLSXFile = (file) => {
        let reader = new FileReader();
        reader.onload = async () => {
            let XLSXData = XLSXFileReader(reader.result);
            await Promise.all(
                XLSXData.map(async ({ denomination, siren }) =>
                    this.props.session.financialData.updateCorporateId(
                        denomination,
                        siren
                    )
                )
            );
            this.setState({
                companies: this.props.session.financialData.companies,
                nbwithoutCorporateId: this.props.session.financialData.companies.filter((company) => company.state != "siren").length
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
                    denomination: company.corporateName,
                    siren: company.corporateId,
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

        let companiesToSynchronise = this.state.companies.filter((company) => company.state == "siren" && company.status != 200);
        // synchronise data
        this.setState({ fetching: true, progression: 0 });

        let i = 0;
        let n = companiesToSynchronise.length;

        for (let company of companiesToSynchronise) {
            await company.updateFromRemote()
            i++;
            this.setState({ progression: Math.round((i / n) * 100) });
        }

        // update view
        if (
            this.state.companies.filter((company) => company.status == 404).length > 0
        )
            this.state.view = "unsync";




        // update state
        this.setState({ fetching: false, progression: 0, nbCompaniesSynchronised: this.state.companies.filter((company) => company.status == 200).length });
        // update session
        this.props.session.updateFootprints();
    };


}
/* -------------------------------------------------- ANNEXES -------------------------------------------------- */


const nextStepAvailable = ({ companies }) => {
    return (companies.filter((company) => company.status == 200).length == companies.filter((company) => company.state == "siren").length);
};

/* ---------- DISPLAY ---------- */

const filterCompanies = (companies, view, significativeCompanies) => {
    switch (view) {
        case "undefined":
            return companies.filter((company) => company.state != "siren");
        case "unsync":
            return companies.filter((company) => company.status != 200);
        default:
            return companies;
    }
};