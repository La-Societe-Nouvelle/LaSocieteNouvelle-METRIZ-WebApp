// La Societe Nouvelle

// React
import React from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
import { faSync, faEnvelope } from "@fortawesome/free-solid-svg-icons";   
import { faGithub}  from "@fortawesome/free-brands-svg-icons";   

/* -------------------- HEADER -------------------- */

export function HeaderSection({step,stepMax,setStep, downloadSession}) 
{  
  const refresh = () => location.reload(true);
  const saveSession = () => downloadSession();
  return (
    <header>  
    <div className="top-bar">
        <ul className="nav">
          <li><a href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/" target="_blank"><FontAwesomeIcon icon={faGithub} /> GitHub</a></li>
          <li><a href="https://lasocietenouvelle.org/contact" target="_blank" > <FontAwesomeIcon icon={faEnvelope} /> Contactez-nous</a></li>
        </ul>
        <button className={"btn btn-download btn-secondary"} onClick={saveSession}>  <FontAwesomeIcon icon={faSync} /> Sauvegarder ma session</button>
    </div>
    <div id="menu" className="container-fluid"> 
      <div className="row">
      <div className="logo">
                <img src="/logo_la-societe-nouvelle_s.svg" alt="logo"  onClick={refresh}/>
            </div>
      <nav id="progression" className="row">
        <div className={"stepper-item" + (stepMax >= 1 ? " completed" : "")}>
               <button className={"step-counter" + (step == 1 ? " current" : "")} disabled={stepMax < 1} onClick={() => setStep(1)}>1</button>
               <div className="step-name">Import comptable</div>
        </div>
        <div className={"stepper-item" + (stepMax > 2 ? " completed" : "")}>
          <button  className={"step-counter" + (step == 2 ? " current" : "")} disabled={stepMax < 2} onClick={() => setStep(2)}>2</button>
          <div className="step-name">Validation de l'import</div>
        </div>
        <div className={"stepper-item" + (stepMax > 3 ? " completed" : "")}>
          <button className={"step-counter" + (step == 3 ? " current" : "")} disabled={stepMax < 3} onClick={() => setStep(3)}>3</button>
          <div className="step-name">Saisie des états initiaux</div>
        </div>
        <div className={"stepper-item" + (stepMax > 4 ? " completed" : "")}>
          <button className={"step-counter" + (step == 4 ? " current" : "")} disabled={stepMax < 4} onClick={() => setStep(4)}>4</button>
          <div className="step-name">Traitement des fournisseurs</div>
        </div>
        <div className={"stepper-item" + (stepMax == 5 ? " completed" : "")}>
          <button className={"step-counter" + (step == 5 ? " current" : "")} disabled={stepMax < 5} onClick={() => setStep(5)}>5</button>
          <div className="step-name">Mesure de l'impact</div>
        </div>
      </nav>

      </div>
      </div>



    </header>)
}

