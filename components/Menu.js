// La Societe Nouvelle

import React from 'react';

// Libraries
import indics from '../lib/indics.json';

export function Menu({selectedSection, changeSection, downloadSession, importSession}) 
{

  const triggerImportFile = () => {document.getElementById('import-session').click()};
  const importFile = (event) => {importSession((event.target.files)[0])}
  
  return (
    <div className="menu">
      <h2>MENU</h2>
      <div className="menu-items">
        <div className="menu-items-group">

          <button className={"menu-button"+("legalData"==selectedSection ? " selected" : "")}
                  onClick = {() => changeSection("legalData")}>Unité Légale</button>
          
          <button className={"menu-button"+("financialData"==selectedSection ? " selected" : "")}
                  onClick = {() => changeSection("financialData")} >Données financières</button>
          
          <button className={"menu-button"+("companies"==selectedSection ? " selected" : "")}
                  onClick = {() => changeSection("companies")} >Fournisseurs</button>
          
          <button className={"menu-button"+("initialStates"==selectedSection ? " selected" : "")}
                  onClick = {() => changeSection("initialStates")} >Etats initiaux</button>
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
        </div>
        <div className="menu-items-group">
          <button onClick={() => window.open("https://github.com/SylvainH-LSN/LaSocieteNouvelle-METRIZ-WebApp/blob/main/DOCUMENTATION.md","_blank")} className="menu-button">Documentation</button>
          <button onClick={() => window.open("https://github.com/SylvainH-LSN/LaSocieteNouvelle-METRIZ-WebApp","_blank")} className="menu-button">Code Source</button>
        </div>
      </div>
    </div>
  );
}