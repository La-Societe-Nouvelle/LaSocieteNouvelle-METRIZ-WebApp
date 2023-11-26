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
import { sortProviders } from "../utils";

// Select Style
import { customSelectStyles } from "/config/customStyles";

// Libs
import divisions from "/lib/divisions";
import areas from "/lib/areas";
import { isValidNumber } from "../../../../utils/Utils";

const ProvidersTable = ({
  providers,
  startIndex,
  endIndex,
  significativeProviders,
  financialPeriod,
  setProviderDefaultFootprintParams,
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

  const sortedProviders = sortProviders(
    providers,
    sortColumn,
    sortOrder,
    financialPeriod
  );

  // Select Options
  const divisionsOptions = getDivisionsOptions(divisions);
  const areasOptions = getAreasOptions(areas);

  // show note
  const showSignificativeNote = providers.some(
    (provider) =>
      significativeProviders.includes(provider.providerNum) &&
      provider.defaultFootprintParams.code === "00"
  );

  // Check if significant providers are unassigned
  const hasWarning = (provider) => {
    return (
      significativeProviders.includes(provider.providerNum) &&
      provider.defaultFootprintParams.code == "00"
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
            <th
              onClick={() => handleSort("libelle")}
            >
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
          {sortedProviders
            .slice(startIndex, endIndex)
            .map((provider, index) => (
              <tr key={provider.providerNum}>
                <td>
                  <div className="d-flex">
                    <i
                      className={
                        getUnidentifiedProviderStatusIcon(provider).className
                      }
                      title={getUnidentifiedProviderStatusIcon(provider).title}
                    ></i>
                    {hasWarning(provider) && (
                      <i
                        className="bi bi-exclamation-triangle text-warning"
                        title="Grand risque d'imprécision"
                      ></i>
                    )}
                  </div>
                </td>
                <td>{provider.providerLib}</td>
                <td>{provider.providerNum}</td>
                <td>
                  <Select
                    styles={customSelectStyles("150px")}
                    value={{
                      label: areas[provider.defaultFootprintParams.area],
                      value: provider.defaultFootprintParams.area,
                    }}
                    placeholder={"Choisissez un espace économique"}
                    className={
                      provider.footprintStatus == 200 &&
                      provider.footprint.isValid()
                        ? "success"
                        : ""
                    }
                    options={areasOptions}
                    onChange={(e) =>
                      setProviderDefaultFootprintParams(
                        provider.providerNum,
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
                      provider.footprintStatus,
                      hasWarning(provider)
                    )}
                    value={{
                      label:
                        provider.defaultFootprintParams.code +
                        " - " +
                        divisions[provider.defaultFootprintParams.code],
                      value: provider.defaultFootprintParams.code,
                    }}
                    placeholder={"Choisissez un secteur d'activité"}
                    className={
                      provider.footprintStatus == 200 &&
                      provider.footprint.isValid()
                        ? "success"
                        : ""
                    }
                    options={divisionsOptions}
                    onChange={(e) =>
                      setProviderDefaultFootprintParams(
                        provider.providerNum,
                        "code",
                        e.value
                      )
                    }
                  />
                </td>
                <td>
                  <div key={index} className="text-center flex-grow-1">
                    <span className={"badge rounded-pill bg-" + getTagClass(provider.defaultFootprintParams.accuracyMapping)}>
                      {(provider.defaultFootprintParams.accuracyMapping || " -")+" %"}
                    </span>
                  </div>
                </td>
                <td className="text-end">
                  {printValue(
                    provider.periodsData[financialPeriod.periodKey].amount,
                    0
                  )}{" "}
                  &euro;
                </td>
              </tr>
            ))}
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




export default ProvidersTable;

