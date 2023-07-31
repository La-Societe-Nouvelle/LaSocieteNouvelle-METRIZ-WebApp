// La Société Nouvelle

// React
import React from "react";
import { useEffect,useState } from "react";

import { Table } from "react-bootstrap";

// Utils
import { getNewId } from "/src/utils/Utils";

import EmployeeRow from "./EmployeeRow";


/* -------------------- INDIVIDUALS DATA FOR SOCIAL FOOTPRINT -------------------- */

const IndividualsDataTable = ({ impactsData, handleIndividualsData }) => {
  const [individualsData, setIndividualsData] = useState(
    impactsData.individualsData
  );

  useEffect(() => {
    if (individualsData != impactsData.individualsData) {
      setIndividualsData(impactsData.individualsData);
    }
  }, [impactsData]);

  useEffect(async () => {
    if (impactsData.individualsData != individualsData) {
      await handleIndividualsData(individualsData);
    }


  }, [individualsData]);

  const deleteAll = () => setIndividualsData([]);

  const removeIndividual = (id) =>
    setIndividualsData((prevIndividualsData) =>
      prevIndividualsData.filter((individualData) => individualData.id !== id)
    );

  const addEmployee = () => {
    const newIndividualData = {
      id:
        "_" +
        getNewId(
          individualsData
            .filter((individualData) => individualData.id.startsWith("_"))
            .map((item) => ({ id: item.id.substring(1) }))
        ),
      name: "",
      sex: "",
      wage: null,
      workingHours: null,
      hourlyRate: null,
      trainingHours: null,
      trainingContract: false,
    };
    setIndividualsData((prevIndividualsData) => [
      ...prevIndividualsData,
      newIndividualData,
    ]);
  };

  const updateIndividualData = async (nextimpactsData) => {
    setIndividualsData((prevIndividualsData) =>
      prevIndividualsData.map((individualData) =>
        individualData.id === nextimpactsData.id
          ? { ...individualData, ...nextimpactsData }
          : individualData
      )
    );
  };


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
          {individualsData.map((individualData) => (
            <tr key={individualData.id}>
              <td>
                <i
                  className="bi bi-trash3-fill"
                  onClick={() => removeIndividual(individualData.id)}
                />
              </td>
              <EmployeeRow
                {...individualData}
                isNewEmployeeRow={false}
                updateSocialData={updateIndividualData}
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
