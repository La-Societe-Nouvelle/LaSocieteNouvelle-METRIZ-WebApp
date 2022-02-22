// La Societe Nouvelle

// React
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faArrowsRotate}  from '@fortawesome/free-solid-svg-icons'
import { StepMenu } from './StepMenu';

/* -------------------- HEADER -------------------- */

export function Header({step,stepMax,downloadSession,setStep}) 
{  
  const refresh = () => location.reload(true);
 
  const openDocumentation = () => window.open("https://lasocietenouvelle.notion.site/METRIZ-GUIDE-D-UTILISATION-ce7af947e69e47b1a3f90697374ad80b","_blank");
  const saveSession = () => downloadSession();
  const goBack = () => setStep(5);


  if (step == 0) {
    return (
        <div className="header">
            <div className="logo">
                <img src="/logo_la-societe-nouvelle.png" alt="logo" />
            </div>
        </div>
        )
}
  if (step==6) {
    return(
      <div className="popup">
      <div className="popup-inner">
        <h2>Publiez vos résultats</h2>
     {/* <div id="global-actions">
          <img className="img" src="/resources/icon_back.png" alt="back" onClick={goBack}/>
        </div> */}
          <button>Ok</button>
      </div>
    </div>
   
       
    )
  }
  return (
    <div className="header-steps">
      <div className="top-bar">
        <ul className="top-bar-menu">
          <li>
            <a href='https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp' title="Github">
            <FontAwesomeIcon icon={faGithub} />
              Github</a>
          </li>
          <li>
            <a href='https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp' title="Nous contacter">
            <FontAwesomeIcon icon={faEnvelope} />
              Nous contacter</a>
          </li>
        </ul>
          <button className={'btn'} onClick={saveSession}>
            <FontAwesomeIcon icon={faArrowsRotate} />
              Sauvegarder ma session
          </button>
      </div>
      <div className='progressBar-container'>
        <div className='logo'>
          <a href="" onClick={refresh}>
          <img src="/logo_lsn-small.svg" alt="logo" />
          </a>
          
        </div>
        <StepMenu step={step} setStep={setStep} stepMax={stepMax} /> 
      </div>
   </div>
    )
}

