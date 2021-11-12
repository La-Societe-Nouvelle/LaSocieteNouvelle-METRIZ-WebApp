// La Société Nouvelle

// React
import React from 'react';

// Components
import { ImmobilisationsTable } from '../tables/ImmobilisationsTable';
import { IncomeStatementTable } from '../tables/IncomeStatementTable';
import { ExpensesTable } from '../tables/ExpensesTable';
import { StocksTable } from '../tables/StocksTable';
import { FECImportPopup } from '../popups/FECImportPopup';

// Readers
import { FECFileReader, FECDataReader } from '../../src/readers/FECReader';

// Libraries
import indics from '/lib/indics.json';
import { MessagePopup } from '../popups/MessagePopup';
import { FinancialData } from '../../src/FinancialData';

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
    }
  }
    
  render() 
  {
    const {selectedTable,importedData,errorFile,errorMessage} = this.state;
    const isDataLoaded = this.props.session.financialData.isFinancialDataLoaded;
    
    if (!isDataLoaded) 
    {
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
          <MessagePopup title="Erreur - Fichier" message={errorMessage} closePopup={() => this.setState({errorFile: false})}/>}
      </div>
      )
    } 
    else 
    {
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
              <option key="1" value="incomeStatement">Compte de résultat</option>
              <option key="2" value="immobilisations">Immobilisations</option>
              <option key="3" value="expenses">Charges externes</option>
              <option key="4" value="stocks">Stocks</option>
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
            <MessagePopup title="Erreur - Fichier" message={errorMessage} closePopup={() => this.setState({errorFile: false})}/>}

        </div>
      </div>
    )}
  }

  buildtable = (selectedTable) => 
  {
    switch(selectedTable) 
    {
      case "incomeStatement" :  return(<IncomeStatementTable financialData={this.props.session.financialData}/>)
      case "immobilisations" :  return(<ImmobilisationsTable financialData={this.props.session.financialData}/>)
      case "expenses" :         return(<ExpensesTable financialData={this.props.session.financialData}/>)
      case "stocks" :           return(<StocksTable financialData={this.props.session.financialData}/>)
    }
  }
  
  /* ----- SELECTED TAB ----- */
  
  changeFinancialTable = (event) => this.setState({selectedTable: event.target.value})
  
  /* ----- VALID FINANCIAL DATA ----- */



  /* ----- UPDATES ----- */

  updateFootprints = () => this.props.session.updateFootprints()

  /* ----- FEC IMPORT ----- */

  importFECFile = (event) => 
  {
    let file = event.target.files[0];

    let reader = new FileReader();
    reader.onload = async () => 
    {
      try {
        let FECData = await FECFileReader(reader.result)
        this.setState({importedData: FECData});
      } catch(error) {
        this.setState({errorFile: true, errorMessage: error});
      }
    }
    
    try {
      reader.readAsText(file, "iso-8859-1");
    } catch(error) {
      this.setState({errorFile: true});
    }
  }

  loadFECData = async (FECData) => 
  {
    let nextFinancialData = await FECDataReader(FECData);

    if (nextFinancialData.errors.length > 0) {
      nextFinancialData.errors.forEach(error => console.log(error));
      this.setState({errorFile: true, errorMessage: nextFinancialData.errors[0], importedData: null});
    }
    else {
      // year
      this.props.session.year = /^[0-9]{8}/.test(FECData.meta.lastDate) ? FECData.meta.lastDate.substring(0,4) : "";
      // load financial data
      this.props.session.financialData = new FinancialData(nextFinancialData);
      this.props.session.financialData.companiesInitializer();
      this.props.session.financialData.initialStatesInitializer();
      // load impacts data
      this.props.session.impactsData.netValueAdded = this.props.session.financialData.getNetValueAdded();
      this.loadKNWData(nextFinancialData.KNWData);
      // check indicator
      this.checkNetValueAddedIndicator();
      // update progression
      this.props.session.progression = 2;
      // update state
      this.setState({importedData: null});
    }
  }

  // update knw details from FEC data
  loadKNWData = ({apprenticeshipTax,vocationalTrainingTax}) => 
  {
    this.props.session.impactsData.knwDetails.apprenticeshipTax = apprenticeshipTax;
    this.props.session.impactsData.knwDetails.vocationalTrainingTax = vocationalTrainingTax;
    this.props.session.updateIndicator("knw");
  }

  checkNetValueAddedIndicator = async () =>
  {
    Object.keys(indics).forEach((indic) => 
    {
      let nextIndicator = this.props.session.getNetValueAddedIndicator(indic);
      if (nextIndicator!==this.props.session.netValueAddedFootprint.indicators[indic]) {
        this.props.session.validations = this.props.session.validations.filter(item => item != indic);
      }
    })
  }
}

const getTitle = (selectedTable) =>
{
  switch(selectedTable)
  {
    case "incomeStatement" :  return("Compte de résultat")
    case "immobilisations" :  return("Immobilisations")
    case "expenses" :         return("Comptes de charges externes")
    case "stocks" :           return("Stocks")
  }
}