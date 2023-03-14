import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

function DepreciationAssetsMapping(props) {

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

 

  function handleOnchange(accountToMapNum, nextAssetAccountNum) 
  {    
    if (accountToMapNum.charAt(1)=="8") 
    {
      // remove current association with prev asset account
      let prevAssetAccountNum = accounts[accountToMapNum].assetAccountNum;
      if (prevAssetAccountNum) {
        accounts[prevAssetAccountNum].amortisationAccountNum = undefined;
        accounts[prevAssetAccountNum].amortisationAccountLib = undefined;
      }
      
      // remove current association with next asset account (in amortisation account data)
      let prevAmortisationAccountNum = accounts[nextAssetAccountNum].amortisationAccountNum; // current association
      if (prevAmortisationAccountNum) {
        accounts[prevAmortisationAccountNum].assetAccountNum = undefined;
        accounts[prevAmortisationAccountNum].assetAccountLib = undefined;
      }

      // update asset account data
      accounts[nextAssetAccountNum].amortisationAccountNum = accountToMapNum;
      accounts[nextAssetAccountNum].amortisationAccountLib = accounts[accountToMapNum].accountLib;
      
      // update amortisation account data
      accounts[accountToMapNum].assetAccountNum = nextAssetAccountNum;
      accounts[accountToMapNum].assetAccountLib = accounts[nextAssetAccountNum].accountLib;
    }

    if (accountToMapNum.charAt(1)=="9") 
    {
      // remove current association with asset account
      let prevAssetAccountNum = accounts[accountToMapNum].assetAccountNum;
      if (prevAssetAccountNum) {
        accounts[prevAssetAccountNum].depreciationAccountNum = undefined;
        accounts[prevAssetAccountNum].depreciationAccountLib = undefined;
      }

      // remove current association with next asset account (in depreciation account data)
      let prevDepreciationAccountNum = accounts[nextAssetAccountNum].depreciationAccountNum; // current association
      if (prevDepreciationAccountNum) {
        accounts[prevDepreciationAccountNum].assetAccountNum = undefined;
        accounts[prevDepreciationAccountNum].assetAccountLib = undefined;
      }

      // update asset account data
      accounts[nextAssetAccountNum].depreciationAccountNum = accountToMapNum;
      accounts[nextAssetAccountNum].depreciationAccountLib = accounts[accountToMapNum].accountLib;
      
      // update depreciation account data
      accounts[accountToMapNum].assetAccountNum = nextAssetAccountNum;
      accounts[accountToMapNum].assetAccountLib = accounts[nextAssetAccountNum].accountLib;
    }

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
      <h3 >
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
          <i className="bi bi-chevron-left"></i> Retour 
        </button>
        <button
          className="btn btn-secondary"
          disabled={isDisabled}
          onClick={() => props.onClick()}
        >
          Valider
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

export default DepreciationAssetsMapping;

const IconWarning = () => {
  return (
    <span className="icon-warning" title="Informations à vérifier">
      <i className=" bi bi-exclamation-triangle "></i>
    </span>
  );
};
