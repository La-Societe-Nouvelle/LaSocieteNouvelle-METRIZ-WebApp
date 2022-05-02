import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

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
  const [isDisabled, setIsDisabled] = useState(true);

  const [mappedAccounts, setMappedAccounts] = useState(
    props.meta.mappingAccounts
  );

  useEffect(() => {

    if (Object.values(mappedAccounts).some(it => !it.length)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [isDisabled, mappedAccounts]);


  function handleOnchange(depKey, e) {


    Object.entries(mappedAccounts).map(([key, value]) => {

      // set empty value if value is already associeted to 28xxxx account
      if ( key.substring(0,2) == "28" && value == e.target.value) {

        Object.assign(mappedAccounts, {
          [key]: "",
        })
      }
    });

    // assign new value
    Object.assign(mappedAccounts, {
      [depKey]: e.target.value,
    });

    setMappedAccounts(mappedAccounts);

    // check if all accounts is associated 

    if (Object.values(mappedAccounts).some(it => !it.length)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
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
                <select onChange={(e) => handleOnchange(depKey, e)}>
                  <option value="">Sélectionner un compte...</option>
                  {assetAccounts.map(([assetKey, assetValue], index) => (
                    
                    <option key={index} value={assetKey} selected={mappedAccounts[depKey] == assetKey ? "selected" : ""}>
                      {assetKey} - {assetValue}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-end">
        <button
          className="btn btn-secondary"
          disabled={isDisabled}
          onClick={() => props.onClick(mappedAccounts)}
        >
          Valider
        </button>
      </div>
    </div>
  );
}

export default MappedAccounts;
