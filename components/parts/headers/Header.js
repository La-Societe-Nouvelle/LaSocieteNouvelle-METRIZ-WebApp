// La Societe Nouvelle

// React
import React from "react";
import { Container } from "react-bootstrap";

/* -------------------- HEADER -------------------- */

export function Header() {
  return (
    <header className="header px-5">
      <Container fluid>
        <p className="text-end">Intiative OpenData - OpenSource</p>
      </Container>
    </header>
  );
}
