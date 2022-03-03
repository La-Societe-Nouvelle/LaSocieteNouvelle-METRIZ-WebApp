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
            <h1>
              Mesurez <span className="underline">l'impact carbone</span> de
              votre entreprise en quelques clics.
            </h1>
            <p>
              Notre objectif est de vous permettre de <b>connaître</b> et de <strong>mesurer l’empreinte de la production</strong> de votre
              entreprise sur des enjeux <strong>majeurs de développement durable.</strong>
            </p>
            <div id="section-picto" className="row">
              <div>
                <img
                  src="resources/pictos/sustainable.svg"
                  alt="Developpement durable"
                />
                <p>Développement durable</p>
              </div>
              <div>
                <img src="resources/pictos/performance.svg" alt="Performance" />
                <p>Performance extra financière</p>
              </div>
              <div>
                <img src="resources/pictos/compare.svg" alt="Comparaison" />
                <p>Comparaison dans votre secteur d’activité</p>
              </div>
              <div>
                <img src="resources/pictos/goals.svg" alt="Engagement" />
                <p>Engagements sociaux et environementaux</p>
              </div>
            </div>
            <button className={"btn btn-primary"} onClick={this.props.startNewSession}>
              Nouvelle analyse
            </button>
            <button className={"btn btn-outline"} onClick={this.triggerImportFile}>
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
