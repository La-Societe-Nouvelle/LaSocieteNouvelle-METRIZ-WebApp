// La Societe Nouvelle

// React
import React from 'react';

/* -------------------- HEADER -------------------- */

export function Header({step,stepMax,downloadSession,setStep}) 
{  
  const refresh = () => location.reload(true);
  const openRepository = () => window.open("https://github.com/SylvainH-LSN/LaSocieteNouvelle-METRIZ-WebApp","_blank");
  const openDocumentation = () => window.open("https://lasocietenouvelle.org/METRIZ_documentation_v1.1.3.pdf","_blank");
  const redirectToContactForm = () => window.open("https://lasocietenouvelle.org/contact","_blank");
  const saveSession = () => downloadSession();
  const goBack = () => setStep(5);

  if (step==6) {
    return(
      <div className="header">
        <div id="global-actions">
          <img className="img" src="/resources/icon_back.png" alt="back" onClick={goBack}/>
        </div>
        <h1>Formulaire de publication</h1>
      </div>
    )
  }
  return (
    <div className="header">

      <div id="global-actions">
        <img className="img" src="/resources/icon_refresh.jpg" alt="refresh" onClick={refresh}/>
        <img className="img" src="/resources/icon_github.png" alt="code" onClick={openRepository}/>
        <img className="img" src="/resources/icon_doc.svg" alt="doc" onClick={openDocumentation}/>
        <img className="img" src="/resources/icon_message.png" alt="save" onClick={redirectToContactForm}/>
        <img className="img" src="/resources/icon_save.png" alt="save" onClick={saveSession}/>
      </div>

      <div id="progression">
        <div className={"progression-item"+(step==1 ? " current" : "")}>
          <button disabled={stepMax < 1} onClick={() => setStep(1)}>1</button>
          <p>Siren</p>
        </div>
        <Line/>
        <div className={"progression-item"+(step==2 ? " current" : "")}>
          <button disabled={stepMax < 2} onClick={() => setStep(2)}>2</button>
          <p>Ecritures comptables</p>
        </div>
        <Line/>
        <div className={"progression-item"+(step==3 ? " current" : "")}>
          <button disabled={stepMax < 3} onClick={() => setStep(3)}>3</button>
          <p>Etats initiaux</p>
        </div>
        <Line/>
        <div className={"progression-item"+(step==4 ? " current" : "")}>
          <button disabled={stepMax < 4} onClick={() => setStep(4)}>4</button>
          <p>Fournisseurs</p>
        </div>
        <Line/>
        <div className={"progression-item"+(step==5 ? " current" : "")}>
          <button disabled={stepMax < 5} onClick={() => setStep(5)}>5</button>
          <p>Empreintes</p>
        </div>
      </div>

    </div>)
}

const Line = () => <svg viewBox="0 0 150 30"><line x1="0" y1="15" x2="150" y2="15"/></svg>