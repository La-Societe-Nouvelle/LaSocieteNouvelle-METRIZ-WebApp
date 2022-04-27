import React, { useEffect, useState } from "react";
import { FormSelect, Table } from "react-bootstrap";

function MappedAccounts(props) {
  const [allAccounts] = useState(props.meta.accounts);

  const [mappedAccounts, setMappedAccounts] = useState(
    props.meta.mappingAccounts
  );

  const [assetAmortisationAccounts, setAssetAmortisationAccounts] = useState(
    {}
  );
  const [assetDepreciationAccounts, setAssetDepreciationAccounts] = useState(
    {}
  );

  const [stockDepreciationAccounts, setStockDepreciationAccounts] = useState(
    {}
  );

  const [associatedAccounts, setAssociatedAccounts] = useState({});

  useEffect(() => {
    splitAccount(allAccounts);
  },[]);

  function splitAccount(accounts) {
    let accountsToSplit = accounts;

    // CREATE OBJECT OF ASSET AMORTISATION ACCOUNTS

    let assetAmortisationAccounts = {};

    for (const [key, value] of Object.entries(accountsToSplit)) {
      if (/^28/.test(key)) {
        assetAmortisationAccounts[key] = value;
        delete accountsToSplit[key];
      }
    }
    setAssetAmortisationAccounts(assetAmortisationAccounts);

    // CREATE OBJECT OF ASSET DEPRECIATION ACCOUNTS
    let assetDepreciationAccounts = {};

    for (const [key, value] of Object.entries(accountsToSplit)) {
      if (/^29/.test(key)) {
        assetDepreciationAccounts[key] = value;
        delete accountsToSplit[key];
      }
    }
    setAssetDepreciationAccounts(assetDepreciationAccounts);

    // CREATE OBJECT LIST OF STOCKS DEPRECIATION ACCOUNT

    let stockDepreciationAccounts = {};

    for (const [key, value] of Object.entries(accountsToSplit)) {
      if (/^39/.test(key)) {
        stockDepreciationAccounts[key] = value;
        delete accountsToSplit[key];
      }
    }

    setStockDepreciationAccounts(stockDepreciationAccounts);
    setAssociatedAccounts(accountsToSplit);
  }

  return (
    <div>
	
      <h3 className="subtitle underline">
        Associations des comptes d'amortissements et de dépréciations{" "}
      </h3>

      <Table size="lg" bordered hover>
        <thead>
          <th>Numéro de compte</th>
          <th>Libellé du compte</th>
          <th>Compte associé</th>
        </thead>
        <tbody>

          {Object.entries(assetAmortisationAccounts).map(
            ([key, value], index) => {
		
              return (
                <tr key={index}>
                  <td>{key}</td>
                  <td>{value}</td>
                  <td> 
                    <FormSelect id="accountAux" size="sm">
                      <option value="default"></option>
					  {Object.entries(associatedAccounts).map( 
						     ([key, value], index) => {

								 return(
									 <option key={index} value={key}  
									 >
										 {key} - {value}
									 </option>
								 )
							 }
					  )}

                    </FormSelect>
                  </td>
                </tr>
              );
            }
          )}
          {Object.entries(assetDepreciationAccounts).map(
            ([key, value], index) => {
              return (
                <tr key={index}>
                  <td>{key}</td>
                  <td>{value}</td>
                  <td>
                    <FormSelect id="accountAux" size="sm">
                      <option value="default">Default select</option>
                    </FormSelect>
                  </td>
                </tr>
              );
            }
          )}
          {Object.entries(stockDepreciationAccounts).map(
            ([key, value], index) => {
              return (
                <tr key={index}>
                  <td>{key}</td>
                  <td>{value}</td>
                  <td>
                    <FormSelect id="accountAux" size="sm">
                      <option value="default">Default select</option>
                    </FormSelect>
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default MappedAccounts;
