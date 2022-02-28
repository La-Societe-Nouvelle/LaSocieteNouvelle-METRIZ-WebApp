// La Société Nouvelle

// React
import React from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

/* ---------- FEC IMPORT  ---------- */

export class FECImportSection extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ...props.FECData,
      noBook: false
    }
  }

  render() {
    const { meta, books, noBook } = this.state;
    const disabledValidation = !(noBook || Object.entries(meta.books).map(([_, { type }]) => type).includes("ANOUVEAUX"));
    const refresh = () => location.reload(true);

    return (

      <>
        <div className={"table-container container"}>
          <h4>Identifiez le journal des A-Nouveaux : </h4>
          <table>
            <thead>
              <tr>
                <td>Code</td>
                <td>Libellé</td>
                <td>Fin</td>
                <td>Nombre de Lignes</td>
                <td width="50px">Identification A-Nouveaux</td>
              </tr>
            </thead>
            <tbody>
              {Object.entries(meta.books).sort()
                .map(([code, { label, type }]) => {
                  const nLines = books[code].length;
                  const dateStart = books[code][0].EcritureDate;
                  const dateEnd = books[code][nLines - 1].EcritureDate;
                  return (
                    <tr key={code}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" id="checked" name="ANOUVEAUX" value={code} checked={type == "ANOUVEAUX"} onChange={this.changeJournalANouveaux} />
                        </div>
                      </td>
                      <td>{code}</td>
                      <td>{label}</td>
                      <td>{dateEnd.substring(6, 8) + "/" + dateEnd.substring(4, 6) + "/" + dateEnd.substring(0, 4)}</td>
                      <td>{nLines}</td>

                    </tr>
                  )
                }
                )}
            </tbody>
          </table>
          <div className={"custom-control-inline"}>
            <div className="form-group">
              <input type="checkbox" className="custom-control-input"
                checked={noBook}
                onChange={this.onCheckboxChange} />
              <label htmlFor="certification" className="custom-control-label">&nbsp;Pas de journal A-Nouveaux</label>
            </div>
          </div>

        </div>
    
        <div className={"container align-right"}>
          <button className={"btn btn-outline"} onClick={refresh}>
            Retour
          </button>
            Valider la sélection
          </button>
        </div>
      </>
    )
  }

  /* ----- EDIT ----- */

  changeJournalANouveaux = (event) => {
    let selectedCode = event.target.value;
    let meta = this.state.meta;
    Object.entries(meta.books).forEach(([code, _]) => meta.books[code].type = (code == selectedCode ? "ANOUVEAUX" : ""));
    this.setState({ meta: meta, noBook: false });
  }

  onCheckboxChange = (event) => {
    let meta = this.state.meta;
    if (event.target.checked) Object.entries(meta.books).forEach(([code, _]) => meta.books[code].type = "");
    this.setState({ meta: meta, noBook: event.target.checked });
  }

  /* ----- PROPS METHODS ----- */

  validate = () => this.props.onValidate({ ...this.state })

}