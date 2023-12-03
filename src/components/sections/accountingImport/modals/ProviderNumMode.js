// La Société Nouvelle

// React
import React, { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';

/* ####################################################################################################  */

export const ProviderNumMode = ({
  meta,
  onSubmit,
  onGoBack
}) => {

  const {
    accountsProviders,
    accountsAuxProviders
  } = meta;

  const [useAccountAux, setUseAccountAux] = useState(true);

  useEffect(() => {
    setUseAccountAux(true);
  }, []);

  const changeProviderNumRef = (event) => {
    let radioValue = event.target.value;
    setUseAccountAux(radioValue);
  };

  const submit = () => {
    meta.useAccountAux = useAccountAux;
    onSubmit();
  };

  return (
    <div>
      <h5>Gestion des comptes fournisseurs</h5>
      <Form.Group as={Col} className="form-group align-items-center m-3">
        <Row className="ms-1 text-start">
          <Form.Check
            inline
            type="radio"
            label={"Gestion par compte fournisseur auxiliaire - "+Object.entries(accountsAuxProviders).length+" compte(s)"}
            value="true"
            checked={useAccountAux === true}
            onChange={changeProviderNumRef}
          />
        </Row>
        <Row className="ms-1 text-start">
          <Form.Check
            inline
            type="radio"
            label={"Gestion par compte fournisseur - "+Object.entries(accountsProviders).length+" compte(s)"}
            value="false"
            checked={useAccountAux === false}
            onChange={changeProviderNumRef}
          />
        </Row>
      </Form.Group>
      <div className="text-end">
        <button className="btn btn-primary me-2" onClick={() => onGoBack()}>
          <i className="bi bi-chevron-left"></i> Retour
        </button>
        <button className="btn btn-secondary" onClick={submit}>
          Valider mes données
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};