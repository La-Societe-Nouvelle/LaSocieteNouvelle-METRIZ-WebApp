// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import Select from "react-select";

// Utils
import { getBranchesOptions } from "/src/utils/metaUtils";
import { printValue } from "/src/utils/formatters";
import { getPrevDate } from "/src/utils/periodsUtils";

// Styles
import { customSelectStyles } from "/config/customStyles";

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
    label: "---",
  },
  prevFootprint: {
    value: "prevFootprint",
    label: "Reprise sur exercice précédent",
  },
  currentFootprint: {
    value: "currentFootprint",
    label: "Estimée sur exercice courant",
  },
  defaultData: {
    value: "defaultData",
    label: "Valeurs par défaut",
  },
};

export const RowTableImmobilisation = ({ account, period, onUpdate }) => {
  const { accountNum, accountLib, isAmortisable, initialState } = account;

  const prevStateDateEnd = getPrevDate(period.dateStart);
  const isPrevPeriodAvailable =
    parseInt(initialState.date) < parseInt(prevStateDateEnd);

  const [initialStateType, setInitialStateType] = useState(
    account.initialStateType
  );
  const [initialStateSet, setInitialStateSet] = useState(
    account.initialStateSet
  );
  const [initialFootprintParams, setInitialFootprintParams] = useState(
    account.initialFootprintParams
  );

  // ----------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (initialStateType != account.initialStateType) {
      setInitialStateType(account.initialStateType);
    }
    if (initialStateSet != account.initialStateSet) {
      setInitialStateSet(account.initialStateSet);
    }
    if (initialFootprintParams != account.initialFootprintParams) {
      setInitialStateSet(account.initialFootprintParams);
    }
  }, [
    account.initialStateType,
    account.initialStateSet,
    account.initialFootprintParams,
  ]);

  useEffect(() => {
    account.initialStateType = initialStateType;
    account.initialStateSet = initialStateSet;
    account.initialFootprintParams = initialFootprintParams;
    onUpdate();
  }, [initialStateType, initialStateSet, initialFootprintParams]);

  // ----------------------------------------------------------------------------------------------------

  const onActivityCodeChange = (event) => {
    const nextActivityCode = event.value;
    setInitialFootprintParams({
      ...initialFootprintParams,
      code: nextActivityCode,
    });
    setInitialStateSet(false);
  };

  const onInitialStateTypeChange = (event) => {
    const nextType = event.value;
    setInitialStateType(nextType);

    if (nextType == "defaultData") {
      setInitialStateSet(false);
      setInitialFootprintParams({
        code: "TOTAL",
        area: "FRA",
        aggregate: "TRESS",
      });
    }
  };

  // ----------------------------------------------------------------------------------------------------

  // options
  const initialStateOptions = [metaInitialStates.defaultData];

  return (
    <tr>
      <td>{accountNum}</td>
      <td>
        {accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}
      </td>
      {/* Immobilisation non amortie */}
      {!isAmortisable && (
        <td colSpan="2">
          &nbsp;&nbsp;Immobilisation non amortie sur l'exercice
        </td>
      )}
      {/* Empreinte reprise sur exercice précédent */}
      {isAmortisable && isPrevPeriodAvailable && (
        <td colSpan={2}>
          <Select
            className={"success"}
            value={metaInitialStates.prevFootprint}
            isDisabled
            styles={customSelectStyles()}
          />
        </td>
      )}
      {/* Empreinte par défaut à définir */}

      {isAmortisable && !isPrevPeriodAvailable && (
        <>
          <td colSpan={initialStateType == "defaultData" ? 1 : 2}>
            <Select
              styles={customSelectStyles()}
              value={metaInitialStates[initialStateType]}
              placeholder={"Choisissez..."}
              className={initialStateSet ? "success" : ""}
              options={initialStateOptions}
              onChange={onInitialStateTypeChange}
            />
          </td>
          {initialStateType == "defaultData" && (
            <td>
              <Select
                defaultValue={{
                  label:
                    initialFootprintParams.code +
                    " - " +
                    branches[initialFootprintParams.code],
                  value: initialFootprintParams.code,
                }}
                placeholder={"Choisissez une branche"}
                className={initialStateSet ? "success" : ""}
                options={branchesOptions}
                onChange={onActivityCodeChange}
                styles={customSelectStyles()}
              />
            </td>
          )}
        </>
      )}
      <td className="text-end">
        {printValue(account.states[prevStateDateEnd].amount, 0)} &euro;
      </td>
    </tr>
  );
};
