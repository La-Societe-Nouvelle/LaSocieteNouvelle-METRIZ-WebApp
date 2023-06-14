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
  constructor(props) 
  {
    super(props);
    this.state = {
      // mapping
      mapping: props.mapping || {}
    };
  }

  render() 
  {
    const { invoicesData,providers,closePopup } = this.props;
    const { mapping } = this.state;

    return (
      <Modal show="true" onHide={closePopup} size="xl" centered>
        <Modal.Body>
          <div className="assessment">
                
            <div className="table-main">
              <Table size="sm" responsive>
                <thead>
                  <tr>
                    <td>Identifiant</td>
                    <td>Dénomination</td>
                    <td>Compte fournisseur</td>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(invoicesData).map(([key,{legalUnitData}]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{legalUnitData.denomination}</td>
                      <td>
                        <select
                          className="form-select"
                          onChange={(e) => handleOnchange(accountToMapNum, e.target.value)}
                          value={""}
                        >
                          <option value="">Aucun compte fournisseur associé</option>
                          {providers
                            .filter((provider) => !provider.isDefaultProviderAccount)
                            .map(({providerNum,providerLib}, index) => (
                              <option key={index} value={providerNum}>
                                {providerNum} - {providerLib}
                              </option>
                            ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <hr/>             
            <div className="view-footer text-end mt-2">
              <button
                className="btn btn-secondary "
                onClick={() => this.onSubmit()}>
                Valider
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  /* ---------- HEADER ACTIONS ---------- */

  handleOnchange = async (providerId,providerNum) =>
  {
    let mapping = this.state.mapping;
    mapping[providerId] = providerNum;
    this.setState({ mapping });
  }

  // Submit
  onSubmit = async () => 
  {
    // to do

    this.props.onGoBack({});
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