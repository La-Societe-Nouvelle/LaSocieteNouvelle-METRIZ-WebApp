// La Société Nouvelle

// React
import React from 'react';

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
      financialData: props.session.financialData
    }
  }
    
  render()
  {
    const {financialData} = this.state;

    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Etats initiaux</h1>
        </div>

        <div className="section-view-main">
          <div className="groups">

            <div className="group"><h3>Comptes de Stocks et d'Immobilisations</h3>

              <div className="actions">
                {financialData.immobilisations.length > 0 && <button onClick={() => this.synchroniseAll()}>Synchroniser les données</button>}
              </div>

              {financialData.immobilisations.length > 0 &&
                <InitialStatesTable financialData={financialData} 
                                    onUpdate={this.updateFootprints.bind(this)}/>}
            </div>

          </div>
        </div>
      </div>
    )
  }

  /* ---------- ACTIONS ---------- */
  
  // Synchronisation
  async synchroniseAll() 
  {
    await Promise.all(this.props.session.financialData.immobilisations.concat(this.props.session.financialData.stocks)
                                                                      .filter(immobilisation => immobilisation.initialState == "defaultData")
                                                                      .map(async immobilisation => await this.fetchDefaultData(immobilisation)));
    this.setState({financialData: this.props.session.financialData});
  }

  fetchDefaultData = async (stockOrImmobilisation) => 
  {
    await stockOrImmobilisation.updatePrevFootprintFromRemote();
    this.setState({financialData: this.props.session.financialData});
  }

  /* ----- UPDATES ----- */

  updateFootprints = () => this.props.session.updateFootprints();

}