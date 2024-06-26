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
          Certains comptes n'ont pas pu être synchronisés. Vérifiez les informations erronées et resynchronisez les données.
        </p>

        <p className="text-center mt-4">
          <Button variant="secondary" onClick={handleViewChangeAndClose}>
            Afficher les comptes erronés
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
  nextStep,
  changeView
}) => {

  return (
    <Modal show={showModal} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title></Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <Image
          src="illus/sync-success.svg"
          alt="success image"
          height={100}
          className="mx-auto my-3 d-block"
        />
        <h6 className="text-center my-2">Données des fournisseurs synchronisées !</h6>
        <p className="small text-center">
          {isAllProvidersIdentified
            ? "Tous les fournisseurs ont été identifiés et leurs données ont été synchronisées avec succès. Vous pouvez directement passer à la mesure de vos impacts."
            : "Toutes les données des fournisseurs identifiés ont été synchronisées avec succès. Vous pouvez maintenant renseigner les numéros SIREN manquants ou associer un secteur d'activité à l'étape suivante."}
        </p>

        <div className="text-center">
        <Button className="me-2" onClick={() => changeView("notDefined")}>Comptes sans SIREN</Button>
          <Button variant="secondary" onClick={nextStep}>
            {isAllProvidersIdentified ? "Mesurer mon impact" : "Etape suivante"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
