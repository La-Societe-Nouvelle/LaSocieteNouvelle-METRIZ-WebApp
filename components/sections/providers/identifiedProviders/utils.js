// La Société Nouvelle

import * as XLSX from "xlsx";

// utils
import { getSumItems } from "../../../../src/utils/Utils";

// Libraries
import metaIndics from "../../../../lib/indics.json";

/* ------------------------------------ COMPANIES FILE --------------------------------------- */
/*
  Header format :
    -> corporateId : id of the company
    -> corporateName : name of the company
*/

export async function processCSVCompaniesData(CSVCompaniesData) {
  // ...extract data to use in session
  let data = {};

  await CSVCompaniesData.forEach((CSVCompanieData) => {
    data[CSVCompanieData.providerNum] = {
      corporateName: CSVCompanieData.corporateName,
      corporateId: CSVCompanieData.corporateId,
    };
  });

  return data;
}

/* ------------------------------------- FORMULAS -------------------------------------------- */

// limite significative (0.5 -> 50%)
const limit = 0.1;

export async function getSignificativeProviders(
  providers,
  minFpt,
  maxFpt,
  period
) {
  // if no data -> return list of all provider with default footprint
  if (minFpt == null || maxFpt == null) {
    return providers
      .filter((provider) => provider.useDefaultFootprint)
      .map((provider) => provider.providerNum);
  }

  // significative companies
  let providersSorted = providers
    .filter((provider) => provider.periodsData.hasOwnProperty(period.periodKey))
    .sort(
      (a, b) =>
        Math.abs(a.periodsData[period.periodKey].amountExpenses) -
        Math.abs(b.periodsData[period.periodKey].amountExpenses)
    );

  let significativeProviders = [];
  for (let indic of Object.keys(metaIndics)) {
    // significative providers for indic
    let significativeProvidersForIndic = await getSignificativeProvidersByIndic(
      indic,
      providersSorted,
      minFpt,
      maxFpt,
      limit,
      period
    ); // return list accounts
    significativeProviders.push(...significativeProvidersForIndic);
  }

  // significative companies for investments -> all by default
  let immobilisationProviders = providers
    .filter((provider) => provider.periodsData.hasOwnProperty(period.periodKey))
    .filter(
      (provider) => provider.periodsData[period.periodKey].amountInvestments > 0
    )
    .map((provider) => provider.providerNum);
  significativeProviders.push(...immobilisationProviders);

  // Remove duplicates & return
  return significativeProviders.filter(
    (value, index, self) => index === self.findIndex((item) => item === value)
  );
}

// iteration until provider under limit are significative
const getSignificativeProvidersByIndic = async (
  indic,
  providers,
  minFpt,
  maxFpt,
  limit,
  period
) => {
  let isSignificative = false;

  providers.sort(
    (a, b) =>
      Math.abs(a.periodsData[period.periodKey].amountExpenses) -
      Math.abs(b.periodsData[period.periodKey].amountExpenses)
  );
  let index = 0; // under -> providers not significative

  while (!isSignificative && index <= providers.length) {
    // build impact for upper limit providers (mininum footprint case) -> use activity footprint if defined otherwise use min footprint
    let upperLimitProviders = providers.slice(index);
    let impactOfUpperLimitProviders = getSumItems(
      upperLimitProviders.map((provider) =>
        provider.defaultFootprintParams.code == "00" ||
        (provider.footprintStatus != 200 && provider.footprintStatus != 203) //
          ? minFpt.indicators[indic].value *
            provider.periodsData[period.periodKey].amountExpenses //  if no activity set or footprint unfetched
          : provider.footprint.indicators[indic].value *
            provider.periodsData[period.periodKey].amountExpenses
      )
    ); //  if activity set & fpt fetched

    // build impact for under limit providers (maximum footprint case) -> use activity footprint if defined otherwise use max footprint
    let underLimitProviders = providers.slice(0, index);
    let impactOfUnderLimitCompanies = getSumItems(
      underLimitProviders.map((provider) =>
        provider.defaultFootprintParams.code == "00" ||
        (provider.footprintStatus != 200 && provider.footprintStatus != 203)
          ? maxFpt.indicators[indic].value *
            provider.periodsData[period.periodKey].amountExpenses
          : provider.footprint.indicators[indic].value *
            provider.periodsData[period.periodKey].amountExpenses
      )
    );

    // check if impact of under limit providers represent more than [limit] % of identified expenses and upper limit providers impacts
    if (
      Math.abs(impactOfUnderLimitCompanies) >=
      Math.abs(impactOfUpperLimitProviders) * limit
    )
      isSignificative = true;

    if (!isSignificative) index++;
  }

  // Retrieve list of companies
  let significativeProviders =
    index > 0
      ? providers.slice(index - 1).map((provider) => provider.providerNum)
      : [];
  return significativeProviders;
};

/* ---------------------------------------- READERS ---------------------------------------------- */
// CSV
export async function CSVFileReader(content) {
  // ...build JSON from CSV File
  let CSVData = [];
  let columns = {};

  // Clean content
  content = content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");

  // read header
  const header = content.slice(0, content.indexOf("\n")).split(";");
  header.forEach((column) => {
    columns[column.replace(/^\"/, "").replace(/\"$/, "")] =
      header.indexOf(column);
  });

  // read rows
  const rows = content.slice(content.indexOf("\n") + 1).split("\n");
  await rows.forEach((rowString) => {
    if (rowString != "") {
      let row = rowString.split(";");
      readCSVFileRow(columns, row).then((rowData) => CSVData.push(rowData));
    }
  });

  return CSVData;
}

// Read line
async function readCSVFileRow(columns, row) {
  let rowData = {};
  Object.entries(columns).forEach(([column, index]) => {
    rowData[column] = row[index].replace(/^\"/, "").replace(/\"$/, "");
  });
  return rowData;
}

// XLSX 
export async function XLSXFileReader(content) {
  // ...build JSON from XLSX File
  let data = [];
  let columns = {};

  const workbook = XLSX.read(content, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const workSheet = workbook.Sheets[sheetName];

  // read header
  Object.keys(workSheet)
    .filter((cellAdress) => cellAdress.slice(1) == "1")
    .map((cellAdress) => cellAdress.charAt(0))
    .forEach((column) => (columns[column] = workSheet[column + "1"].v));

  const lastRow = Object.keys(workSheet)
    .filter((cellAdress) => cellAdress.charAt(0) == "A")
    .map((cellAdress) => parseInt(cellAdress.slice(1)))
    .reduce((a, b) => Math.max(a, b), 0);

  // read rows
  for (let i = 2; i <= lastRow; i++) {
    let dataCell = {};
    Object.entries(columns).forEach(([column, label]) => {
      let cell = workSheet[column + i];
      if (cell != undefined) {
        dataCell[label] = cell.w;
      } else {
        dataCell[label] = null;
      }
    });
    data.push(dataCell);
  }

  return data;
}

/* ---------------------------------------- WRITERS ---------------------------------------------- */

// XLSX
export async function XLSXFileWriterFromJSON(
  fileProps,
  sheetName,
  jsonContent
) {
  // ...build XLSX File from JSON
  const worksheet = XLSX.utils.json_to_sheet(jsonContent);

  if (fileProps.wsclos != undefined) worksheet["!cols"] = fileProps.wsclos;

  const workbook = XLSX.utils.book_new();
  workbook.Props = fileProps;
  workbook.SheetNames.push(sheetName);
  workbook.Sheets[sheetName] = worksheet;

  var XLSXData = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

  // convert to ArrayBuffer
  var buf = new ArrayBuffer(XLSXData.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != XLSXData.length; ++i)
    view[i] = XLSXData.charCodeAt(i) & 0xff;

  return buf;
}
