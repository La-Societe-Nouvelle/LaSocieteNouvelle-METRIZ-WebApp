// La Société Nouvelle

// React
import React from "react";

// Icon
import { Button, Modal, Image } from "react-bootstrap";

/* ---------- USER INFORMATION MODALS ---------- */

export const SyncErrorModal = ({ showModal, onClose, changeView }) => {
  const handleViewChangeAndClose = () => {
    changeView();
    onClose();
  };

  return (
    <Modal show={showModal} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h5"}>Erreur lors de la synchronisation</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Image
          src="illus/warning.svg"
          alt="error image"
          height={100}
          className="mx-auto my-3 d-block"
        />
        <p className="small text-center">
          Certains comptes n'ont pas pu être synchronisés. Vérifiez le numéro de
          siren et resynchronisez les données.
        </p>

        <p className="text-center mt-4">
          <Button variant="primary" onClick={handleViewChangeAndClose}>
            Afficher les numéros de siren incorrects
          </Button>
        </p>
      </Modal.Body>
    </Modal>
  );
};

export const SyncSuccessModal = ({
  showModal,
  onClose,
  isAllProvidersIdentified,
  nextStep
}) => {
    {console.log(isAllProvidersIdentified)}

  return (
    <Modal show={showModal} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h6"}>Données synchronisées !</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="small">
          {isAllProvidersIdentified
            ? "Toutes les fournisseurs ont été identifiés et leurs données ont été synchronisées avec succès. Vous pouvez directement passer à la mesure de vos impacts. "
            : "Toutes les données des fournisseurs identifiés ont été synchronisées avec succès. Vous pouvez maintenant passer à l'étape suivante.          "}
        </p>
        <div className="text-end">
          <Button className="me-1" onClick={onClose}>Fermer</Button>
          <Button variant="secondary" onClick={nextStep}>
            {isAllProvidersIdentified ? "Mesurer mon impact" : "Etape suivante"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
