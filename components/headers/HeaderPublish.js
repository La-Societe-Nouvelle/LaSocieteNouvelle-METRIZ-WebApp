// La Societe Nouvelle

// React
import React from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faEnvelope, faBook, faRuler, faBackward, faChevronRight, faChevronLeft, faUpload } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

/* -------------------- HEADER -------------------- */

export function HeaderPublish({ setStep, downloadSession }) {
  const refresh = () => location.reload(true);
  const saveSession = () => downloadSession();
  return (
    <header >
      <div className="top-bar">
          <ul className="nav">
            <li>
              <a href="https://docs.lasocietenouvelle.org/" target="_blank"> <FontAwesomeIcon icon={faBook} /> Documentation</a>
            </li>
            <li><a href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/" target="_blank"><FontAwesomeIcon icon={faGithub} /> GitHub</a></li>
            <li><a href="https://lasocietenouvelle.org/contact" target="_blank" > <FontAwesomeIcon icon={faEnvelope} /> Contactez-nous</a></li>
          </ul>
          <button className={"btn btn-download btn-secondary"} onClick={saveSession}>  <FontAwesomeIcon icon={faSync} /> Sauvegarder ma session</button>
      </div>
      <div id="menu" className="container-fluid">
        <div className="row">
          <div className="logo">
            <img src="/logo_la-societe-nouvelle_s.svg" alt="logo" onClick={refresh} />
          </div>
          <div className="action">
          <button className="btn btn-secondary" onClick={() => setStep(5)}> <FontAwesomeIcon icon={faChevronLeft} /> Retour  </button>
        </div>
          <nav id="progression" className="row">
            <div className={"stepper-item completed"}>
              <p className={"step-counter"} ><FontAwesomeIcon icon={faUpload} /> </p>
              <div className="step-name"><h2>Publier mes résultats</h2></div>
            </div>
            </nav>
        </div>

      </div>
    </header>)
}

