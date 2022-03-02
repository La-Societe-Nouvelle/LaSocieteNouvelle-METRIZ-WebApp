// La Société Nouvelle

// React
import React from "react";

/* ------------------------------------------------------- */
/* -------------------- START SECTION -------------------- */
/* ------------------------------------------------------- */

export class StartSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  
  render() {
    
    return (
      <div id="start" className="container">
        <div className="row">
          <div className="col">
            <h2>
               <span className="underline">Metriz</span> - Version Partenaire
            </h2>
            <p>
              <b>Cabinet : </b> Terre d'Entrepreneurs
            </p>
            <p>
            <b> Dernière mise à jour le : </b>  03/03/2022

            </p>
            <div id="section-picto" className="row">
              <div className="logoLSN">
                <img src="/logo_la-societe-nouvelle_s.svg" alt="logo" />
              </div>
              <div>
                <img src="resources/logo-partenaires/logo-te-1.png" alt="Terre Entrepreneur" />
              </div>
            </div>
            <button className={"btn btn-primary"} onClick={this.props.startNewSession}>
              Nouvelle analyse
            </button>
            <button className={"btn btn-secondary"} onClick={this.triggerImportFile}>
              Reprendre une session
            </button>

            <input
              id="import-session"
              type="file"
              accept=".json"
              onChange={this.importFile}
              visibility="collapse"
            />
          </div>
          <div className="col">
          <img src="/resources/team_working.png" alt="Team" />
          </div>
        </div>
      </div>
    );
  }

  triggerImportFile = () => {
    document.getElementById("import-session").click();
  };
  importFile = (event) => {
    this.props.loadPrevSession(event.target.files[0]);
  };

}
