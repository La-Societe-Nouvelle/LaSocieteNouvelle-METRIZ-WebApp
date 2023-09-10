// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import Select from "react-select";

// Styles
import { customSelectStyles } from "/config/customStyles";

// Utils
import { getBranchesOptions } from "/src/utils/metaUtils";
import { printValue } from "/src/utils/formatters";
import { getPrevDate } from "/src/utils/periodsUtils";

// Libraries
import branches from "/lib/branches";

const branchesOptions = getBranchesOptions(branches);

/* ---------- ROW FOR STOCK ACCOUNT  ---------- */

/** Row for stock account
 * 
 */

const metaInitialStates = {
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

export const RowTableStock = ({
  account,
  period,
  onUpdate
}) => {

  const { 
    accountNum, 
    accountLib, 
    isProductionStock,
    initialState,
    entries
  } = account;

  const prevStateDateEnd = getPrevDate(period.dateStart);
  const isPrevPeriodAvailable = parseInt(initialState.date)<parseInt(prevStateDateEnd);
  const isInitialAmountNull = initialState.amount == 0;
  const hasInputs = entries.some((entry) => period.regex.test(entry.date));

  const [initialStateType, setInitialStateType] = useState(account.initialStateType);
  const [initialStateSet, setInitialStateSet] = useState(account.initialStateSet);
  const [initialFootprintParams, setInitialFootprintParams] = useState(account.initialFootprintParams);

  // ----------------------------------------------------------------------------------------------------

  // on props update
  useEffect(() => 
  {
    if (initialStateType!=account.initialStateType) {
      setInitialStateType(account.initialStateType);
    }
    if (initialStateSet!=account.initialStateSet) {
      setInitialStateSet(account.initialStateSet);
    }
    if (initialFootprintParams!=account.initialFootprintParams) {
      setInitialStateSet(account.initialFootprintParams);
    }
  }, [account.initialStateSet, account.initialStateType, account.initialFootprintParams]);

  // update props
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
      setInitialStateSet(false)
      setInitialFootprintParams({
        code: "TOTAL",
        area: "FRA",
        aggregate: "TRESS",
      });
    }

    if (nextType == "currentFootprint") {
      setInitialStateSet(true);
      setInitialFootprintParams({});
    }
  };

  // ----------------------------------------------------------------------------------------------------

  // options
  const initialStateOptions = [
    ... !isProductionStock ? [metaInitialStates.defaultData] : [],
    ... (hasInputs || isProductionStock) ? [metaInitialStates.currentFootprint] : []
  ] 
  
  return (
    <tr>
      <td>{accountNum}</td>
      <td>
        {accountLib.charAt(0).toUpperCase() +
         accountLib.slice(1).toLowerCase()}
      </td>
      {isInitialAmountNull &&
        <td colSpan="2">
          &nbsp;&nbsp;Montant nul en début d'exercice
        </td>
      }
      {isPrevPeriodAvailable && 
        <td colSpan={2}>
          <Select
            className={"success"}
            value={metaInitialStates.prevFootprint}
            isDisabled
            styles={customSelectStyles}
          />
        </td>}
      {(!isPrevPeriodAvailable && !isInitialAmountNull) &&
        <>
          <td colSpan={(initialStateType=="defaultData") ? 1 : 2}>
            <Select
              className={initialStateSet ? "success" : ""}
              placeholder={"Choisissez..."}
              value={metaInitialStates[initialStateType]}
              options={initialStateOptions}
              onChange={onInitialStateTypeChange}
              styles={customSelectStyles}
            />
          </td>
          {initialStateType == "defaultData" && (
            <td className={initialStateSet === true ? " success" : ""}>
              <Select
                className={initialStateSet ? " success" : ""}
                placeholder={"Choisissez une branche"}
                defaultValue={{
                  label: initialFootprintParams.code + " - " + branches[initialFootprintParams.code],
                  value: initialFootprintParams.code,
                }}
                options={branchesOptions}
                onChange={onActivityCodeChange}
                styles={customSelectStyles}
              />
            </td>
          )}
        </>}
      <td className="text-end">
        {printValue(account.states[prevStateDateEnd].amount, 0)}{" "}
        &euro;
      </td>
    </tr>
  );
}