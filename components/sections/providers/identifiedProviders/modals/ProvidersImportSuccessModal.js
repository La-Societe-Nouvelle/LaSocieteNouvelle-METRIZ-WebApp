// La Société Nouvelle

// React
import { Image, Modal } from "react-bootstrap";

export const ProvidersImportSuccessModal = ({ showModal, onSynchronise, onClose }) => {
  return (
    <Modal show={showModal} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h5"}>Import des fournisseurs</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Image
          src="illus/upload.svg"
          alt=""
          height={140}
          className="mx-auto d-block"
        />
        <p className="text-center  small my-1">
          Importation des fournisseurs réussie ! <br></br>Vous pouvez maintenant
          synchroniser leurs données.
        </p>

        <p className="text-center mt-4">
          <button className="btn btn-secondary " onClick={onSynchronise}>
            <i className="bi bi-arrow-repeat"></i> Synchroniser les données
          </button>
        </p>
      </Modal.Body>
    </Modal>
  );
};
