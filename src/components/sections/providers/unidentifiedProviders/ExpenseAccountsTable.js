import React, { useState } from "react";
import { Table } from "react-bootstrap";
import Select from "react-select";


// Utils
import {
  getAreasOptions,
  getDivisionsOptions
} from "/src/utils/metaUtils";
import { printValue } from "/src/utils/formatters";
import { getUnidentifiedProviderStatusIcon } from "./utils";
import { sortProviders as sortAccounts } from "../utils";
import { isValidNumber } from "../../../../utils/Utils";

// Select Style
import { customSelectStyles } from "/config/customStyles";

// Libs
import divisions from "/lib/divisions";
import areas from "/lib/areas";

const ExpenseAccountsTable = ({
  accounts,
  startIndex,
  endIndex,
  significativeAccounts,
  financialPeriod,
  setAccountDefaultFootprintParams
}) => {
  // Sorting for providers
  const [sorting, setSorting] = useState({
    sortColumn: "montant",
    sortOrder: "desc",
  });

  const { sortColumn, sortOrder } = sorting;

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSorting((prevState) => ({
        ...prevState,
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
      }));
    } else {
      setSorting((prevState) => ({
        ...prevState,
        sortColumn: column,
        sortOrder: "asc",
      }));
    }
  };

  const sortedAccounts = sortAccounts(
    accounts,
    sortColumn,
    sortOrder,
    financialPeriod
  );

  // Select Options
  const divisionsOptions = getDivisionsOptions(divisions);
  const areasOptions = getAreasOptions(areas);

  // show note
  const showSignificativeNote = accounts.some((account) =>
      significativeAccounts.includes(account.accountNum) &&
      account.defaultFootprintParams.code === "00"
  );

  // Check if significant providers are unassigned
  const hasWarning = (account) => {

    return (
      significativeAccounts.includes(account.accountNum) &&
      account.defaultFootprintParams.code == "00"
    );
  };

  const getTagClass = (accuracy) => 
  {
    if (!isValidNumber(accuracy,0,100)) {
      return("")
    } else if (isValidNumber(accuracy,0,49)) {
      return("warning")
    } else if (isValidNumber(accuracy,50,79)) {
      return("primary")
    } else {
      return("success")
    }
  }

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th width={10}></th>
            <th onClick={() => handleSort("libelle")}>
              <i className="bi bi-arrow-down-up me-1"></i>
              Libellé du compte fournisseur
            </th>
            <th>Compte fournisseur</th>
            <th>Espace économique</th>
            <th>Secteur d'activité</th>
            <th>Confiance</th>
            <th className="text-end" onClick={() => handleSort("montant")}>
              <i className="bi bi-arrow-down-up me-1"></i>
              Montant
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedAccounts.length === 0 ? (
            <tr>
              <td colSpan="5">Aucun compte</td>
            </tr>
          ) : (
            sortedAccounts.slice(startIndex, endIndex).map((account, index) => (
              <tr key={account.accountNum || account.providerNum}>
                <td>
                  <div className="d-flex">
                    <i
                      className={
                        getUnidentifiedProviderStatusIcon(account).className
                      }
                      title={getUnidentifiedProviderStatusIcon(account).title}
                    ></i>
                    {hasWarning(account) && (
                      <i
                        className="bi bi-exclamation-triangle text-warning"
                        title="Grand risque d'imprécision"
                      ></i>
                    )}
                  </div>
                </td>
                <td>{account.accountLib || account.providerLib}</td>
                <td>{account.accountNum || account.providerNum}</td>
                <td>
                  <Select
                    styles={customSelectStyles("150px")}
                    value={{
                      label: areas[account.defaultFootprintParams.area],
                      value: account.defaultFootprintParams.area,
                    }}
                    placeholder={"Choisissez un espace économique"}
                    options={areasOptions}
                    onChange={(e) =>
                      setAccountDefaultFootprintParams(
                        account.providerNum || account.accountNum,
                        "area",
                        e.value
                      )
                    }
                  />
                </td>
                <td>
                  <Select
                    styles={customSelectStyles(
                      "500px",
                      account.footprintStatus,
                      hasWarning(account)
                    )}
                    value={{
                      label:
                        account.defaultFootprintParams.code +
                        " - " +
                        divisions[account.defaultFootprintParams.code],
                      value: account.defaultFootprintParams.code,
                    }}
                    placeholder={"Choisissez un secteur d'activité"}
                    options={divisionsOptions}
                    onChange={(e) =>
                      setAccountDefaultFootprintParams(
                        account.providerNum || account.accountNum,
                        "code",
                        e.value
                      )
                    }
                  />
                </td>
                <td>
                  <div key={index} className="text-center flex-grow-1">
                    <span className={"badge rounded-pill bg-" + getTagClass(account.defaultFootprintParams.accuracyMapping)}>
                      {(account.defaultFootprintParams.accuracyMapping || " -")+" %"}
                    </span>
                  </div>
                </td>
                <td className="text-end">
                  {printValue(
                    account.periodsData[financialPeriod.periodKey].amount,
                    0
                  )}{" "}
                  &euro;
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      {showSignificativeNote && (
        <p className="small border-warning">
          <i
            className="bi bi-exclamation-triangle text-warning"
            title="Grand risque d'imprécision"
          ></i>{" "}
          Compte significatifs non rattachés à un secteur d'activité
        </p>
      )}
    </>
  );
};

export default ExpenseAccountsTable;