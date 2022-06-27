// La Societe Nouvelle

// React
import React from "react";
import { Col, Container, Row } from "react-bootstrap";

export function Footer() {
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  return (
    <footer>
      <Container fluid>
        <Row>
          <Col>
            <p>
              &copy; {getCurrentYear()} La Société Nouvelle
            </p>
          </Col>
          <Col>
              <div className="text-end">

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
          </Col>
        </Row>

      </Container>
    </footer>
  );

}
