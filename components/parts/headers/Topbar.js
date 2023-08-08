import React from "react";
import { Button } from "react-bootstrap";
import { downloadSession } from "../../../src/utils/Utils";

function TopBar({ session }) {

  return (
    <div className="top-bar">
      <ul className="nav">
        <li>
          <a
            href="https://docs.lasocietenouvelle.org/application-web"
            target="_blank"
          >
            <i className="bi bi-book-fill"></i> Documentation
          </a>
        </li>
        <li>
          <a
            href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/"
            target="_blank"
          >
            <i className="bi bi-github"></i> GitHub
          </a>
        </li>
        <li>
          <a href="https://lasocietenouvelle.org/contact" target="_blank">
            <i className="bi bi-envelope-fill"></i> Contactez-nous
          </a>
        </li>
      </ul>
      <Button
        className="btn-sm me-4 my-2 p-2"
        disabled={session.progression == 0}
        variant="secondary"
        onClick={() => downloadSession(session)}
      >
        <i className="bi bi-arrow-down"></i>
        Sauvegarder ma session
      </Button>
    </div>
  );
}

export default TopBar;
