// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";

/* -------------------- STOCKS-EXPENSES MAPPING -------------------- */

/** View for mapping between stock and expense accounts
 *  
 *  Props :
 *    - meta -> fec metadata (accounts)
 *    - onClick()
 *    - return()
 * 
 *  Update meta.accounts...
 */

export const StockPurchasesMapping = (props) => 
{
  const [accounts, setAccounts] = useState(() => {
    const initializedAccounts = { ...props.meta.accounts };
    // Initialize the purchasesAccounts property for each stocks account if not already defined
    Object.keys(initializedAccounts)
      .filter((accountNum) => /^3(1|2|7)/.test(accountNum))
      .forEach((accountNum) => {
        if (!initializedAccounts[accountNum].purchasesAccounts) {
          initializedAccounts[accountNum].purchasesAccounts = [];
        }
      });
    return initializedAccounts;
  });

  const stocksAccounts = Object.keys(accounts).filter((accountNum) => /^3(1|2|7)/.test(accountNum));
  const purchasesAccounts = Object.keys(accounts).filter((accountNum) => /^60(1|2|7)/.test(accountNum));

  useEffect(() => {
    // Initialization of purchases accounts for the stocks account
    const updatedAccounts = { ...accounts };
    stocksAccounts.forEach((accountNum) => {
      const matchingAccounts = purchasesAccounts.filter(
        (purchaseAccountNum) =>
          accountNum.charAt(1) === purchaseAccountNum.charAt(2)
      );

      // Update the purchasesAccounts property of the accounts object
      updatedAccounts[accountNum].purchasesAccounts = matchingAccounts;
    });
    setAccounts(updatedAccounts); // Update the state with the new value of accounts
  }, []);


  const handleDeletePurchaseAccount = (stockAccountNum, purchaseAccountNum) =>
  {
    const updatedAccounts = { ...accounts };
    const purchasesAccounts = updatedAccounts[stockAccountNum].purchasesAccounts
      .filter((accountNum) => accountNum !== purchaseAccountNum); ///Remove the corresponding purchase account
    updatedAccounts[stockAccountNum].purchasesAccounts = purchasesAccounts; // Update the purchasesAccounts for the corresponding stock account
    setAccounts(updatedAccounts);
  }

  const handleAddPurchaseAccount = (stockAccountNum, purchaseAccountNum) => 
  {
    const updatedAccounts = {
      ...accounts,
      [stockAccountNum]: {
        ...accounts[stockAccountNum],
        purchasesAccounts: [
          ...accounts[stockAccountNum].purchasesAccounts,
          purchaseAccountNum,
        ],
      },
    };
    setAccounts(updatedAccounts);
  };

  function getAvailablePurchaseAccounts(stockAccountNum) {

    const allPurchaseAccounts = Object.keys(accounts).filter((accountNum) =>
      /^60[^3]/.test(accountNum)
    );
  
    const usedPurchaseAccounts = accounts[
      stockAccountNum
    ].purchasesAccounts;
  
    const availablePurchaseAccounts = allPurchaseAccounts
      .filter((accountNum) => !usedPurchaseAccounts.includes(accountNum))
      .map((accountNum) => ({
        accountNum: accountNum,
        accountLib: accounts[accountNum].accountLib,
      }));
  
    return availablePurchaseAccounts;
  }

  // Check if all stock accounts have at least one associated purchase account
  const allStocksAccountsHavePurchaseAccounts = () => {
    return stocksAccounts.every((accountNum) => {
      return accounts[accountNum].purchasesAccounts.length > 0;
    });
  };

  const onSubmit = () =>
  {
    console.log("Associations des comptes d'achats avec les comptes de stocks : ");
    console.log(Object.values(accounts).filter(({accountNum}) => /^3(1|2|7)/.test(accountNum)));
    props.onClick();
  }

  return (
    <div>
      <h3>Associez les comptes de stocks et les comptes de charges</h3>
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
                      {accounts[accountNum].purchasesAccounts.map(
                        (purchasesAccount, subIndex) => (
                          <li key={subIndex} className="py-2">
                            <Button
                              className="p-0 me-2"
                              variant="link"
                              title="Dissocier le compte de charge du compte de stock"
                              onClick={() =>
                                handleDeletePurchaseAccount(
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
                        handleAddPurchaseAccount(
                          accountNum,
                          selectedPurchaseAccount
                        );
                      }}
                    >
                      <option> Associer un autre compte de charge</option>
                      {getAvailablePurchaseAccounts(accountNum).map(
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
        <button className="btn btn-primary me-2" onClick={() => props.return()}>
          <i className="bi bi-chevron-left"></i> Retour
        </button>
        <button
          className="btn btn-secondary"
          onClick={onSubmit}
          disabled={!allStocksAccountsHavePurchaseAccounts()}
        >
          Valider mes données
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}