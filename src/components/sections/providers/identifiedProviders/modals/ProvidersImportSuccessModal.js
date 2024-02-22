// La Société Nouvelle

// React
import { Image, Modal } from "react-bootstrap";

export const ProvidersImportSuccessModal = ({
  showModal,
  totalProviders,
  updatedProvidersCount,
  onSynchronise,
  onClose,
}) => {
  return (
    <Modal show={showModal} onHide={onClose} size="md" centered>
      <Modal.Header closeButton></Modal.Header>

      <Modal.Body>
        <Image
          src="illus/upload-success.svg"
          alt=""
          height={80}
          className="mx-auto d-block"
        />
        <h5 className="h6 text-center my-2">Importation réussie !</h5>

        <p className="small text-center">
          <b>{updatedProvidersCount}</b> numéros de SIREN parmi les{" "}
          <b>{totalProviders}</b> fournisseurs ont été complétés. Vous pouvez
          maintenant synchroniser leurs données.
        </p>

        <p className="text-center mt-4">
          <button className="btn btn-secondary " onClick={onSynchronise}>
            <i className="bi bi-arrow-repeat"></i> Synchroniser
          </button>
        </p>
      </Modal.Body>
    </Modal>
  );
};

export const ProvidersImportWarningModal = ({
  showModal,
  onClose,
}) => {
  return (
    <Modal show={showModal} onHide={onClose} size="md" centered>
      <Modal.Header closeButton></Modal.Header>

      <Modal.Body>
        <Image
          src="illus/warning.svg"
          alt="warning illu"
          height={100}
          className="mx-auto d-block"
        />
        <p className="text-center small my-2">
          Aucun numéro SIREN n'a pu être attribué aux fournisseurs. Veuillez
          vérifier les données importées.
        </p>
      </Modal.Body>
    </Modal>
  );
};
