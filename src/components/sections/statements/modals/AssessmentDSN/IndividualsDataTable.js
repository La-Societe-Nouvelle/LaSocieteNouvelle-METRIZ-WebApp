// La Société Nouvelle

// React
import React from "react";
import { useEffect,useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { getNewId } from "/src/utils/Utils";

import EmployeeRow from "./EmployeeRow";
import { initIndividualData } from "./utils";


/* -------------------- INDIVIDUALS DATA FOR SOCIAL FOOTPRINT -------------------- */

const IndividualsDataTable = ({ 
  impactsData, 
  handleIndividualsData,
  onChange
}) => {
  // individuals data
  const [individualsData, setIndividualsData] = useState(
    impactsData.individualsData
  );

  // when props update
  useEffect(() => {
    console.log(individualsData !== impactsData.individualsData);
    console.log(individualsData != impactsData.individualsData);
    console.log(individualsData);
    console.log(impactsData.individualsData);
    if (individualsData !== impactsData.individualsData) {
      setIndividualsData(impactsData.individualsData);
    }
  }, [impactsData.individualsData]);

  // when state update
  useEffect(async () => {
    console.log("use effect triggered individuals data state")
    impactsData.individualsData = individualsData;
    console.log(individualsData);
  }, [individualsData]);

  // manage individuals data

  const deleteAll = () => setIndividualsData([]);

  const removeIndividual = (id) => {
    setIndividualsData((prevIndividualsData) =>
      prevIndividualsData.filter((individualData) => individualData.id !== id)
    );
  }

  const addEmployee = () => {
    const id = getNewId(
      individualsData
        .filter((individualData) => individualData.id.startsWith("_"))
        .map((item) => ({ id: item.id.substring(1) }))
    );
    const newIndividualData = initIndividualData(id);
    setIndividualsData((prevIndividualsData) => [
      ...prevIndividualsData,
      newIndividualData,
    ]);
  };

  const updateIndividualData = async (nextIndividualData) => {
    const nextIndividualsData = impactsData.individualsData
      .map((individualData) =>
        individualData.id === nextIndividualData.id
          ? { ...individualData, ...nextIndividualData }
          : individualData
      );
    console.log(nextIndividualsData);
    impactsData.individualsData = nextIndividualsData;
    //setIndividualsData(nextIndividualsData);
  };

  const rowDidUpdate = () => {
    console.log(individualsData);
    impactsData.individualsData = individualsData;
    onChange();
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
                  updateSocialData={updateIndividualData}
                  onUpdate={rowDidUpdate}
                />
              </tr>
          ))}
        </tbody>
      </Table>

      <button className="btn btn-primary btn-sm me-2" onClick={addEmployee}>
        <i className="bi bi-plus-lg"></i> Ajouter
      </button>
      <button className="btn btn-secondary btn-sm" onClick={deleteAll}>
        <i className="bi bi-trash3-fill" /> Supprimer tout
      </button>
    </div>
  );
};

export default IndividualsDataTable;
