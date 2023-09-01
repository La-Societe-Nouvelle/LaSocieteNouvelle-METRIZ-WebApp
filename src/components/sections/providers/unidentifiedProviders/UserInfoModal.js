import { Button, Image, Modal } from "react-bootstrap";

export const SyncSuccessModal = ({ showModal, onClose, nextStep }) => {
  return (
    <Modal show={showModal} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h6"}>Données synchronisées </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <Image
          src="illus/sync-success.svg"
          alt="error image"
          height={140}
          className="mx-auto mb-3 d-block"
        />
        <p className="small text-center">
          Toutes les comptes fournisseurs ont été synchronisés avec succès !
        </p>
        <div className="text-end">
          <Button className="me-1" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="secondary" onClick={nextStep}>
            Mesurer mon impact
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const SyncWarningModal = ({ showModal, onClose, onSubmit }) => {
  return (
    <Modal show={showModal} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h6"}>Comptes significatifs non associés </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image
          src="illus/warning.svg"
          alt="error image"
          height={100}
          className="mx-auto mb-3 d-block"
        />
        <p className="small">
          Attention , certains comptes significatifs n'ont pas été reliés à un
          secteur d'activité et peut entrainer un grand risque d'imprécision
          dans les résultats. Souhaitez-vous continuer ?
        </p>
        <div className="text-center">
          <Button className="me-1" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="secondary" onClick={onSubmit}>
            Confirmer
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
