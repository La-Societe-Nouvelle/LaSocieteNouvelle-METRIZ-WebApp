import * as XLSX from 'xlsx';
import { getExpensesGroupByAccount } from '../../components/tables/IndicatorExpensesTable';
import { buildFixedCapitalConsumptionsAggregates, buildIntermediateConsumptionsAggregates } from '../formulas/aggregatesBuilder';
import {  roundValue } from '../utils/Utils';

import metaIndics from "/lib/indics";

async function exportIndicXLSX(
  indic,
  session,
  period
) {
  // Build file
  let file = await IndicXLSXFileWriter(
    indic,
    session,
    period
  );

  let blob = new Blob([file], { type: "application/octet-stream" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "results.xlsx";
  link.click();
}

/* ---------- CONTENT BUILDER ---------- */

async function IndicXLSXFileWriter(indic,session,period)
{
  const workbook = XLSX.utils.book_new();

  //workbook.Props = fileProps;

  // build main aggregates tab
  let mainAggregatesContent = await buildMainAggregatesContent(indic,session,period);
  const mainAggregatesWorksheet = XLSX.utils.aoa_to_sheet(mainAggregatesContent);
  mainAggregatesWorksheet['!cols'] = [{ wch: 75 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  workbook.SheetNames.push("Soldes");
  workbook.Sheets["Soldes"] = mainAggregatesWorksheet;

  // build external expenses tab
  let externalExpensesContent = await buildExpensesContent(indic,session);
  const externalExpensesWorksheet = XLSX.utils.aoa_to_sheet(externalExpensesContent);
  externalExpensesWorksheet['!cols'] = [{ wch: 20 }, { wch: 50 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  workbook.SheetNames.push("Charges externes");
  workbook.Sheets["Charges externes"] = externalExpensesWorksheet;

  var XLSXData = XLSX.write(workbook, {bookType:'xlsx',  type: 'binary'});

  // convert to ArrayBuffer
  var buf = new ArrayBuffer(XLSXData.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=XLSXData.length; ++i) view[i] = XLSXData.charCodeAt(i) & 0xFF;

  return buf;
}

/* ---------- CONTENT BUILDERS ---------- */ 

async function buildMainAggregatesContent(indic,session,period)
{
  let aoaContent = [];

  const nbDecimals = metaIndics[indic].nbDecimals;

  const {
    revenue,
    storedProduction,
    immobilisedProduction
  } = session.financialData.productionAggregates;
  
  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = session.financialData.mainAggregates;

  // header

  aoaContent.push([
    metaIndics[indic].libelle
  ])

  aoaContent.push([""]);
  aoaContent.push(["Soldes Intermédiaires de Gestion"]);

  aoaContent.push([
    "Agrégat",
    "Montant (en €)",
    "Empreinte (en "+metaIndics[indic].unit+")",
    "Incertitude (en %)"
  ])

  // production

  aoaContent.push([
    "Production",
    roundValue(production.periodsData[period.periodKey].amount, 0),
    roundValue(production.periodsData[period.periodKey].footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(production.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(), 0)
  ])

  aoaContent.push([
    "   Production vendue",
    roundValue(revenue.periodsData[period.periodKey].amount, 0),
    roundValue(revenue.periodsData[period.periodKey].footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(revenue.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(), 0)
  ])

  aoaContent.push([
    "   Production stockée",
    roundValue(storedProduction.periodsData[period.periodKey].amount, 0),
    roundValue(storedProduction.periodsData[period.periodKey].footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(storedProduction.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(), 0)
  ])

  aoaContent.push([
    "   Production immobilisée",
    roundValue(immobilisedProduction.periodsData[period.periodKey].amount, 0),
    roundValue(immobilisedProduction.periodsData[period.periodKey].footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(immobilisedProduction.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(), 0)
  ])

  // Consommations intermédiaires

  aoaContent.push([
    "Consommations intermédiaires",
    roundValue(intermediateConsumptions.periodsData[period.periodKey].amount, 0),
    roundValue(intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(), 0)
  ])

  const intermediateConsumptionsAggregates =
  await buildIntermediateConsumptionsAggregates(
    session.financialData,
    period.periodKey
  );

  intermediateConsumptionsAggregates
    .filter((aggregate) => aggregate.amount != 0)
    .forEach(({ accountLib, amount, footprint }) => 
    (
      aoaContent.push([
        "   "+accountLib,
        roundValue(amount, 0),
        roundValue(footprint.indicators[indic].getValue(), nbDecimals),
        roundValue(footprint.indicators[indic].getUncertainty(), 0)
      ])
    ));

  // Consommations de capital fixe

  aoaContent.push([
    "Consommations de capital fixe",
    roundValue(fixedCapitalConsumptions.periodsData[period.periodKey].amount, 0),
    roundValue(fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(), 0)
  ])

  const fixedCapitalConsumptionsAggregates =
  await buildFixedCapitalConsumptionsAggregates(
    session.financialData,
    period.periodKey
  );


  fixedCapitalConsumptionsAggregates
    .filter((aggregate) => aggregate.amount != 0)
    .forEach(({ accountLib, amount, footprint }) => 
    (
      aoaContent.push([
        "   "+accountLib,
        roundValue(amount, 0),
        roundValue(footprint.indicators[indic].getValue(), nbDecimals),
        roundValue(footprint.indicators[indic].getUncertainty(), 0)
      ])
    ));

  // Net Value Added
  aoaContent.push([
    "Valeur ajoutée nette",
    roundValue(netValueAdded.periodsData[period.periodKey].amount, 0),
    roundValue(netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(), 0)
  ])

  return aoaContent;
}

async function buildExpensesContent(indic,session)
{
  let aoaContent = [];

  const nbDecimals = metaIndics[indic].nbDecimals;

  const {
    expenseAccounts
  } = session.financialData;

  const expensesByAccount = getExpensesGroupByAccount(session.financialData.externalExpenses);
  expensesByAccount.sort((a,b) => b.amount - a.amount);

  // header

  aoaContent.push([
    metaIndics[indic].libelle
  ])

  aoaContent.push([""]);
  aoaContent.push(["Charges externes"]);

  aoaContent.push([
    "Compte",
    "Libellé",
    "Montant (en €)",
    "Empreinte (en "+metaIndics[indic].unit+")",
    "Incertitude (en %)"
  ])

  // Consommations intermédiaires
  console.log(expensesByAccount)
  expensesByAccount
    .forEach(({ accountNum, accountLib, amount }) => 
    {
      let indicator = session.getExpensesAccountIndicator(accountNum,indic); // TO FIX
      aoaContent.push([
        accountNum,
        accountLib,
        roundValue(amount, 0),
        roundValue(indicator.getValue(), nbDecimals),
        roundValue(indicator.getUncertainty(),   0)
      ]);
    });

  return aoaContent;
}

/* ---------- EXPORT ---------- */ 

export {
  exportIndicXLSX
}