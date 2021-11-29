// La Société Nouvelle

// React
import React from 'react';

// Objects
import { FinancialData } from '../../src/FinancialData';

// Tables
import { MainAggregatesTable } from '../tables/MainAggregatesTable';
import { ImmobilisationsTable } from '../tables/ImmobilisationsTable';
import { IncomeStatementTable } from '../tables/IncomeStatementTable';
import { ExpensesTable } from '../tables/ExpensesTable';
import { StocksTable } from '../tables/StocksTable';

// Components
import { FECImportPopup } from '../popups/FECImportPopup';
import { MessagePopup, MessagePopupErrors } from '../popups/MessagePopup';

// Readers
import { FECFileReader, FECDataReader } from '../../src/readers/FECReader';

/* ----------------------------------------------------------- */
/* -------------------- FINANCIAL SECTION -------------------- */
/* ----------------------------------------------------------- */

export class FinancialDataSection extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = 
    {
      selectedTable: "incomeStatement",
      importedData: null,
      errorFile: false,
      errorMessage: "",
      errors: [],
    }
  }
    
  render() 
  {
    const {selectedTable,importedData,errorFile,errorMessage,errors} = this.state;
    
    if (!this.props.session.financialData.isFinancialDataLoaded) 
    {
      // Render if data not loaded -------------------------------------------------------------------------------- //
      return(
        <div className="section-view">

          <div className="section-view-actions">
            <div></div>
            <div>
              <button id="validation-button" disabled={true} onClick={this.props.submit}>Valider</button>
            </div>
          </div>

          <div className="section-top-notes">
            <p><b>Notes : </b>
              Le fichier FEC doit couvrir l'ensemble de l'exercice. 
              Il est conseillé de vérifier la validité de la structure du fichier avant l'import.
              La lecture du fichier peut entraîner des exceptions (écritures complexes, problème de correspondances, etc.). En cas d'erreur(s), n'hésitez pas à nous contacter.
            </p>
          </div>

          <div id="import-fec-container">
            <button className="big" onClick={() => {document.getElementById('import-fec').click()}}>
              Importer un fichier FEC
            </button>
            <input className="hidden" id="import-fec" visibility="collapse"
                    type="file" 
                    accept=".csv,.txt" 
                    onChange={this.importFECFile}/>
          </div>

        {importedData!=null &&
          <FECImportPopup FECData={importedData}
                          onValidate={this.loadFECData.bind(this)}/>}
        {errorFile &&
          <MessagePopupErrors title="Erreur - Fichier" message={errorMessage} errors={errors} closePopup={() => this.setState({errorFile: false})}/>}
        </div>)          
    } 
    else 
    {
      // Render if data loaded ------------------------------------------------------------------------------------ //
      return (
        <div className="section-view">

          <div className="section-view-actions">
            <div className="sections-actions">
              <button onClick={() => {document.getElementById('import-fec').click()}}>
                Importer un fichier FEC
              </button>
              <input className="hidden" id="import-fec" visibility="collapse"
                    type="file" 
                    accept=".csv,.txt" 
                    onChange={this.importFECFile}/>
              <select value={selectedTable}
                            onChange={this.changeFinancialTable}>
                <option key="1" value="mainAggregates">Soldes intermédiaires de gestion</option>
                <option key="2" value="incomeStatement">Compte de résultat</option>
                <option key="3" value="immobilisations">Immobilisations</option>
                <option key="4" value="expenses">Charges externes</option>
                <option key="5" value="stocks">Stocks</option>
              </select>
            </div>
            <div>
              <button id="validation-button" onClick={this.props.submit}>Valider</button>
            </div>
          </div>

          <div className="section-top-notes">
            <p><b>Notes : </b>
              Merci de vérifier la lecture des écritures comptables et l'exactitude des principaux agrégats financiers.
              Plusieurs vues sont disponibles via le menu déroulant ci-dessus.
            </p>
          </div>

          <div className="section-view-header">
            <h1>{getTitle(selectedTable)}</h1>
          </div>

          <div className="section-view-main">

            {this.buildtable(selectedTable)}

            {importedData!=null &&
              <FECImportPopup FECData={importedData}
                              onValidate={this.loadFECData.bind(this)}/>}
            {errorFile &&
              <MessagePopupErrors title="Erreur - Fichier" message={errorMessage} errors={errors} closePopup={() => this.setState({errorFile: false})}/>}

          </div>
        </div>
      )
    }
  }

  /* ---------- TABLE ---------- */

  buildtable = (selectedTable) => 
  {
    switch(selectedTable) 
    {
      case "mainAggregates" :   return(<MainAggregatesTable financialData={this.props.session.financialData}/>)       // Soldes intermediaires de gestion
      case "incomeStatement" :  return(<IncomeStatementTable financialData={this.props.session.financialData}/>)      // Compte de résultat
      case "immobilisations" :  return(<ImmobilisationsTable financialData={this.props.session.financialData}/>)      // Table des immobilisations
      case "stocks" :           return(<StocksTable financialData={this.props.session.financialData}/>)               // Table des stocks
      case "expenses" :         return(<ExpensesTable financialData={this.props.session.financialData}/>)             // Dépenses par compte de charges externes
    }
  }
  
  /* ---------- SELECTED TABLE ---------- */
  
  changeFinancialTable = (event) => this.setState({selectedTable: event.target.value})
  
  /* ---------- FEC IMPORT ---------- */

  // Import FEC File
  importFECFile = (event) =>                                                              // Load data from file to JSON (stashed in state)
  {
    let file = event.target.files[0];                                                     // File

    let reader = new FileReader();
    reader.onload = async () =>                                                           // Action after file loaded
    {
      try 
      {
        let FECData = await FECFileReader(reader.result)                                  // read file (file -> JSON)
        this.setState({importedData: FECData});                                           // update state with imported data
      } 
      catch(error) {this.setState({errorFile: true, errorMessage: error, errors: []});}   // show error(s) (file structure)
    }
    
    try 
    {
      reader.readAsText(file, "iso-8859-1");                                              // Read file
    }
    catch(error) {this.setState({errorFile: true, errorMessage: error, errors: []});}     // show error (file)
  }

  // Load imported data into financial data
  loadFECData = async (FECData) => 
  {
    let nextFinancialData = await FECDataReader(FECData);                                                                 // read data from JSON (JSON -> financialData JSON)

    if (nextFinancialData.errors.length > 0)                                                                              // show error(s) (content)
    {
      nextFinancialData.errors.forEach(error => console.log(error));
      this.setState({errorFile: true, errorMessage: "Erreur(s) relvée(s) : ", errors: nextFinancialData.errors, importedData: null});
    }
    else 
    {
      // load year
      this.props.session.year = /^[0-9]{8}/.test(FECData.meta.lastDate) ? FECData.meta.lastDate.substring(0,4) : "";

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
      
      // update state
      this.setState({importedData: null});
    }
  }

}

/* -------------------------------------------------- ANNEXES -------------------------------------------------- */

const getTitle = (selectedTable) =>
{
  switch(selectedTable)
  {
    case "mainAggregates" :   return("Soldes intermédiaires de gestion")
    case "incomeStatement" :  return("Compte de résultat")
    case "immobilisations" :  return("Immobilisations")
    case "expenses" :         return("Comptes de charges externes")
    case "stocks" :           return("Stocks")
  }
}