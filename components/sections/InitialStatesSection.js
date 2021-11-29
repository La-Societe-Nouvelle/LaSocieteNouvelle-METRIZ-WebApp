// La Société Nouvelle

// React
import React from 'react';

// Components
import { InitialStatesTable } from '/components/tables/InitialStatesTable'
import { ProgressBar } from '../popups/ProgressBar';
import { MessagePopup } from '../popups/MessagePopup';

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
      syncProgression: 0,
      showMessage: false,
      titlePopup: "",
      message: ""
    }
  }
    
  render()
  {
    const {financialData,fetching,syncProgression,showMessage,titlePopup,message} = this.state;
    const accountsShowed = financialData.immobilisations.concat(financialData.stocks);

    const isNextStepAvailable = nextStepAvailable(this.state);
    
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
            <button id="validation-button" disabled={!isNextStepAvailable} onClick={this.props.submit}>Valider</button>
          </div>
        </div>

        <div className="section-top-notes">
          <p><b>Notes : </b>
            Les états initiaux correspondent aux empreintes des comptes de stocks et d'immobilisations en début d'exercice. 
            Les empreintes peuvent être reprises de l'exercice précédent à partir d'une sauvegarde (Cf. Importer un fichier). 
            En l'absence de données historisées, elles sont estimées sur l'exercice courant ou initialisées à partir de valeurs par défaut.
          </p>
        </div>

        <div className="section-view-header">
          <h1>Etats initiaux</h1>
        </div>

        <div className="section-view-main">

        {financialData.immobilisations.concat(financialData.stocks).length > 0 &&
          <div className="table-container">
            <div className="table-header">
              <div>
                {isNextStepAvailable && <p><img className="img" src="/resources/icon_good.png" alt="warning"/> Données complètes.</p>}
                {!isNextStepAvailable && <p><img className="img" src="/resources/icon_warning.png" alt="warning"/> L'empreinte de certains comptes ne sont pas initialisés.</p>}
              </div>
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
                       progression={syncProgression}/>
        </div>}
      {showMessage &&
        <MessagePopup title={titlePopup} message={message} closePopup={() => this.setState({showMessage: false})}/>}

      </div>
    )
  }

  /* ---------- ACTIONS ---------- */
  
  // Synchronisation
  async synchroniseAll() 
  {
    // init progression
    this.setState({fetching: true, syncProgression: 0})

    // accounts
    const accountsToSync = this.props.session.financialData.immobilisations.concat(this.props.session.financialData.stocks)
                                                                           .filter(account => account.initialState == "defaultData");
    
    let i=0; 
    let n=accountsToSync.length;
    for (let account of accountsToSync) 
    {
      await account.updatePrevFootprintFromRemote();
      i++;
      this.setState({syncProgression: Math.round((i/n)*100), financialData: this.props.session.financialData});
    }

    await this.props.session.updateFootprints();
    this.setState({fetching: false, syncProgression:0, financialData: this.props.session.financialData});
  }

  /* ----- UPDATES ----- */

  updateFootprints = () => 
  {
    this.props.session.updateFootprints();
    this.setState({financialData: this.props.session.financialData})
  }

  /* ---------- BACK-UP IMPORT ---------- */

  importFile = (event) =>
  {
    let file = event.target.files[0];

    let reader = new FileReader();
    reader.onload = async () => 
    {
      try
      {
        // text -> JSON
        const prevSession = JSON.parse(reader.result);

        // update to current version
        updateVersion(prevProps);

        if (prevSession.legalUnit.siren == this.props.session.legalUnit.siren
          && parseInt(prevSession.year) == parseInt(this.props.session.year)-1)
        {
          // JSON -> session
          this.props.session.financialData.loadInitialStates(prevSession);
    
          // Update component
          this.setState({financialData: this.props.session.financialData});
        }
        else if (prevSession.legalUnit.siren!=this.props.session.legalUnit.siren) {this.setState({titlePopup: "Erreur - Fichier", message: "Les numéros de siren ne correspondent pas.", showMessage: true})}
        else {this.setState({titlePopup: "Erreur - Fichier", message: "La sauvegarde ne correspond pas à l'année précédente.", showMessage: true})}
      }
      catch(error) {this.setState({titlePopup: "Erreur - Fichier", message: "Fihcier non lisible.", showMessage: true});}
    }

    try 
    {
      reader.readAsText(file);
    }
    catch(error) {this.setState({titlePopup: "Erreur - Fichier", message: "Fihcier non lisible.", showMessage: true});}
  }
}

/* -------------------------------------------------- NEXT SECTION -------------------------------------------------- */

const nextStepAvailable = ({financialData}) =>
// condition : data fetched for all accounts using default data for initial state (or no account with data unfetched if using default data as initial state)
{
  let accounts = financialData.immobilisations.concat(financialData.stocks);
  return(!(accounts.filter(account => account.initialState=="defaultData" && !account.dataFetched)
                   .length > 0));
}
