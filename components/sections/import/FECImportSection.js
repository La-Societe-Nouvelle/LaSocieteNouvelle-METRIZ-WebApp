// La Société Nouvelle

// React
import React from 'react';

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

    return (
        <div className="table-container">
          <p className="alert alert-info">
            L'identification du journal des A-Nouveaux est nécessaire à la bonne lecture du fichier d'écritures comptables.
            En cas de premier exercice, validez la sélection sans cocher de case.
          </p>
          <table className="w100">
            <thead>
              <tr>
                <td>Code</td>
                <td>Libellé</td>
                <td>Fin</td>
                <td className="align-center">Nombre de Lignes</td>
                <td className="column_value" width="100px">Identification A-Nouveaux</td>
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
                      <td>{code}</td>
                      <td>{label}</td>
                      <td>{dateEnd.substring(6, 8) + "/" + dateEnd.substring(4, 6) + "/" + dateEnd.substring(0, 4)}</td>
                      <td className="align-center">{nLines}</td>
                      <td className="column_value">
                        <div className="form-check">
                          <input type="checkbox" id="checked" name="ANOUVEAUX" value={code} checked={type == "ANOUVEAUX"} onChange={this.changeJournalANouveaux} />
                        </div>
                      </td>
                    </tr>
                  )
                }
                )}

            </tbody>
          </table>

        </div>
    )
  }

  /* ----- EDIT ----- */

  changeJournalANouveaux = (event) => {
    let meta = this.state.meta;
    let selectedCode = event.target.value;
    let prevSelectedCode = Object.entries(meta.books).filter(([code, _]) => meta.books[code].type == "ANOUVEAUX").map(([code, _]) => code)[0];
    Object.entries(meta.books).forEach(([code, _]) => meta.books[code].type = (code == selectedCode && selectedCode != prevSelectedCode ? "ANOUVEAUX" : ""));
    this.setState({ meta: meta, noBook: selectedCode == prevSelectedCode });
    this.props.onChangeJournalANouveaux(meta);
  }

}