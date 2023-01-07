import * as XLSX from 'xlsx';
import { printValue } from '../utils/Utils';

import metaIndics from "/lib/indics";

async function exportIndicXLSX(
  indic,
  session,
  comparativeDivision
) {
  // XLSX Export
  let jsonContent = await buildJSONContent(indic,session);
  let fileProps = { wsclos: [{ wch: 50 }, { wch: 20 }] };

    // write file (JSON -> ArrayBuffer)
    let file = await XLSXFileWriterFromJSON(
      fileProps,
      "results",
      jsonContent
    );

  let blob = new Blob([file], { type: "application/octet-stream" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "results.xlsx";
  link.click();
}

/* ---------- CONTENT BUILDER ---------- */ 

async function buildJSONContent(indic,session)
{
  let jsonContent = [];

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

  jsonContent.push({
    aggregate: "Production",
    amount: printValue(production.amount, 0),
    footprint: printValue(production.footprint.indicators[indic].getValue(), nbDecimals),
    uncertainty: printValue(production.footprint.indicators[indic].getUncertainty(), 0)
  })

  return jsonContent;
}

/* ---------- CONTENT WRITER ---------- */ 

async function XLSXFileWriterFromJSON(fileProps,sheetName,jsonContent)
// ...build XLSX File from JSON
{
  const worksheet = XLSX.utils.json_to_sheet(jsonContent);
  
  if (fileProps.wsclos != undefined) worksheet['!cols'] = fileProps.wsclos;

  const workbook = XLSX.utils.book_new();
        workbook.Props = fileProps;
        workbook.SheetNames.push(sheetName);
        workbook.Sheets[sheetName] = worksheet;

  var XLSXData = XLSX.write(workbook, {bookType:'xlsx',  type: 'binary'});

  // convert to ArrayBuffer
  var buf = new ArrayBuffer(XLSXData.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=XLSXData.length; ++i) view[i] = XLSXData.charCodeAt(i) & 0xFF;

  return buf;
}

/* ---------- CONTENT WRITER ---------- */ 

async function XLSXFileIndicAggregatesWriter(workbook,content)
// ...build XLSX File from JSON
{
  
  const worksheet = XLSX.utils.table_to_sheet();
  workbook.SheetNames.push(sheetName);
        workbook.Sheets[sheetName] = worksheet;

  var XLSXData = XLSX.write(workbook, {bookType:'xlsx',  type: 'binary'});

  // convert to ArrayBuffer
  var buf = new ArrayBuffer(XLSXData.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=XLSXData.length; ++i) view[i] = XLSXData.charCodeAt(i) & 0xFF;

  return buf;
}

/* ---------- HEADER WRITER ---------- */ 

async function XLSXHeaderFileWriter(fileProps,sheetName,arrayHeader)
// ...build XLSX File (empty file with header) from array
{
  const worksheet = XLSX.utils.aoa_to_sheet(arrayHeader);
  
  if (fileProps.wsclos != undefined) worksheet['!cols'] = fileProps.wsclos;

  const workbook = XLSX.utils.book_new();
        workbook.Props = fileProps;
        workbook.SheetNames.push(sheetName);
        workbook.Sheets[sheetName] = worksheet;

  workbook.Sheets[sheetName] = worksheet;

  var XLSXData = XLSX.write(workbook, {bookType:'xlsx',  type: 'binary'});

  // convert to ArrayBuffer
  var buf = new ArrayBuffer(XLSXData.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=XLSXData.length; ++i) view[i] = XLSXData.charCodeAt(i) & 0xFF;

  return buf;
}

export {
  exportIndicXLSX
}