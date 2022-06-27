// La Societe Nouvelle

// React
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Col, Container, NavLink, Row } from 'react-bootstrap';

/* -------------------- HEADER -------------------- */

export function Header() 
{  
  return (
    <header className="header px-5"> 
    <Container fluid>
  
                <p className="text-end">
                  Intiative OpenData - OpenSource
                </p>
   
    </Container>
      
    </header>)
}

