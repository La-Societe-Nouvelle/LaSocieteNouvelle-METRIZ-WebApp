// La Societe Nouvelle

// React
import React from "react";

export function Footer({ step }) {
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  return (
    <footer className="row container-fluid">
        <p>
          &copy; {getCurrentYear()} La Société Nouvelle
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
    </footer>
  );

}
