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
  const [isDisabled, setIsDisabled] = useState(true);

  const [mappedAccounts, setMappedAccounts] = useState(
    props.meta.mappingAccounts
  );

  useEffect(() => {
    console.log("updated");
  }, [isDisabled]);

  function handleOnchange(depKey, e) {

    Object.entries(mappedAccounts).map(([key, value]) => {
      if (value == e.target.value) {
        delete mappedAccounts[key];
      }
    });

    Object.assign(mappedAccounts, {
      [depKey]: e.target.value,
    });

    setMappedAccounts(mappedAccounts);

    if (Object.keys(mappedAccounts).length == depAccounts.length) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }

  }

  function getDefaultValue(depKey) {
    console.log(depKey);
    console.log(mappedAccounts)
    console.log(Object.keys(mappedAccounts).filter((key) => key == depKey))
    return Object.keys(mappedAccounts).filter((key) => key == depKey);
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
          {
            console.log(mappedAccounts)

          }
                    {
            console.log("selecteds")

          }
          {depAccounts.map(([depKey, depValue], index) => (

          console.log(mappedAccounts[depKey]),
            <tr key={index}>
              <td>{depKey}</td>
              <td>{depValue}</td>
              <td>
                <FormSelect
                  defaultValue={mappedAccounts[depKey]}
                  size="sm"
                  onChange={(e) => handleOnchange(depKey, e)}
                >
                  <option value="">
                    Sélectionner un compte...
                  </option>
                  {assetAccounts.map(([assetKey, assetValue], index) => (
                    <option key={index} value={assetKey}>
                      {assetKey} - {assetValue}
                    </option>
                  ))}
                </FormSelect>
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
