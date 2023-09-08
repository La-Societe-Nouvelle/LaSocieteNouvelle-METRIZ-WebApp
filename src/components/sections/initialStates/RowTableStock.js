// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import Select from "react-select";
import { getBranchesOptions, printValue } from "../../../utils/Utils";

// Styles
import { customSelectStyles } from "/config/customStyles";

// Libraries
import branches from "/lib/branches";
import { isCurrentFootprintAvailable } from "./utils";

const branchesOptions = getBranchesOptions(branches);

const initialStateTypeOptions = {
  none: { 
    value: "none", 
    label: "---" 
  },
  prevFootprint: {
    value: "prevFootprint",
    label: "Reprise sur exercice précédent",
  },
  currentFootprint: {
    value: "currentFootprint",
    label: "Estimée sur exerice courant",
  },
  defaultData: { 
    value: "defaultData", 
    label: "Valeurs par défaut" 
  },
};

const getInitialStateOptions = (initialStateType, hasInputs) => 
{
  switch (initialStateType) {
    case "none":
      return [
        initialStateTypeOptions["none"],
        initialStateTypeOptions["defaultData"],
        hasInputs ? initialStateTypeOptions["currentFootprint"] : []
      ]; // options -> none, defaultData
    case "defaultData":
      return [
        initialStateTypeOptions["defaultData"],
        hasInputs ? initialStateTypeOptions["currentFootprint"] : []
      ]; // options -> defaultData
    case "prevFootprint":
      return [
        initialStateTypeOptions["prevFootprint"],
        initialStateTypeOptions["defaultData"],
        hasInputs ? initialStateTypeOptions["currentFootprint"] : []
      ]; // options -> prevFootprint, defaultData
    default:
      return [
        initialStateTypeOptions["defaultData"],
        hasInputs ? initialStateTypeOptions["currentFootprint"] : []
      ]; // options -> defaultData
  }
}

export const RowTableStock = ({
  account,
  prevStateDateEnd, // day before period
  onUpdate
}) => {

  const { 
    accountNum, 
    accountLib, 
    isProductionStock,
    hasInputs,
  } = account;

  const [initialStateType, setInitialStateType] = useState(account.initialStateType);
  const [initialStateSet, setInitialStateSet] = useState(account.initialStateSet);
  const [initialFootprintParams, setInitialFootprintParams] = useState(account.initialFootprintParams);

  // ----------------------------------------------------------------------------------------------------

  useEffect(() => 
  {
    if (initialStateType!=account.initialStateType) {
      setInitialStateType(account.initialStateType);
    }
    if (initialStateSet!=account.initialStateSet) {
      setInitialStateSet(account.initialStateSet);
    }
  }, [account.initialStateSet]);

  useEffect(() => {
    account.initialStateType = initialStateType;
    account.initialStateSet = initialStateSet;
    account.initialFootprintParams = initialFootprintParams;

    onUpdate();
  }, [initialStateType,initialStateSet,initialFootprintParams])

  // ----------------------------------------------------------------------------------------------------

  const onActivityCodeChange = (event) => 
  {
    const nextActivityCode = event.value;
    setInitialFootprintParams({
      ...initialFootprintParams,
      code: nextActivityCode
    });
    setInitialStateSet(false);
  };

  const onInitialStateTypeChange = (event) => 
  {
    const nextType = event.value;
    setInitialStateType(nextType);

    if (nextType == "defaultData") {
      setInitialFootprintParams({
        code: "TOTAL",
        area: "FRA",
        aggregate: "TRESS",
      });
    } else {
      setInitialFootprintParams({});
    }
  };
  
  if (isProductionStock) {
    return (
      <tr>
        <td>{accountNum}</td>
        <td>
          {accountLib.charAt(0).toUpperCase() +
            accountLib.slice(1).toLowerCase()}
        </td>
        <td colSpan={2}>
          <Select
            styles={customSelectStyles}
            value={initialStateTypeOptions[initialStateType]}
            placeholder={"Choisissez..."}
            className={initialStateType == "currentFootprint" ? "success" : ""}
            options={[{ label: "Estimée sur exercice courant", value: "none" }]}
          />
        </td>
        <td className="text-end">
          {printValue(account.states[prevStateDateEnd].amount, 0)}{" "}
          &euro;
        </td>
      </tr>
    );
  } else {
    return (
      <tr>
        <td>{accountNum}</td>
        <td>
          {accountLib.charAt(0).toUpperCase() +
            accountLib.slice(1).toLowerCase()}
        </td>
        <td colSpan={(initialStateType=="defaultData") ? 1 : 2}>
          <Select
            styles={customSelectStyles}
            value={initialStateTypeOptions[initialStateType]}
            placeholder={"Choisissez..."}
            className={initialStateSet ? "success" : ""}
            options={getInitialStateOptions(initialStateType,hasInputs)}
            onChange={onInitialStateTypeChange}
          />
        </td>
        {initialStateType == "defaultData" && (
          <td className={initialStateSet === true ? " success" : ""}>
            <Select
              defaultValue={{
                label: initialFootprintParams.code + " - " + branches[initialFootprintParams.code],
                value: initialFootprintParams.code,
              }}
              placeholder={"Choisissez une branche"}
              className={initialStateSet ? " success" : ""}
              options={branchesOptions}
              onChange={onActivityCodeChange}
              styles={customSelectStyles}
            />
          </td>
        )}
        <td className="text-end">
          {printValue(account.states[prevStateDateEnd].amount, 0)}{" "}
          &euro;
        </td>
      </tr>
    );
  }
}