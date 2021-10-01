// La Société Nouvelle

// React
import React from 'react';
import Popup from 'reactjs-popup';
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
      progression: 0
    }
  }
    
  render()
  {
    const {financialData,fetching,progression} = this.state;

    const isAllValid = !(financialData.immobilisations.concat(financialData.stocks)
                                                      .filter(account => account.initialState=="defaultData" && !account.dataFetched)
                                                      .length > 0);
    
    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Etats initiaux</h1>
        </div>

        <div>
          <p>Informations : {isAllValid ? "OK" : "Données manquantes"}</p>
        </div>

        <div className="section-view-main">
          <div className="groups">

            <div className="group"><h3>Comptes de Stocks et d'Immobilisations</h3>

              <div className="actions">
                {financialData.immobilisations.concat(financialData.stocks).length > 0 && <button onClick={() => this.synchroniseAll()}>Synchroniser les données</button>}
              </div>

              {financialData.immobilisations.concat(financialData.stocks).length > 0 &&
                <InitialStatesTable financialData={financialData} 
                                    onUpdate={this.updateFootprints.bind(this)}/>}
            </div>

          </div>
        </div>

        <Popup open={fetching}>
          <ProgressBar message="Récupération des données par défaut..."
                        progression={progression}/>
        </Popup>

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

}