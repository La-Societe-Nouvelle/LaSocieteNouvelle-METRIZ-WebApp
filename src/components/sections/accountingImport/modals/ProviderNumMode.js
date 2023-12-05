// La Société Nouvelle

// React
import React, { useEffect, useState } from 'react';
import { Col, Form, Row, Table } from 'react-bootstrap';

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
  const [selectedTab, setSelectedTab] = useState("account");

  useEffect(() => {
    setUseAccountAux(true);
  }, []);

  const changeProviderNumRef = (event) => {
    let radioValue = event.target.value;
    setUseAccountAux(radioValue == "true");
  };

  const switchTab = (event) => {
    const table = event.target.value;
    setSelectedTab(table);
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
      <div>
      <div className="table-menu mx-auto">
        <button
          key={1}
          value="account"
          onClick={switchTab}
          className={selectedTab == "account" || "" ? "active" : ""}
        >
          Comptes fournisseurs
        </button>
        <button
          key={2}
          value="accountAux"
          onClick={switchTab}
          className={selectedTab == "accountAux" || "" ? "active" : ""}
        >
          Comptes fournisseurs auxiliaires
        </button>
      </div>
      <div>
        {(selectedTab=="account") &&
          <Table size="sm" className="mt-4" striped>
          <thead>
            <tr>
              <th className="px-1">Numéro de compte</th>
              <th>Libellé</th>
              <th className="text-end">Compte générique</th>
            </tr>
          </thead>

          <tbody>
            {Object.values(meta.accountsProviders).map(({ accountNum, accountLib }) => (
              <tr key={accountNum}>
                <td className="px-1">{accountNum}</td>
                <td>{accountLib}</td>
                <td className="px-4 text-end">
                  <Form.Check
                    type="checkbox"
                    value={accountNum}
                    //onChange={handleInputChange}
                    checked={false}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>}
        {(selectedTab=="accountAux") &&
          <Table size="sm" className="mt-4" striped>
          <thead>
            <tr>
              <th className="px-1">Numéro de compte</th>
              <th>Libellé</th>
              <th className="text-end">Compte générique</th>
            </tr>
          </thead>

          <tbody>
            {Object.values(meta.accountsAuxProviders).map(({ accountNum, accountLib }) => (
              <tr key={accountNum}>
                <td className="px-1">{accountNum}</td>
                <td>{accountLib}</td>
                <td className="px-4 text-end">
                  <Form.Check
                    type="checkbox"
                    value={accountNum}
                    //onChange={handleInputChange}
                    checked={false}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>}
      </div>
      </div>
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