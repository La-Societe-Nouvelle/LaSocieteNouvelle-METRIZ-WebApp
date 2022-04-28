import React, { useEffect, useState } from "react";
import { FormSelect, Table } from "react-bootstrap";

function MappedAccounts(props) {
  const [allAccounts] = useState(props.meta.accounts);
  const accounts = Object.entries(allAccounts);

  let getDepAccounts = accounts.filter(
    (account) =>
      /^28/.test(account) || /^29/.test(account) || /^39/.test(account)
  );

  let getAssetsAccounts = accounts.filter(
    (account) => /^2(0|1)/.test(account) || /^3[0-8]/.test(account)
  );

  const [depAccounts] = useState(getDepAccounts);
  const [assetAccounts] = useState(getAssetsAccounts);

  const [mappedAccounts, setMappedAccounts] = useState(
    props.meta.mappingAccounts
  );


  function handleOnchange(depKey, e) { 

    console.log(depKey);
    
    let depAccount = depAccounts.filter(([key]) => key == depKey);

    // Object.keys(mappedAccounts)
    //   .filter((account) =>
    //     depAccounts.map(
    //       ([key, value]) => console.log(key)
    //     )
    //   )


  
    // console.log(e.target.value);
    // console.log(depKey);

  }

  function isSelected(mappedAccounts,depKey, assetKey){

    return Object.keys(mappedAccounts).some(
      () => mappedAccounts[depKey] === assetKey
    );

  }

  return (
    <div>
      <h3 className="subtitle underline">
        Associations des comptes d'amortissements et de dépréciations
      </h3>
      <Table size="lg" bordered hover>
        <thead>
          <tr>
            <th>Numéro de compte</th>
            <th>Libellé du compte</th>
            <th>Compte associé</th>
          </tr> 
        </thead>
        <tbody>
        {depAccounts.map(([depKey, depValue], index) => (
            <tr key={index}>
              <td>{depKey}</td>
              <td>{depValue}</td>
              <td>
                <FormSelect size="sm" onChange={(e) => handleOnchange(depKey, e)}>
                  <option value="default"></option>
                  {assetAccounts.map(([assetKey, assetValue], index) => ( 
                    <option key={index} value={assetKey} selected={isSelected(mappedAccounts,depKey,assetKey)}>
                      {assetKey} - {assetValue}
                    </option>
                  ))}
                </FormSelect>
              </td>
            </tr>
          ))}
          
          </tbody>
      </Table>
    </div>
  );
}

export default MappedAccounts;
