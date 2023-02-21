// La Societe Nouvelle

// React
import React from "react";
import { Container } from "react-bootstrap";

/* -------------------- HEADER -------------------- */

export function Header() {
  return (
    <header className="px-5 py-2">
      <Container fluid>
        <p className="text-end small">Intiative OpenData - OpenSource</p>
      </Container>
    </header>
  );
}
