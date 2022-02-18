// La Société Nouvelle

// React
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEllipsis } from '@fortawesome/free-solid-svg-icons'

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
        <section className="start-section">
          <div>
            <h2>
              Mesurez <span className="underline">l'impact carbone</span> de
              votre entreprise en quelques clics.
            </h2>
            <p>
              Notre objectif est de vous permettre de 
              <span className="font-weight-bold">connaître</span> et de 
              <strong>mesurer l’empreinte de la production</strong> de votre
              entreprise sur des enjeux 
              <strong>majeurs de développement durable.</strong>
            </p>
            <div className="start-picto">
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

            <div id="start-choices-container">
              <div id="start-choices">
                <button
                  className={"btn btn-link"}
                  onClick={this.props.startNewSession}
                >
                  Je démarre *
                </button>
                <button
                   className={"btn btn-outlined"}
                  onClick={this.triggerImportFile}
                >
                  Reprendre une session
                </button>
              </div>
              <input
                id="import-session"
                type="file"
                accept=".json"
                onChange={this.importFile}
                visibility="collapse"
              />
              <p className="small-text">
              *Munissez vous d’un fichier d’export comptable au format FEC, à générer depuis votre outil de comptabilité ou auprès de votre service comptabilité.
              </p>
            </div>
          </div>
          <div className="start-publish-container">
            <div>
            <img src="/resources/team_working.png" alt="Team" />
              <div className="cta-publish">
                <p className="icon">
                <FontAwesomeIcon icon={faPaperPlane} />
                </p>
                <a href="#" target="_blank">Publiez vos résultat !
                <span>Maintenant</span></a>

              </div>
            </div>
            
          </div>
        </section>
    );
  }

  triggerImportFile = () => {
    document.getElementById("import-session").click();
  };
  importFile = (event) => {
    this.props.loadPrevSession(event.target.files[0]);
  };
}
