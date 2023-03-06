import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

function MappedAccounts(props) {
  const [accounts, setAccounts] = useState(props.meta.accounts);

  const accountsToMap = Object.keys(accounts).filter((accountNum) => /^28/.test(accountNum) || /^29/.test(accountNum) || /^39/.test(accountNum));
  const assetAccounts = Object.keys(accounts).filter((accountNum) => /^2(0|1)/.test(accountNum) || /^3[0-8]/.test(accountNum));

  const [isDisabled, setIsDisabled] = useState(true);

  // disabled if one account is not mapped i.e. enabled if all accounts are mapped
  useEffect(() => {
    if (accountsToMap.some((accountNum) => !accounts[accountNum].assetAccountNum)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [isDisabled]);

  function handleOnchange(accountToMapNum, nextAssetAccountNum) {
    // remove association if a dep/amort. account is already associated with account aux
    Object.entries(accounts)
      .filter(([_,{assetAccountNum}]) => assetAccountNum==nextAssetAccountNum)
      .forEach(([_,{assetAccountNum}]) => assetAccountNum = "");
        
    // add association
    accounts[accountToMapNum].assetAccountNum = nextAssetAccountNum;

    props.meta.accounts = accounts; // ?
    setAccounts(accounts);

    // check if all accounts are associated
    if (accountsToMap.some((account) => !accounts[account].assetAccountNum)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }

  return (
    <div>
      <h3 className=" ">
        Associez les comptes d'amortissements et de dépréciations
      </h3>
      <Table size="lg" hover className="mt-3">
        <thead>
          <tr>
            <th>Numéro de compte</th>
            <th>Libellé du compte</th>
            <th></th>
            <th>Compte associé</th>
          </tr>
        </thead>
        <tbody>
          {accountsToMap.map((accountToMapNum, index) => (
            <tr key={index}>
              <td>{accountToMapNum}</td>
              <td>{accounts[accountToMapNum].accountLib}</td>
              <td style={{width:'40px'}}>
                {!accounts[accountToMapNum].directMatching && (
                  <IconWarning />
                )}
              </td>
              <td>
                <select
                  className="form-select"
                  onChange={(e) =>
                    handleOnchange(accountToMapNum, e.target.value)
                  }
                  value={accounts[accountToMapNum].assetAccountNum || ""}
                >
                  <option value="">Sélectionner un compte...</option>
                  {assetAccounts
                    .filter(
                      ([assetAccountNum, _]) =>
                        assetAccountNum[0] == accountToMapNum[0]
                    )
                    .map((assetAccountNum, index) => (
                      <option key={index} value={assetAccountNum}>
                        {assetAccountNum} - {accounts[assetAccountNum].accountLib}
                      </option>
                    ))}
                </select>
              </td>

            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-end">
        <button className="btn btn-primary me-2" onClick={() => props.return()}>
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

const IconWarning = () => {
  return (
    <span className="icon-warning" title="Informations à vérifier">
      <i className=" bi bi-exclamation-triangle "></i>
    </span>
  );
};
