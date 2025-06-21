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

/* ---------- ROW FOR IMMOBILISATION ACCOUNT  ---------- */

export const RowTableImmobilisation = ({ account, period, onUpdate }) => 
{
  const { accountNum, accountLib, isAmortisable } = account;

  const prevStateDateEnd = getPrevDate(period.dateStart);

  const [initialStateSet, setInitialStateSet] = useState(
    account.initialStateSet
  );
  const [initialFootprintParams, setInitialFootprintParams] = useState(
    account.initialFootprintParams
  );

  // ----------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (initialStateSet != account.initialStateSet) {
      setInitialStateSet(account.initialStateSet);
    }
    if (initialFootprintParams != account.initialFootprintParams) {
      setInitialStateSet(account.initialFootprintParams);
    }
  }, [
    account.initialStateSet,
    account.initialFootprintParams,
  ]);

  useEffect(() => {
    account.initialStateSet = initialStateSet;
    account.initialFootprintParams = initialFootprintParams;
    onUpdate();
  }, [initialStateSet, initialFootprintParams]);

  // ----------------------------------------------------------------------------------------------------

  const onActivityCodeChange = (event) => {
    const nextActivityCode = event.value;
    setInitialFootprintParams({
      ...initialFootprintParams,
      code: nextActivityCode,
    });
    setInitialStateSet(false);
  };

  // ----------------------------------------------------------------------------------------------------

  return (
    <tr>
      <td>{accountNum}</td>
      <td>
        {accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}
      </td>
      {/* Immobilisation non amortie */}
      {!isAmortisable && (
        <td colSpan="1">
          &nbsp;&nbsp;Immobilisation non amortie sur l'exercice
        </td>
      )}

      {/* Empreinte par défaut à définir */}
      {isAmortisable && (
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
      <td className="text-end">
        {printValue(account.states[prevStateDateEnd].amount, 0)} &euro;
      </td>
    </tr>
  );
};