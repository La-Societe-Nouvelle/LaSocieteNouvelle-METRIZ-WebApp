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

/* ----------------------------------------------------------- */
/* -------------------- FINANCIAL SECTION -------------------- */
/* ----------------------------------------------------------- */

export class FinancialDataSection extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = 
    {
      importedData: null,
      selectedTable: "incomeStatement"
    }
  }
    
  render() 
  {
    const {importedData,selectedTable} = this.state;
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
    reader.onload = async () => FECFileReader(reader.result)
                                  .then((FECData) => this.setState({importedData: FECData}));
    reader.readAsText(file, "iso-8859-1");
  }

  loadFECData = (FECData) => 
  {
    FECDataReader(FECData)
      .then(async (nextFinancialData) => 
      {
        await this.props.session.financialData.loadData(nextFinancialData);
        this.loadKNWData(nextFinancialData.KNWData);
      })
      .then(() => 
      {
        this.setState({importedData: null});
      })
  }

  // update knw details from FEC data
  loadKNWData = ({apprenticeshipTax,vocationalTrainingTax}) => 
  {
    this.props.session.impactsData.knwDetails.apprenticeshipTax = apprenticeshipTax;
    this.props.session.impactsData.knwDetails.vocationalTrainingTax = vocationalTrainingTax;
    this.props.session.updateIndicator("knw");
  }

}