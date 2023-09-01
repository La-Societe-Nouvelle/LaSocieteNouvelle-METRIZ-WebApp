// La Societe Nouvelle

// React
import React from "react";

// Bootstrap
import { Col, Container, Row } from "react-bootstrap";

/* -------------------- FOOTER -------------------- */

export const Footer = () => 
{
  return (
    <footer className="px-4">
      <Container fluid>
        <Row>
          <Col>
            <p>
              &copy; 2023 La Société Nouvelle
            </p>
          </Col>
          <Col>
            <div className="text-end">
              <ul>
                <li>
                  <a href="/a-propos">
                    A propos
                  </a>
                </li>
                <li>
                  <a href="/conditions-generales-utilisation" >
                    Conditions générales d'utilisation
                  </a>
                </li>
                <li>
                  <a href="/confidentialite-des-donnees">
                    Confidentialités des Données
                  </a>
                </li>
                <li>
                  <a href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/" 
                     target="_blank">
                    Code source
                  </a>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}