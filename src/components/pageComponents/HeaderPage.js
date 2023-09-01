// La Société Nouvelle

// React
import React from "react";

// Bootstrap
import {
  Container,
  Image,
  Nav,
  Navbar,
} from "react-bootstrap";

/* -------------------- HEADER PAGES -------------------- */

export const HeaderPage = () => 
{
 return (
    <Navbar expand="lg">
    <Container >
      <Navbar.Brand href="/">
        <Image
          className="d-inline-block align-center"
          src="/logo_la-societe-nouvelle_s.svg"
          height="80"
          alt="logo"
        />
      </Navbar.Brand>
      <Navbar>
        <Nav className="me-auto">
          <Nav.Link href="/">
            <i className="bi bi-house-door-fill"></i> Accueil
          </Nav.Link>
          <Nav.Link href="/a-propos">
            A propos
          </Nav.Link>
          <Nav.Link href="/conditions-generales-utilisation">
            Conditions générales d'utilisation
          </Nav.Link>
          <Nav.Link href="/confidentialite-des-donnees">
            Confidentialité des données
          </Nav.Link>
          <Nav.Link href="https://lasocietenouvelle.org" 
                    target="_blank">
            La société nouvelle
          </Nav.Link>
        </Nav>
      </Navbar>
    </Container>
  </Navbar>
 )
}