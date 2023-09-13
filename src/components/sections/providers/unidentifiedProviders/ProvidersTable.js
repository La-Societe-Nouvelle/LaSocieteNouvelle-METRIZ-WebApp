import React from "react";
import { Table } from "react-bootstrap";
import Select from "react-select";


// Utils
import {
  getAreasOptions,
  getDivisionsOptions
} from "/src/utils/metaUtils";
import { printValue } from "/src/utils/formatters";
import { getUnidentifiedProviderStatusIcon } from "../identifiedProviders/utils";

// Select Style
import { customSelectStyles } from "/config/customStyles";

// Libs
import divisions from "/lib/divisions";
import areas from "/lib/areas";

const ProvidersTable = ({
  providers,
  startIndex,
  endIndex,
  significativeProviders,
  financialPeriod,
  updateProviderParams,
}) => {
  // Select Options
  const divisionsOptions = getDivisionsOptions(divisions);
  const areasOptions = getAreasOptions(areas);

  // show note
  const showSignificativeNote = providers
  .some((provider) => significativeProviders.includes(provider.providerNum)
    && provider.defaultFootprintParams.code === "00");

// Check if significant providers are unassigned  
  const hasWarning = (provider) => {
    return (
      significativeProviders.includes(provider.providerNum) &&
      provider.defaultFootprintParams.code == "00"
    );
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th width={10}></th>
            <th>
              <i className="bi bi-arrow-down-up me-1"></i>
              Libellé du compte fournisseur
            </th>
            <th>Compte fournisseur</th>
            <th>Espace économique</th>
            <th>Secteur d'activité</th>
            <th className="text-end">
              <i className="bi bi-arrow-down-up me-1"></i>
              Montant
            </th>
          </tr>
        </thead>
        <tbody>
          {providers.slice(startIndex, endIndex).map((provider, index) => (
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
                  className={(provider.footprintStatus == 200 && provider.footprint.isValid()) ? "success" : ""}
                  options={areasOptions}
                  onChange={(e) =>
                    updateProviderParams(provider.providerNum, "area", e.value)
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
                  className={(provider.footprintStatus == 200 && provider.footprint.isValid()) ? "success" : ""}
                  options={divisionsOptions}
                  onChange={(e) =>
                    updateProviderParams(provider.providerNum, "code", e.value)
                  }
                />
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
      {showSignificativeNote && 
        <p class=" border-warning">
          <i
            className="bi bi-exclamation-triangle text-warning"
            title="Grand risque d'imprécision"
          ></i>{" "}
            Compte significatifs non rattachés à un secteur d'activité
    
        </p>}
    </>
  );
};

export default ProvidersTable;
