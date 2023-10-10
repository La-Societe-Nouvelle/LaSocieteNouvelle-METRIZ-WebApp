import React from "react";
import { Button, Image, Modal } from "react-bootstrap";
import PresentationCarousel from "../pageComponents/PresentationCarousel";
import { useState } from "react";

const CarouselModal = ({ show, onHide }) => {
  const [showCarousel, setShowCarousel] = useState(false);

  const handleHide = () => {
    setShowCarousel(false);
    onHide();
  };
  return (
    <Modal
      show={show}
      onHide={handleHide}
      size="xl"
      className="carousel-modal"
      centered
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        {!showCarousel && (
          <div className="d-flex align-items-center">
            <Image
              className="mx-4"
              src="/carousel/earth-metriz.svg"
              fluid
              alt="Metriz"
            />
            <div>
              <h4 className="mb-4">
                Première visite sur Metriz ? Suivez notre guide introductif
              </h4>

              <p className="mb-4">
                Ce guide introductif vous donne les clés de compréhension de
                notre méthodologie et décrit les différentes étapes nécessaires
                à effectuer dans l'application pour accéder à l'empreinte
                sociétale de votre entreprise.
              </p>
              <Button onClick={() => setShowCarousel(true)}>Commencer</Button>
            </div>
          </div>
        )}
        {showCarousel && <PresentationCarousel />}
      </Modal.Body>
    </Modal>
  );
};

export default CarouselModal;
