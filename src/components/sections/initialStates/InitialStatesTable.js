// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Table } from "react-bootstrap";

// Utils
import { printValue } from "/src/utils/Utils";
import { getBranchesOptions, getDivisionsOptions } from "/src/utils/Utils";

// Libraries
import divisions from "/lib/divisions";
import branches from "/lib/branches";

// Styles
import { customSelectStyles } from "/config/customStyles";
import { getPrevDate } from "../../../utils/periodsUtils";

/* ---------- INITIAL STATES TABLE ---------- */

const branchesOptions = getBranchesOptions(branches);
const divisionsOptions = getDivisionsOptions(divisions);


const initialStateTypeOptions = {
  none: { value: "none", label: "---" },
  prevFootprint: {
    value: "prevFootprint",
    label: "Reprise sur exercice précédent",
  },
  currentFootprint: {
    value: "currentFootprint",
    label: "Estimée sur exerice courant",
  },
  defaultData: { value: "defaultData", label: "Valeurs par défaut" },
};
export class InitialStatesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnSorted: "account",
      reverseSort: false,
      nbItems: 20,
      page: 0,
    };
  }

  render() {
    const { immobilisations, stocks } = this.props.financialData;
    const prevStateDateEnd = getPrevDate(this.props.financialPeriod.dateStart);

    const { columnSorted, nbItems, page } = this.state;

    const accounts = immobilisations.concat(stocks); // merge array
    accounts.forEach((account) =>
      buildHasInputs(account, this.props.financialData)
    ); // to know if fpt can be based on current financial period

    this.sortItems(accounts, columnSorted);
    //this.sortItems(immobilisations,columnSorted);
    //this.sortItems(stocks,columnSorted);

    const nbAccounts = accounts.length;

    return (
      <>
        <Table>
          <thead>
            <tr>
              <td onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td colSpan="2">États initiaux - Empreinte sociétale</td>
              <td
                className="text-end"
                onClick={() => this.changeColumnSorted("amount")}
              >
                Montant
              </td>
            </tr>
          </thead>
          <tbody>
            {accounts
              .slice(page * nbItems, (page + 1) * nbItems)
              .map((account) => (
                <Row
                  key={account.accountNum}
                  account={account}
                  prevStateDateEnd={prevStateDateEnd}
                  onInitialStateUpdate={this.updateAccount.bind(this)}
                  syncData={this.synchroniseAccount.bind(this)}
                />
              ))}
          </tbody>
        </Table>

        {nbAccounts.length > nbItems && (
          <div className="table-navigation">
            <button
              className={page == 0 ? "hidden" : ""}
              onClick={this.prevPage}
            >
              Page précédente
            </button>
            <button
              className={
                (page + 1) * nbItems < nbAccounts.length ? "" : "hidden"
              }
              onClick={this.nextPage}
            >
              Page suivante
            </button>
          </div>
        )}
      </>
    );
  }

  /* ---------- ACTIONS ---------- */

  synchroniseAccount = async (accountNum) => {
    // Immobilisation
    if (/^2/.test(accountNum)) {
      let immobilisation =
        this.props.financialData.getImmobilisationByAccount(accountNum);
      this.fetchDefaultData(immobilisation);
    }
    // Stock
    else if (/^3/.test(accountNum)) {
      let stock = this.props.financialData.getStockByAccount(accountNum);
      this.fetchDefaultData(stock);
    }
  };

  async fetchDefaultData(stockOrImmobilisation) {
    await stockOrImmobilisation.updatePrevFootprintFromRemote();
    this.forceUpdate();
    this.props.onUpdate();
  }

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) {
    if (columnSorted != this.state.columnSorted) {
      this.setState({ columnSorted: columnSorted, reverseSort: false });
    } else {
      this.setState({ reverseSort: !this.state.reverseSort });
    }
  }

  sortItems(items, columSorted) {
    switch (columSorted) {
      case "label":
        items.sort((a, b) => a.label.localeCompare(b.label));
        break;
      case "account":
        items.sort((a, b) => a.accountNum.localeCompare(b.accountNum));
        break;
      case "amount":
        items.sort((a, b) => b.prevAmount - a.prevAmount);
        break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {
    if (this.state.page > 0) this.setState({ page: this.state.page - 1 });
  };
  nextPage = () => {
    if (
      (this.state.page + 1) * this.state.nbItems <
      this.props.financialData.immobilisations.length
    )
      this.setState({ page: this.state.page + 1 });
  };

  /* ----- OPERATIONS ON IMMOBILISATION ----- */

  updateAccount = (nextProps) => {
    // Immobilisation
    if (/^2/.test(nextProps.accountNum))
      this.props.financialData.updateImmobilisation(nextProps);
    // Stock
    else if (/^3/.test(nextProps.accountNum))
      this.props.financialData.updateStock(nextProps);

    this.props.onUpdate();
  };
}

/* ---------- INPUTS/OUTPUTS AVAILABLE ---------- */

const buildHasInputs = (account, financialData) => {
  if (/^3/.test(account.accountNum)) {
    account.hasInputs = financialData.externalExpenses.some((expense) =>
      account.purchasesAccounts.includes(expense.accountNum)
    );
  } else if (/^2/.test(account.accountNum)) {
    account.hasInputs = financialData.investments.some(
      (investment) => investment.accountNum == account.accountNum
    );
  }
};

/* ---------- ROWS ---------- */

const Row = (props) => {
  switch (props.account.accountNum.charAt(0)) {
    case "2":
      return <RowTableImmobilisations {...props} />;
    case "3":
      return <RowTableStocks {...props} />;
  }
};

/* ---------- ROW IMMOBILISATION ---------- */

function RowTableImmobilisations(props) {
  const immobilisation = props.account;
  const { accountNum, accountLib, initialFootprintParams, isAmortisable } =
    immobilisation;

  const usePrevFootprint = props.prevStateDateEnd!=immobilisation.initialState.date;
  const [initialStateType, setInitialStateType] = useState(usePrevFootprint ? "prevFootprint" : immobilisation.initialStateType);
  const [initialStateSet, setInitialStateSet] = useState(immobilisation.initialStateSet);

  const [activityCode, setActivityCode] = useState(
    initialFootprintParams.code || "TOTAL"
  );

  useEffect(() => {
    const usePrevFootprint = props.prevStateDateEnd!=immobilisation.initialState.date;
    setInitialStateSet(immobilisation.initialStateSet);
    setInitialStateType(usePrevFootprint ? "prevFootprint" : immobilisation.initialStateType);
  }, [props]);

  const onActivityCodeChange = (event) => {
    immobilisation.initialFootprintParams.code = event.value;
    immobilisation.initialStateSet = false;
    setActivityCode(immobilisation.initialFootprintParams.code);
  };

  const onInitialStateTypeChange = (event) => {
    immobilisation.initialStateType = event.value;
    immobilisation.initialStateSet = false;
    if (immobilisation.initialStateType == "defaultData") {
      immobilisation.initialFootprintParams = {
        code: "TOTAL",
        area: "FRA",
        aggregate: "TRESS",
      };
    } else {
      immobilisation.initialFootprintParams = {};
    }
    setInitialStateType(immobilisation.initialStateType);
  };

  const getInitialStateOptions = () => {
    switch (initialStateType) {
      case "none":
        return [
          initialStateTypeOptions["none"],
          initialStateTypeOptions["defaultData"],
        ]; // options -> none, defaultData
      case "defaultData":
        return [initialStateTypeOptions["defaultData"]]; // options -> defaultData
      case "prevFootprint":
        return [
          initialStateTypeOptions["prevFootprint"],
          initialStateTypeOptions["defaultData"],
        ]; // options -> prevFootprint, defaultData
      default:
        return [initialStateTypeOptions["defaultData"]]; // options -> defaultData
    }
  }
  
  if (isAmortisable) {
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
            className={
              initialStateType == "prevFootprint" ||
              initialStateType == "currentFootprint" ||
              initialStateSet
                ? "success"
                : ""
            }
            options={getInitialStateOptions()}
            onChange={onInitialStateTypeChange}
          />
        </td>
        {initialStateType == "defaultData" && (
          <td className={initialStateSet === true ? " success" : ""}>
            <Select
              defaultValue={{
                label: activityCode + " - " + branches[activityCode],
                value: activityCode,
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
          {printValue(immobilisation.states[props.prevStateDateEnd].amount, 0)}{" "}
          &euro;
        </td>
      </tr>
    );
  } else if (isAmortisable) {
    return (
      <tr>
        <td>{accountNum}</td>
        <td>
          {accountLib.charAt(0).toUpperCase() +
            accountLib.slice(1).toLowerCase()}
        </td>
        <td colSpan="2">
          &nbsp;&nbsp;Immobilisation non amortie sur l'exercice
        </td>
        <td className="text-end">
          {printValue(immobilisation.states[props.prevStateDateEnd].amount, 0)}{" "}
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
        <td colSpan="2">
          &nbsp;&nbsp;Immobilisation non prise en compte (non amortissable)
        </td>
        <td className="text-end">
          {printValue(immobilisation.states[props.prevStateDateEnd].amount, 0)}{" "}
          &euro;
        </td>
      </tr>
    );
  }
}

/* ---------- ROW STOCK ---------- */

function RowTableStocks(props) {
  const stock = props.account;
  const {
    accountNum,
    accountLib,
    isProductionStock,
    initialFootprintParams,
    hasInputs,
  } = stock;

  const [initialStateType, setInitialStateType] = useState(
    stock.initialStateType
  );
  const [initialStateSet, setInitialStateSet] = useState(stock.initialStateSet);
  const [activityCode, setActivityCode] = useState(
    initialFootprintParams.code || "00"
  );

  useEffect(() => {
    setInitialStateSet(stock.initialStateSet);
    setInitialStateType(stock.initialStateType);
  }, [props]);

  const onActivityCodeChange = (event) => {
    stock.initialFootprintParams.code = event.value;
    stock.initialStateSet = false;
    setActivityCode(stock.initialFootprintParams.code);
  };

  const onInitialStateTypeChange = (event) => {
    stock.initialStateType = event.value;
    stock.initialStateSet = false;
    if (stock.initialStateType == "defaultData") {
      stock.initialFootprintParams = {
        area: "FRA",
        code: "00",
        aggregate: "TRESS",
      };
    } else {
      stock.initialFootprintParams = {};
    }
    setInitialStateType(stock.initialStateType);
  };

  const getInitialStateOptions = () => {
    let initialStateOptions = [];
    if (initialStateType == "none")
      initialStateOptions.push(initialStateTypeOptions["none"]);
    if (initialStateType == "prevFootprint")
      initialStateOptions.push(initialStateTypeOptions["prevFootprint"]);
    if (stock.hasInputs)
      initialStateOptions.push(initialStateTypeOptions["currentFootprint"]);
    initialStateOptions.push(initialStateTypeOptions["defaultData"]);
    return initialStateOptions;
  };

  return (
    <tr>
      <td>{accountNum}</td>
      <td>
        {accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}
      </td>
      {!isProductionStock && (
        <td colSpan={initialStateType == "defaultData" ? 1 : 2}>
          <Select
            styles={customSelectStyles}
            value={initialStateTypeOptions[initialStateType]}
            placeholder={"Choisissez..."}
            className={
              initialStateType == "prevFootprint" ||
              initialStateType == "currentFootprint" ||
              initialStateSet
                ? "success"
                : ""
            }
            options={getInitialStateOptions()}
            onChange={onInitialStateTypeChange}
          />
        </td>
      )}
      {isProductionStock && (
        <td colSpan="2">
          <Select
            styles={customSelectStyles}
            placeholder={"Choisissez..."}
            defaultValue={{
              label: "Estimée sur exercice courant",
              value: "none",
            }}
            className={initialStateType == "currentFootprint" ? "success" : ""}
            options={[{ label: "Estimée sur exercice courant", value: "none" }]}
          />
        </td>
      )}
      {initialStateType == "defaultData" && (
        <td className={initialStateSet === true ? "success" : ""}>
          <Select
            styles={customSelectStyles}
            defaultValue={{
              label: activityCode + " - " + divisions[activityCode],
              value: activityCode,
            }}
            placeholder={"Choisissez une division"}
            className={initialStateSet ? "success" : ""}
            options={divisionsOptions}
            onChange={onActivityCodeChange}
          />
        </td>
      )}
      <td className="text-end">
        {printValue(stock.states[props.prevStateDateEnd].amount, 0)} &euro;
      </td>
    </tr>
  );
}
