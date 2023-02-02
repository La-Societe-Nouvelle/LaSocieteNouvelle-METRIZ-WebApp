import * as XLSX from 'xlsx';
import { getExpensesGroupByAccount } from '../../components/tables/IndicatorExpensesTable';
import { getFixedCapitalConsumptionsAggregatesGroups, getIntermediateConsumptionsAggregatesGroups } from '../../components/tables/IndicatorMainAggregatesTable';
import {  roundValue } from '../utils/Utils';

import metaIndics from "/lib/indics";

async function exportIndicXLSX(
  indic,
  session,
) {
  // Build file
  let file = await IndicXLSXFileWriter(
    indic,
    session
  );

  let blob = new Blob([file], { type: "application/octet-stream" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "results.xlsx";
  link.click();
}

/* ---------- CONTENT BUILDER ---------- */

async function IndicXLSXFileWriter(indic,session)
{
  const workbook = XLSX.utils.book_new();

  //workbook.Props = fileProps;

  // build main aggregates tab
  let mainAggregatesContent = await buildMainAggregatesContent(indic,session);
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

async function buildMainAggregatesContent(indic,session)
{
  let aoaContent = [];

  const nbDecimals = metaIndics[indic].nbDecimals;

  const {
    production,
    revenue,
    storedProduction,
    immobilisedProduction,
    intermediateConsumption,
    capitalConsumption,
    netValueAdded,
  } = session.financialData.aggregates;

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
    roundValue(production.amount, 0),
    roundValue(production.footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(production.footprint.indicators[indic].getUncertainty(), 0)
  ])

  aoaContent.push([
    "   Production vendue",
    roundValue(revenue.amount, 0),
    roundValue(revenue.footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(revenue.footprint.indicators[indic].getUncertainty(), 0)
  ])

  aoaContent.push([
    "   Production stockée",
    roundValue(storedProduction.amount, 0),
    roundValue(storedProduction.footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(storedProduction.footprint.indicators[indic].getUncertainty(), 0)
  ])

  aoaContent.push([
    "   Production immobilisée",
    roundValue(immobilisedProduction.amount, 0),
    roundValue(immobilisedProduction.footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(immobilisedProduction.footprint.indicators[indic].getUncertainty(), 0)
  ])

  // Consommations intermédiaires

  aoaContent.push([
    "Consommations intermédiaires",
    roundValue(intermediateConsumption.amount, 0),
    roundValue(intermediateConsumption.footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(intermediateConsumption.footprint.indicators[indic].getUncertainty(), 0)
  ])

  const intermediateConsumptionsAggregates =
    getIntermediateConsumptionsAggregatesGroups(session.financialData);

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
    roundValue(capitalConsumption.amount, 0),
    roundValue(capitalConsumption.footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(capitalConsumption.footprint.indicators[indic].getUncertainty(), 0)
  ])

  const fixedCapitalConsumptionsAggregates =
    getFixedCapitalConsumptionsAggregatesGroups(session.financialData);

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
    roundValue(netValueAdded.amount, 0),
    roundValue(netValueAdded.footprint.indicators[indic].getValue(), nbDecimals),
    roundValue(netValueAdded.footprint.indicators[indic].getUncertainty(), 0)
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

  const expensesByAccount = getExpensesGroupByAccount(session.financialData.expenses);
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

  expensesByAccount
    .forEach(({ account, accountLib, amount }) => 
    {
      let indicator = session.getExpensesAccountIndicator(account,indic);
      aoaContent.push([
        account,
        accountLib,
        roundValue(amount, 0),
        roundValue(indicator.getValue(), nbDecimals),
        roundValue(indicator.getUncertainty(), 0)
      ]);
    });

  return aoaContent;
}

/* ---------- EXPORT ---------- */ 

export {
  exportIndicXLSX
}