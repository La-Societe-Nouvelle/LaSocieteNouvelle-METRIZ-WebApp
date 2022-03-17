// La Societe Nouvelle

// React
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";   

export function Footer({ step }) {
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  return (
    <footer className={"row container-fluid aln-middle " + (step > 0 ? "footer-step aln-left" : "  ")}>
      <div>
        <p>
          <b>&copy; {getCurrentYear()} La Société Nouvelle</b>
        </p>
        <ul>
          <li>
            <a href="https://lasocietenouvelle.org/mentions-legales" target="_blank">Mentions légales</a>
          </li>
          <li>
            <a href="http://www.cecill.info/licences/Licence_CeCILL_V2.1-fr.txt" target="_blank">Licence</a>
          </li>
          <li>
            <a href="https://docs.lasocietenouvelle.org/" target="_blank">Documentation</a>
          </li>
          <li>
            <a href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/" target="_blank">Code source</a>
          </li>
        </ul>
      </div>
    </footer>
  );

}
