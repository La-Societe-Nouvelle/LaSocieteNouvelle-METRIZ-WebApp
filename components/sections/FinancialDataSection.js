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
      errorFile: false
    }
  }
    
  render() 
  {
    const {selectedTable,importedData,errorFile} = this.state;
    const isDataLoaded = this.props.session.financialData.isFinancialDataLoaded;
    
    return (
      <div className="section-view">

        <div className="section-view-header">
          <h1>Ecritures comptables</h1>
        </div>

        <div className="section-view-main">

          <div className="group"><h3>Données comptables</h3>

            <div className="actions">
              <button onClick={() => {document.getElementById('import-fec').click()}}>
                Importer un fichier FEC
              </button>
              <input className="hidden" id="import-fec" visibility="collapse"
                      type="file" 
                      accept=".csv,.txt" 
                      onChange={this.importFECFile}/>
              {isDataLoaded &&
                <select value={selectedTable}
                        onChange={this.changeFinancialTable}>
                  <option key="1" value="incomeStatement">Compte de résultat</option>
                  <option key="2" value="immobilisations">Immobilisations</option>
                  <option key="3" value="expenses">Charges externes</option>
                  <option key="4" value="stocks">Stocks</option>
                </select>}
            </div>

            {this.buildtable(selectedTable)}

            <div className="notes">
            </div>

          </div>

          {importedData!=null &&
            <FECImportPopup FECData={importedData}
                            onValidate={this.loadFECData.bind(this)}/>}
          {errorFile &&
            <MessagePopup title="Erreur - Fichier" message="Le fichier n'est pas lisible." closePopup={() => this.setState({errorFile: false})}/>}

        </div>
      </div>
    )
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
        this.setState({errorFile: true});
      }
    }
    
    try {
      reader.readAsText(file, "iso-8859-1");
    } catch(error) {
      this.setState({errorFile: true});
    }
  }

  loadFECData = (FECData) => 
  {
    FECDataReader(FECData)
      .then(async (nextFinancialData) => 
      {
        await this.props.session.financialData.loadData(nextFinancialData);
        this.props.session.impactsData.netValueAdded = this.props.session.financialData.getNetValueAdded();
        this.loadKNWData(nextFinancialData.KNWData);
        this.checkNetValueAddedIndicator();
      })
      .then(() => 
      {
        this.setState({importedData: null});
        this.props.updateMenu();
      })
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
      let nextIndicator = this.props.session.getValueAddedIndicator(indic);
      if (nextIndicator!==this.props.session.netValueAddedFootprint.indicators[indic]) {
        this.props.session.validations = this.props.session.validations.filter(item => item != indic);
      }
    })
  }

}