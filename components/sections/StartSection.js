// La Société Nouvelle

// React
import React from 'react';

/* ------------------------------------------------------- */
/* -------------------- START SECTION -------------------- */
/* ------------------------------------------------------- */

export class StartSection extends React.Component {

  constructor(props)
  {
    super(props);
    this.state = {};
  }

  render ()
  {
    return (
      <div className="section-view"> 

        <div className="section-top-notes">
          <p><b>Notes : </b>
             Les données saisies au cours de l'analyse sont traitées au sein de la page web. 
             Vos données restent ainsi en local pour garantir leur sécurité.</p>
        </div>

        <div id="start-choices-container">
          <div id="start-choices">
            <button className="big" onClick={this.props.startNewSession}>Nouvelle analyse</button>
            <button className="big" onClick={this.triggerImportFile}>Importer une sauvegarde</button>
          </div>
        </div>
        
        <input id="import-session" type="file" accept=".json" onChange={this.importFile} visibility="collapse"/>
      </div>)
  }

  triggerImportFile = () => {document.getElementById('import-session').click()};
  importFile = (event) => {this.props.loadPrevSession((event.target.files)[0])}

}