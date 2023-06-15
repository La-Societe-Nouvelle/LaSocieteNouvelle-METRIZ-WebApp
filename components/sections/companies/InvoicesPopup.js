// La Société Nouvelle

// React
import React from "react";
import { Modal, Table } from "react-bootstrap";

/* -------------------- INVOICES DATA POPUP -------------------- */

/** Component in SirenSection
 *  Props :
 *    - invoicesData (extracted data from pdf)
 *    - providers
 *    - onGoBack -> close popup
 *  Behaviour :
 *    Edit indivualsData in state
 *    Update impacts data and footprints on validation
 *  State :
 *    mapping
 */

export class InvoicesPopup extends React.Component 
{
  constructor(props) {
    super(props);
    this.state = {
      // mapping
      mapping: props.invoicesData || {},
    };
  }


  render() 
  {
    const { invoicesData, providers, closeinvoicesPopup} = this.props;
    const { mapping } = this.state;
    
    return (
      <Modal show="true" onHide={closeinvoicesPopup} size="xl" centered>
        <Modal.Header  closeButton>
          <h3>Associer les comptes fournisseurs </h3>
        </Modal.Header>
        <Modal.Body>
          <div className="assessment">
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <td>Identifiant</td>
                  <td>Dénomination</td>
                  <td>Compte fournisseur</td>
                </tr>
              </thead>
              <tbody>
                {Object.entries(invoicesData).map(
                  ([key, { legalUnitData }]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{legalUnitData.denomination}</td>
                      <td>
                        <select
                          className="form-select"
                          onChange={(e) =>
                            this.handleOnchange(key, e.target.value)
                          }
                          value={mapping[key].matching}
                        >
                          <option value="">
                            Aucun compte fournisseur associé
                          </option>
                          {providers
                            .filter(
                              (provider) => !provider.isDefaultProviderAccount
                            )
                            .map(({ providerNum, providerLib }, index) => (
                              <option key={index} value={providerNum}>
                                {providerNum} - {providerLib}
                              </option>
                            ))}
                        </select>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>

            <div className="view-footer text-end mt-2">
            <button
                className="btn btn-light me-1 "
                onClick={closeinvoicesPopup}
              >
                Annuler
              </button>

              <button
                className="btn btn-secondary "
                onClick={() => this.onSubmit()}
              >
                Valider
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  /* ---------- HEADER ACTIONS ---------- */

  handleOnchange = async (providerId, providerNum) => 
  {
    let mapping = this.state.mapping;
    Object.values(mapping).filter((invoiceData) => invoiceData.matching==providerNum).forEach((invoiceData) => invoiceData.matching="");
    mapping[providerId].matching = providerNum;
    this.setState({ mapping });
  };

  // Submit
  onSubmit = async () => 
  {
    // to do
    this.props.onGoBack(this.state.mapping);
  };

  /* ---------- TABLE DISPLAY ---------- */

  // Column for sorting
  changeColumnSorted(columnSorted) {
    if (columnSorted != this.state.columnSorted) {
      this.setState({ columnSorted: columnSorted, reverseSort: false });
    } else {
      this.setState({ reverseSort: !this.state.reverseSort });
    }
  }
}
