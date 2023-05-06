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
    const { invoicesData,closePopup } = this.props;
    const { mapping } = this.state;

    return (
      <Modal show="true" onHide={closePopup} size="md" centered>
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
                  {Object.entries(invoicesData).map(([key,value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td></td>
                      <td></td>
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