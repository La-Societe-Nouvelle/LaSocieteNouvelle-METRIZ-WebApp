// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";

// Bootstrap
import { Table } from "react-bootstrap";

/* -------------------- AMORTISATION/DEPRECIATION-ASSET MAPPING -------------------- */

/** View for mapping between depreciation and asset accounts
 *  
 *  Props :
 *    - meta -> fec metadata (accounts)
 *    - onClick()
 *    - return()
 * 
 *  Update meta.accounts to set for each amortisation/depreciation account the asset account
 */

export function DepreciationAssetsMapping(props) 
{
  // JSON of accounts
  const [accounts, setAccounts] = useState(props.meta.accounts);

  // accounts to map (list of account nums) -> amortisation & depreciation accounts
  const accountsToMap = Object.keys(accounts).filter((accountNum) => /^28/.test(accountNum) || /^29/.test(accountNum) || /^39/.test(accountNum));
  // asset accounts (list of account nums) -> asset account (storage & immobilisation)
  const assetAccounts = Object.keys(accounts).filter((accountNum) => /^2(0|1)/.test(accountNum) || /^3[0-8]/.test(accountNum));
   
  // disable if at least one account is not mapped i.e. enable if all accounts mapped
  const [isDisabled, setIsDisabled] = useState(true);

  // check if some accounts have assetAccountNum prop undefined
  useEffect(() => {
    if (accountsToMap.some((accountNum) => !accounts[accountNum].assetAccountNum)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [isDisabled]);

  // on change
  const handleOnchange = (accountToMapNum, nextAssetAccountNum) =>
  {
    // amortisation account
    if (accountToMapNum.charAt(1)=="8") 
    {
      // remove current association with amortisation account (in prev asset account data)
      let prevAssetAccountNum = accounts[accountToMapNum].assetAccountNum;
      if (prevAssetAccountNum) {
        accounts[prevAssetAccountNum].amortisationAccountNum = undefined;
        accounts[prevAssetAccountNum].amortisationAccountLib = undefined;
      }
      
      // remove current association with selected asset account (in amortisation account data)
      let prevAmortisationAccountNum = accounts[nextAssetAccountNum].amortisationAccountNum;
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

    // depreciation data
    if (accountToMapNum.charAt(1)=="9") 
    {
      // remove current association with depreciation account (in prev asset account data)
      let prevAssetAccountNum = accounts[accountToMapNum].assetAccountNum;
      if (prevAssetAccountNum) {
        accounts[prevAssetAccountNum].depreciationAccountNum = undefined;
        accounts[prevAssetAccountNum].depreciationAccountLib = undefined;
      }

      // remove current association with selected asset account (in depreciation account data)
      let prevDepreciationAccountNum = accounts[nextAssetAccountNum].depreciationAccountNum;
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

    props.meta.accounts = accounts; // update props
    setAccounts(accounts);

    // check if all accounts are mapped
    if (accountsToMap.some((account) => !accounts[account].assetAccountNum)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }

  const onSubmit = () =>
  {
    console.log("Associations des comptes d'amortissement et de dépréciation avec les comptes de stock et d'immobilisation : ");
    console.log(Object.values(accounts).filter(({accountNum}) => /^2(0|1)/.test(accountNum) || /^3[0-8]/.test(accountNum)));
    props.onClick();
  }

  return (
    <div>
      <h3 className="mb-4">
        Associez les comptes d'amortissements et de dépréciations
      </h3>
      <Table>
        {/* Header */}
        <thead>
          <tr>
            <th>Numéro de compte</th>
            <th>Libellé du compte</th>
            <th></th>
            <th>Compte associé</th>
          </tr>
        </thead>
        {/* Body */}
        <tbody>
          {accountsToMap.map((accountToMapNum, index) => (
            <tr key={index}>
              <td>{accountToMapNum}</td>
              <td>{accounts[accountToMapNum].accountLib}</td>
              <td style={{width:'40px'}}>
                {/* Warning icon if no direct matching */}
                {!accounts[accountToMapNum].directMatching && (
                  <span className="icon-warning" 
                        title="Informations à vérifier">
                    <i className=" bi bi-exclamation-triangle "/>
                  </span>
                )}
              </td>
              <td>
                <select className="form-select"
                        onChange={(e) => handleOnchange(accountToMapNum, e.target.value)}
                        value={accounts[accountToMapNum].assetAccountNum || ""}>
                  <option value="">Sélectionner un compte...</option>
                  {assetAccounts
                    .filter(([assetAccountNum, _]) =>
                      assetAccountNum[0] == accountToMapNum[0])
                    .map((assetAccountNum, index) => (
                      <option key={index} value={assetAccountNum}>
                        {assetAccountNum} - {accounts[assetAccountNum].accountLib}
                      </option>))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="text-end">
        <button className="btn btn-primary me-2" 
                onClick={() => props.return()}>
          <i className="bi bi-chevron-left"/> Retour 
        </button>
        <button className="btn btn-secondary"
                onClick={onSubmit}
                disabled={isDisabled}>
          Valider
          <i className="bi bi-chevron-right"/>
        </button>
      </div>
    </div>
  )
}