// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { getSumItems } from "../../../../../utils/Utils";
import { printValue } from "/src/utils/formatters";


export const DirectorRemunerationAccountsTable = ({
  accountingData,
  individualsData,
  onUpdate
}) => {

  const [accountsData, setAccountsData] = useState(accountingData);

  // ----------------------------------------------------------------------------------------------------

  useEffect(() => {

    const isDirectors = individualsData.some(individual => individual.isDirector);
    if (!isDirectors) {
      // set to none if no director
      Object.values(accountsData).forEach((accountData) => accountData.allocation = "none");
    } else {
      const allUnallocated = Object.values(accountsData)
        .every(accountData => accountData.allocation == "none");
      if (allUnallocated) {
        // set to all if unallocated
        Object.values(accountsData).forEach((accountData) => accountData.allocation = "all");
      }
    }

    setAccountsData({...accountsData});

  }, [individualsData]);

  // useEffect(() => {
  //   onUpdate(accountsData);
  // }, [accountsData]);

  // useEffect(() => {
  //   setAccountsData({...accountingData});
  // }, [accountingData])

  // ----------------------------------------------------------------------------------------------------

  const onAccountDataUpdate = (accountData) => {
    // setAccountsData({
    //   ...accountsData,
    //   [accountData.accountNum]: accountData
    // });
  }

  // ----------------------------------------------------------------------------------------------------

  const totalRemuneration = getSumItems(Object.values(accountsData)
    .filter((accountData) => accountData.allocation != "none")
    .map((accountData) => accountData.amount));

  return(
    <Table >
      <thead>
        <tr>
          <td>Compte</td>
          <td>Libellé</td>
          <td>Montant</td>
          {/* <td>Traitement</td> */}
        </tr>
      </thead>
      <tbody>
        {Object.values(accountsData)
          .sort((a,b) => a.accountNum.localeCompare(b.accountNum))
          .map((accountData) =>
          <DirectorDataRow
            accountData={accountData}
            individualsData={individualsData}
            onUpdate={onAccountDataUpdate}
          />
        )}

        <tr className="with-top-line">
          <td colSpan={2}>Total</td>
          <td className="column_value">
            {printValue(totalRemuneration, 0)} &euro;
          </td>
          {/* <td></td> */}
        </tr>
      </tbody>
    </Table>
  )
}


// ROW

const DirectorDataRow = ({
  accountData,    // item data
  individualsData,
  onUpdate,       // trigger
}) => {

  // variables
  const [allocation, setAllocation] = useState(accountData.allocation);

  // ----------------------------------------------------------------------------------------------------

  // on change
  useEffect(() => {    
    accountData.allocation = allocation;
    onUpdate(accountData);
  }, [allocation]);

  useEffect(() => {
    if (accountData.allocation != allocation) {
      setAllocation(accountData.allocation);
    }
  }, [accountData.allocation])

  // ----------------------------------------------------------------------------------------------------

  // Allocation
  const updateAllocation = (event) => {
    const nextAllocation = event.target.value
    setAllocation(nextAllocation);
  };

  // ----------------------------------------------------------------------------------------------------

  return(
    <tr key={accountData.accountNum}>
      <td>{accountData.accountNum}</td>
      <td>{accountData.accountLib}</td>
      <td className="column_value">{printValue(accountData.amount,0)} €</td>
      {/* <td>
        <select
          className="form-select form-select-sm"
          value={accountData.allocation}
          onChange={updateAllocation}
        >
          <option key="none" value="none">Non attribué</option>
          <option key="all" value="all">Attribué à tous</option>
          {individualsData
            .filter(individual => individual.isDirector)
            .map((individual) => 
              <option key={individual.id} value={individual.id}>Attribué à {individual.name}</option>
            )}
        </select>
      </td> */}
    </tr>
  )
}