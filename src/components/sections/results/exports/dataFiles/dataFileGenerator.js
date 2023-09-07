import * as XLSX from "xlsx";
import metaIndics from "/lib/indics";

import { roundValue } from "/src/utils/Utils";
import {buildFixedCapitalConsumptionsAggregates,buildIntermediateConsumptionsAggregates} from "/src/formulas/aggregatesBuilder";

// --------------------------------------------------------------------------
//  Indicator Data excel File
// --------------------------------------------------------------------------

export const buildDataFile = async ({ session, period, indic }) => {
  let xlsxFile = await generateXLSXFile({ indic, session, period });

  let blobXLSX = new Blob([xlsxFile], { type: "application/octet-stream" });
  return blobXLSX;
};

/* -------------------------------------------------------------------------- */

const generateXLSXFile = async ({ indic, session, period }) => {
  const workbook = XLSX.utils.book_new();

  // Build main aggregates tab
  let mainAggregatesContent = await buildMainAggregatesContent(
    indic,
    session,
    period
  );
  const mainAggregatesWorksheet = XLSX.utils.aoa_to_sheet(
    mainAggregatesContent
  );
  mainAggregatesWorksheet["!cols"] = [
    { wch: 75 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];
  workbook.SheetNames.push("Soldes");
  workbook.Sheets["Soldes"] = mainAggregatesWorksheet;

  // Build external expenses tab
  let externalExpensesContent = await buildExpensesContent(
    indic,
    session,
    period
  );
  const externalExpensesWorksheet = XLSX.utils.aoa_to_sheet(
    externalExpensesContent
  );
  externalExpensesWorksheet["!cols"] = [
    { wch: 20 },
    { wch: 50 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];
  workbook.SheetNames.push("Charges externes");
  workbook.Sheets["Charges externes"] = externalExpensesWorksheet;

  var XLSXData = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

  // Convert to ArrayBuffer
  var buf = new ArrayBuffer(XLSXData.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != XLSXData.length; ++i)
    view[i] = XLSXData.charCodeAt(i) & 0xff;

  return buf;
};

/* ---------- CONTENT BUILDERS ---------- */

const buildMainAggregatesContent = async (indic, session, period) => {
  let aoaContent = [];

  const nbDecimals = metaIndics[indic].nbDecimals;

  const { revenue, storedProduction, immobilisedProduction } =
    session.financialData.productionAggregates;

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = session.financialData.mainAggregates;

  // header

  aoaContent.push([metaIndics[indic].libelle]);

  aoaContent.push([""]);
  aoaContent.push(["Soldes Intermédiaires de Gestion"]);

  aoaContent.push([
    "Agrégat",
    "Montant (en €)",
    "Empreinte (en " + metaIndics[indic].unit + ")",
    "Incertitude (en %)",
  ]);

  // production

  aoaContent.push([
    "Production",
    roundValue(production.periodsData[period.periodKey].amount, 0),
    roundValue(
      production.periodsData[period.periodKey].footprint.indicators[
        indic
      ].getValue(),
      nbDecimals
    ),
    roundValue(
      production.periodsData[period.periodKey].footprint.indicators[
        indic
      ].getUncertainty(),
      0
    ),
  ]);

  aoaContent.push([
    "   Production vendue",
    roundValue(revenue.periodsData[period.periodKey].amount, 0),
    roundValue(
      revenue.periodsData[period.periodKey].footprint.indicators[
        indic
      ].getValue(),
      nbDecimals
    ),
    roundValue(
      revenue.periodsData[period.periodKey].footprint.indicators[
        indic
      ].getUncertainty(),
      0
    ),
  ]);

  aoaContent.push([
    "   Production stockée",
    roundValue(storedProduction.periodsData[period.periodKey].amount, 0),
    roundValue(
      storedProduction.periodsData[period.periodKey].footprint.indicators[
        indic
      ].getValue(),
      nbDecimals
    ),
    roundValue(
      storedProduction.periodsData[period.periodKey].footprint.indicators[
        indic
      ].getUncertainty(),
      0
    ),
  ]);

  aoaContent.push([
    "   Production immobilisée",
    roundValue(immobilisedProduction.periodsData[period.periodKey].amount, 0),
    roundValue(
      immobilisedProduction.periodsData[period.periodKey].footprint.indicators[
        indic
      ].getValue(),
      nbDecimals
    ),
    roundValue(
      immobilisedProduction.periodsData[period.periodKey].footprint.indicators[
        indic
      ].getUncertainty(),
      0
    ),
  ]);

  // Consommations intermédiaires

  aoaContent.push([
    "Consommations intermédiaires",
    roundValue(
      intermediateConsumptions.periodsData[period.periodKey].amount,
      0
    ),
    roundValue(
      intermediateConsumptions.periodsData[
        period.periodKey
      ].footprint.indicators[indic].getValue(),
      nbDecimals
    ),
    roundValue(
      intermediateConsumptions.periodsData[
        period.periodKey
      ].footprint.indicators[indic].getUncertainty(),
      0
    ),
  ]);

  const intermediateConsumptionsAggregates =
    await buildIntermediateConsumptionsAggregates(session.financialData, [
      period,
    ]);

  intermediateConsumptionsAggregates
    .filter((aggregate) => aggregate.amount != 0)
    .forEach(({ label, periodsData }) =>
      aoaContent.push([
        "   " + label,
        roundValue(periodsData[period.periodKey].amount, 0),
        roundValue(
          periodsData[period.periodKey].footprint.indicators[indic].getValue(),
          nbDecimals
        ),
        roundValue(
          periodsData[period.periodKey].footprint.indicators[
            indic
          ].getUncertainty(),
          0
        ),
      ])
    );

  // Consommations de capital fixe

  aoaContent.push([
    "Consommations de capital fixe",
    roundValue(
      fixedCapitalConsumptions.periodsData[period.periodKey].amount,
      0
    ),
    roundValue(
      fixedCapitalConsumptions.periodsData[
        period.periodKey
      ].footprint.indicators[indic].getValue(),
      nbDecimals
    ),
    roundValue(
      fixedCapitalConsumptions.periodsData[
        period.periodKey
      ].footprint.indicators[indic].getUncertainty(),
      0
    ),
  ]);

  const fixedCapitalConsumptionsAggregates =
    await buildFixedCapitalConsumptionsAggregates(session.financialData, [
      period,
    ]);

  fixedCapitalConsumptionsAggregates
    .filter((aggregate) => aggregate.amount != 0)
    .forEach(({ label, periodsData }) =>
      aoaContent.push([
        "   " + label,
        roundValue(periodsData[period.periodKey].amount, 0),
        roundValue(
          periodsData[period.periodKey].footprint.indicators[indic].getValue(),
          nbDecimals
        ),
        roundValue(
          periodsData[period.periodKey].footprint.indicators[
            indic
          ].getUncertainty(),
          0
        ),
      ])
    );

  // Net Value Added
  aoaContent.push([
    "Valeur ajoutée nette",
    roundValue(netValueAdded.periodsData[period.periodKey].amount, 0),
    roundValue(
      netValueAdded.periodsData[period.periodKey].footprint.indicators[
        indic
      ].getValue(),
      nbDecimals
    ),
    roundValue(
      netValueAdded.periodsData[period.periodKey].footprint.indicators[
        indic
      ].getUncertainty(),
      0
    ),
  ]);

  return aoaContent;
};

const buildExpensesContent = async (indic, session, period) => {
  let aoaContent = [];

  const currentPeriod = period.periodKey;
  const externalExpenses = session.financialData.externalExpenses.filter(
    (account) => account.date.startsWith(currentPeriod.slice(2))
  );

  externalExpenses.sort((a, b) => b.amount - a.amount);

  // header

  aoaContent.push([metaIndics[indic].libelle]);

  aoaContent.push([""]);
  aoaContent.push(["Charges externes"]);

  aoaContent.push([
    "Compte",
    "Libellé",
    "Montant (en €)",
    "Empreinte (en " + metaIndics[indic].unit + ")",
    "Incertitude (en %)",
  ]);

  externalExpenses.forEach(({ accountNum, accountLib, amount, footprint }) => {
    aoaContent.push([
      accountNum,
      accountLib,
      roundValue(amount, 0),
      footprint.indicators[indic].value,
      footprint.indicators[indic].uncertainty,
    ]);
  });

  return aoaContent;
};
