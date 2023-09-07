// La Société Nouvelle

// React
import React, { useEffect,useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { getNewId } from "/src/utils/Utils";

import EmployeeRow from "./EmployeeRow";
import { checkIndividualData, initIndividualData } from "./utils";


/* -------------------- INDIVIDUALS DATA FOR SOCIAL FOOTPRINT -------------------- */

export const IndividualsDataTab = ({ 
  individualsData: individualsDataInModal, 
  onUpdateIndividualsData,
}) => {

  // individuals data
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
            <td>Contrat de formation</td>
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
                <EmployeeRow
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
      <button className="btn btn-secondary btn-sm" onClick={removeAll}>
        <i className="bi bi-trash3-fill" /> Supprimer tout
      </button>
    </div>
  );
}