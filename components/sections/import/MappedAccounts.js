
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
      if ( key.substring(0,2) == depKey.substring(0,2) && value == e.target.value) {

        Object.assign(mappedAccounts, {
          [key]: "",
        })
      }
    });

    // assign new value
    Object.assign(mappedAccounts, {
      [depKey]: e.target.value,
    });

    props.meta.mappingAccounts = mappedAccounts;
    setMappedAccounts({...mappedAccounts});

    // check if all accounts is associated 

    if (Object.values(mappedAccounts).some(it => !it.length)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }

  return (
    <div>
      <h3 className="subtitle ">
        Associez les comptes d'amortissements et de dépréciations
      </h3>
      <Table size="lg"  hover className="mt-3">
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
                <select className="form-control" onChange={(e) => handleOnchange(depKey, e)} value={mappedAccounts[depKey] || ""}>
                  <option value="">Sélectionner un compte...</option>
                  {assetAccounts.filter(([assetKey,_]) => assetKey[0]==depKey[0]).map(([assetKey, assetValue], index) => (
                    
                    <option key={index} value={assetKey}>
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
          className="btn btn-primary me-2"
          onClick={() => props.return()}
        >
          <i className="bi bi-chevron-left"></i> Retour aux A-Nouveaux
        </button>
        <button
          className="btn btn-secondary"
          disabled={isDisabled}
          onClick={() => props.onClick()}
        >
          Valider mes données
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

export default MappedAccounts;
