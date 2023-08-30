import { Button, Modal } from "react-bootstrap";

 const SyncSuccessModal = ({
    showModal,
    onClose,
    nextStep
  }) => {
  
    return (
      <Modal show={showModal} onHide={onClose} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title as={"h6"}>Données synchronisées </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small">
          Toutes les comptes fournisseurs associés à un secteur d'activité et une zone économique 
         ont été synchronisés avec succès !
          </p>
          <div className="text-end">
            <Button className="me-1" onClick={onClose}>Fermer</Button>
            <Button variant="secondary" onClick={nextStep}>
            Mesurer mon impact
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  export default SyncSuccessModal;