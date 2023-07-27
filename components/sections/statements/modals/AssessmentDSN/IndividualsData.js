// La Société Nouvelle

// React
import React from "react";
import { Table } from "react-bootstrap";

// Utils
import { getNewId, } from "/src/utils/Utils";

import TableRow from "./TableRow";
import { useEffect } from "react";
import { useState } from "react";

/* -------------------- INDIVIDUALS DATA FOR SOCIAL FOOTPRINT -------------------- */

/*  The assessment tool is the same for IDR & GEQ
 *  it's also used for KNW with the training hourse and the training contracts
 */

const IndividualsData = ({ impactsData, onIndividualsDataUpdate }) => {

  const [individualsData, setIndividualsData] = useState(impactsData.individualsData || []);

  useEffect(() => {

    if(individualsData != impactsData.individualsData) {
      setIndividualsData(impactsData.individualsData)
    }
   // if (impactsData.socialStatements.length > 0 && individualsData.length === 0) {
      //     const individualsData = await getIndividualsData(impactsData.socialStatements);
      //     setIndividualsData(individualsData);
      //   }

  // const isAllValid = !individualsData.some((individualData) => !checkIndividualData(individualData));
    
  }, [impactsData.individualsData]);

 



  const deleteAll = () => setIndividualsData([]);

  const removeIndividual = (id) =>
    setIndividualsData((prevIndividualsData) => prevIndividualsData.filter((individualData) => individualData.id !== id));

  const addEmployee = () => {
    const newIndividualData = {
      id: '_' + getNewId(individualsData.filter((individualData) => individualData.id.startsWith('_')).map((item) => ({ id: item.id.substring(1) }))),
      name: '',
      sex: '',
      wage: null,
      workingHours: null,
      hourlyRate: null,
      trainingHours: null,
      trainingContract: false,
    };
    setIndividualsData((prevIndividualsData) => [...prevIndividualsData, newIndividualData]);
  };

  const updateIndividualData = (nextProps) => {
    setIndividualsData((prevIndividualsData) =>
      prevIndividualsData.map((individualData) => (individualData.id === nextProps.id ? { ...individualData, ...nextProps } : individualData))
    );
  };


  /* -------------------- CHECK IF ALL DATA OK -------------------- */

const checkIndividualData = (individualData) => {
  if (individualData.sex != 1 && individualData.sex != 2) return false;
  else if (individualData.wage == null) return false;
  else if (individualData.workingHours == null) return false;
  else if (individualData.hourlyRate == null) return false;
  else return true;
};


  return (
    <div className="assessment">
      <Table size="sm" responsive>
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
              <TableRow
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

export default IndividualsData;


