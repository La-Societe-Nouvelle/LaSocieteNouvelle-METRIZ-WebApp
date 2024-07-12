// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Button, Form, Image, Table } from "react-bootstrap";

/* -------------------- STOCKS-EXPENSES MAPPING -------------------- */

/** View for mapping between stock and expense accounts
 *  
 *  Props :
 *    - meta -> fec metadata (accounts)
 *    - onSubmit()
 *    - onGoBack()
 * 
 *  Update meta.accounts...
 */

export const StockPurchasesMapping = ({
  meta,
  onSubmit,
  onGoBack
}) => {

  const stocksAccounts = Object.keys(meta.accounts).filter((accountNum) => /^3(1|2|7)/.test(accountNum));
  const purchasesAccounts = Object.keys(meta.accounts).filter((accountNum) => /^60(1|2|5|6|7)/.test(accountNum));

  const [accounts, setAccounts] = useState(meta.accounts);

  // ----------------------------------------------------------------------------------------------------

  // init purchases accounts list for each stock account
  useEffect(() => {
    stocksAccounts.forEach((stockAccountNum) => {
      let pattern = "60"+stockAccountNum.slice(1).replace(/0*$/g,"");
      const matchingAccounts = purchasesAccounts
        .filter((purchaseAccountNum) => purchaseAccountNum.startsWith(pattern));

      // Update the purchasesAccounts property of the accounts object
      accounts[stockAccountNum].purchasesAccounts = matchingAccounts;
    });
    setAccounts({...accounts})
  }, []);

  // ----------------------------------------------------------------------------------------------------

  const deletePurchaseAccount = (stockAccountNum, purchaseAccountNum) =>
  {
    const purchasesAccounts = accounts[stockAccountNum].purchasesAccounts
      .filter((accountNum) => accountNum !== purchaseAccountNum); // Remove the purchase account
    accounts[stockAccountNum].purchasesAccounts = purchasesAccounts;
    setAccounts({...accounts});
  }

  const addPurchaseAccount = (stockAccountNum, purchaseAccountNum) => 
  {
    accounts[stockAccountNum].purchasesAccounts.push(purchaseAccountNum);
    setAccounts({...accounts});
  };

  // ----------------------------------------------------------------------------------------------------

  const submit = () =>
  {
    meta.accounts = accounts;

    // console logs
    console.log("Associations des comptes d'achats avec les comptes de stocks : ");
    console.log(Object.values(accounts).filter(({accountNum}) => /^3(1|2|7)/.test(accountNum)));

    onSubmit();
  }

  // ----------------------------------------------------------------------------------------------------
  
  const getPurchaseAccountsOptions = (stockAccountNum) => {
    const usedPurchaseAccounts = accounts[stockAccountNum].purchasesAccounts || [];
    const availablePurchaseAccounts = purchasesAccounts
      .filter((accountNum) => !usedPurchaseAccounts.includes(accountNum))
      .map((accountNum) => ({
        accountNum: accountNum,
        accountLib: accounts[accountNum].accountLib,
      }));
    return availablePurchaseAccounts;
  }

  const isMappingValid = stocksAccounts.every((accountNum) => accounts[accountNum].purchasesAccounts?.length>0);

  return (
    <>
      <div className="small mb-3">
        <div className="alert-info mt-0">
          <div className="info-icon">
            <Image src="/info-circle.svg" alt="icon info" />
          </div>
          <div>
            <p>
              Les associations entre les comptes de stocks et les comptes de charges
              sont nécessaires à la bonne mesure des empreintes des variations de stocks,
              et ainsi de l'empreinte des consommations intermédiaires.
            </p>
            <p className="mt-1">
              Il est possible pour chaque compte de stock d'ajouter ou de retirer des comptes
              de charges. Un compte de stock doit être lié à au moins un compte de charges.
            </p>
          </div>
        </div>
      </div>
      <Form>
        <Table size="lg" hover className="mt-3">
          <thead>
            <tr>
              <th>Numéro de compte</th>
              <th>Libellé du compte</th>
              <th>Comptes de charges associés</th>
            </tr>
          </thead>
          <tbody>
            {stocksAccounts.map((accountNum, index) => {

              return (
                <tr key={index}>
                  <td>{accountNum}</td>
                  <td>{accounts[accountNum].accountLib}</td>
                  <td>
                    <ul className="list-unstyled">
                      {accounts[accountNum].purchasesAccounts?.map(
                        (purchasesAccount, subIndex) => (
                          <li key={subIndex} className="py-2">
                            <Button
                              className="p-0 me-2"
                              variant="link"
                              title="Dissocier le compte de charge du compte de stock"
                              onClick={() =>
                                deletePurchaseAccount(
                                  accountNum,
                                  purchasesAccount                                )
                              }
                            >
                              <i className="bi bi-trash3-fill"></i>
                            </Button>
                            <span>
                            {purchasesAccount} - {accounts[purchasesAccount].accountLib} 
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                    <p className="h6"></p>
                    <Form.Select
                      size="sm"
                      aria-label="Select"
                      onChange={(e) => {
                        const selectedPurchaseAccount = e.target.value;
                        addPurchaseAccount(
                          accountNum,
                          selectedPurchaseAccount
                        );
                      }}
                    >
                      <option> Associer un autre compte de charge</option>
                      {getPurchaseAccountsOptions(accountNum).map(
                        (account) => (
                          <option
                            key={account.accountNum}
                            value={account.accountNum}
                          >
                            {account.accountNum} - {account.accountLib}
                          </option>
                        )
                      )}
                    </Form.Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Form>

      <div className="text-end">
        <button className="btn btn-primary me-2" onClick={() => onGoBack()}>
          <i className="bi bi-chevron-left"></i> Retour
        </button>
        <button className="btn btn-secondary" onClick={() => submit()} disabled={!isMappingValid}>
          Suivant
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </>
  );
}