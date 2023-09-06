// La Société Nouvelle

// React
import React, { useState } from "react";

// Bootstrap
import { Table } from "react-bootstrap";

/* ---------- BALANCE FORWARD BOOK SELECTION  ---------- */

/** View to select the balance carrier forward book
 *
 *  Props :
 *    - FECData -> meta
 *    - onClick()
 *    - return()
 *
 *  Update meta.accounts to set the balance carrier forward book (journal A-Nouveau)
 */

export function BalanceForwardBookSelection(props) {
  const { books } = props.FECData;
  const [meta, setMeta] = useState(props.FECData.meta);

  const formateDate = (date) => date.substring(6,8)+"/"+date.substring(4,6)+"/"+date.substring(0,4);

  // on change
  const handleOnChange = (event) => {
    let selectedCode = event.target.value;
    let prevSelectedCode =
      Object.entries(meta.books)
        .filter(([code, _]) => meta.books[code].type == "ANOUVEAUX")
        .map(([code, _]) => code)[0] || "";

    // change selected code
    if (selectedCode != prevSelectedCode) {
      Object.entries(meta.books).forEach(([code, _]) => {
        meta.books[code].type = code == selectedCode ? "ANOUVEAUX" : "";
      });
    }
    // remove current selection
    else {
      meta.books[selectedCode].type = "";
    }

    props.FECData.meta = meta; // update props
    setMeta(meta);
  };

  const onSubmit = () => {
    console.log("Sélection du journal des A-Nouveaux : ");
    console.log(meta.books);
    props.onClick();
  };

  return (
    <>
      <h4>Identifiez les A-Nouveaux</h4>
      <div className="small mb-3">
        <p>
          L'identification du journal des A-Nouveaux est nécessaire à la bonne
          lecture du fichier d'écritures comptables. En cas de premier exercice,
          validez la sélection sans cocher de case.
        </p>
      </div>
      <Table bordered hover>
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
                  <td>{formateDate(dateEnd)}</td>
                  <td className="align-center">{nLines}</td>
                  <td className="text-end">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="ANOUVEAUX"
                        value={code}
                        checked={type == "ANOUVEAUX"}
                        onChange={handleOnChange}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
      <div className="text-end">
        <button className="btn btn-primary me-2" onClick={() => props.return()}>
          Annuler
        </button>
        <button className="btn btn-secondary" onClick={onSubmit}>
          Etape suivante
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </>
  );
}
