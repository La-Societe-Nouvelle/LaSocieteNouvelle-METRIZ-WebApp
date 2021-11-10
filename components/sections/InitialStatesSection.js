// La Société Nouvelle

// React
import React from 'react';
import { ProgressBar } from '../popups/ProgressBar';

// Components
import { InitialStatesTable } from '/components/tables/InitialStatesTable'

/* ---------------------------------------------------------------- */
/* -------------------- INITIAL STATES SECTION -------------------- */
/* ---------------------------------------------------------------- */

export class InitialStatesSection extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state =
    {
      financialData: props.session.financialData,
      fetching: false,
      progressionSynchro: 0
    }
  }
    
  render()
  {
    const {financialData,fetching,progressionSynchro} = this.state;

    const isAllValid = !(financialData.immobilisations.concat(financialData.stocks)
                                                      .filter(account => account.initialState=="defaultData" && !account.dataFetched)
                                                      .length > 0);
    //
    const accountsShowed = financialData.immobilisations.concat(financialData.stocks);
    
    return (
      <div className="section-view">

        <div className="section-view-actions">
          <div className="sections-actions">
            <button onClick={() => document.getElementById('import-states').click()}>Importer un fichier (.json)</button>
            <input id="import-states" visibility="collapse"
                   type="file" accept=".json" 
                   onChange={this.importFile}/>
          </div>
          <div>
            <button id="validation-button" disabled={!isAllValid} onClick={this.props.submit}>Valider</button>
          </div>
        </div>

        <div className="section-view-header">
          <h1>Etats initiaux</h1>
        </div>

        <div className="section-view-main">

          <div className="notes">
            <p>Empreintes des comptes de stocks et des comptes d'immobilisations en début d'exercice.</p>
            {isAllValid && <p><img className="img" src="/resources/icon_good.png" alt="warning"/> Données complètes.</p>}
            {!isAllValid && <p><img className="img" src="/resources/icon_warning.png" alt="warning"/> L'empreinte de certains comptes ne sont pas initialisés.</p>}
          </div>

        {financialData.immobilisations.concat(financialData.stocks).length > 0 &&
          <div className="table-container">
            <div className="table-header">
              <div></div>
              <button onClick={() => this.synchroniseAll()}>Synchroniser les données</button>
            </div>
            <InitialStatesTable financialData={financialData} 
                                accountsShowed={accountsShowed}
                                onUpdate={this.updateFootprints.bind(this)}/>
          </div>}

        </div>

      {fetching &&
        <div className="popup">
          <ProgressBar message="Récupération des données par défaut..."
                        progression={progressionSynchro}/>
        </div>}

      </div>
    )
  }

  /* ---------- ACTIONS ---------- */
  
  // Synchronisation
  async synchroniseAll() 
  {
    this.setState({fetching: true, progression: 0})
    const stockAccountsToSync = this.props.session.financialData.immobilisations.concat(this.props.session.financialData.stocks).filter(immobilisation => immobilisation.initialState == "defaultData");
    
    let i=0; let n=stockAccountsToSync.length;
    for (let stockAccount of stockAccountsToSync) 
    {
      await stockAccount.updatePrevFootprintFromRemote();
      i++;
      this.setState({progression: Math.round((i/n)*100),financialData: this.props.session.financialData});
      await new Promise(r => setTimeout(r, 10));
    }
    this.props.session.updateFootprints();
    this.setState({fetching: false, progression:0, financialData: this.props.session.financialData});
    this.props.updateMenu();
  }

  fetchDefaultData = async (stockOrImmobilisation) => 
  {
    await stockOrImmobilisation.updatePrevFootprintFromRemote();
    this.setState({financialData: this.props.session.financialData});
  }

  /* ----- UPDATES ----- */

  updateFootprints = () => {
    this.props.session.updateFootprints();
    this.setState({financialData: this.props.session.financialData})
    this.props.updateMenu();
  }

  importFile = (event) =>
  {
    let file = event.target.files[0];
    this.importStates(file);
  }

  // import session (JSON data -> session)
  importStates = (file) =>
  {
    const reader = new FileReader();
    reader.onload = async () => 
    {
      // text -> JSON
      const prevSession = JSON.parse(reader.result);

      // JSON -> session
      this.props.session.financialData.loadInitialStates(prevSession);
      this.setState({financialData: this.props.session.financialData});
      this.props.updateMenu();
    }
    reader.readAsText(file);
  }

}