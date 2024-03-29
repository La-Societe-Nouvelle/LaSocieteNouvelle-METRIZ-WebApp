// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { getSumItems } from "../../../../../utils/Utils";
import { printValue } from "/src/utils/formatters";


export const DirectorAccountingDataView = ({
  accountingData: accountDataProp,
  individualsData,
  onUpdate
}) => {

  const [accountingData, setAccountingData] = useState(accountDataProp);

  // ----------------------------------------------------------------------------------------------------

  // useEffect(() => {
  //   onUpdate(accountsData);
  // }, [accountsData]);

  useEffect(() => {
    setAccountingData({...accountingData});
  }, [accountDataProp])

  // ----------------------------------------------------------------------------------------------------

  const onAccountDataUpdate = (accountData) => {
    setAccountingData({
      ...accountingData,
      [accountData.accountNum]: accountData
    });
  }

  // ----------------------------------------------------------------------------------------------------

  const totalRemuneration = getSumItems(Object.values(accountingData)
    .filter((accountData) => accountData.allocation != "none")
    .map((accountData) => accountData.amount));

  return(
    <Table >
      <thead>
        <tr>
          <td>Compte</td>
          <td>Libellé</td>
          <td>Montant</td>
          <td>Traitement</td>
        </tr>
      </thead>
      <tbody>
        {Object.values(accountingData)
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
          <td></td>
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

  // state
  const [allocation, setAllocation] = useState(accountData.allocation);

  // ----------------------------------------------------------------------------------------------------

  // on change (state)
  useEffect(() => {    
    accountData.allocation = allocation;
    onUpdate(accountData);
  }, [allocation]);

  // on change (props)
  useEffect(() => {
    if (accountData.allocation !== allocation) {
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
      <td>
        <select
          className="form-select form-select-sm"
          value={allocation}
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
      </td>
    </tr>
  )
}