// La Société Nouvelle

// React
import React from 'react';

// Components
import { IncomeStatementTable } from '../tables/IncomeStatementTable';
import { FECImportPopup } from '../popups/FECImportPopup';

// Readers
import { FECFileReader, FECDataReader } from '../../src/readers/FECReader';

/* ---------- FINANCIAL MAIN TAB ---------- */

/*  Financial main tab :
 *    - FEC import button
 *    - financial main table
 */

export class FinancialMainTab extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      importedData: null,
    }
  }

  render()
  {
    const {financialData} = this.props;
    const {importedData} = this.state;

    const {amountExpensesFixed,amountDepreciationsFixed} = financialData;
  
    return (
      <div className="tab-view">

        <div className="group"><h3>Soldes intermédiaires de gestion</h3>

          <div className="actions">
            <button onClick={() => {document.getElementById('import-fec').click()}}>
              Importer un fichier FEC
            </button>
            <input className="hidden" id="import-fec" visibility="collapse"
                    type="file" 
                    accept=".csv,.txt" 
                    onChange={this.importFECFile}/>
          </div>

          <IncomeStatementTable financialData={financialData}
                                onUpdate={this.onUpdate}/>

          <div className="notes">
            {(amountExpensesFixed || amountDepreciationsFixed) &&
              <div className="note">
                <p>&nbsp;<img className="img locker" src="/resources/icon_locked.jpg" alt="locked"/>
                   &nbsp;Saisie supérieure à la somme des écritures renseignées. Cliquez sur le cadenas pour recalculer la somme totale.
                </p>
              </div>}
          </div>
          
        </div>

        {importedData!=null &&
          <FECImportPopup FECData={importedData}
                          onValidate={this.loadFECData.bind(this)}/>}

      </div>
    )
  }

  /* ----- UPDATES ----- */

  onUpdate = () => this.props.onUpdate()

  /* ----- FEC IMPORT ----- */

  importFECFile = (event) => 
  {
    let file = event.target.files[0];

    let reader = new FileReader();
    reader.onload = async () => FECFileReader(reader.result)
                                  .then((FECData) => this.setState({importedData: FECData}))
    reader.readAsText(file);
  }

  loadFECData = (FECData) => 
  {
    FECDataReader(FECData)
      .then(async (nextFinancialData) => 
      {
        await this.props.financialData.loadFECData(nextFinancialData);
        this.props.loadKNWData(nextFinancialData.KNWData);
      })
      .then(() => 
      {
        this.props.onUpdate();
        this.setState({importedData: null});
      })
  }

}