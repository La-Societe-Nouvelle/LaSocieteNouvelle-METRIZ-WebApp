// La Societe Nouvelle

// React
import React from 'react';

// Libraries
import indics from '../lib/indics.json';

export function Menu({selectedSection, changeSection, downloadSession, importSession, downloadFinalStates, progression}) 
{
  // import file
  const triggerImportFile = () => {document.getElementById('import-session').click()};
  const importFile = (event) => {importSession((event.target.files)[0])}
  
  // render
  return (
    <div className="menu">
      <h2>MENU</h2>
      <div className="menu-items">
        <div className="menu-items-group">

          <button className={"menu-button"+("legalData"==selectedSection ? " selected" : "")}
                  onClick = {() => changeSection("legalData")}>Unité Légale {progression.legalUnitOK && <img className="icon-menu" src="/resources/icon_good-white.png" alt="refresh"/>}</button>
          
          <button className={"menu-button"+("financialData"==selectedSection ? " selected" : "")}
                  onClick = {() => changeSection("financialData")} >Ecritures comptables {progression.financialDataOK && <img className="icon-menu" src="/resources/icon_good-white.png" alt="refresh"/>}</button>
          
          <button className={"menu-button"+("initialStates"==selectedSection ? " selected" : "")}
                  disabled={!progression.financialDataOK}
                  onClick = {() => changeSection("initialStates")} >Etats initiaux {(progression.financialDataOK && progression.initialStatesOK) && <img className="icon-menu" src="/resources/icon_good-white.png" alt="refresh"/>}</button>
          
          <button className={"menu-button"+("companies"==selectedSection ? " selected" : "")}
                  disabled={!progression.financialDataOK}
                  onClick = {() => changeSection("companies")} >Fournisseurs {(progression.financialDataOK && progression.companiesOK) && <img className="icon-menu" src="/resources/icon_good-white.png" alt="refresh"/>}</button>
          
        </div>

        <div className="menu-items-group">
          {Object.entries(indics).map(([codeIndic,dataIndic]) => 
            <button key={"menu-button-"+codeIndic}
                    className={"menu-button"+(codeIndic==selectedSection ? " selected" : "")}
                    onClick = {() => changeSection(codeIndic)}>
              {dataIndic.libelleMenu}
            </button>
          )}
        </div>
        
        <div className="menu-items-group">
          <button onClick = {() => downloadSession()} className="menu-button">Télécharger la session</button>
          <button onClick={triggerImportFile} className="menu-button">Importer un fichier</button>
          <input id="import-session" type="file" accept=".json" onChange={importFile} visibility="collapse"/>
          <button onClick = {() => downloadFinalStates()} className="menu-button">Télécharger les états finaux</button>
        </div>
        <div className="menu-items-group">
          <button onClick={() => window.open("https://github.com/SylvainH-LSN/LaSocieteNouvelle-METRIZ-WebApp/blob/main/DOCUMENTATION.md","_blank")} className="menu-button">Documentation</button>
          <button onClick={() => window.open("https://github.com/SylvainH-LSN/LaSocieteNouvelle-METRIZ-WebApp","_blank")} className="menu-button">Code Source</button>
        </div>
      </div>
    </div>
  );
}