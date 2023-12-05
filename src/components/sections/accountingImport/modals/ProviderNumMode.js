// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Form, Image, Row, Tab, Table, Tabs } from "react-bootstrap";
import PaginationComponent from "../../providers/PaginationComponent";

/* ---------- PROVIDER READING SELECTION  ---------- */

/** Modal to select the property used for provider num (ComptNum or ComptAuxNum)
 *  
 */

export const ProviderNumMode = ({ 
  meta, 
  onSubmit, 
  onGoBack 
}) => {
  
  const { accountsProviders, accountsAuxProviders } = meta;

  const [useAccountAux, setUseAccountAux] = useState(true);
  const [activeKey, setActiveKey] = useState("accountAux");
  // const [miscellaneousAccounts, setMiscellaneousAccounts] = useState([]);

  useEffect(() => {
    setUseAccountAux(true);
  }, []);

  useEffect(() => {
    if (activeKey=="accountAux") {
      setUseAccountAux(true);
    } else {
      setUseAccountAux(false);
    }
  }, [activeKey]);

  const changeProviderNumRef = (event) => {
    let radioValue = event.target.value;
    setUseAccountAux(radioValue == "true");

    setActiveKey(radioValue === "true" ? "accountAux" : "account");
  };

  const submit = () => {
    meta.useAccountAux = useAccountAux;
    onSubmit();
  };

  // const handleInputChange = (event) => {
  //   const { value, checked } = event.target;
  //   if (checked) {
  //     setMiscellaneousAccounts([
  //       ...miscellaneousAccounts, value
  //     ])
  //   } else {
  //     setMiscellaneousAccounts(
  //       miscellaneousAccounts.filter(accountNum => accountNum != value)
  //     )
  //   }
  // };

  const generateAccountString = (accountsObj) => {
    const numberOfAccounts = Object.entries(accountsObj).length;
    const plural = numberOfAccounts > 1 ? "s" : "";
    return `${numberOfAccounts} compte${plural}`;
  };

  return (
    <div id="provider-num-mode">

      <div className="small mb-3">
        <div className="alert-info mt-0">
          <div className="info-icon">
            <Image src="/info-circle.svg" alt="icon info" />
          </div>
          <div>
            <p>
              Pour la mesure des empreintes des consommations, les dépenses doivent
              être groupées par fournisseur. Cette étape d'import permet de confirmer
              le mode de lecture des comptes fournisseurs : par numéro de compte ou par
              compte auxiliaire.
            </p>
          </div>
        </div>
      </div>
     
      <Form.Group className="mb-3">
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
            // miscellaneousAccounts={miscellaneousAccounts}
            // onUpdate={handleInputChange}
          />
        </Tab>
        <Tab
          eventKey="account"
          title={"Comptes fournisseurs (" +generateAccountString(accountsProviders) +")"
          }
        >
          <PaginatedTable
            data={Object.values(meta.accountsProviders)}
            // miscellaneousAccounts={miscellaneousAccounts}
            // onUpdate={handleInputChange}
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

const PaginatedTable = ({ 
  data,
  miscellaneousAccounts,
  onUpdate 
}) => {

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
            <th className="col-2">Numéro de compte</th>
            <th className="col-8">Libellé</th>
            {/* <th className="text-center col-2">Compte générique</th> */}
          </tr>
        </thead>
        <tbody>
          {data
            .slice(startIndex, endIndex)
            .map(({ accountNum, accountLib }) => (
              <tr key={accountNum + accountLib}>
                <td>{accountNum}</td>
                <td>{accountLib}</td>
                {/* <td className="text-center">
                  <Form.Check
                    type="checkbox"
                    value={accountNum}
                    onChange={onUpdate}
                    checked={miscellaneousAccounts.includes(accountNum)}
                  />
                </td> */}
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
