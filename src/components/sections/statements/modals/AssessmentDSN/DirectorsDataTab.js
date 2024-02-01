// La Société Nouvelle

// React
import React, { useEffect,useState } from "react";
import { Accordion, Table } from "react-bootstrap";

// Utils
import { getNewId } from "/src/utils/Utils";
import { getSumItems, isValidNumber, roundValue } from "../../../../../utils/Utils";
import { printValue } from "/src/utils/formatters";
import { initIndividualData } from "./utils";

// Components
import DirectorRow from "./DirectorRow";
import { DirectorRemunerationAccountsTable } from "./DirectorRemunerationAccountsTable";


/* -------------------- EXECUTIVES DATA FOR SOCIAL FOOTPRINT -------------------- */

export const DirectorsDataTab = ({ 
  individualsData: individualsDataInModal, 
  onUpdateIndividualsData,
  onUpdateDirectorRemunerationAccounts,
  directorRemunerationAccounts
}) => {
  
  // executives data
  const [individualsData, setIndividualsData] = useState(individualsDataInModal);
  const [accountsData, setAccountsData] = useState(directorRemunerationAccounts || {});
  
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

  useEffect(() => {
    onUpdateDirectorRemunerationAccounts(accountsData);
  }, [accountsData]);

  // ----------------------------------------------------------------------------------------------------

  const removeAll = () => {
    const nextIndividualsData = individualsData
      .filter((individualData) => !individualData.isDirector);
    setIndividualsData([...nextIndividualsData]);
  };

  const removeIndividual = (id) => {
    setIndividualsData(individualsData
      .filter((individualData) => individualData.id !== id));
  }

  const addDirector = () => {
    const id = getNewId(
      individualsData
        .filter((individualData) => individualData.id.startsWith("_"))
        .map((item) => ({ id: item.id.substring(1) }))
    );
    const newIndividualData = initIndividualData(id);

    // specifi data for director
    newIndividualData.isDirector = true;
    newIndividualData.workingHours = roundValue(1806, 2);

    setIndividualsData([
      ...individualsData,
      newIndividualData,
    ]);
  };

  const applyAccountingData = () => 
  {
    const nbDirectors = individualsData.filter(individual => individual.isDirector).length;
    individualsData
      .filter((individual) => individual.isDirector)
      .forEach((individual) => {
        let nextWage = getSumItems(Object.values(accountsData)
          .map((accountData) => {
            switch(accountData.allocation) {
              case individual.id : return accountData.amount;
              case "all" : return accountData.amount/nbDirectors;
              default : return 0;
            }
          })
        , 0);
        individual.wage = nextWage;
        if (isValidNumber(nextWage,0)
          && isValidNumber(individual.workingHours,0) && individual.workingHours>0) {
            individual.hourlyRate = roundValue(nextWage / individual.workingHours, 2);
        }
      });

    setIndividualsData(individualsData.slice());
    onUpdateIndividualsData(individualsData);
  }

  const onAccountingDataUpdate = (accountData) => {
    setAccountsData({
      ...accountsData,
      [accountData.accountNum]: accountData
    });
  }

  const didUpdate = () => 
  {
    // update impacts data
    onUpdateIndividualsData(individualsData);
  }
  
  console.log(individualsData);
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
            .filter(individualData => individualData.isDirector)
            .map((individualData) => (
              <tr key={individualData.id}>
                <td>
                  <i
                    className="bi bi-trash3-fill"
                    onClick={() => removeIndividual(individualData.id)}
                  />
                </td>
                <DirectorRow
                  individualData={individualData}
                  isNewEmployeeRow={false}
                  onUpdate={didUpdate}
                />
              </tr>
          ))}
        </tbody>
      </Table>

      <button className="btn btn-primary btn-sm me-2" onClick={addDirector}>
        <i className="bi bi-plus-lg"></i> Ajouter
      </button>
      <button className="btn btn-secondary btn-sm" onClick={removeAll}>
        <i className="bi bi-trash3-fill" /> Supprimer tout
      </button>

      <hr></hr>
      <Accordion>
        <Accordion.Item eventKey="0" className="bg-white">
          <Accordion.Header as="h5">
            <i className="bi bi-bar-chart-steps me-2"></i>
            Données comptables - Rémunérations du travail de l'exploitant 
          </Accordion.Header>
          <Accordion.Body className="chart-accordion bg-white p-0">
            <DirectorRemunerationAccountsTable
              accountingData={accountsData}
              individualsData={individualsData}
              onUpdate={onAccountingDataUpdate}
            />
            {/* <div className="p-3">
              <button className="btn btn-primary btn-sm me-2" onClick={applyAccountingData}>
                <i className="bi bi-arrow-repeat"></i> Attribuer les rémunérations
              </button>
            </div> */}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}