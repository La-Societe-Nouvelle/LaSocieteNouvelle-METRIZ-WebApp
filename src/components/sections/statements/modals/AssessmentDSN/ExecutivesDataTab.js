// La Société Nouvelle

// React
import React, { useEffect,useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { getNewId } from "/src/utils/Utils";
import { roundValue } from "../../../../../utils/Utils";

import ExecutiveRow from "./ExecutiveRow";
import { initIndividualData } from "./utils";


/* -------------------- EXECUTIVES DATA FOR SOCIAL FOOTPRINT -------------------- */

export const ExecutivesDataTab = ({ 
  individualsData: individualsDataInModal, 
  onUpdateIndividualsData,
  resetIndividualsData,
  personnelExpenses
}) => {

  const executiveRemunerationData = {};
  personnelExpenses
    //.filter((expense) => /^644/.test(expense.accountNum))
    .forEach((expense) => {
      if (!executiveRemunerationData.hasOwnProperty(expense.accountNum)) {
        executiveRemunerationData[expense.accountNum] = 0;
      }
      executiveRemunerationData[expense.accountNum] =
        roundValue(executiveRemunerationData[expense.accountNum] + expense.amount, 2);
    });

  // executives data
  const [individualsData, setIndividualsData] = useState(individualsDataInModal);

  // ----------------------------------------------------------------------------------------------------

  // when props update
  useEffect(() => 
  {
    if (individualsData !== individualsDataInModal) {
      setIndividualsData(individualsDataInModal);
    }
  }, [individualsDataInModal]);

  // when individuals data update (individual removed or added)
  useEffect(() => {
    didUpdate();
  }, [individualsData]);

  // ----------------------------------------------------------------------------------------------------

  const removeAll = () => {
    setIndividualsData([]);
  };

  const removeIndividual = (id) => {
    setIndividualsData(individualsData
      .filter((individualData) => individualData.id !== id));
  }

  const addIndividual = () => {
    const id = getNewId(
      individualsData
        .filter((individualData) => individualData.id.startsWith("_"))
        .map((item) => ({ id: item.id.substring(1) }))
    );
    const newIndividualData = initIndividualData(id);
    setIndividualsData([
      ...individualsData,
      newIndividualData,
    ]);
  };

  const didUpdate = () => 
  {
    // update impacts data
    onUpdateIndividualsData(individualsData);
  }

  return (
    <div className="assessment">
      <Table>
        <thead>
          <tr>
            <td></td>
            <td>Nom</td>
            <td>Sexe</td>
            <td>Heures travaillées (annuelles)</td>
            <td>Rémunération annuelle brute</td>
            <td>Taux horaire</td>
            <td>Heures de formation</td>
          </tr>
        </thead>
        <tbody>
          {individualsData
            .map((individualData) => (
              <tr key={individualData.id}>
                <td>
                  <i
                    className="bi bi-trash3-fill"
                    onClick={() => removeIndividual(individualData.id)}
                  />
                </td>
                <ExecutiveRow
                  individualData={individualData}
                  isNewEmployeeRow={false}
                  onUpdate={didUpdate}
                />
              </tr>
          ))}
        </tbody>
      </Table>

      <button className="btn btn-primary btn-sm me-2" onClick={addIndividual}>
        <i className="bi bi-plus-lg"></i> Ajouter
      </button>
      <button className="btn btn-primary btn-sm me-2" onClick={resetIndividualsData}>
        <i className="bi bi-arrow-repeat"></i> Réinitialiser
      </button>
      <button className="btn btn-secondary btn-sm" onClick={removeAll}>
        <i className="bi bi-trash3-fill" /> Supprimer tout
      </button>

      <hr></hr>
      <h4>Données des comptes 644x</h4>
      {Object.entries(executiveRemunerationData)
        .map(([accountNum,amount]) =>
          <div>
            <p>{accountNum} : {amount} €</p>
          </div>
        )}
    </div>
  );
}