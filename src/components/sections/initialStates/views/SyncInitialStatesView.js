// La Société Nouvelle

// React
import { useState } from "react";
import { ProgressBar, Table } from "react-bootstrap";

// Components
import { RowTableImmobilisation } from "./RowTableImmobilisation";
import { RowTableStock } from "./RowTableStock";

// Modals
import { ErrorAPIModal } from "../../../modals/userInfoModals";

/* ---------- SYNC INITIAL STATES VIEW  ---------- */

/** Table to synchronise initial states
 * 
 */

export const SyncInitialStatesView = ({
  assets,
  period,
  initialStatesDidUpdate
}) => {

  // fetching data
  const [fetching, setFetching] = useState(false);
  const [syncProgression, setSyncProgression] = useState(0);
  
  // error API
  const [errorAPI, setErrorAPI] = useState(false);

  // ----------------------------------------------------------------------------------------------------

  // Synchronisation
  const synchroniseAll = async () => 
  {
    // accounts
    const accountsToSync = assets
      .filter((asset) => asset.initialStateType == "defaultData");

    // init progression
    setFetching(true);
    setSyncProgression(0);

    // --------------------------------------------------

    let i = 0;
    let n = accountsToSync.length;
    for (let account of accountsToSync) 
    {
      try {
        await account.updateInitialStateFootprintFromRemote();
      } catch (error) {
        setErrorAPI(true)
        break;
      }
      i++;
      setSyncProgression(Math.round((i / n) * 100));
    }

    // --------------------------------------------------

    // end progression
    setFetching(false);
    setSyncProgression(0);

    initialStatesDidUpdate();
  }

  /* ----- UPDATES ----- */

  const rowDidUpdate = () => {
    initialStatesDidUpdate();
  };

  const isSyncButtonEnable = assets.some(
    (account) => account.initialStateType == "defaultData" && !account.initialStateSet
  );

  return (
    <>
      <div className="step p-4 my-3">
        <h3 className="mb-3"> Initialiser les états initiaux </h3>

        <div className="small">
          <p>
            <i className="bi bi-info-circle"></i> <b>Valeur par défaut :</b>{" "}
            Les valeurs par défaut correspondent aux données disponibles
            pour la branche économique la plus proche.
          </p>
          <p>
            <i className="bi  bi-info-circle"></i>{" "}
            <b>Estimée sur exercice courant : </b>Nous initialisons
            l'empreinte du compte en début d'exercice. à partir des
            opérations réalisées sur l'exercice courant.
          </p>
        </div>

        {isSyncButtonEnable ? (
          <div className="alert alert-info">
            <p>
              <i className="bi bi-exclamation-circle"></i> Les empreintes de
              certains comptes doivent être synchronisées.
            </p>
            <button
              onClick={() => synchroniseAll()}
              className="btn btn-secondary"
            >
              <i className="bi bi-arrow-repeat"></i> Synchroniser les
              données
            </button>
          </div>
        ) : (
          <div className={"alert alert-success"}>
            <p>
              <i className="bi bi-check2"></i> Les données ont bien été
              synchronisées.
            </p>
          </div>
        )}
        
        <div className="table-data mt-2">
          <Table>
            <thead>
              <tr>
                <td>Compte</td>
                <td>Libellé</td>
                <td colSpan="2">États initiaux - Empreinte sociétale</td>
                <td className="text-end">Montant</td>
              </tr>
            </thead>
            <tbody>
              {assets
                .map((account) => (
                  <Row
                    key={account.accountNum}
                    account={account}
                    period={period}
                    onUpdate={rowDidUpdate}
                  />
                ))}
            </tbody>
          </Table> 
        </div>

        {fetching && (
          <div className="popup">
            <ProgressBar
              message="Récupération des données par défaut..."
              progression={syncProgression}
            />
          </div>)}
      </div>

      <ErrorAPIModal
        hasError={errorAPI}
        onClose={() => setErrorAPI(false)}
      />      
    </>
  )
}

/* ---------- ROWS ---------- */

const Row = (props) => 
{
  switch (props.account.accountNum.charAt(0)) {
    case "2":
      return <RowTableImmobilisation {...props} />;
    case "3":
      return <RowTableStock {...props} />;
  }
}