// La Société Nouvelle

// React

import React from "react";
import { Table } from "react-bootstrap";

/* ---------- FEC IMPORT  ---------- */

export class FECImport extends React.Component 
{
  constructor(props) {
    super(props);
    this.state = {
      ...props.FECData,
      noBook: false,
    };
  }

  render() {
    const { meta, books } = this.state;

    return (
      <>
        <h3 className="subtitle ">Identifiez les A-Nouveaux</h3>
          <div className="form-text mb-3">
            <p>
              L'identification du journal des A-Nouveaux est nécessaire à la
              bonne lecture du fichier d'écritures comptables. En cas de premier
              exercice, validez la sélection sans cocher de case.
            </p>
          </div>
        <div className="table-container">
          <Table hover responsive borderless>
            <thead>
              <tr>
                <td>Code</td>
                <td>Libellé</td>
                <td>Fin</td>
                <td className="align-center">Nombre de Lignes</td>
                <td className="text-end">Identification A-Nouveaux</td>
              </tr>
            </thead>
            <tbody>
              {Object.entries(meta.books)
                .sort()
                .map(([code, { label, type }]) => {
                  const nLines = books[code].length;
                  const dateEnd = books[code][nLines - 1].EcritureDate;
                  return (
                    <tr key={code}>
                      <td>{code}</td>
                      <td>{label}</td>
                      <td>
                        {dateEnd.substring(6, 8) +
                          "/" +
                          dateEnd.substring(4, 6) +
                          "/" +
                          dateEnd.substring(0, 4)}
                      </td>
                      <td className="align-center">{nLines}</td>
                      <td className="text-end">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            name="ANOUVEAUX"
                            value={code}
                            checked={type == "ANOUVEAUX"}
                            onChange={this.changeJournalANouveaux}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>

          <div className="text-end">
            <button
              className="btn btn-primary me-2"
              onClick={() => this.props.return()}
            >
              <i className="bi bi-chevron-left"></i>
              Importer un autre FEC
            </button>
            <button
              className="btn btn-secondary"
              onClick={this.onSubmit}
            >
              Etape suivante
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ----- EDIT ----- */

  changeJournalANouveaux = (event) => 
  {
    let meta = this.state.meta;
    let selectedCode = event.target.value;
    let prevSelectedCode = Object.entries(meta.books)
      .filter(([code, _]) => meta.books[code].type == "ANOUVEAUX")
      .map(([code, _]) => code)[0];
    Object.entries(meta.books).forEach(
      ([code, _]) =>
        (meta.books[code].type =
          code == selectedCode && selectedCode != prevSelectedCode
            ? "ANOUVEAUX"
            : "")
    );
    this.setState({ meta: meta, noBook: selectedCode == prevSelectedCode });
  };

  onSubmit = () =>
  {
    console.log("Sélection du journal des A-Nouveaux : ");
    console.log(this.state.meta.books);
    this.props.onClick();
  }
}
