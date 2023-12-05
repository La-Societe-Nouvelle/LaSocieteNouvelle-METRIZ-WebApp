// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Form, Row, Tab, Table, Tabs } from "react-bootstrap";
import PaginationComponent from "../../providers/PaginationComponent";

/* ####################################################################################################  */

export const ProviderNumMode = ({ meta, onSubmit, onGoBack }) => {
  const { accountsProviders, accountsAuxProviders } = meta;

  const [useAccountAux, setUseAccountAux] = useState(true);
  const [activeKey, setActiveKey] = useState("accountAux");

  useEffect(() => {
    setUseAccountAux(true);
  }, []);

  const changeProviderNumRef = (event) => {
    let radioValue = event.target.value;
    setUseAccountAux(radioValue == "true");

    setActiveKey(radioValue === "true" ? "accountAux" : "account");
  };

  const submit = () => {
    meta.useAccountAux = useAccountAux;
    onSubmit();
  };

  const handleInputChange = (event) => {};

  const generateAccountString = (accountsObj) => {
    const numberOfAccounts = Object.entries(accountsObj).length;
    const plural = numberOfAccounts > 1 ? "s" : "";
    return `${numberOfAccounts} compte${plural}`;
  };

  return (
    <div id="provider-num-mode">
      <h5>Gestion des comptes fournisseurs</h5>
      <Form.Group className="my-3">
        <Row className="ms-1 mt-1">
          <Form.Check
            inline
            type="radio"
            label="Gestion par compte fournisseur auxiliaire"
            id="Gestion par  compte fournisseur auxiliaire"
            value="true"
            checked={useAccountAux === true}
            onChange={changeProviderNumRef}
          />
        </Row>
        <Row className="ms-1">
          <Form.Check
            inline
            type="radio"
            label="Gestion par compte fournisseur"
            id="Gestion par commpte fournisseur"
            value="false"
            checked={useAccountAux === false}
            onChange={changeProviderNumRef}
          />
        </Row>
      </Form.Group>
      <Tabs activeKey={activeKey}  onSelect={(key) => setActiveKey(key)} id="selectionTab">
        <Tab
          eventKey="accountAux"
          title={"Comptes fournisseurs auxiliaires (" +generateAccountString(accountsAuxProviders) +")"}
        >
          <PaginatedTable
            data={Object.values(meta.accountsAuxProviders)}
            onUpdate={handleInputChange}
          />
        </Tab>
        <Tab
          eventKey="account"
          title={"Comptes fournisseurs (" +generateAccountString(accountsProviders) +")"
          }
        >
          <PaginatedTable
            data={Object.values(meta.accountsProviders)}
            onUpdate={handleInputChange}
          />
        </Tab>
      </Tabs>

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

const PaginatedTable = ({ data, onUpdate }) => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div>
      <Table striped>
        <thead>
          <tr>
            <th>Numéro de compte</th>
            <th>Libellé</th>
            <th className="text-end">Compte générique</th>
          </tr>
        </thead>
        <tbody>
          {data
            .slice(startIndex, endIndex)
            .map(({ accountNum, accountLib }) => (
              <tr key={accountNum + accountLib}>
                <td>{accountNum}</td>
                <td>{accountLib}</td>
                <td className="px-4 text-end">
                  <Form.Check
                    type="checkbox"
                    value={accountNum}
                    onChange={onUpdate}
                    checked={false}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(newPage) => setCurrentPage(newPage)}
      />
    </div>
  );
};
