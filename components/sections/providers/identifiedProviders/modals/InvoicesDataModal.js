// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Modal, Table } from "react-bootstrap";
import Select from "react-select";

// Styles
import { customSelectStyles } from "../../../../../config/customStyles";

/* -------------------- INVOICES DATA MODAL -------------------- */


const InvoicesDataModal = ({
  invoicesData,
  providers,
  showModal,
  onClose,
  onSubmit,
}) => {
  const [providersMapping, setProvidersMapping] = useState(invoicesData || {});

  useEffect(() => {
    setProvidersMapping(invoicesData || {});
  }, [invoicesData]);

  const handleOnchange = (providerId, providerNum) => {
    const updatedMapping = { ...providersMapping };
    Object.values(updatedMapping)
      .filter((invoiceData) => invoiceData.matching === providerNum)
      .forEach((invoiceData) => (invoiceData.matching = ""));
    updatedMapping[providerId].matching = providerNum;

    setProvidersMapping(updatedMapping);
  };

  return (
    <Modal show={showModal} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <h3>Associer les comptes fournisseurs</h3>
      </Modal.Header>
      <Modal.Body>
        <Table size="sm">
          <thead>
            <tr>
              <td>Identifiant</td>
              <td>Dénomination</td>
              <td>Compte fournisseur</td>
            </tr>
          </thead>
          <tbody>
            {Object.entries(providersMapping).map(
              ([key, { legalUnitData }]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{legalUnitData.denomination}</td>
                  <td>
                    <Select
                      styles={customSelectStyles}
                      options={[
                        {
                          value: "",
                          label: "Aucun compte fournisseur associé",
                        },
                        ...providers
                          .filter(
                            (provider) => !provider.isDefaultProviderAccount
                          )
                          .filter(
                            ({ providerNum }) =>
                              !Object.values(providersMapping).some(
                                (invoiceData) =>
                                  invoiceData.matching === providerNum
                              )
                          )
                          .map(({ providerNum, providerLib }) => ({
                            value: providerNum,
                            label: `${providerNum} - ${providerLib}`,
                          })),
                      ]}
                      onChange={(selectedOption) =>
                        handleOnchange(key, selectedOption.value)
                      }
                      placeholder="Sélectionnez un compte fournisseur"
                      defaultValue={
                        providersMapping[key].matching
                          ? {
                              value: providersMapping[key].matching,
                              label: `${providersMapping[key].matching} - ${
                                providers.find(
                                  (provider) =>
                                    provider.providerNum ===
                                    providersMapping[key].matching
                                )?.providerLib
                              }`,
                            }
                          : {
                              value: "",
                              label: "Aucun compte fournisseur associé",
                            }
                      }
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>

        <div className="view-footer text-end mt-2">
          <button
            className="btn btn-secondary"
            onClick={() => onSubmit(providersMapping)}
          >
            Valider
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default InvoicesDataModal;
