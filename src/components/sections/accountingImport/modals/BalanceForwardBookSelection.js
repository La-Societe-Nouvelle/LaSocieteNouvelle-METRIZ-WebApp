// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Image, Table } from "react-bootstrap";

// Librairies
import booksProps from "/lib/books.json";


/* ---------- BALANCE FORWARD BOOK SELECTION  ---------- */

/** View to select the balance carrier forward book
 *
 *  Props :
 *    - FECData -> meta, books
 *    - onSubmit()
 *    - onCancel()
 *
 *  Update meta.accounts to set the balance carrier forward book (journal A-Nouveau)
 */

export const BalanceForwardBookSelection = ({
  FECData,
  onSubmit,
  onCancel
}) => {
  
  const [balanceForwardBookCode, setBalanceForwardBookCode] = useState("");

  // ----------------------------------------------------------------------------------------------------

  useEffect(() => 
  {
    // pre-select A-NOUVEAUX
    let potentialBooks = Object.entries(FECData.meta.books)
      .filter(([code,meta]) =>
           booksProps.ANOUVEAUX.codes.includes(code)
        || booksProps.ANOUVEAUX.labels.includes(meta.label.toUpperCase()))
      .map(([code,_]) => code);
        
    if (potentialBooks.length==1) {
      const selectedCode = potentialBooks[0];
      setBalanceForwardBookCode(selectedCode);
    };
  }, [])

  // ----------------------------------------------------------------------------------------------------

  // on change
  const onSelection = (event) => {
    let { value, checked } = event.target;
    if (checked) {
      setBalanceForwardBookCode(value);
    } else {
      setBalanceForwardBookCode("");
    }
  };

  // ----------------------------------------------------------------------------------------------------

  const submit = () => 
  {
    // remove type
    Object.values(FECData.meta.books)
        .filter(({type}) => type == "ANOUVEAUX")
        .forEach(({type}) => type = "");
    
    // select book
    if (balanceForwardBookCode) {
      FECData.meta.books[balanceForwardBookCode].type = "ANOUVEAUX"
    };

    // console logs
    console.log("Sélection du journal des A-Nouveaux : "+balanceForwardBookCode);
    console.log(FECData.meta.books);

    onSubmit();
  };

  // ----------------------------------------------------------------------------------------------------

  const printDate = (date) => date.substring(6,8)+"/"+date.substring(4,6)+"/"+date.substring(0,4);

  return (
    <>
      <h4>Identifiez les A-Nouveaux</h4>
      <div className="small mb-3">
        <div className="alert-info">
          <div className="info-icon">
            <Image src="/info-circle.svg" alt="icon info" />
          </div>
          <p>
            L'identification du journal des A-Nouveaux est nécessaire à la bonne
            lecture du fichier d'écritures comptables. En cas de premier exercice,
            validez la sélection sans cocher de case.
          </p>
        </div>
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
          {Object.entries(FECData.meta.books)
            .sort()
            .map(([code, { label }]) => {
              const nLines = FECData.books[code].length;
              const dateEnd = FECData.books[code][nLines - 1].EcritureDate;
              return (
                <tr key={code}>
                  <td>{code}</td>
                  <td>{label}</td>
                  <td>{printDate(dateEnd)}</td>
                  <td className="align-center">{nLines}</td>
                  <td className="text-end">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="ANOUVEAUX"
                        value={code}
                        checked={code == balanceForwardBookCode}
                        onChange={onSelection}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
      <div className="text-end">
        <button className="btn btn-primary me-2" onClick={onCancel}>
          Annuler
        </button>
        <button className="btn btn-secondary" onClick={() => submit()}>
          Etape suivante
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </>
  );
}